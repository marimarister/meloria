-- Allow users to view their own group membership
CREATE POLICY "Users can view their own group membership"
ON public.group_members
FOR SELECT
USING (email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

-- Allow users to view other members in their group
CREATE POLICY "Users can view members in their group"
ON public.group_members
FOR SELECT
USING (
  group_id IN (
    SELECT gm.group_id 
    FROM public.group_members gm 
    JOIN public.profiles p ON gm.email = p.email 
    WHERE p.id = auth.uid()
  )
);

-- Allow users to view their company group details
CREATE POLICY "Users can view their company group"
ON public.company_groups
FOR SELECT
USING (
  id IN (
    SELECT gm.group_id 
    FROM public.group_members gm 
    JOIN public.profiles p ON gm.email = p.email 
    WHERE p.id = auth.uid()
  )
);