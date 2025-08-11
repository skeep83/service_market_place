import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RefundEscrowRequest {
  escrow_id: number
  reason: string
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

    const { escrow_id, reason }: RefundEscrowRequest = await req.json()

    if (!escrow_id || !reason) {
      return new Response(
        JSON.stringify({ error: 'Escrow ID and reason are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get escrow details
    const { data: escrow, error: escrowError } = await supabaseClient
      .from('escrow')
      .select('*')
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
        JSON.stringify({ error: `Cannot refund escrow with status: ${escrow.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user has authority to refund (client or admin)
    if (user.id !== escrow.client_id) {
      // Check if user is admin (you can implement admin role check here)
      return new Response(
        JSON.stringify({ error: 'Not authorized to refund this escrow' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Refund the escrow
    const { data: updatedEscrow, error: updateError } = await supabaseClient
      .from('escrow')
      .update({
        status: 'refunded',
        meta: {
          ...escrow.meta,
          refunded_at: new Date().toISOString(),
          refunded_by: user.id,
          refund_reason: reason
        }
      })
      .eq('id', escrow_id)
      .select()
      .single()

    if (updateError) {
      console.error('Escrow refund error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to refund escrow' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TODO: In real implementation, process actual refund through payment provider
    // For now, we just mark it as refunded

    // Log the refund event
    await supabaseClient
      .from('risk_events')
      .insert({
        actor: user.id,
        kind: 'escrow_refunded',
        subject: escrow.subject,
        subject_id: escrow.subject_id,
        weight: 1, // Slight risk increase for refunds
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
        status: 'refunded',
        amount_cents: escrow.amount_cents,
        message: 'Escrow refunded successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Refund escrow error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})