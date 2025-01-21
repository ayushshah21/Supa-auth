-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Customers can view interactions on their tickets" ON interactions;
DROP POLICY IF EXISTS "Workers and admins can view all interactions" ON interactions;
DROP POLICY IF EXISTS "Workers and admins can create interactions" ON interactions;

-- Create Interactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ticket_id UUID,
    type TEXT NOT NULL CHECK (type IN ('NOTE', 'STATUS_CHANGE', 'ASSIGNMENT', 'CREATION')),
    content JSONB NOT NULL,
    author_id UUID,
    metadata JSONB,
    CONSTRAINT interactions_ticket_id_fkey FOREIGN KEY (ticket_id) 
        REFERENCES public.tickets(id) ON DELETE CASCADE,
    CONSTRAINT interactions_author_id_fkey FOREIGN KEY (author_id) 
        REFERENCES public.users(id) ON DELETE SET NULL
);

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_interactions_ticket_id ON interactions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_interactions_author_id ON interactions(author_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(type);

-- Enable RLS
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Customers can view interactions on their tickets"
ON interactions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM tickets 
        WHERE tickets.id = interactions.ticket_id 
        AND tickets.customer_id = auth.uid()
    )
);

CREATE POLICY "Workers and admins can view all interactions"
ON interactions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('WORKER', 'ADMIN')
    )
);

CREATE POLICY "Workers and admins can create interactions"
ON interactions FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('WORKER', 'ADMIN')
    )
); 