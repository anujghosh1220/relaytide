-- Add INSERT policy for profiles table
-- This allows users to manually create their profile if the trigger fails

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
