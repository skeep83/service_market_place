/*
  # Anti-Collusion and Anti-Bypass Implementation

  1. Escrow System
    - `escrow` table for holding deposits
    - `escrow_locks` view for checking deposit status
  
  2. Sealed-Bid Tenders
    - `bids_locked` field for tenders
    - Unique constraint for one bid per pro per tender
  
  3. PII Masking in Chat
    - `content_masked` column for chat messages
    - Trigger to mask phone/email/social handles
  
  4. OTP Job Start/Finish
    - OTP fields for job verification
    - Started/finished timestamps
  
  5. Risk Events & Scoring
    - Risk events tracking
    - Risk scores view
  
  6. RLS Policies
    - Sealed-bid enforcement
    - Contact exposure control
*/

-- 1) ESCROW SYSTEM
CREATE TABLE IF NOT EXISTS escrow (
  id BIGSERIAL PRIMARY KEY,
  subject TEXT CHECK (subject IN ('job','tender')) NOT NULL,
  subject_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES auth.users(id),
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  status TEXT NOT NULL CHECK (status IN ('held','released','refunded','expired')),
  payment_intent_id TEXT,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrow_subject ON escrow(subject, subject_id);
CREATE INDEX IF NOT EXISTS idx_escrow_client ON escrow(client_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow(status);

-- Escrow locks view to check deposit status
CREATE OR REPLACE VIEW escrow_locks AS
SELECT 
  subject, 
  subject_id, 
  BOOL_OR(status = 'held') AS has_deposit,
  MAX(created_at) AS latest_deposit
FROM escrow
GROUP BY subject, subject_id;

-- 2) SEALED-BID TENDERS
ALTER TABLE IF EXISTS tenders 
  ADD COLUMN IF NOT EXISTS bids_locked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bids_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS winner_bid_id UUID REFERENCES bids(id),
  ADD COLUMN IF NOT EXISTS pay_price INTEGER;

-- Ensure one bid per pro per tender
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bids_unique_per_pro'
  ) THEN
    ALTER TABLE bids ADD CONSTRAINT bids_unique_per_pro UNIQUE(tender_id, pro_id);
  END IF;
END $$;

-- Add bid scoring fields
ALTER TABLE IF EXISTS bids 
  ADD COLUMN IF NOT EXISTS weighted_score NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS is_winner BOOLEAN DEFAULT FALSE;

-- 3) PROFESSIONALS PUBLIC CONTACTS
ALTER TABLE IF EXISTS professionals
  ADD COLUMN IF NOT EXISTS phone_masked TEXT GENERATED ALWAYS AS ('[hidden]') STORED;

-- View that shows contacts only when deposit exists
CREATE OR REPLACE VIEW professionals_public AS
SELECT 
  p.id,
  p.full_name,
  p.categories,
  p.bio,
  p.rating,
  p.hourly_rate,
  p.service_radius_km,
  p.kyc_status,
  p.is_available,
  p.response_time_minutes,
  p.total_earned,
  p.completed_jobs,
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
ALTER TABLE IF EXISTS chat_messages 
  ADD COLUMN IF NOT EXISTS content_masked TEXT,
  ADD COLUMN IF NOT EXISTS pii_detected BOOLEAN DEFAULT FALSE;

-- Function to mask PII (phone, email, social handles)
CREATE OR REPLACE FUNCTION mask_pii(txt TEXT) 
RETURNS TEXT 
LANGUAGE SQL 
IMMUTABLE
AS $$
  SELECT regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace($1,
            '(\+?\d[\d\-\s\(\)]{7,}\d)', '[hidden phone]', 'g'),
          '([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})', '[hidden email]', 'g'),
        '(telegram|tg|whatsapp|wa|viber|facebook|fb|insta|instagram|vk|discord|skype)[\s:@/]*[a-zA-Z0-9._\-]+', '[hidden handle]', 'gi'),
      't\.me\/[a-zA-Z0-9._\-]+', '[hidden telegram]', 'gi'),
    '(www\.|https?://)[^\s]+', '[hidden link]', 'gi'
  );
$$;

