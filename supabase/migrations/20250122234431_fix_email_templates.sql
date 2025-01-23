-- Drop existing email_templates table if it exists
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;

-- Create email templates table
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email logs table
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    template_id UUID REFERENCES email_templates(id),
    sent_by UUID REFERENCES auth.users(id),
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('SENT', 'FAILED')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

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

-- Only admins can manage templates
CREATE POLICY "Admins can manage email templates"
    ON email_templates
    FOR INSERT UPDATE DELETE
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

-- Insert default email templates
INSERT INTO email_templates (name, subject_template, body_template) VALUES
    ('ticket_resolved', 'Ticket #{{ticket_id}} Has Been Resolved', 'Your support ticket #{{ticket_id}} has been resolved. If you need further assistance, please let us know by replying to this email or creating a new ticket.'),
    ('manual_update', 'Update on Ticket #{{ticket_id}}', 'There has been an update on your support ticket #{{ticket_id}}:\n\n{{message}}\n\nIf you have any questions, please don''t hesitate to respond.'); 