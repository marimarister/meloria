-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view their own group membership" ON public.group_members;
DROP POLICY IF EXISTS "Users can view members in their group" ON public.group_members;
DROP POLICY IF EXISTS "Users can view their company group" ON public.company_groups;
DROP POLICY IF EXISTS "Company users can view group test results" ON public.test_results;
DROP POLICY IF EXISTS "Users can view profiles in their group" ON public.profiles;

-- Create a security definer function to get user's group IDs without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_group_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gm.group_id 
  FROM public.group_members gm 
  JOIN public.profiles p ON gm.email = p.email 
  WHERE p.id = _user_id
$$;

-- Create a security definer function to get user email without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles WHERE id = _user_id
$$;

-- Now create safe RLS policies using the security definer functions

-- Allow users to view group_members for their groups
CREATE POLICY "Users can view group members in their groups"
ON public.group_members
FOR SELECT
USING (
  group_id IN (SELECT public.get_user_group_ids(auth.uid()))
);

-- Allow users to view their company groups
CREATE POLICY "Users can view their company groups"
ON public.company_groups
FOR SELECT
USING (
  id IN (SELECT public.get_user_group_ids(auth.uid()))
);

-- Allow company users to view test results for members in their group
CREATE POLICY "Company users can view group test results"
ON public.test_results
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'hr'
  )
  AND user_id IN (
    SELECT p.id 
    FROM public.profiles p
    JOIN public.group_members gm ON p.email = gm.email
    WHERE gm.group_id IN (SELECT public.get_user_group_ids(auth.uid()))
  )
);

-- Allow users to view profiles of members in their groups
CREATE POLICY "Users can view profiles in their groups"
ON public.profiles
FOR SELECT
USING (
  email IN (
    SELECT gm.email 
    FROM public.group_members gm 
    WHERE gm.group_id IN (SELECT public.get_user_group_ids(auth.uid()))
  )
);