-- Create a table to store user test results
CREATE TABLE public.test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type text NOT NULL CHECK (test_type IN ('burnout', 'perception', 'preference')),
  scores jsonb NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, test_type)
);

-- Enable RLS
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Users can view their own results
CREATE POLICY "Users can view their own test results"
ON public.test_results
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own results
CREATE POLICY "Users can insert their own test results"
ON public.test_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own results
CREATE POLICY "Users can update their own test results"
ON public.test_results
FOR UPDATE
USING (auth.uid() = user_id);

-- Meloria admins can view all test results
CREATE POLICY "Meloria admins can view all test results"
ON public.test_results
FOR SELECT
USING (is_meloria_admin(auth.uid()));

-- Meloria admins can delete test results (for reset)
CREATE POLICY "Meloria admins can delete test results"
ON public.test_results
FOR DELETE
USING (is_meloria_admin(auth.uid()));