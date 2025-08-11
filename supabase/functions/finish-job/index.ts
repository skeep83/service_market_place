import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface FinishJobRequest {
  job_id: string
  otp: string
  evidence_urls: string[]
  notes?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { job_id, otp, evidence_urls, notes }: FinishJobRequest = await req.json()

    if (!job_id || !otp || !evidence_urls || evidence_urls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Job ID, OTP, and evidence photos are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get job details and verify professional
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .eq('pro_id', user.id)
      .single()

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: 'Job not found or not assigned to you' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check job status
    if (job.status !== 'in_progress') {
      return new Response(
        JSON.stringify({ error: `Cannot finish job with status: ${job.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if already finished
    if (job.finished_at) {
      return new Response(
        JSON.stringify({ error: 'Job already finished' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify OTP
    if (job.finish_otp !== otp) {
      // Log failed OTP attempt
      await supabaseClient
        .from('risk_events')
        .insert({
          actor: user.id,
          kind: 'otp_failed',
          subject: 'job',
          subject_id: job_id,
          weight: 2, // Higher weight for finish OTP failures
          meta: {
            otp_type: 'finish',
            provided_otp: otp,
            expected_otp: job.finish_otp
          }
        })

      return new Response(
        JSON.stringify({ error: 'Invalid OTP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate evidence URLs (basic validation)
    const validUrls = evidence_urls.filter(url => {
      try {
        new URL(url)
        return url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      } catch {
        return false
      }
    })

    if (validUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one valid image URL is required as evidence' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Finish the job
    const { data: updatedJob, error: updateError } = await supabaseClient
      .from('jobs')
      .update({
        status: 'done',
        finished_at: new Date().toISOString(),
        evidence_urls: validUrls,
        meta: {
          ...job.meta,
          completion_notes: notes,
          evidence_count: validUrls.length
        }
      })
      .eq('id', job_id)
      .select()
      .single()

    if (updateError) {
      console.error('Job finish error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to finish job' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log successful job completion
    await supabaseClient
      .from('risk_events')
      .insert({
        actor: user.id,
        kind: 'job_completed',
        subject: 'job',
        subject_id: job_id,
        weight: -2, // Strong positive action
        meta: {
          finished_at: updatedJob.finished_at,
          evidence_urls: validUrls,
          duration_minutes: job.started_at ? 
            Math.round((new Date(updatedJob.finished_at).getTime() - new Date(job.started_at).getTime()) / 60000) : null
        }
      })

    // Auto-release escrow after job completion
    const { data: escrow } = await supabaseClient
      .from('escrow')
      .select('id')
      .eq('subject', 'job')
      .eq('subject_id', job_id)
      .eq('status', 'held')
      .single()

    if (escrow) {
      // Call release-escrow function
      const releaseResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/release-escrow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          escrow_id: escrow.id,
          reason: 'job_completed'
        })
      })

      if (!releaseResponse.ok) {
        console.error('Failed to auto-release escrow:', await releaseResponse.text())
      }
    }

    // Create notification for client
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: job.user_id,
        type: 'job_completed',
        title: 'Work completed!',
        message: `Professional has completed the work: ${job.brief}. Please review and rate the service.`,
        read: false
      })

    return new Response(
      JSON.stringify({
        success: true,
        job_id,
        status: 'done',
        finished_at: updatedJob.finished_at,
        evidence_urls: validUrls,
        escrow_released: !!escrow,
        message: 'Job completed successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Finish job error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})