-- Function to detect if PII exists in text
CREATE OR REPLACE FUNCTION detect_pii(txt TEXT) 
RETURNS BOOLEAN 
LANGUAGE SQL 
IMMUTABLE
AS $$
  SELECT $1 ~ '(\+?\d[\d\-\s\(\)]{7,}\d)|([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})|(telegram|tg|whatsapp|wa|viber|facebook|fb|insta|instagram|vk|discord|skype|t\.me)';
$$;

-- Trigger function for chat PII masking
CREATE OR REPLACE FUNCTION chat_guard() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
AS $$
DECLARE 
  has_dep BOOLEAN := FALSE;
  has_pii BOOLEAN := FALSE;
BEGIN
  -- Check if deposit exists for this chat's job/tender
  SELECT COALESCE(el.has_deposit, FALSE) INTO has_dep
  FROM chats c
  LEFT JOIN jobs j ON j.id = c.job_id
  LEFT JOIN tenders t ON t.id = c.tender_id
  LEFT JOIN escrow_locks el ON
       (el.subject = 'job' AND el.subject_id = j.id)
    OR (el.subject = 'tender' AND el.subject_id = t.id)
  WHERE c.id = NEW.chat_id;

  -- Detect PII in content
  has_pii := detect_pii(NEW.content);
  NEW.pii_detected := has_pii;

  -- Mask content if no deposit or apply original content if deposit exists
  IF has_dep THEN
    NEW.content_masked := NEW.content;
  ELSE
    NEW.content_masked := mask_pii(NEW.content);
    
    -- Log risk event if PII detected without deposit
    IF has_pii THEN
      INSERT INTO risk_events (actor, kind, subject, subject_id, weight, meta)
      VALUES (
        NEW.sender_id, 
        'offplatform_hint', 
        'chat', 
        NEW.chat_id, 
        2,
        jsonb_build_object('message_id', NEW.id, 'detected_at', NOW())
      );
    END IF;
  END IF;
  
  RETURN NEW;
END $$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS chat_messages_mask ON chat_messages;
CREATE TRIGGER chat_messages_mask
  BEFORE INSERT OR UPDATE ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION chat_guard();

-- 5) OTP / QR JOB VERIFICATION
ALTER TABLE IF EXISTS jobs
  ADD COLUMN IF NOT EXISTS start_otp TEXT,
  ADD COLUMN IF NOT EXISTS finish_otp TEXT,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS finished_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS evidence_urls TEXT[];

-- Function to generate OTP
CREATE OR REPLACE FUNCTION generate_otp() 
RETURNS TEXT 
LANGUAGE SQL 
AS $$
  SELECT LPAD((RANDOM() * 999999)::INT::TEXT, 6, '0');
$$;

-- 6) RISK EVENTS & SCORING
CREATE TABLE IF NOT EXISTS risk_events (
  id BIGSERIAL PRIMARY KEY,
  actor UUID NOT NULL REFERENCES auth.users(id),
  kind TEXT NOT NULL CHECK (kind IN ('offplatform_hint', 'repeat_pair', 'bid_anomaly', 'ip_device_match', 'suspicious_behavior')),
  subject TEXT,
  subject_id UUID,
  weight INTEGER DEFAULT 1,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_events_actor ON risk_events(actor);
CREATE INDEX IF NOT EXISTS idx_risk_events_kind ON risk_events(kind);
CREATE INDEX IF NOT EXISTS idx_risk_events_created ON risk_events(created_at);

-- Risk scores view
CREATE OR REPLACE VIEW risk_scores AS
SELECT 
  actor, 
  SUM(weight) AS score, 
  COUNT(*) AS events,
  MAX(created_at) AS latest_event,
  ARRAY_AGG(DISTINCT kind) AS risk_types
FROM risk_events
WHERE created_at > NOW() - INTERVAL '30 days' -- Only last 30 days
GROUP BY actor;

-- 7) RLS POLICIES

-- Enable RLS on new tables
ALTER TABLE escrow ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_events ENABLE ROW LEVEL SECURITY;

-- Escrow policies
CREATE POLICY "Users can view own escrow" ON escrow
  FOR SELECT TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Users can create own escrow" ON escrow
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

-- Risk events policies  
CREATE POLICY "Users can view own risk events" ON risk_events
  FOR SELECT TO authenticated
  USING (actor = auth.uid());

