-- Drop indexes first
DROP INDEX IF EXISTS public.idx_team_specialties_team_id;
DROP INDEX IF EXISTS public.idx_team_specialties_tag_id;

-- Drop policies
DROP POLICY IF EXISTS "Admins can manage team specialties" ON public.team_specialties;
DROP POLICY IF EXISTS "Workers can view team specialties" ON public.team_specialties;

-- Drop the table
DROP TABLE IF EXISTS public.team_specialties; 