-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  group_id UUID NOT NULL REFERENCES public.company_groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Meloria admins can do everything with events
CREATE POLICY "Meloria admins can view all events"
ON public.events FOR SELECT
USING (is_meloria_admin(auth.uid()));

CREATE POLICY "Meloria admins can insert events"
ON public.events FOR INSERT
WITH CHECK (is_meloria_admin(auth.uid()));

CREATE POLICY "Meloria admins can update events"
ON public.events FOR UPDATE
USING (is_meloria_admin(auth.uid()));

CREATE POLICY "Meloria admins can delete events"
ON public.events FOR DELETE
USING (is_meloria_admin(auth.uid()));

-- Users can view events for groups they belong to
CREATE POLICY "Users can view events in their groups"
ON public.events FOR SELECT
USING (group_id IN (SELECT get_user_group_ids(auth.uid())));

-- Create event_invitations table
CREATE TABLE public.event_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_invitations ENABLE ROW LEVEL SECURITY;

-- Meloria admins can do everything
CREATE POLICY "Meloria admins can view all invitations"
ON public.event_invitations FOR SELECT
USING (is_meloria_admin(auth.uid()));

CREATE POLICY "Meloria admins can insert invitations"
ON public.event_invitations FOR INSERT
WITH CHECK (is_meloria_admin(auth.uid()));

CREATE POLICY "Meloria admins can delete invitations"
ON public.event_invitations FOR DELETE
USING (is_meloria_admin(auth.uid()));

-- Users can view their own invitations
CREATE POLICY "Users can view their own invitations"
ON public.event_invitations FOR SELECT
USING (user_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

-- Users can update their own invitations (mark as viewed)
CREATE POLICY "Users can update their own invitations"
ON public.event_invitations FOR UPDATE
USING (user_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));