-- Create security definer function to check meloria admin status
CREATE OR REPLACE FUNCTION public.is_meloria_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.meloria_admins
    WHERE user_id = _user_id
  )
$$;

-- RLS policies for meloria_admins table
CREATE POLICY "Meloria admins can view all meloria_admins"
ON public.meloria_admins
FOR SELECT
TO authenticated
USING (public.is_meloria_admin(auth.uid()));

CREATE POLICY "Meloria admins can insert meloria_admins"
ON public.meloria_admins
FOR INSERT
TO authenticated
WITH CHECK (public.is_meloria_admin(auth.uid()));

CREATE POLICY "Meloria admins can update meloria_admins"
ON public.meloria_admins
FOR UPDATE
TO authenticated
USING (public.is_meloria_admin(auth.uid()));

-- RLS policies for company_groups table
CREATE POLICY "Meloria admins can view all company_groups"
ON public.company_groups
FOR SELECT
TO authenticated
USING (public.is_meloria_admin(auth.uid()));

CREATE POLICY "Meloria admins can insert company_groups"
ON public.company_groups
FOR INSERT
TO authenticated
WITH CHECK (public.is_meloria_admin(auth.uid()));

CREATE POLICY "Meloria admins can update company_groups"
ON public.company_groups
FOR UPDATE
TO authenticated
USING (public.is_meloria_admin(auth.uid()));

CREATE POLICY "Meloria admins can delete company_groups"
ON public.company_groups
FOR DELETE
TO authenticated
USING (public.is_meloria_admin(auth.uid()));

-- RLS policies for group_members table
CREATE POLICY "Meloria admins can view all group_members"
ON public.group_members
FOR SELECT
TO authenticated
USING (public.is_meloria_admin(auth.uid()));

CREATE POLICY "Meloria admins can insert group_members"
ON public.group_members
FOR INSERT
TO authenticated
WITH CHECK (public.is_meloria_admin(auth.uid()));

CREATE POLICY "Meloria admins can update group_members"
ON public.group_members
FOR UPDATE
TO authenticated
USING (public.is_meloria_admin(auth.uid()));

CREATE POLICY "Meloria admins can delete group_members"
ON public.group_members
FOR DELETE
TO authenticated
USING (public.is_meloria_admin(auth.uid()));