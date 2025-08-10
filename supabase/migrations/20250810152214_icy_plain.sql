/*
  # Fix handle_new_user trigger function

  1. Updates
    - Fix handle_new_user() function to properly handle different account types
    - Handle client, business, and professional user data correctly
    - Add proper error handling and logging

  2. Security
    - Maintains existing RLS policies
    - Ensures proper data validation
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create updated function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  account_type TEXT;
  full_name_value TEXT;
BEGIN
  -- Extract account type and role from metadata
  account_type := COALESCE((NEW.raw_user_meta_data->>'account_type')::TEXT, 'client');
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::TEXT, 'user');
  
  -- Set role to 'pro' if account_type is 'pro'
  IF account_type = 'pro' THEN
    user_role := 'pro';
  END IF;
  
  -- Determine full_name based on account type
  IF account_type = 'business' THEN
    full_name_value := COALESCE((NEW.raw_user_meta_data->>'company_name')::TEXT, NEW.email);
  ELSE
    full_name_value := COALESCE((NEW.raw_user_meta_data->>'full_name')::TEXT, NEW.email);
  END IF;
  
  -- Insert into profiles table
  INSERT INTO public.profiles (
    id,
    role,
    full_name,
    phone,
    rating,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    user_role::TEXT,
    full_name_value,
    (NEW.raw_user_meta_data->>'phone')::TEXT,
    0.0,
    NOW(),
    NOW()
  );
  
  -- Create specific user type records based on account_type
  IF account_type = 'client' THEN
    INSERT INTO public.clients (
      id,
      full_name,
      phone,
      address,
      rating,
      total_spent,
      active_orders,
      completed_orders,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      full_name_value,
      (NEW.raw_user_meta_data->>'phone')::TEXT,
      NULL,
      0.0,
      0,
      0,
      0,
      NOW(),
      NOW()
    );
    
  ELSIF account_type = 'business' THEN
    INSERT INTO public.businesses (
      id,
      company_name,
      idno,
      contact_person,
      legal_address,
      phone,
      email,
      rating,
      total_spent,
      active_contracts,
      completed_contracts,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'company_name')::TEXT,
      (NEW.raw_user_meta_data->>'idno')::TEXT,
      (NEW.raw_user_meta_data->>'contact_person')::TEXT,
      (NEW.raw_user_meta_data->>'legal_address')::TEXT,
      (NEW.raw_user_meta_data->>'phone')::TEXT,
      NEW.email,
      0.0,
      0,
      0,
      0,
      NOW(),
      NOW()
    );
    
  ELSIF account_type = 'pro' THEN
    INSERT INTO public.professionals (
      id,
      full_name,
      phone,
      categories,
      service_radius_km,
      bio,
      hourly_rate,
      rating,
      total_earned,
      active_jobs,
      completed_jobs,
      kyc_status,
      is_available,
      response_time_minutes,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      full_name_value,
      (NEW.raw_user_meta_data->>'phone')::TEXT,
      '{}',
      20,
      NULL,
      0,
      0.0,
      0,
      0,
      0,
      'pending',
      true,
      60,
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (this will appear in Supabase logs)
    RAISE LOG 'Error in handle_new_user: %, SQLSTATE: %', SQLERRM, SQLSTATE;
    -- Re-raise the exception to prevent user creation
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();