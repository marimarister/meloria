-- Add parent_group_id column to enable nested groups (departments)
ALTER TABLE public.company_groups 
ADD COLUMN parent_group_id uuid REFERENCES public.company_groups(id) ON DELETE CASCADE;

-- Create index for better query performance on parent lookups
CREATE INDEX idx_company_groups_parent ON public.company_groups(parent_group_id);