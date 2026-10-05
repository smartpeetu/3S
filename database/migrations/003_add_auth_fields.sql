ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.team_members
ADD CONSTRAINT team_members_auth_user_id_fkey
FOREIGN KEY (auth_user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;