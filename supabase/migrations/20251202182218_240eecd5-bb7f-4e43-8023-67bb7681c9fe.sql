-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Update emails for existing users
UPDATE public.profiles SET email = 'laura.mezsarga@gmail.com' WHERE id = 'b20e46cc-5db8-474f-9608-bc21cec3d45f';
UPDATE public.profiles SET email = 'valerija.aulmane@gmail.com' WHERE id = '47ee233f-1e56-4f76-a28e-35e6158d52ed';
UPDATE public.profiles SET email = 'mariam.inanishvili@gmail.com' WHERE id = '3cfad58d-ae7b-4134-a0fa-020093e4bc73';
UPDATE public.profiles SET email = 'marimarister@gmail.com' WHERE id = 'c833c5f7-1389-412f-9482-f3493ef4f4ae';