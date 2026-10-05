ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'User';

ALTER TABLE public.team_members
ADD CONSTRAINT team_members_role_check
CHECK (role IN ('Admin', 'User'));