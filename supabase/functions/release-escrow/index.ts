import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ReleaseEscrowRequest {
  escrow_id: number
  reason?: string
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

    const { escrow_id, reason }: ReleaseEscrowRequest = await req.json()

    if (!escrow_id) {
      return new Response(
        JSON.stringify({ error: 'Escrow ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get escrow details and verify authority
    const { data: escrow, error: escrowError } = await supabaseClient
      .from('escrow')
      .select(`
        *,
        jobs:jobs!escrow_subject_id_fkey(user_id, pro_id, status),
        tenders:tenders!escrow_subject_id_fkey(user_id, winner_bid_id)
      `)
      .eq('id', escrow_id)
      .single()

    if (escrowError || !escrow) {
      return new Response(
        JSON.stringify({ error: 'Escrow not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if escrow is in correct status
    if (escrow.status !== 'held') {
      return new Response(
        JSON.stringify({ error: `Cannot release escrow with status: ${escrow.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user has authority to release
    let hasAuthority = false
    
    if (escrow.subject === 'job') {
      // Client can release, or system can release after job completion
      const job = escrow.jobs
      hasAuthority = user.id === escrow.client_id || 
                   (job?.status === 'done' && job?.finished_at)
    } else if (escrow.subject === 'tender') {
      // Client can release, or system can release after tender completion
      hasAuthority = user.id === escrow.client_id
    }

    if (!hasAuthority) {
      return new Response(
        JSON.stringify({ error: 'Not authorized to release this escrow' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Release the escrow
    const { data: updatedEscrow, error: updateError } = await supabaseClient
      .from('escrow')
      .update({
        status: 'released',
        meta: {
          ...escrow.meta,
          released_at: new Date().toISOString(),
          released_by: user.id,
          release_reason: reason || 'manual_release'
        }
      })
      .eq('id', escrow_id)
      .select()
      .single()

    if (updateError) {
      console.error('Escrow update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to release escrow' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TODO: In real implementation, trigger actual payment to professional
    // For now, we just update the wallet balance
    if (escrow.subject === 'job') {
      const job = escrow.jobs
      if (job?.pro_id) {
        // Add to professional's wallet
        await supabaseClient.rpc('add_to_wallet', {
          pro_id: job.pro_id,
          amount_cents: escrow.amount_cents
        })
      }
    }

    // Log the release event
    await supabaseClient
      .from('risk_events')
      .insert({
        actor: user.id,
        kind: 'escrow_released',
        subject: escrow.subject,
        subject_id: escrow.subject_id,
        weight: 0,
        meta: {
          escrow_id,
          amount_cents: escrow.amount_cents,
          reason
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        escrow_id,
        status: 'released',
        amount_cents: escrow.amount_cents,
        message: 'Escrow released successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Release escrow error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})