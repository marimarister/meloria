-- Allow users to view profiles of members in their group
CREATE POLICY "Users can view profiles in their group"
ON public.profiles
FOR SELECT
USING (
  email IN (
    SELECT gm.email 
    FROM public.group_members gm 
    WHERE gm.group_id IN (
      SELECT gm2.group_id 
      FROM public.group_members gm2 
      JOIN public.profiles p ON gm2.email = p.email 
      WHERE p.id = auth.uid()
    )
  )
);