/*
  # Anti-Collusion System Implementation

  1. New Tables
    - `escrow` - Secure deposit management for jobs and tenders
    - `risk_events` - Tracking suspicious activities and violations
  
  2. New Views
    - `escrow_locks` - Check deposit status for jobs/tenders
    - `risk_scores` - Aggregate risk scores per user
    - `professionals_public` - Public professional profiles with contact masking
  
  3. Enhanced Tables
    - `tenders` - Added bids_locked field for sealed bidding
    - `bids` - Added unique constraint per professional per tender
    - `professionals` - Added phone_masked field
    - `chat_messages` - Added content_masked field for PII protection
    - `jobs` - Added OTP fields and timing for start/finish verification
  
  4. Security Features
    - PII masking function for chat messages
    - Chat guard trigger for automatic content masking
    - RLS policies for sealed bidding
    - Contact exposure control based on deposits
  
  5. Functions
    - `mask_pii()` - Masks phone numbers, emails, and social handles
    - `chat_guard()` - Trigger function for automatic PII masking
*/

-- 1) ESCROW SYSTEM
CREATE TABLE IF NOT EXISTS escrow (
  id BIGSERIAL PRIMARY KEY,
  subject TEXT NOT NULL CHECK (subject IN ('job', 'tender')),
  subject_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  status TEXT NOT NULL CHECK (status IN ('held', 'released', 'refunded', 'expired')),
  payment_intent_id TEXT,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on escrow
ALTER TABLE escrow ENABLE ROW LEVEL SECURITY;

-- Escrow policies
CREATE POLICY IF NOT EXISTS "Clients can read own escrow"
  ON escrow FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Clients can insert own escrow"
  ON escrow FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

-- Escrow locks view
CREATE OR REPLACE VIEW escrow_locks AS
SELECT 
  subject, 
  subject_id, 
  bool_or(status = 'held') AS has_deposit
FROM escrow
GROUP BY subject, subject_id;

-- 2) SEALED-BID ENHANCEMENTS
DO $$
BEGIN
  -- Add bids_locked column to tenders if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tenders' AND column_name = 'bids_locked'
  ) THEN
    ALTER TABLE tenders ADD COLUMN bids_locked BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add winner_bid_id column to tenders if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tenders' AND column_name = 'winner_bid_id'
  ) THEN
    ALTER TABLE tenders ADD COLUMN winner_bid_id UUID REFERENCES bids(id);
  END IF;

  -- Add pay_price column to tenders if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tenders' AND column_name = 'pay_price'
  ) THEN
    ALTER TABLE tenders ADD COLUMN pay_price INTEGER;
  END IF;

  -- Add weighted_score column to bids if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bids' AND column_name = 'weighted_score'
  ) THEN
    ALTER TABLE bids ADD COLUMN weighted_score NUMERIC(5,2);
  END IF;

  -- Add is_winner column to bids if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bids' AND column_name = 'is_winner'
  ) THEN
    ALTER TABLE bids ADD COLUMN is_winner BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Unique constraint for one bid per pro per tender
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'bids_unique_per_pro'
  ) THEN
    ALTER TABLE bids ADD CONSTRAINT bids_unique_per_pro UNIQUE(tender_id, pro_id);
  END IF;
END $$;

-- 3) PROFESSIONALS CONTACT MASKING
DO $$
BEGIN
  -- Add phone_masked column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professionals' AND column_name = 'phone_masked'
  ) THEN
    ALTER TABLE professionals ADD COLUMN phone_masked TEXT DEFAULT '[hidden]';
  END IF;
END $$;

-- Professionals public view with contact masking
CREATE OR REPLACE VIEW professionals_public AS
SELECT 
  p.id,
  p.full_name,
  p.categories,
  p.bio,
  p.rating,
  p.completed_jobs,
  p.hourly_rate,
  p.service_radius_km,
  p.kyc_status,
  p.is_available,
  p.response_time_minutes,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM jobs j
      JOIN escrow_locks el ON el.subject = 'job' AND el.subject_id = j.id AND el.has_deposit
      WHERE j.pro_id = p.id
    )
    OR EXISTS (
      SELECT 1
      FROM tenders t
      JOIN escrow_locks el ON el.subject = 'tender' AND el.subject_id = t.id AND el.has_deposit
      WHERE EXISTS (SELECT 1 FROM bids b WHERE b.tender_id = t.id AND b.pro_id = p.id)
    )
    THEN p.phone
    ELSE p.phone_masked
  END AS phone_public,
  p.created_at,
  p.updated_at
