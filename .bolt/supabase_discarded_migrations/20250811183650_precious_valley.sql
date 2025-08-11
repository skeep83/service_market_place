/*
  # Anti-Collusion System Implementation

  ## New Tables
  - `escrow` - Secure deposit management for jobs and tenders
  - `risk_events` - Tracking suspicious activities and violations

  ## New Views
  - `escrow_locks` - Check deposit status for jobs/tenders
  - `risk_scores` - Aggregate risk scores per user
  - `professionals_public` - Public professional profiles with contact masking

  ## Enhanced Tables
  - `tenders` - Added bids_locked field for sealed bidding
  - `bids` - Added unique constraint per professional per tender
  - `professionals` - Added phone_masked field
  - `chat_messages` - Added content_masked field for PII protection
  - `jobs` - Added OTP fields and timing for start/finish verification

  ## Security Features
  - PII masking function for chat messages
  - Chat guard trigger for automatic content masking
  - RLS policies for sealed bidding
  - Contact exposure control based on deposits

  ## Functions
  - `mask_pii()` - Masks phone numbers, emails, and social handles
  - `chat_guard()` - Trigger function for automatic PII masking
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

-- Enable RLS on escrow
ALTER TABLE escrow ENABLE ROW LEVEL SECURITY;

-- Escrow policies
CREATE POLICY IF NOT EXISTS "Users can read own escrow"
  ON escrow FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY IF NOT EXISTS "System can manage escrow"
  ON escrow FOR ALL
  TO service_role
  USING (true);

-- 2) ESCROW LOCKS VIEW
CREATE OR REPLACE VIEW escrow_locks AS
SELECT 
  subject, 
  subject_id, 
  bool_or(status = 'held') AS has_deposit
FROM escrow
GROUP BY subject, subject_id;

-- 3) ADD BIDS_LOCKED TO TENDERS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tenders' AND column_name = 'bids_locked'
  ) THEN
    ALTER TABLE tenders ADD COLUMN bids_locked BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 4) ADD WINNER FIELDS TO TENDERS
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

-- 5) ADD UNIQUE CONSTRAINT TO BIDS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'bids_tender_pro_unique'
  ) THEN
    ALTER TABLE bids ADD CONSTRAINT bids_tender_pro_unique UNIQUE (tender_id, pro_id);
  END IF;
END $$;

-- 6) ADD WEIGHTED SCORE AND WINNER FLAG TO BIDS
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

-- 7) ADD PHONE_MASKED TO PROFESSIONALS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professionals' AND column_name = 'phone_masked'
  ) THEN
    ALTER TABLE professionals ADD COLUMN phone_masked TEXT DEFAULT '[hidden]';
  END IF;
END $$;

-- 8) PROFESSIONALS PUBLIC VIEW
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
      JOIN escrow_locks el ON el.subject = 'job' AND el.subject_id = j.id AND el.has_deposit = true
      WHERE j.pro_id = p.id
    )
    OR EXISTS (
      SELECT 1
      FROM tenders t
      JOIN bids b ON b.tender_id = t.id AND b.pro_id = p.id
      JOIN escrow_locks el ON el.subject = 'tender' AND el.subject_id = t.id AND el.has_deposit = true
    )
    THEN p.phone
    ELSE p.phone_masked
  END AS phone_public,
  p.created_at,
  p.updated_at
FROM professionals p;

-- 9) ADD CONTENT_MASKED TO CHAT_MESSAGES
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

-- 10) PII MASKING FUNCTION
CREATE OR REPLACE FUNCTION mask_pii(txt TEXT) 
RETURNS TEXT 
LANGUAGE SQL 
IMMUTABLE
AS $$
  SELECT regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          COALESCE(txt, ''),
          '\+?\d[\d\-\s\(\)]{7,}\d', '[hidden phone]', 'g'
        ),
        '[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', '[hidden email]', 'g'
      ),
      '(telegram|tg|whatsapp|wa|viber|facebook|fb|insta|instagram|vk|discord|skype)[\s:]*[^\s]+', '[hidden handle]', 'gi'
    ),
    't\.me/[^\s]+', '[hidden link]', 'gi'
  );
$$;

-- 11) CHAT GUARD TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION chat_guard() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
AS $$
DECLARE 
  has_dep BOOLEAN := FALSE;
  original_content TEXT;
  masked_content TEXT;
BEGIN
  -- Get original content
  original_content := COALESCE(NEW.content, '');
  
  -- Check if deposit exists for this chat
  SELECT COALESCE(el.has_deposit, FALSE) INTO has_dep
  FROM chats c
  LEFT JOIN jobs j ON j.id = c.job_id
  LEFT JOIN tenders t ON t.id = c.tender_id
  LEFT JOIN escrow_locks el ON 
    (el.subject = 'job' AND el.subject_id = j.id) OR
    (el.subject = 'tender' AND el.subject_id = t.id)
  WHERE c.id = NEW.chat_id;

  -- Mask content if no deposit
  IF has_dep THEN
    NEW.content_masked := original_content;
    NEW.pii_detected := FALSE;
  ELSE
    masked_content := mask_pii(original_content);
    NEW.content_masked := masked_content;
    NEW.pii_detected := (masked_content != original_content);
    
    -- Log PII attempt if detected
    IF NEW.pii_detected AND NEW.sender_id != 'system' THEN
      INSERT INTO risk_events (actor, kind, subject, subject_id, weight, meta)
      VALUES (
        NEW.sender_id::UUID,
        'offplatform_hint',
        'chat',
        NEW.chat_id::UUID,
        2,
        jsonb_build_object(
          'message_id', NEW.id,
          'original_length', length(original_content),
          'masked_length', length(masked_content)
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END $$;

-- 12) CREATE CHAT GUARD TRIGGER
DROP TRIGGER IF EXISTS chat_messages_mask ON chat_messages;
CREATE TRIGGER chat_messages_mask
  BEFORE INSERT OR UPDATE ON chat_messages
  FOR EACH ROW 
  EXECUTE FUNCTION chat_guard();

-- 13) ADD OTP FIELDS TO JOBS
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

-- 14) RISK EVENTS TABLE
CREATE TABLE IF NOT EXISTS risk_events (
  id BIGSERIAL PRIMARY KEY,
  actor UUID NOT NULL,
  kind TEXT NOT NULL,
  subject TEXT,
  subject_id UUID,
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

CREATE POLICY IF NOT EXISTS "System can manage risk events"
  ON risk_events FOR ALL
  TO service_role
  USING (true);

-- 15) RISK SCORES VIEW
CREATE OR REPLACE VIEW risk_scores AS
SELECT 
  actor, 
  COALESCE(SUM(weight), 0) AS score, 
  COUNT(*) AS events,
  MAX(created_at) AS latest_event,
  array_agg(DISTINCT kind) AS risk_types
FROM risk_events
GROUP BY actor;

-- 16) SEALED BID RLS POLICIES
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "bids_select_sealed" ON bids;
DROP POLICY IF EXISTS "bids_insert_by_pro" ON bids;

-- Sealed bid select policy
CREATE POLICY "bids_select_sealed" ON bids
  FOR SELECT TO authenticated
  USING (
    -- Pros can see their own bids
    pro_id = auth.uid()
    OR
    -- Tender owners can see all bids only after lock
    EXISTS (
      SELECT 1 FROM tenders t
      WHERE t.id = bids.tender_id
        AND t.user_id = auth.uid()
        AND t.bids_locked = true
    )
  );

-- Bid insert policy
CREATE POLICY "bids_insert_by_pro" ON bids
  FOR INSERT TO authenticated
  WITH CHECK (pro_id = auth.uid());

-- Bid update policy (pros can update their own bids before lock)
CREATE POLICY IF NOT EXISTS "bids_update_before_lock" ON bids
  FOR UPDATE TO authenticated
  USING (
    pro_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM tenders t 
      WHERE t.id = bids.tender_id AND t.bids_locked = false
    )
  );

-- 17) CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_escrow_subject ON escrow(subject, subject_id);
CREATE INDEX IF NOT EXISTS idx_escrow_client ON escrow(client_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow(status);

CREATE INDEX IF NOT EXISTS idx_risk_events_actor ON risk_events(actor);
CREATE INDEX IF NOT EXISTS idx_risk_events_kind ON risk_events(kind);
CREATE INDEX IF NOT EXISTS idx_risk_events_created ON risk_events(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_masked ON chat_messages(pii_detected) WHERE pii_detected = true;

CREATE INDEX IF NOT EXISTS idx_tenders_locked ON tenders(bids_locked);
CREATE INDEX IF NOT EXISTS idx_bids_winner ON bids(is_winner) WHERE is_winner = true;

-- 18) GENERATE OTP FUNCTION
CREATE OR REPLACE FUNCTION generate_otp() 
RETURNS TEXT 
LANGUAGE SQL 
AS $$
  SELECT LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
$$;

-- 19) AUTO-GENERATE OTP FOR NEW JOBS
CREATE OR REPLACE FUNCTION auto_generate_job_otps()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.start_otp IS NULL THEN
    NEW.start_otp := generate_otp();
  END IF;
  
  IF NEW.finish_otp IS NULL THEN
    NEW.finish_otp := generate_otp();
  END IF;
  
  RETURN NEW;
END $$;

-- Create trigger for auto OTP generation
DROP TRIGGER IF EXISTS jobs_auto_otp ON jobs;
CREATE TRIGGER jobs_auto_otp
  BEFORE INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_job_otps();

-- 20) WALLET HELPER FUNCTION
CREATE OR REPLACE FUNCTION add_to_wallet(pro_id UUID, amount_cents BIGINT)
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

-- 21) UPDATE EXISTING CHAT MESSAGES WITH MASKED CONTENT
UPDATE chat_messages 
SET content_masked = mask_pii(content),
    pii_detected = (mask_pii(content) != content)
WHERE content_masked IS NULL;