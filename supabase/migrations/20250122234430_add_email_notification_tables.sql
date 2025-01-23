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

-- Only admins can manage templates
CREATE POLICY "Admins can manage email templates"
    ON email_templates
    FOR ALL
    TO authenticated
    USING (auth.jwt()->>'role' = 'ADMIN');

-- Workers and admins can view templates
CREATE POLICY "Workers and admins can view email templates"
    ON email_templates
    FOR SELECT
    TO authenticated
    USING (auth.jwt()->>'role' IN ('WORKER', 'ADMIN'));

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

-- Add function to send email notification
CREATE OR REPLACE FUNCTION notify_ticket_resolved(
    ticket_id UUID
) RETURNS void AS $$
DECLARE
    v_template_id UUID;
    v_customer_email TEXT;
    v_ticket_number TEXT;
BEGIN
    -- Get the template ID
    SELECT id INTO v_template_id
    FROM email_templates
    WHERE name = 'ticket_resolved'
    LIMIT 1;

    -- Get the customer email and ticket info
    SELECT 
        u.email,
        t.id::text
    INTO 
        v_customer_email,
        v_ticket_number
    FROM tickets t
    JOIN users u ON t.customer_id = u.id
    WHERE t.id = ticket_id;

    -- Log the email attempt
    INSERT INTO email_logs (
        ticket_id,
        template_id,
        sent_by,
        recipient_email,
        status
    ) VALUES (
        ticket_id,
        v_template_id,
        auth.uid(),
        v_customer_email,
        'SENT'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
