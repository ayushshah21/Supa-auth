-- migrate:up
-- Add RLS policy for ticket deletion
CREATE POLICY "Customers can delete their own tickets"
ON public.tickets
FOR DELETE
TO authenticated
USING (customer_id = auth.uid());

-- Add CASCADE DELETE for all ticket-related tables
ALTER TABLE attachments 
  DROP CONSTRAINT IF EXISTS attachments_ticket_id_fkey,
  ADD CONSTRAINT attachments_ticket_id_fkey 
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE;

ALTER TABLE custom_fields 
  DROP CONSTRAINT IF EXISTS custom_fields_ticket_id_fkey,
  ADD CONSTRAINT custom_fields_ticket_id_fkey 
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE;

ALTER TABLE email_logs 
  DROP CONSTRAINT IF EXISTS email_logs_ticket_id_fkey,
  ADD CONSTRAINT email_logs_ticket_id_fkey 
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE;

ALTER TABLE feedback 
  DROP CONSTRAINT IF EXISTS feedback_ticket_id_fkey,
  ADD CONSTRAINT feedback_ticket_id_fkey 
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE;

ALTER TABLE interactions 
  DROP CONSTRAINT IF EXISTS interactions_ticket_id_fkey,
  ADD CONSTRAINT interactions_ticket_id_fkey 
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE;

ALTER TABLE notes 
  DROP CONSTRAINT IF EXISTS notes_ticket_id_fkey,
  ADD CONSTRAINT notes_ticket_id_fkey 
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE;

ALTER TABLE ticket_tags 
  DROP CONSTRAINT IF EXISTS ticket_tags_ticket_id_fkey,
  ADD CONSTRAINT ticket_tags_ticket_id_fkey 
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE;

-- migrate:down
-- Remove RLS policy
DROP POLICY IF EXISTS "Customers can delete their own tickets" ON public.tickets;

-- Restore original foreign key constraints without CASCADE
ALTER TABLE attachments 
  DROP CONSTRAINT IF EXISTS attachments_ticket_id_fkey,
  ADD CONSTRAINT attachments_ticket_id_fkey 
    FOREIGN KEY (ticket_id) REFERENCES tickets(id);

ALTER TABLE custom_fields 
  DROP CONSTRAINT IF EXISTS custom_fields_ticket_id_fkey,
  ADD CONSTRAINT custom_fields_ticket_id_fkey 
    FOREIGN KEY (ticket_id) REFERENCES tickets(id);

ALTER TABLE email_logs 
  DROP CONSTRAINT IF EXISTS email_logs_ticket_id_fkey,
  ADD CONSTRAINT email_logs_ticket_id_fkey 
    FOREIGN KEY (ticket_id) REFERENCES tickets(id);

ALTER TABLE feedback 
  DROP CONSTRAINT IF EXISTS feedback_ticket_id_fkey,
  ADD CONSTRAINT feedback_ticket_id_fkey 
    FOREIGN KEY (ticket_id) REFERENCES tickets(id);

ALTER TABLE interactions 
  DROP CONSTRAINT IF EXISTS interactions_ticket_id_fkey,
  ADD CONSTRAINT interactions_ticket_id_fkey 
    FOREIGN KEY (ticket_id) REFERENCES tickets(id);

ALTER TABLE notes 
  DROP CONSTRAINT IF EXISTS notes_ticket_id_fkey,
  ADD CONSTRAINT notes_ticket_id_fkey 
    FOREIGN KEY (ticket_id) REFERENCES tickets(id);

ALTER TABLE ticket_tags 
  DROP CONSTRAINT IF EXISTS ticket_tags_ticket_id_fkey,
  ADD CONSTRAINT ticket_tags_ticket_id_fkey 
    FOREIGN KEY (ticket_id) REFERENCES tickets(id); 