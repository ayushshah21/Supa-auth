-- migrate:up
-- First, ensure RLS is enabled
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Recreate the policy to ensure it's correct
DROP POLICY IF EXISTS "Customers can delete their own tickets" ON public.tickets;
CREATE POLICY "Customers can delete their own tickets"
ON public.tickets
FOR DELETE
TO authenticated
USING (customer_id = auth.uid());

-- Add a policy for customers to read their own tickets (needed for delete verification)
DROP POLICY IF EXISTS "Customers can read own tickets" ON public.tickets;
CREATE POLICY "Customers can read own tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (customer_id = auth.uid());

-- migrate:down
DROP POLICY IF EXISTS "Customers can delete their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Customers can read own tickets" ON public.tickets; 