-- Bids sealed-bid policies (replace existing)
DROP POLICY IF EXISTS "Users and pros can read relevant bids" ON bids;
DROP POLICY IF EXISTS "Pros can create bids" ON bids;
DROP POLICY IF EXISTS "Pros can update own bids" ON bids;

-- Sealed-bid select policy
CREATE POLICY "bids_select_sealed" ON bids
  FOR SELECT TO authenticated
  USING (
    -- Pro can see their own bids
    pro_id = auth.uid()
    OR
    -- Tender owner can see all bids only after lock
    EXISTS (
      SELECT 1 FROM tenders t
      WHERE t.id = bids.tender_id
        AND t.user_id = auth.uid()
        AND t.bids_locked = TRUE
    )
  );

-- Bids insert policy
CREATE POLICY "bids_insert_by_pro" ON bids
  FOR INSERT TO authenticated
  WITH CHECK (pro_id = auth.uid());

-- Bids update policy (only own bids, only before lock)
CREATE POLICY "bids_update_own_before_lock" ON bids
  FOR UPDATE TO authenticated
  USING (
    pro_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM tenders t 
      WHERE t.id = bids.tender_id AND t.bids_locked = FALSE
    )
  );

-- 8) HELPER FUNCTIONS

-- Function to calculate bid weighted score
CREATE OR REPLACE FUNCTION calculate_bid_score(
  bid_price INTEGER,
  pro_rating NUMERIC,
  pro_completed_jobs INTEGER,
  warranty_days INTEGER
) 
RETURNS NUMERIC 
LANGUAGE SQL 
IMMUTABLE
AS $$
  SELECT (
    -- Price component (lower is better, normalized)
    (1.0 - (bid_price::NUMERIC / NULLIF((SELECT MAX(price) FROM bids), 0))) * 0.4 +
    -- Rating component
    (COALESCE(pro_rating, 0) / 5.0) * 0.3 +
    -- Experience component
    (LEAST(pro_completed_jobs, 100)::NUMERIC / 100.0) * 0.2 +
    -- Warranty component
    (LEAST(warranty_days, 365)::NUMERIC / 365.0) * 0.1
  ) * 100;
$$;

-- Function to update tender winner
CREATE OR REPLACE FUNCTION update_tender_winner(tender_id UUID)
RETURNS TABLE(winner_id UUID, pay_price INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  winner_bid RECORD;
  second_bid RECORD;
  final_price INTEGER;
BEGIN
  -- Get winner (highest weighted score)
  SELECT b.id, b.price, b.pro_id INTO winner_bid
  FROM bids b
  JOIN professionals p ON p.id = b.pro_id
  WHERE b.tender_id = update_tender_winner.tender_id
  ORDER BY calculate_bid_score(b.price, p.rating, p.completed_jobs, b.warranty_days) DESC
  LIMIT 1;

  -- Get second best bid for Vickrey pricing
  SELECT b.price INTO second_bid
  FROM bids b
  JOIN professionals p ON p.id = b.pro_id
  WHERE b.tender_id = update_tender_winner.tender_id
    AND b.id != winner_bid.id
  ORDER BY calculate_bid_score(b.price, p.rating, p.completed_jobs, b.warranty_days) DESC
  LIMIT 1;

  -- Set pay price (Vickrey: second best price, or winner price if only one bid)
  final_price := COALESCE(second_bid.price, winner_bid.price);

  -- Update tender
  UPDATE tenders SET
    winner_bid_id = winner_bid.id,
    pay_price = final_price,
    updated_at = NOW()
  WHERE id = update_tender_winner.tender_id;

  -- Mark winner bid
  UPDATE bids SET is_winner = TRUE WHERE id = winner_bid.id;

  RETURN QUERY SELECT winner_bid.id, final_price;
END $$;

-- 9) UPDATED TIMESTAMP TRIGGERS

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END $$;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_escrow_updated_at ON escrow;
CREATE TRIGGER update_escrow_updated_at
  BEFORE UPDATE ON escrow
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10) INITIAL DATA SETUP

-- Generate OTPs for existing jobs
UPDATE jobs 
SET 
  start_otp = generate_otp(),
  finish_otp = generate_otp()
WHERE start_otp IS NULL OR finish_otp IS NULL;