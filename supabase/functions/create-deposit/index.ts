import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CreateDepositRequest {
  subject: 'job' | 'tender'
  subject_id: string
  amount_cents: number
}

interface MockPaymentResponse {
  success: boolean
  payment_intent_id: string
  amount_cents: number
}

// Mock payment provider - simulate successful payment
async function mockPaymentProvider(amount_cents: number): Promise<MockPaymentResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock success (in real implementation, this would call Stripe/LiqPay)
  return {
    success: true,
    payment_intent_id: `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount_cents
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
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

    // Parse request body
    const { subject, subject_id, amount_cents }: CreateDepositRequest = await req.json()

    // Validate input
    if (!subject || !subject_id || !amount_cents || amount_cents <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user owns the job/tender
    let ownershipQuery
    if (subject === 'job') {
      ownershipQuery = supabaseClient
        .from('jobs')
        .select('user_id')
        .eq('id', subject_id)
        .eq('user_id', user.id)
        .single()
    } else {
      ownershipQuery = supabaseClient
        .from('tenders')
        .select('user_id')
        .eq('id', subject_id)
        .eq('user_id', user.id)
        .single()
    }

    const { data: ownership, error: ownershipError } = await ownershipQuery
    if (ownershipError || !ownership) {
      return new Response(
        JSON.stringify({ error: 'Not authorized for this resource' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if deposit already exists
    const { data: existingEscrow } = await supabaseClient
      .from('escrow')
      .select('id, status')
      .eq('subject', subject)
      .eq('subject_id', subject_id)
      .eq('status', 'held')
      .single()

    if (existingEscrow) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Deposit already exists',
          escrow_id: existingEscrow.id 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process payment through mock provider
    const paymentResult = await mockPaymentProvider(amount_cents)

    if (!paymentResult.success) {
      return new Response(
        JSON.stringify({ error: 'Payment failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create escrow record
    const { data: escrow, error: escrowError } = await supabaseClient
      .from('escrow')
      .insert({
        subject,
        subject_id,
        client_id: user.id,
        amount_cents,
        status: 'held',
        payment_intent_id: paymentResult.payment_intent_id,
        meta: {
          payment_provider: 'mock',
          created_by_function: 'create-deposit'
        }
      })
      .select()
      .single()

    if (escrowError) {
      console.error('Escrow creation error:', escrowError)
      return new Response(
        JSON.stringify({ error: 'Failed to create escrow' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Reset risk events for this user (clean slate after deposit)
    await supabaseClient
      .from('risk_events')
      .delete()
      .eq('actor', user.id)
      .in('kind', ['offplatform_hint'])

    // Log successful deposit event
    await supabaseClient
      .from('risk_events')
      .insert({
        actor: user.id,
        kind: 'deposit_created',
        subject,
        subject_id,
        weight: -1, // Positive action, reduces risk
        meta: {
          amount_cents,
          escrow_id: escrow.id
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        escrow_id: escrow.id,
        payment_intent_id: paymentResult.payment_intent_id,
        amount_cents,
        message: 'Deposit created successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Create deposit error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})