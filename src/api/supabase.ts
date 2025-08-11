import { supabase } from '../lib/supabase';

// Anti-collusion API helpers
export const antiCollusionAPI = {
  // Escrow operations
  async createDeposit(subject: 'job' | 'tender', subjectId: string, amountCents: number) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.functions.invoke('create-deposit', {
      body: {
        subject,
        subject_id: subjectId,
        amount_cents: amountCents
      }
    });

    if (error) throw error;
    return data;
  },

  async releaseEscrow(escrowId: number, reason?: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.functions.invoke('release-escrow', {
      body: {
        escrow_id: escrowId,
        reason
      }
    });

    if (error) throw error;
    return data;
  },

  async refundEscrow(escrowId: number, reason: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.functions.invoke('refund-escrow', {
      body: {
        escrow_id: escrowId,
        reason
      }
    });

    if (error) throw error;
    return data;
  },

  // Tender operations
  async pickWinner(tenderId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.functions.invoke('pick-winner', {
      body: {
        tender_id: tenderId
      }
    });

    if (error) throw error;
    return data;
  },

  async lockTenderBids(tenderId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('tenders')
      .update({ bids_locked: true })
      .eq('id', tenderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Job operations
  async startJob(jobId: string, otp: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.functions.invoke('start-job', {
      body: {
        job_id: jobId,
        otp
      }
    });

    if (error) throw error;
    return data;
  },

  async finishJob(jobId: string, otp: string, evidenceUrls: string[], notes?: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.functions.invoke('finish-job', {
      body: {
        job_id: jobId,
        otp,
        evidence_urls: evidenceUrls,
        notes
      }
    });

    if (error) throw error;
    return data;
  },

  // Risk and security
  async getRiskScore(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('risk_scores')
      .select('*')
      .eq('actor', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors
    return data;
  },

  async getEscrowStatus(subject: 'job' | 'tender', subjectId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('escrow_locks')
      .select('*')
      .eq('subject', subject)
      .eq('subject_id', subjectId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Professional contacts (with deposit check)
  async getProfessionalPublic(proId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('professionals_public')
      .select('*')
      .eq('id', proId)
      .single();

    if (error) throw error;
    return data;
  },

  // Chat with PII masking
  async getChatMessages(chatId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        id,
        chat_id,
        sender_id,
        content_masked,
        pii_detected,
        is_read,
        created_at,
        profiles:profiles!chat_messages_sender_id_fkey(full_name, email)
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async sendChatMessage(chatId: string, content: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        content,
        message_type: 'text'
      })
      .select(`
        id,
        chat_id,
        sender_id,
        content_masked,
        pii_detected,
        is_read,
        created_at
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Sealed bid operations
  async getBidsForTender(tenderId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    // This will automatically apply RLS policies for sealed bids
    const { data, error } = await supabase
      .from('bids')
      .select(`
        id,
        pro_id,
        price,
        warranty_days,
        note,
        weighted_score,
        is_winner,
        created_at,
        professionals:professionals!bids_pro_id_fkey(
          full_name,
          rating,
          completed_jobs
        )
      `)
      .eq('tender_id', tenderId)
      .order('weighted_score', { ascending: false, nullsLast: true });

    if (error) throw error;
    return data;
  },

  async createBid(tenderId: string, price: number, warrantyDays: number, note: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('bids')
      .insert({
        tender_id: tenderId,
        price,
        warranty_days: warrantyDays,
        note
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Export existing database services
export * from '../lib/database';