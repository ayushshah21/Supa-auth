-- Drop existing email logs policies
DROP POLICY IF EXISTS "Workers and admins can view email logs" ON email_logs;
DROP POLICY IF EXISTS "Workers and admins can create email logs" ON email_logs;

-- Everyone can insert email logs (since this is done by the system when sending emails)
CREATE POLICY "Allow system to create email logs"
    ON email_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Workers and admins can view email logs
CREATE POLICY "Workers and admins can view email logs"
    ON email_logs
    FOR SELECT
    TO authenticated
    USING (auth.jwt()->>'role' IN ('WORKER', 'ADMIN')); 