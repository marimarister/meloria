-- Remove the policy that exposes personal data to other group members
DROP POLICY IF EXISTS "Users can view profiles in their groups" ON public.profiles;