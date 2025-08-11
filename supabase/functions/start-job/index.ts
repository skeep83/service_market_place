import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface StartJobRequest {
  job_id: string
  otp: string
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

    const { job_id, otp }: StartJobRequest = await req.json()

    if (!job_id || !otp) {
      return new Response(
        JSON.stringify({ error: 'Job ID and OTP are required' }),
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
    if (job.status !== 'accepted') {
      return new Response(
        JSON.stringify({ error: `Cannot start job with status: ${job.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if already started
    if (job.started_at) {
      return new Response(
        JSON.stringify({ error: 'Job already started' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify OTP
    if (job.start_otp !== otp) {
      // Log failed OTP attempt
      await supabaseClient
        .from('risk_events')
        .insert({
          actor: user.id,
          kind: 'otp_failed',
          subject: 'job',
          subject_id: job_id,
          weight: 1,
          meta: {
            otp_type: 'start',
            provided_otp: otp,
            expected_otp: job.start_otp
          }
        })

      return new Response(
        JSON.stringify({ error: 'Invalid OTP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Start the job
    const { data: updatedJob, error: updateError } = await supabaseClient
      .from('jobs')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', job_id)
      .select()
      .single()

    if (updateError) {
      console.error('Job start error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to start job' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log successful job start
    await supabaseClient
      .from('risk_events')
      .insert({
        actor: user.id,
        kind: 'job_started',
        subject: 'job',
        subject_id: job_id,
        weight: -1, // Positive action
        meta: {
          started_at: updatedJob.started_at,
          otp_verified: true
        }
      })

    // Create notification for client
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: job.user_id,
        type: 'job_started',
        title: 'Work has started',
        message: `Professional has started working on: ${job.brief}`,
        read: false
      })

    return new Response(
      JSON.stringify({
        success: true,
        job_id,
        status: 'in_progress',
        started_at: updatedJob.started_at,
        message: 'Job started successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Start job error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})