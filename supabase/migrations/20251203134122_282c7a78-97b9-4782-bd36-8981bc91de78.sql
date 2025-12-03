-- Add INSERT policy for profiles table
-- Note: Regular user profile creation happens via handle_new_user() trigger with SECURITY DEFINER
-- This policy allows Meloria admins to manually insert profiles if needed
CREATE POLICY "Meloria admins can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (is_meloria_admin(auth.uid()));