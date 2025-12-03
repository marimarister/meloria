-- Add DELETE policy for profiles table (Meloria admins only)
CREATE POLICY "Meloria admins can delete profiles"
ON public.profiles
FOR DELETE
USING (is_meloria_admin(auth.uid()));