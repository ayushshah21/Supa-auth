-- Add policy for customers to create note interactions
CREATE POLICY "Customers can create note interactions" ON interactions
FOR INSERT TO authenticated
WITH CHECK (
  type = 'NOTE'
  AND NOT (content->>'internal')::boolean
  AND EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = ticket_id
    AND tickets.customer_id = auth.uid()
  )
); 