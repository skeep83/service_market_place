/*
  # Initial Database Schema Setup

  1. New Tables
    - `profiles` - User profiles with role-based access
    - `pros` - Professional service provider details
    - `jobs` - Instant booking jobs
    - `tenders` - Auction-based projects
    - `bids` - Bids on tenders
    - `wallets` - Professional earnings tracking
    - `charges` - Transaction history

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Role-based access control

  3. Extensions
    - Enable PostGIS for location data
    - Enable UUID generation
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'pro', 'admin')),
  full_name text,
  phone text,
  rating numeric(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pros table for professional details
CREATE TABLE IF NOT EXISTS pros (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  categories text[] DEFAULT '{}',
  service_radius_km integer DEFAULT 20 CHECK (service_radius_km > 0),
  kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create jobs table for instant bookings
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  geo geography(POINT, 4326),
  brief text,
  price_est_min integer CHECK (price_est_min > 0),
  price_est_max integer CHECK (price_est_max >= price_est_min),
  status text DEFAULT 'new' CHECK (status IN ('new', 'offered', 'accepted', 'in_progress', 'done', 'disputed', 'cancelled')),
  pro_id uuid REFERENCES profiles(id),
  scheduled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tenders table for auction-based projects
CREATE TABLE IF NOT EXISTS tenders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  geo geography(POINT, 4326),
  brief text,
  window_from timestamptz,
  window_to timestamptz,
  budget_hint integer CHECK (budget_hint > 0),
  status text DEFAULT 'open' CHECK (status IN ('open', 'bafo', 'awarded', 'cancelled', 'expired')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  pro_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  price integer NOT NULL CHECK (price > 0),
  eta_slot text,
  warranty_days integer DEFAULT 0 CHECK (warranty_days >= 0),
  note text,
  is_final boolean DEFAULT false,
  score numeric(3,2) CHECK (score >= 0 AND score <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tender_id, pro_id)
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  pro_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance_cents integer DEFAULT 0 CHECK (balance_cents >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create charges table for transaction history
CREATE TABLE IF NOT EXISTS charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  subject_id uuid,
  pro_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL,
  meta jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pros ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE charges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Pros policies
CREATE POLICY "Anyone can read pro profiles"
  ON pros
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Pros can update own profile"
  ON pros
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Pros can insert own profile"
  ON pros
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Jobs policies
CREATE POLICY "Users can read own jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = pro_id);

CREATE POLICY "Users can create jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and pros can update jobs"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = pro_id);

-- Tenders policies
CREATE POLICY "Anyone can read open tenders"
  ON tenders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tenders"
  ON tenders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tenders"
  ON tenders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Bids policies
CREATE POLICY "Users and pros can read relevant bids"
  ON bids
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = pro_id OR 
    auth.uid() IN (SELECT user_id FROM tenders WHERE id = tender_id)
  );

CREATE POLICY "Pros can create bids"
  ON bids
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = pro_id);

CREATE POLICY "Pros can update own bids"
  ON bids
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = pro_id);

-- Wallets policies
CREATE POLICY "Pros can read own wallet"
  ON wallets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = pro_id);

CREATE POLICY "Pros can update own wallet"
  ON wallets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = pro_id);

CREATE POLICY "System can insert wallets"
  ON wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = pro_id);

-- Charges policies
CREATE POLICY "Pros can read own charges"
  ON charges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = pro_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_pro_id ON jobs(pro_id);
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_category ON tenders(category);
CREATE INDEX IF NOT EXISTS idx_tenders_user_id ON tenders(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_tender_id ON bids(tender_id);
CREATE INDEX IF NOT EXISTS idx_bids_pro_id ON bids(pro_id);
CREATE INDEX IF NOT EXISTS idx_charges_pro_id ON charges(pro_id);

-- Create spatial indexes for geography columns
CREATE INDEX IF NOT EXISTS idx_jobs_geo ON jobs USING GIST(geo);
CREATE INDEX IF NOT EXISTS idx_tenders_geo ON tenders USING GIST(geo);

-- Create function to automatically create wallet for new pros
CREATE OR REPLACE FUNCTION create_wallet_for_pro()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'pro' THEN
    INSERT INTO wallets (pro_id) VALUES (NEW.id)
    ON CONFLICT (pro_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create wallet
DROP TRIGGER IF EXISTS trigger_create_wallet_for_pro ON profiles;
CREATE TRIGGER trigger_create_wallet_for_pro
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_wallet_for_pro();

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();