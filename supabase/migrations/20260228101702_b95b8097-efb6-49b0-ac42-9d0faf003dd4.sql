
-- Add permissive base SELECT policies requiring authentication on all sensitive tables
-- These work with existing RESTRICTIVE policies: (permissive passes) AND (all restrictive pass)

-- profiles
CREATE POLICY "Authenticated users base access"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- group_members
CREATE POLICY "Authenticated users base access"
ON public.group_members FOR SELECT
TO authenticated
USING (true);

-- event_invitations
CREATE POLICY "Authenticated users base access"
ON public.event_invitations FOR SELECT
TO authenticated
USING (true);

-- test_results
CREATE POLICY "Authenticated users base access"
ON public.test_results FOR SELECT
TO authenticated
USING (true);

-- user_roles
CREATE POLICY "Authenticated users base access"
ON public.user_roles FOR SELECT
TO authenticated
USING (true);

-- meloria_admins
CREATE POLICY "Authenticated users base access"
ON public.meloria_admins FOR SELECT
TO authenticated
USING (true);
