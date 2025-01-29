-- Add source field to email_logs for tracking AI-generated emails
ALTER TABLE email_logs 
ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('MANUAL', 'AI', 'SYSTEM')) 
DEFAULT 'MANUAL';

-- Add ai_draft field to store original AI suggestion
ALTER TABLE email_logs
ADD COLUMN IF NOT EXISTS ai_draft TEXT;

-- Add index for querying AI-generated emails
CREATE INDEX IF NOT EXISTS idx_email_logs_source ON email_logs(source);

-- Update RLS policies to allow AI source
DROP POLICY IF EXISTS "Workers and admins can create email logs" ON email_logs;
CREATE POLICY "Workers and admins can create email logs"
    ON email_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt()->>'role' IN ('WORKER', 'ADMIN')); 