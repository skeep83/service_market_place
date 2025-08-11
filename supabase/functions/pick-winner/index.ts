import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PickWinnerRequest {
  tender_id: string
}

interface BidWithScore {
  id: string
  pro_id: string
  price: number
  warranty_days: number
  note: string
  weighted_score: number
  professional: {
    full_name: string
    rating: number
    completed_jobs: number
  }
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

    const { tender_id }: PickWinnerRequest = await req.json()

    if (!tender_id) {
      return new Response(
        JSON.stringify({ error: 'Tender ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user owns the tender
    const { data: tender, error: tenderError } = await supabaseClient
      .from('tenders')
      .select('*')
      .eq('id', tender_id)
      .eq('user_id', user.id)
      .single()

    if (tenderError || !tender) {
      return new Response(
        JSON.stringify({ error: 'Tender not found or not authorized' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if bids are locked
    if (!tender.bids_locked) {
      return new Response(
        JSON.stringify({ error: 'Bids must be locked before picking winner' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if winner already picked
    if (tender.winner_bid_id) {
      return new Response(
        JSON.stringify({ error: 'Winner already selected for this tender' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all bids with professional data and calculate scores
    const { data: bids, error: bidsError } = await supabaseClient
      .from('bids')
      .select(`
        id,
        pro_id,
        price,
        warranty_days,
        note,
        professionals:professionals!bids_pro_id_fkey (
          full_name,
          rating,
          completed_jobs
        )
      `)
      .eq('tender_id', tender_id)

    if (bidsError || !bids || bids.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No bids found for this tender' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate weighted scores for all bids
    const bidsWithScores: BidWithScore[] = bids.map(bid => {
      const professional = Array.isArray(bid.professionals) ? bid.professionals[0] : bid.professionals
      
      // Calculate weighted score
      const maxPrice = Math.max(...bids.map(b => b.price))
      const priceScore = maxPrice > 0 ? (1.0 - (bid.price / maxPrice)) * 0.4 : 0
      const ratingScore = (professional?.rating || 0) / 5.0 * 0.3
      const experienceScore = Math.min(professional?.completed_jobs || 0, 100) / 100.0 * 0.2
      const warrantyScore = Math.min(bid.warranty_days, 365) / 365.0 * 0.1
      
      const weightedScore = (priceScore + ratingScore + experienceScore + warrantyScore) * 100

      return {
        id: bid.id,
        pro_id: bid.pro_id,
        price: bid.price,
        warranty_days: bid.warranty_days,
        note: bid.note,
        weighted_score: Math.round(weightedScore * 100) / 100,
        professional: {
          full_name: professional?.full_name || 'Unknown',
          rating: professional?.rating || 0,
          completed_jobs: professional?.completed_jobs || 0
        }
      }
    })

    // Sort by weighted score (highest first)
    bidsWithScores.sort((a, b) => b.weighted_score - a.weighted_score)

    const winnerBid = bidsWithScores[0]
    const secondBid = bidsWithScores[1]

    // Vickrey pricing: winner pays second-best price (or their own if only one bid)
    const payPrice = secondBid ? secondBid.price : winnerBid.price

    // Update all bids with their calculated scores
    for (const bid of bidsWithScores) {
      await supabaseClient
        .from('bids')
        .update({
          weighted_score: bid.weighted_score,
          is_winner: bid.id === winnerBid.id
        })
        .eq('id', bid.id)
    }

    // Update tender with winner
    const { error: updateError } = await supabaseClient
      .from('tenders')
      .update({
        winner_bid_id: winnerBid.id,
        pay_price: payPrice,
        status: 'awarded'
      })
      .eq('id', tender_id)

    if (updateError) {
      console.error('Tender update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update tender with winner' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log winner selection event
    await supabaseClient
      .from('risk_events')
      .insert({
        actor: user.id,
        kind: 'winner_selected',
        subject: 'tender',
        subject_id: tender_id,
        weight: 0,
        meta: {
          winner_bid_id: winnerBid.id,
          winner_pro_id: winnerBid.pro_id,
          pay_price: payPrice,
          original_price: winnerBid.price,
          total_bids: bidsWithScores.length
        }
      })

    // Create notification for winner
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: winnerBid.pro_id,
        type: 'tender_won',
        title: 'Congratulations! You won a tender',
        message: `You won the tender "${tender.brief}" with a pay price of ${payPrice} cents`,
        read: false
      })

    return new Response(
      JSON.stringify({
        success: true,
        winner: {
          bid_id: winnerBid.id,
          pro_id: winnerBid.pro_id,
          professional_name: winnerBid.professional.full_name,
          original_price: winnerBid.price,
          pay_price: payPrice,
          weighted_score: winnerBid.weighted_score
        },
        all_bids: bidsWithScores.map(bid => ({
          id: bid.id,
          professional_name: bid.professional.full_name,
          price: bid.price,
          weighted_score: bid.weighted_score,
          is_winner: bid.id === winnerBid.id
        })),
        message: 'Winner selected successfully using Vickrey pricing'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Pick winner error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})