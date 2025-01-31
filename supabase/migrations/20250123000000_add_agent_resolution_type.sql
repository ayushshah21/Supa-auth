-- Add new interaction type for agent resolutions
DO $$ BEGIN
    -- Check if AGENT_RESOLUTION type exists in any interactions
    IF NOT EXISTS (
        SELECT 1 FROM interactions 
        WHERE type = 'AGENT_RESOLUTION'
    ) THEN
        -- Add new type safely
        ALTER TABLE interactions 
        DROP CONSTRAINT IF EXISTS interactions_type_check;
        
        ALTER TABLE interactions 
        ADD CONSTRAINT interactions_type_check 
        CHECK (type IN ('FEEDBACK', 'RATING', 'NOTE', 'STATUS_CHANGE', 'ASSIGNMENT', 'AGENT_RESOLUTION'));

        -- Add comment explaining the AGENT_RESOLUTION type content structure
        COMMENT ON COLUMN interactions.content IS 'JSONB content varies by type. For AGENT_RESOLUTION: { resolution_text: string, previous_status: string, automated: boolean, prompt: string? }';
    END IF;
END $$;

-- Add corresponding email template if it doesn't exist
INSERT INTO email_templates (name, subject_template, body_template)
SELECT 
    'agent_ticket_resolution',
    'Ticket #{{ticket_id}} - Resolution Update',
    'Dear {{user_name}},

Your ticket #{{ticket_id}} has been resolved by our support team.

{{resolution_text}}

If you have a moment, we would appreciate your feedback on the resolution:
{{feedback_link}}

Best regards,
The Support Team'
WHERE NOT EXISTS (
    SELECT 1 FROM email_templates 
    WHERE name = 'agent_ticket_resolution'
);

-- Example of how AGENT_RESOLUTION interactions will be created:
COMMENT ON TABLE interactions IS 'Stores all ticket interactions. For AGENT_RESOLUTION, use:
INSERT INTO interactions (ticket_id, author_id, type, content) VALUES 
  ($1, $2, ''AGENT_RESOLUTION'', jsonb_build_object(
    ''resolution_text'', $3,
    ''previous_status'', $4,
    ''automated'', true,
    ''prompt'', $5
  ));';

SELECT DISTINCT type, COUNT(*) as count
FROM interactions
GROUP BY type
ORDER BY type;
