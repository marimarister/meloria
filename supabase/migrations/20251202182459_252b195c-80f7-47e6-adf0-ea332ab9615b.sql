-- Allow Meloria admins to view all profiles
CREATE POLICY "Meloria admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_meloria_admin(auth.uid()));

-- Allow Meloria admins to update all profiles
CREATE POLICY "Meloria admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.is_meloria_admin(auth.uid()));

-- Allow Meloria admins to view all user_roles
CREATE POLICY "Meloria admins can view all user_roles"
ON public.user_roles
FOR SELECT
USING (public.is_meloria_admin(auth.uid()));

-- Allow Meloria admins to update all user_roles
CREATE POLICY "Meloria admins can update all user_roles"
ON public.user_roles
FOR UPDATE
USING (public.is_meloria_admin(auth.uid()));