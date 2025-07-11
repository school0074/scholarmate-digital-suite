/*
  # Fix Profiles RLS Infinite Recursion

  1. Security Changes
    - Drop all existing problematic policies on profiles table
    - Create simple, non-recursive policies
    - Remove any functions that might cause recursion
    - Use only auth.uid() for user identification

  2. New Policies
    - Users can view and update their own profile only
    - Simple policy structure to prevent recursion
*/

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Drop the problematic function if it exists
DROP FUNCTION IF EXISTS get_user_role();

-- Create simple, safe policies that don't cause recursion
CREATE POLICY "Enable read access for users based on user_id"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for users based on user_id"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create a simple function that doesn't query profiles table
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role')::user_role,
    'student'::user_role
  );
$$;