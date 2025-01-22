-- Drop existing policies
DROP POLICY IF EXISTS "Customers can create feedback interactions" ON interactions;
DROP POLICY IF EXISTS "Workers and admins can create interactions" ON interactions;
DROP POLICY IF EXISTS "Users can view interactions for their tickets" ON interactions;

-- Recreate policies with updated conditions
CREATE POLICY "Customers can create feedback and rating interactions" ON interactions
FOR INSERT TO authenticated
WITH CHECK (
  type IN ('FEEDBACK', 'RATING')
  AND EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = ticket_id
    AND tickets.customer_id = auth.uid()
  )
);

CREATE POLICY "Workers and admins can create interactions" ON interactions
FOR INSERT TO authenticated
WITH CHECK (
  auth.jwt() ->> 'role' IN ('WORKER', 'ADMIN')
  OR (
    type IN ('FEEDBACK', 'RATING')
    AND EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_id
      AND tickets.customer_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can view interactions for their tickets" ON interactions
FOR SELECT TO authenticated
USING (
  auth.jwt() ->> 'role' IN ('WORKER', 'ADMIN')
  OR EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = ticket_id
    AND tickets.customer_id = auth.uid()
  )
); 