import { supabase } from './supabase';
import { Profile, Pro, Job, Tender, Bid, Wallet, Charge, Notification, JobApplication, Client, Business, Professional, Chat, ChatMessage } from '../types/database';

// Client operations
export const clientService = {
  async getClient(userId: string): Promise<Client | null> {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching client:', error);
      return null;
    }
    
    return data;
  },

  async createClient(clientData: Omit<Client, 'created_at' | 'updated_at'>): Promise<boolean> {
    if (!supabase) return false;
    
    const { error } = await supabase
      .from('clients')
      .insert([clientData]);
    
    if (error) {
      console.error('Error creating client:', error);
      return false;
    }
    
    return true;
  },

  async updateClient(userId: string, updates: Partial<Client>): Promise<boolean> {
    if (!supabase) return false;
    
    const { error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating client:', error);
      return false;
    }
    
    return true;
  }
};

// Business operations
export const businessService = {
  async getBusiness(userId: string): Promise<Business | null> {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching business:', error);
      return null;
    }
    
    return data;
  },

  async createBusiness(businessData: Omit<Business, 'created_at' | 'updated_at'>): Promise<boolean> {
    if (!supabase) return false;
    
    const { error } = await supabase
      .from('businesses')
      .insert([businessData]);
    
    if (error) {
      console.error('Error creating business:', error);
      return false;
    }
    
    return true;
  },

  async updateBusiness(userId: string, updates: Partial<Business>): Promise<boolean> {
    if (!supabase) return false;
    
    const { error } = await supabase
      .from('businesses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating business:', error);
      return false;
    }
    
    return true;
  }
};

// Professional operations
export const professionalService = {
  async getProfessional(userId: string): Promise<Professional | null> {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching professional:', error);
      return null;
    }
    
    return data;
  },

  async createProfessional(professionalData: Omit<Professional, 'created_at' | 'updated_at'>): Promise<boolean> {
    if (!supabase) return false;
    
    const { error } = await supabase
      .from('professionals')
      .insert([professionalData]);
    
    if (error) {
      console.error('Error creating professional:', error);
      return false;
    }
    
    return true;
  },

  async updateProfessional(userId: string, updates: Partial<Professional>): Promise<boolean> {
    if (!supabase) return false;
    
    const { error } = await supabase
      .from('professionals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating professional:', error);
      return false;
    }
    
    return true;
  },

  async getAvailableProfessionals(category?: string): Promise<Professional[]> {
    if (!supabase) return [];
    
    let query = supabase
      .from('professionals')
      .select('*')
      .eq('is_available', true)
      .eq('kyc_status', 'verified');
    
    if (category) {
      query = query.contains('categories', [category]);
    }
    
    const { data, error } = await query.order('rating', { ascending: false });
    
    if (error) {
      console.error('Error fetching available professionals:', error);
      return [];
    }
    
    return data || [];
  }
};

// Legacy Profile operations (для совместимости)
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    // Эта функция устарела, используйте clientService, businessService или professionalService
    console.warn('profileService.getProfile is deprecated. Use specific service instead.');
    return null;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
    // Эта функция устарела, используйте clientService, businessService или professionalService
    console.warn('profileService.updateProfile is deprecated. Use specific service instead.');
    return false;
  }
};

// Pro operations
export const proService = {
  async getProProfile(userId: string): Promise<Pro | null> {
    const { data, error } = await supabase
      .from('pros')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching pro profile:', error);
      return null;
    }
    
    return data;
  },

  async createProProfile(userId: string, proData: Partial<Pro>): Promise<boolean> {
    const { error } = await supabase
      .from('pros')
      .insert([{ id: userId, ...proData }]);
    
    if (error) {
      console.error('Error creating pro profile:', error);
      return false;
    }
    
    return true;
  },

  async updateProProfile(userId: string, updates: Partial<Pro>): Promise<boolean> {
    const { error } = await supabase
      .from('pros')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating pro profile:', error);
      return false;
    }
    
    return true;
  }
};

