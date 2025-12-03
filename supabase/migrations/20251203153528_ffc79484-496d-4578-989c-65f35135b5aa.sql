-- Update the handle_new_user function to not require personal_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, name, surname, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'surname',
    NEW.email
  );
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'role')::app_role
  );
  
  RETURN NEW;
END;
$function$;

-- Make personal_id nullable in profiles table
ALTER TABLE public.profiles ALTER COLUMN personal_id DROP NOT NULL;