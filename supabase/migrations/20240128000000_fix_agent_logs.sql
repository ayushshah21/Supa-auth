-- Remove the old migration entry
DELETE FROM supabase_migrations.schema_migrations WHERE version = '20240127000000';

-- Drop the table if it exists (clean slate)
DROP TABLE IF EXISTS public.agent_logs;

-- Create agent_logs table
CREATE TABLE public.agent_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  query text NOT NULL,
  output text NOT NULL,
  time_taken_ms double precision NOT NULL,
  tools_used text[] DEFAULT array[]::text[],
  success boolean,
  error_type text,
  ticket_id text
);

-- Enable RLS
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Workers and admins can view agent logs"
    ON public.agent_logs
    FOR SELECT
    TO authenticated
    USING (auth.jwt()->>'role' IN ('WORKER', 'ADMIN'));

CREATE POLICY "Workers and admins can create agent logs"
    ON public.agent_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt()->>'role' IN ('WORKER', 'ADMIN'));