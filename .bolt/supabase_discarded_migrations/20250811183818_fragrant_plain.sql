/*
  # Anti-Collusion System Implementation

  1. New Tables
    - `escrow` - Secure deposit management for jobs and tenders
      - `id` (bigserial, primary key)
      - `subject` (text, 'job' or 'tender')
      - `subject_id` (uuid, references jobs/tenders)
      - `client_id` (uuid, references auth.users)
      - `amount_cents` (bigint, deposit amount)
      - `status` (text, 'held'|'released'|'refunded'|'expired')
      - `payment_intent_id` (text, external payment reference)
      - `meta` (jsonb, additional data)
      - `created_at` (timestamptz)

    - `risk_events` - Tracking suspicious activities and violations
      - `id` (bigserial, primary key)
      - `actor` (uuid, user performing action)
      - `kind` (text, type of risk event)
      - `subject` (text, related object type)
      - `subject_id` (uuid, related object id)
      - `weight` (integer, risk weight)
      - `meta` (jsonb, additional context)
      - `created_at` (timestamptz)

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
    - `generate_otp()` - Generate 6-digit OTP codes
    - `add_to_wallet()` - Add funds to professional wallet
*/

-- 1) ESCROW TABLE
CREATE TABLE IF NOT EXISTS escrow (
  id BIGSERIAL PRIMARY KEY,
  subject TEXT NOT NULL CHECK (subject IN ('job', 'tender')),
  subject_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  status TEXT NOT NULL CHECK (status IN ('held', 'released', 'refunded', 'expired')),
  payment_intent_id TEXT,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for escrow
CREATE INDEX IF NOT EXISTS idx_escrow_subject ON escrow(subject, subject_id);
CREATE INDEX IF NOT EXISTS idx_escrow_client ON escrow(client_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow(status);

-- Enable RLS on escrow
ALTER TABLE escrow ENABLE ROW LEVEL SECURITY;

-- RLS policies for escrow
CREATE POLICY "Users can read own escrow" ON escrow
  FOR SELECT TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Users can insert own escrow" ON escrow
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

-- 2) ESCROW LOCKS VIEW
CREATE OR REPLACE VIEW escrow_locks AS
SELECT 
  subject,
  subject_id,
  bool_or(status = 'held') AS has_deposit,
  max(created_at) AS latest_deposit
FROM escrow
GROUP BY subject, subject_id;

-- 3) RISK EVENTS TABLE
CREATE TABLE IF NOT EXISTS risk_events (
  id BIGSERIAL PRIMARY KEY,
  actor UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  subject TEXT,
  subject_id UUID,
  weight INTEGER DEFAULT 1,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for risk_events
CREATE INDEX IF NOT EXISTS idx_risk_events_actor ON risk_events(actor);
CREATE INDEX IF NOT EXISTS idx_risk_events_kind ON risk_events(kind);
CREATE INDEX IF NOT EXISTS idx_risk_events_created ON risk_events(created_at);

-- Enable RLS on risk_events
ALTER TABLE risk_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for risk_events
CREATE POLICY "Users can read own risk events" ON risk_events
  FOR SELECT TO authenticated
  USING (actor = auth.uid());

-- 4) RISK SCORES VIEW
CREATE OR REPLACE VIEW risk_scores AS
SELECT 
  actor,
  COALESCE(SUM(weight), 0) AS score,
  COUNT(*) AS events,
  MAX(created_at) AS latest_event,
  array_agg(DISTINCT kind) AS risk_types
FROM risk_events
GROUP BY actor;

-- 5) ADD BIDS_LOCKED TO TENDERS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tenders' AND column_name = 'bids_locked'
  ) THEN
    ALTER TABLE tenders ADD COLUMN bids_locked BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 6) ADD WINNER FIELDS TO TENDERS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tenders' AND column_name = 'winner_bid_id'
  ) THEN
    ALTER TABLE tenders ADD COLUMN winner_bid_id UUID REFERENCES bids(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tenders' AND column_name = 'pay_price'
  ) THEN
    ALTER TABLE tenders ADD COLUMN pay_price INTEGER;
  END IF;
END $$;

-- 7) ADD UNIQUE CONSTRAINT TO BIDS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'bids_unique_per_pro'
  ) THEN
    ALTER TABLE bids ADD CONSTRAINT bids_unique_per_pro UNIQUE(tender_id, pro_id);
  END IF;
END $$;

-- 8) ADD WEIGHTED SCORE TO BIDS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bids' AND column_name = 'weighted_score'
  ) THEN
    ALTER TABLE bids ADD COLUMN weighted_score NUMERIC(5,2);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bids' AND column_name = 'is_winner'
  ) THEN
    ALTER TABLE bids ADD COLUMN is_winner BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 9) ADD PHONE_MASKED TO PROFESSIONALS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professionals' AND column_name = 'phone_masked'
  ) THEN
    ALTER TABLE professionals ADD COLUMN phone_masked TEXT DEFAULT '[hidden]';
  END IF;
END $$;

-- 10) PROFESSIONALS PUBLIC VIEW
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
      SELECT 1 FROM jobs j
      JOIN escrow_locks el ON el.subject = 'job' AND el.subject_id = j.id AND el.has_deposit = true
      WHERE j.pro_id = p.id
    )
    OR EXISTS (
      SELECT 1 FROM tenders t
      JOIN bids b ON b.tender_id = t.id AND b.pro_id = p.id
      JOIN escrow_locks el ON el.subject = 'tender' AND el.subject_id = t.id AND el.has_deposit = true
    )
    THEN p.phone
    ELSE '[hidden]'
  END AS phone_public,
  p.created_at,
  p.updated_at