FROM professionals p;

-- 4) CHAT PII MASKING
DO $$
BEGIN
  -- Add content_masked column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'content_masked'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN content_masked TEXT;
  END IF;

  -- Add pii_detected column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'pii_detected'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN pii_detected BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- PII masking function
CREATE OR REPLACE FUNCTION mask_pii(txt TEXT) 
RETURNS TEXT 
LANGUAGE SQL 
IMMUTABLE
AS $$
  SELECT regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(LOWER($1),
            '\+?\d[\d\-\s\(\)]{7,}\d', '[hidden phone]', 'g'),
          '[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}', '[hidden email]', 'g'),
        '(telegram|tg|whatsapp|wa|viber|facebook|fb|insta|instagram|vk|discord|skype)[\s:]*[^\s]+', '[hidden handle]', 'g'),
      't\.me\/[^\s]+', '[hidden link]', 'g'),
    'wa\.me\/[^\s]+', '[hidden link]', 'g'
  );
$$;

-- Chat guard trigger function
CREATE OR REPLACE FUNCTION chat_guard() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
AS $$
DECLARE 
  has_dep BOOLEAN := FALSE;
  original_content TEXT;
  masked_content TEXT;
BEGIN
  original_content := NEW.content;
  
  -- Check if deposit exists for this chat's job/tender
  SELECT COALESCE(el.has_deposit, FALSE) INTO has_dep
  FROM chats c
  LEFT JOIN jobs j ON j.id = c.job_id
  LEFT JOIN tenders t ON t.id = c.tender_id
  LEFT JOIN escrow_locks el ON 
       (el.subject = 'job' AND el.subject_id = j.id)
    OR (el.subject = 'tender' AND el.subject_id = t.id)
  WHERE c.id = NEW.chat_id;

  IF has_dep THEN
    -- Deposit exists, show original content
    NEW.content_masked := original_content;
    NEW.pii_detected := FALSE;
  ELSE
    -- No deposit, mask PII
    masked_content := mask_pii(original_content);
    NEW.content_masked := masked_content;
    NEW.pii_detected := (masked_content != LOWER(original_content));
    
    -- Log PII attempt if detected
    IF NEW.pii_detected THEN
      INSERT INTO risk_events (actor, kind, subject, subject_id, weight, meta)
      VALUES (
        NEW.sender_id,
        'offplatform_hint',
        'chat',
        NEW.chat_id::TEXT,
        2,
        jsonb_build_object(
          'original_length', length(original_content),
          'masked_length', length(masked_content),
          'chat_id', NEW.chat_id
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END $$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS chat_messages_mask ON chat_messages;

-- Create chat guard trigger
CREATE TRIGGER chat_messages_mask
  BEFORE INSERT OR UPDATE ON chat_messages
  FOR EACH ROW 
  EXECUTE FUNCTION chat_guard();

-- 5) OTP/QR JOB MANAGEMENT
DO $$
BEGIN
  -- Add OTP fields to jobs if not exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'start_otp'
  ) THEN
    ALTER TABLE jobs ADD COLUMN start_otp TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'finish_otp'
  ) THEN
    ALTER TABLE jobs ADD COLUMN finish_otp TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'started_at'
  ) THEN
    ALTER TABLE jobs ADD COLUMN started_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'finished_at'
  ) THEN
    ALTER TABLE jobs ADD COLUMN finished_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'evidence_urls'
  ) THEN
    ALTER TABLE jobs ADD COLUMN evidence_urls TEXT[];
  END IF;
END $$;

-- Function to generate OTP
CREATE OR REPLACE FUNCTION generate_otp() 
RETURNS TEXT 
LANGUAGE SQL 
AS $$
  SELECT LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
$$;

-- Trigger to generate OTPs when job is accepted
CREATE OR REPLACE FUNCTION generate_job_otps() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    NEW.start_otp := generate_otp();
    NEW.finish_otp := generate_otp();
  END IF;
  RETURN NEW;
END $$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS jobs_generate_otps ON jobs;

-- Create OTP generation trigger
CREATE TRIGGER jobs_generate_otps
  BEFORE UPDATE ON jobs
  FOR EACH ROW 
  EXECUTE FUNCTION generate_job_otps();

