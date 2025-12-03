-- Create a function to get user's last sign in time (security definer to access auth.users)
CREATE OR REPLACE FUNCTION public.get_user_last_sign_in(_user_id uuid)
RETURNS timestamp with time zone
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT last_sign_in_at
  FROM auth.users
  WHERE id = _user_id
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_last_sign_in(uuid) TO authenticated;