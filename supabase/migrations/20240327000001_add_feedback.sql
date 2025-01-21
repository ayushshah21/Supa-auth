-- Create feedback table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

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
