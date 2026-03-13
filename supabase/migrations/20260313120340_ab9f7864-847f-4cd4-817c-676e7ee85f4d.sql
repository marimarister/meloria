
-- Create practices table (catalog managed by Meloria admins)
CREATE TABLE public.practices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  provider text,
  price_credits integer DEFAULT 0,
  duration_minutes integer,
  format text CHECK (format IN ('online', 'offline', 'hybrid')),
  social_fit_solo numeric(3,2) DEFAULT 0,
  social_fit_group numeric(3,2) DEFAULT 0,
  intensity text CHECK (intensity IN ('soft', 'medium', 'intensive')),
  targets_ee numeric(3,2) DEFAULT 0,
  targets_dp numeric(3,2) DEFAULT 0,
  targets_pa numeric(3,2) DEFAULT 0,
  fit_v numeric(3,2) DEFAULT 0,
  fit_a numeric(3,2) DEFAULT 0,
  fit_k numeric(3,2) DEFAULT 0,
  fit_d numeric(3,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on practices
ALTER TABLE public.practices ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read active practices
CREATE POLICY "Authenticated users can read active practices"
ON public.practices FOR SELECT
TO authenticated
USING (is_active = true OR public.is_meloria_admin(auth.uid()));

-- Meloria admins can insert practices
CREATE POLICY "Meloria admins can insert practices"
ON public.practices FOR INSERT
TO authenticated
WITH CHECK (public.is_meloria_admin(auth.uid()));

-- Meloria admins can update practices
CREATE POLICY "Meloria admins can update practices"
ON public.practices FOR UPDATE
TO authenticated
USING (public.is_meloria_admin(auth.uid()))
WITH CHECK (public.is_meloria_admin(auth.uid()));

-- Meloria admins can delete practices
CREATE POLICY "Meloria admins can delete practices"
ON public.practices FOR DELETE
TO authenticated
USING (public.is_meloria_admin(auth.uid()));

-- Create updated_at trigger for practices
CREATE OR REPLACE FUNCTION public.update_practices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER practices_updated_at
BEFORE UPDATE ON public.practices
FOR EACH ROW
EXECUTE FUNCTION public.update_practices_updated_at();

-- Create cart_items table
CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  practice_id uuid NOT NULL REFERENCES public.practices ON DELETE CASCADE,
  cart_role text CHECK (cart_role IN ('core', 'support', 'optional')),
  period_start date NOT NULL,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, practice_id, period_start)
);

-- Enable RLS on cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Users can read their own cart items
CREATE POLICY "Users can read own cart items"
ON public.cart_items FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_meloria_admin(auth.uid()));

-- Users can insert their own cart items
CREATE POLICY "Users can insert own cart items"
ON public.cart_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart items
CREATE POLICY "Users can update own cart items"
ON public.cart_items FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own cart items
CREATE POLICY "Users can delete own cart items"
ON public.cart_items FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
