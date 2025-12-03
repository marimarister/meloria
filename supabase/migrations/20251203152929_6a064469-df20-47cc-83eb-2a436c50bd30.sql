-- Add DELETE policy for meloria_admins table (Meloria admins only)
CREATE POLICY "Meloria admins can delete meloria_admins"
ON public.meloria_admins
FOR DELETE
USING (is_meloria_admin(auth.uid()));