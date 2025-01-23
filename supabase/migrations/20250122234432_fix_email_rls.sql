-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage email templates" ON email_templates;
DROP POLICY IF EXISTS "Workers and admins can view email templates" ON email_templates;
DROP POLICY IF EXISTS "Workers and admins can view email logs" ON email_logs;
DROP POLICY IF EXISTS "Workers and admins can create email logs" ON email_logs;

-- Grant access to authenticated users for email_templates
GRANT SELECT ON email_templates TO authenticated;

-- Grant access to authenticated users for email_logs
GRANT SELECT, INSERT ON email_logs TO authenticated;

-- Everyone can view email templates
CREATE POLICY "Everyone can view email templates"
    ON email_templates
    FOR SELECT
    TO authenticated
    USING (true);

-- Only admins can insert templates
CREATE POLICY "Admins can insert email templates"
    ON email_templates
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt()->>'role' = 'ADMIN');

-- Only admins can update templates
CREATE POLICY "Admins can update email templates"
    ON email_templates
    FOR UPDATE
    TO authenticated
    USING (auth.jwt()->>'role' = 'ADMIN');

-- Only admins can delete templates
CREATE POLICY "Admins can delete email templates"
    ON email_templates
    FOR DELETE
    TO authenticated
    USING (auth.jwt()->>'role' = 'ADMIN');

-- Email logs can be viewed by workers and admins
CREATE POLICY "Workers and admins can view email logs"
    ON email_logs
    FOR SELECT
    TO authenticated
    USING (auth.jwt()->>'role' IN ('WORKER', 'ADMIN'));

-- Workers and admins can insert email logs
CREATE POLICY "Workers and admins can create email logs"
    ON email_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt()->>'role' IN ('WORKER', 'ADMIN')); 