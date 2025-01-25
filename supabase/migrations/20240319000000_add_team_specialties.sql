DO $$ 
BEGIN
    -- Skip if table already exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_specialties') THEN
        RAISE NOTICE 'team_specialties table already exists, skipping creation';
        RETURN;
    END IF;

    -- Create team_specialties table
    CREATE TABLE IF NOT EXISTS public.team_specialties (
        team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
        tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (team_id, tag_id)
    );

    -- Enable RLS
    ALTER TABLE public.team_specialties ENABLE ROW LEVEL SECURITY;

    -- Allow admins to manage team specialties
    CREATE POLICY "Admins can manage team specialties"
        ON public.team_specialties
        FOR ALL
        TO authenticated
        USING (auth.get_user_role(auth.uid())::text = 'ADMIN')
        WITH CHECK (auth.get_user_role(auth.uid())::text = 'ADMIN');

    -- Allow workers to view team specialties
    CREATE POLICY "Workers can view team specialties"
        ON public.team_specialties
        FOR SELECT
        TO authenticated
        USING (auth.get_user_role(auth.uid())::text IN ('WORKER', 'ADMIN'));

    -- Add helpful indexes
    CREATE INDEX IF NOT EXISTS idx_team_specialties_team_id ON public.team_specialties(team_id);
    CREATE INDEX IF NOT EXISTS idx_team_specialties_tag_id ON public.team_specialties(tag_id);
END $$; 