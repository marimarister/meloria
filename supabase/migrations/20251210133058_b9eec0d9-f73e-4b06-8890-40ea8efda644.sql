-- Allow company role users to view test results for members in their group
CREATE POLICY "Company users can view group test results"
ON public.test_results
FOR SELECT
USING (
  -- User must have 'hr' role
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'hr'
  )
  AND
  -- Test result user must be in the same group as the current user
  user_id IN (
    SELECT p.id 
    FROM public.profiles p
    JOIN public.group_members gm ON p.email = gm.email
    WHERE gm.group_id IN (
      SELECT gm2.group_id 
      FROM public.group_members gm2 
      JOIN public.profiles p2 ON gm2.email = p2.email 
      WHERE p2.id = auth.uid()
    )
  )
);