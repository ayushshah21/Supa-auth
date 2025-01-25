-- Drop the view-only policy for workers as we're replacing it with a management policy
DROP POLICY IF EXISTS "Workers can view team specialties" ON public.team_specialties;

-- Add the new management policy for workers
CREATE POLICY "Workers can manage their team specialties"
    ON public.team_specialties
    FOR ALL
    TO authenticated
    USING (
        auth.get_user_role(auth.uid())::text = 'WORKER'
        AND EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_members.team_id = team_specialties.team_id
            AND team_members.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.get_user_role(auth.uid())::text = 'WORKER'
        AND EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_members.team_id = team_specialties.team_id
            AND team_members.user_id = auth.uid()
        )
    ); 