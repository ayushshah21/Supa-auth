-- Enable RLS on teams table
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Workers and admins can create teams" ON public.teams;
DROP POLICY IF EXISTS "Workers and admins can view teams" ON public.teams;
DROP POLICY IF EXISTS "Workers and admins can update teams" ON public.teams;
DROP POLICY IF EXISTS "Workers and admins can delete teams" ON public.teams;

-- Create policies for team management
CREATE POLICY "Workers and admins can create teams"
    ON public.teams
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.jwt()->>'role' IN ('WORKER', 'ADMIN')
    );

CREATE POLICY "Workers and admins can view teams"
    ON public.teams
    FOR SELECT
    TO authenticated
    USING (
        auth.jwt()->>'role' IN ('WORKER', 'ADMIN')
    );

CREATE POLICY "Workers and admins can update teams"
    ON public.teams
    FOR UPDATE
    TO authenticated
    USING (
        auth.jwt()->>'role' IN ('WORKER', 'ADMIN')
    );

CREATE POLICY "Workers and admins can delete teams"
    ON public.teams
    FOR DELETE
    TO authenticated
    USING (
        auth.jwt()->>'role' IN ('WORKER', 'ADMIN')
    );

-- Enable RLS on team_members table
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Workers and admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Workers and admins can view team members" ON public.team_members;

-- Create policies for team member management
CREATE POLICY "Workers and admins can manage team members"
    ON public.team_members
    FOR ALL
    TO authenticated
    USING (
        auth.jwt()->>'role' IN ('WORKER', 'ADMIN')
    );

CREATE POLICY "Workers and admins can view team members"
    ON public.team_members
    FOR SELECT
    TO authenticated
    USING (
        auth.jwt()->>'role' IN ('WORKER', 'ADMIN')
    ); 