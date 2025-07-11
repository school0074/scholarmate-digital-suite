/*
  # Fix RLS Policies for Profiles Table

  1. Security Changes
    - Remove recursive policy that causes infinite recursion
    - Add safe policies that don't query the profiles table within themselves
    - Use auth.uid() and JWT claims instead of database queries in policies

  2. Policy Updates
    - Replace problematic admin policy with JWT-based role checking
    - Ensure all policies use non-recursive logic
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create safe, non-recursive policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create admin policy using JWT claims instead of database query
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role')::user_role,
      'student'::user_role
    ) = 'admin'::user_role
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role')::user_role,
      'student'::user_role
    ) = 'admin'::user_role
  );

-- Update the get_user_role function to be safer
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