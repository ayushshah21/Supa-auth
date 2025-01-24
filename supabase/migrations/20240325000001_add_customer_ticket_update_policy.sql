-- migrate:up
-- Add policy for customers to update their own tickets
CREATE POLICY "Customers can update their own tickets"
ON public.tickets
FOR UPDATE
TO authenticated
USING (
  customer_id = auth.uid() 
  AND status != 'CLOSED'
)
WITH CHECK (
  customer_id = auth.uid()
  AND status != 'CLOSED'
);

-- migrate:down
DROP POLICY IF EXISTS "Customers can update their own tickets" ON public.tickets;
