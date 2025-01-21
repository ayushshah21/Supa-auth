-- First, drop all existing policies that might reference the type column
DROP POLICY IF EXISTS "Customers can create feedback interactions" ON interactions;
DROP POLICY IF EXISTS "Workers and admins can create interactions" ON interactions;
DROP POLICY IF EXISTS "Users can view interactions for their tickets" ON interactions;

-- Policy for customers to create feedback interactions for their tickets
CREATE POLICY "Customers can create feedback interactions" ON interactions
FOR INSERT TO authenticated
WITH CHECK (
  type = 'FEEDBACK' AND
  EXISTS (
    SELECT 1 FROM tickets 
    WHERE tickets.id = interactions.ticket_id
    AND tickets.customer_id = auth.uid()
  )
);

-- Policy for workers and admins to create any interactions
CREATE POLICY "Workers and admins can create interactions" ON interactions
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM users WHERE role IN ('WORKER', 'ADMIN')
  )
);

-- Policy for viewing interactions
CREATE POLICY "Users can view interactions for their tickets" ON interactions
FOR SELECT TO authenticated
USING (
  auth.uid() IN (
    -- Workers and admins can see all interactions
    SELECT id FROM users WHERE role IN ('WORKER', 'ADMIN')
    UNION
    -- Customers can see interactions for their tickets
    SELECT customer_id FROM tickets WHERE id = interactions.ticket_id
  )
);

-- Fix feedback table policies
DROP POLICY IF EXISTS "Customers can insert feedback for their tickets" ON feedback;
DROP POLICY IF EXISTS "Workers and customers can view feedback" ON feedback;

-- Policy for inserting feedback (only ticket customer can add feedback)
CREATE POLICY "Customers can insert feedback for their tickets" ON feedback
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tickets 
    WHERE tickets.id = feedback.ticket_id
    AND tickets.customer_id = auth.uid()
  )
);

-- Policy for viewing feedback (workers and ticket customer can view)
CREATE POLICY "Workers and customers can view feedback" ON feedback
FOR SELECT TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role IN ('WORKER', 'ADMIN')
    UNION
    SELECT customer_id FROM tickets WHERE id = feedback.ticket_id
  )
); 