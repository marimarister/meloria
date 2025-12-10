-- Modify the handle_new_user function to also add user to group if group_slug is provided
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  group_slug TEXT;
  matched_group_id UUID;
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
  
  -- Check if user signed up with a group invite link
  group_slug := NEW.raw_user_meta_data->>'group_slug';
  
  IF group_slug IS NOT NULL AND group_slug != '' THEN
    -- Find the group by matching the slugified name
    SELECT id INTO matched_group_id
    FROM public.company_groups
    WHERE LOWER(REPLACE(name, ' ', '')) = LOWER(group_slug)
    LIMIT 1;
    
    -- If group found, add user as a member
    IF matched_group_id IS NOT NULL THEN
      INSERT INTO public.group_members (group_id, name, surname, email, access_rights)
      VALUES (
        matched_group_id,
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'surname',
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;