FROM professionals p;

-- 11) ADD CONTENT_MASKED TO CHAT_MESSAGES
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'content_masked'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN content_masked TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'pii_detected'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN pii_detected BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 12) PII MASKING FUNCTION
CREATE OR REPLACE FUNCTION mask_pii(input_text TEXT) 
RETURNS TEXT 
LANGUAGE SQL 
IMMUTABLE
AS $$
  SELECT regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            input_text,
            '\+?[0-9][\d\s\-\(\)]{7,}\d', '[hidden phone]', 'g'
          ),
          '[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', '[hidden email]', 'g'
        ),
        '(telegram|tg|whatsapp|wa|viber|facebook|fb|insta|instagram|vk|discord|skype)[\s:]*[a-zA-Z0-9_\-\.]+', '[hidden handle]', 'gi'
      ),
      't\.me/[a-zA-Z0-9_]+', '[hidden link]', 'gi'
    ),
    'wa\.me/[0-9]+', '[hidden link]', 'gi'
  );
$$;

-- 13) CHAT GUARD TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION chat_guard() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
AS $$
DECLARE 
  has_deposit BOOLEAN := FALSE;
  original_content TEXT;
  masked_content TEXT;
BEGIN
  original_content := NEW.content;
  
  -- Check if deposit exists for this chat's job/tender
  SELECT COALESCE(el.has_deposit, FALSE) INTO has_deposit
  FROM chats c
  LEFT JOIN jobs j ON j.id = c.job_id
  LEFT JOIN tenders t ON t.id = c.tender_id
  LEFT JOIN escrow_locks el ON 
    (el.subject = 'job' AND el.subject_id = j.id) OR
    (el.subject = 'tender' AND el.subject_id = t.id)
  WHERE c.id = NEW.chat_id;

  IF has_deposit THEN
    -- Deposit exists, show original content
    NEW.content_masked := original_content;
    NEW.pii_detected := FALSE;
  ELSE
    -- No deposit, mask PII
    masked_content := mask_pii(original_content);
    NEW.content_masked := masked_content;
    NEW.pii_detected := (masked_content != original_content);
    
    -- Log PII attempt if detected
    IF NEW.pii_detected THEN
      INSERT INTO risk_events (actor, kind, subject, subject_id, weight, meta)
      VALUES (
        NEW.sender_id,
        'offplatform_hint',
        'chat',
        NEW.chat_id::TEXT::UUID,
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

-- 14) CREATE CHAT GUARD TRIGGER
DROP TRIGGER IF EXISTS chat_messages_mask ON chat_messages;
CREATE TRIGGER chat_messages_mask
  BEFORE INSERT OR UPDATE ON chat_messages
  FOR EACH ROW 
  EXECUTE FUNCTION chat_guard();

-- 15) ADD OTP FIELDS TO JOBS
DO $$
BEGIN
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

-- 16) GENERATE OTP FUNCTION
CREATE OR REPLACE FUNCTION generate_otp() 
RETURNS TEXT 
LANGUAGE SQL 
AS $$
  SELECT LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
$$;

-- 17) ADD TO WALLET FUNCTION
CREATE OR REPLACE FUNCTION add_to_wallet(pro_id UUID, amount_cents BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO wallets (pro_id, balance_cents)
  VALUES (pro_id, amount_cents)
  ON CONFLICT (pro_id)
  DO UPDATE SET 
    balance_cents = wallets.balance_cents + amount_cents,
    updated_at = NOW();
END $$;

-- 18) UPDATE BIDS RLS POLICIES
DROP POLICY IF EXISTS "Users and pros can read relevant bids" ON bids;

-- Sealed bid policy: pros see only their own bids before lock
CREATE POLICY "Sealed bid select policy" ON bids
  FOR SELECT TO authenticated
  USING (
    pro_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM tenders t
      WHERE t.id = bids.tender_id
        AND t.user_id = auth.uid()
        AND t.bids_locked = true
    )
  );

-- Pros can insert their own bids
CREATE POLICY "Pros can insert own bids" ON bids
  FOR INSERT TO authenticated
  WITH CHECK (pro_id = auth.uid());

-- Pros can update their own bids (before lock)
CREATE POLICY "Pros can update own bids before lock" ON bids
  FOR UPDATE TO authenticated
  USING (
    pro_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tenders t
      WHERE t.id = bids.tender_id AND t.bids_locked = false
    )
  );

-- 19) UPDATE CHAT_MESSAGES RLS POLICIES
-- Users can read messages in their chats
CREATE POLICY IF NOT EXISTS "Users can read chat messages" ON chat_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chats c
      WHERE c.id = chat_messages.chat_id
        AND (c.client_id = auth.uid() OR c.professional_id = auth.uid())
    )
  );

-- Users can insert messages in their chats
CREATE POLICY IF NOT EXISTS "Users can insert chat messages" ON chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM chats c
      WHERE c.id = chat_messages.chat_id
        AND (c.client_id = auth.uid() OR c.professional_id = auth.uid())
    )
  );

-- 20) CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_risk_events_actor_kind ON risk_events(actor, kind);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_created ON chat_messages(chat_id, created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_otp ON jobs(start_otp, finish_otp) WHERE start_otp IS NOT NULL OR finish_otp IS NOT NULL;

-- 21) UPDATE EXISTING CHAT_MESSAGES WITH MASKED CONTENT
UPDATE chat_messages 
SET content_masked = mask_pii(content),
    pii_detected = (mask_pii(content) != content)
WHERE content_masked IS NULL;