-- 6) RISK EVENTS & SCORING
CREATE TABLE IF NOT EXISTS risk_events (
  id BIGSERIAL PRIMARY KEY,
  actor UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  subject TEXT,
  subject_id TEXT,
  weight INTEGER DEFAULT 1,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on risk_events
ALTER TABLE risk_events ENABLE ROW LEVEL SECURITY;

-- Risk events policies
CREATE POLICY IF NOT EXISTS "Users can read own risk events"
  ON risk_events FOR SELECT
  TO authenticated
  USING (actor = auth.uid());

-- Risk scores view
CREATE OR REPLACE VIEW risk_scores AS
SELECT 
  actor, 
  SUM(weight) AS score, 
  COUNT(*) AS events,
  MAX(created_at) AS latest_event,
  array_agg(DISTINCT kind) AS risk_types
FROM risk_events
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY actor
HAVING SUM(weight) > 0;

-- 7) SEALED-BID RLS POLICIES

-- Drop existing bid policies
DROP POLICY IF EXISTS "Users and pros can read relevant bids" ON bids;
DROP POLICY IF EXISTS "Pros can create bids" ON bids;
DROP POLICY IF EXISTS "Pros can update own bids" ON bids;

-- New sealed-bid policies
CREATE POLICY "Sealed bid select policy"
  ON bids FOR SELECT
  TO authenticated
  USING (
    -- Pros can always see their own bids
    pro_id = auth.uid()
    OR
    -- Tender owners can see all bids only after lock
    EXISTS (
      SELECT 1 FROM tenders t
      WHERE t.id = bids.tender_id
        AND t.user_id = auth.uid()
        AND t.bids_locked = TRUE
    )
  );

CREATE POLICY "Pros can create bids"
  ON bids FOR INSERT
  TO authenticated
  WITH CHECK (
    pro_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tenders t
      WHERE t.id = bids.tender_id
        AND t.status = 'open'
        AND t.bids_locked = FALSE
    )
  );

CREATE POLICY "Pros can update own bids before lock"
  ON bids FOR UPDATE
  TO authenticated
  USING (
    pro_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tenders t
      WHERE t.id = bids.tender_id
        AND t.bids_locked = FALSE
    )
  );

-- 8) HELPER FUNCTIONS

-- Function to add money to wallet
CREATE OR REPLACE FUNCTION add_to_wallet(pro_id UUID, amount_cents INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO wallets (pro_id, balance_cents)
  VALUES (pro_id, amount_cents)
  ON CONFLICT (pro_id)
  DO UPDATE SET 
    balance_cents = wallets.balance_cents + amount_cents,
    updated_at = NOW();
END $$;

-- Function to check if user can see professional contacts
CREATE OR REPLACE FUNCTION can_see_professional_contacts(
  professional_id UUID,
  requesting_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_deposit BOOLEAN := FALSE;
BEGIN
  -- Check if requesting user has deposit for any job with this professional
  SELECT EXISTS (
    SELECT 1
    FROM jobs j
    JOIN escrow_locks el ON el.subject = 'job' AND el.subject_id = j.id
    WHERE j.pro_id = professional_id
      AND j.user_id = requesting_user_id
      AND el.has_deposit = TRUE
  ) OR EXISTS (
    SELECT 1
    FROM tenders t
    JOIN bids b ON b.tender_id = t.id
    JOIN escrow_locks el ON el.subject = 'tender' AND el.subject_id = t.id
    WHERE b.pro_id = professional_id
      AND t.user_id = requesting_user_id
      AND el.has_deposit = TRUE
  ) INTO has_deposit;
  
  RETURN has_deposit;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_escrow_subject_id ON escrow(subject, subject_id);
CREATE INDEX IF NOT EXISTS idx_escrow_client_id ON escrow(client_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow(status);
CREATE INDEX IF NOT EXISTS idx_risk_events_actor ON risk_events(actor);
CREATE INDEX IF NOT EXISTS idx_risk_events_kind ON risk_events(kind);
CREATE INDEX IF NOT EXISTS idx_risk_events_created_at ON risk_events(created_at);
CREATE INDEX IF NOT EXISTS idx_tenders_bids_locked ON tenders(bids_locked);
CREATE INDEX IF NOT EXISTS idx_bids_tender_pro ON bids(tender_id, pro_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_jobs_pro_status ON jobs(pro_id, status);