// Job operations
export const jobService = {
  async createJob(jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('jobs')
      .insert([jobData])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating job:', error);
      return null;
    }
    
    return data.id;
  },

  async getJobsByUser(userId: string): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user jobs:', error);
      return [];
    }
    
    return data || [];
  },

  async getJobsByPro(proId: string): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('pro_id', proId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching pro jobs:', error);
      return [];
    }
    
    return data || [];
  },

  async getAvailableJobs(category?: string): Promise<Job[]> {
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('status', 'new')
      .is('pro_id', null);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching available jobs:', error);
      return [];
    }
    
    return data || [];
  },

  async acceptJob(jobId: string, proId: string): Promise<boolean> {
    const { error } = await supabase
      .from('jobs')
      .update({ 
        pro_id: proId, 
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .eq('status', 'new');
    
    if (error) {
      console.error('Error accepting job:', error);
      return false;
    }
    
    return true;
  }
};

// Tender operations
export const tenderService = {
  async createTender(tenderData: Omit<Tender, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('tenders')
      .insert([tenderData])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating tender:', error);
      return null;
    }
    
    return data.id;
  },

  async getTendersByUser(userId: string): Promise<Tender[]> {
    const { data, error } = await supabase
      .from('tenders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user tenders:', error);
      return [];
    }
    
    return data || [];
  },

  async getAvailableTenders(category?: string): Promise<Tender[]> {
    let query = supabase
      .from('tenders')
      .select('*')
      .eq('status', 'open');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching available tenders:', error);
      return [];
    }
    
    return data || [];
  }
};

// Bid operations
export const bidService = {
  async createBid(bidData: Omit<Bid, 'id' | 'created_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('bids')
      .insert([bidData])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating bid:', error);
      return null;
    }
    
    return data.id;
  },

  async getBidsByTender(tenderId: string): Promise<Bid[]> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('tender_id', tenderId)
      .order('price', { ascending: true });
    
    if (error) {
      console.error('Error fetching tender bids:', error);
      return [];
    }
    
    return data || [];
  },

  async getBidsByPro(proId: string): Promise<Bid[]> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('pro_id', proId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching pro bids:', error);
      return [];
    }
    
    return data || [];
  }
};

// Wallet operations
export const walletService = {
  async getWallet(proId: string): Promise<Wallet | null> {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('pro_id', proId)
      .single();
    
    if (error) {
      console.error('Error fetching wallet:', error);
      return null;
    }
    
    return data;
  },

  async updateBalance(proId: string, amountCents: number): Promise<boolean> {
    const { error } = await supabase
      .from('wallets')
      .update({ 
        balance_cents: amountCents,
        updated_at: new Date().toISOString()
      })
      .eq('pro_id', proId);
    
    if (error) {
      console.error('Error updating wallet balance:', error);
      return false;
    }
    
    return true;
  }
};

// Charge operations
export const chargeService = {
  async createCharge(chargeData: Omit<Charge, 'id' | 'created_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('charges')
      .insert([chargeData])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating charge:', error);
      return null;
    }
    
    return data.id;
  },

  async getChargesByPro(proId: string): Promise<Charge[]> {
    const { data, error } = await supabase
      .from('charges')
      .select('*')
      .eq('pro_id', proId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching charges:', error);
      return [];
    }
    
    return data || [];
  }
};

// Notification operations
export const notificationService = {
  async createNotification(notificationData: Omit<Notification, 'id' | 'created_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }
    
    return data.id;
  },

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    return data || [];
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
    
    return true;
  }
};

// Job Application operations
export const jobApplicationService = {
  async createApplication(applicationData: Omit<JobApplication, 'id' | 'created_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('job_applications')
      .insert([applicationData])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating job application:', error);
      return null;
    }
    
    return data.id;
  },

  async getApplicationsByJob(jobId: string): Promise<JobApplication[]> {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching job applications:', error);
      return [];
    }
    
    return data || [];
  },

  async updateApplicationStatus(applicationId: string, status: 'accepted' | 'rejected'): Promise<boolean> {
    const { error } = await supabase
      .from('job_applications')
      .update({ status })
      .eq('id', applicationId);
    
    if (error) {
      console.error('Error updating application status:', error);
      return false;
    }
    
    return true;
  }
};

// Chat operations
export const chatService = {
  async getChatsByUser(userId: string): Promise<Chat[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('chats')
      .select(`
        *,
        client:profiles!chats_client_id_fkey(full_name, email),
        professional:profiles!chats_professional_id_fkey(full_name, email),
        job:jobs(brief),
        tender:tenders(brief)
      `)
      .or(`client_id.eq.${userId},professional_id.eq.${userId}`)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
    
    return data || [];
  },

  async getMessagesByChat(chatId: string): Promise<ChatMessage[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:profiles(full_name, email)
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    
    return data || [];
  },

  async sendMessage(messageData: Omit<ChatMessage, 'id' | 'created_at'>): Promise<string | null> {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([messageData])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error sending message:', error);
      return null;
    }
    
    return data.id;
  },

  async markMessagesAsRead(chatId: string, userId: string): Promise<boolean> {
    if (!supabase) return false;
    
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('chat_id', chatId)
      .neq('sender_id', userId)
      .eq('is_read', false);
    
    if (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
    
    return true;
  },

  async createChat(chatData: Omit<Chat, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('chats')
      .insert([chatData])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating chat:', error);
      return null;
    }
    
    return data.id;
  }
};