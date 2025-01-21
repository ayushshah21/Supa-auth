-- Add resolved_at column to tickets table
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Create trigger function to handle resolved_at updates
CREATE OR REPLACE FUNCTION update_ticket_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'RESOLVED' AND OLD.status != 'RESOLVED' THEN
        NEW.resolved_at = NOW();
    ELSIF NEW.status != 'RESOLVED' AND OLD.status = 'RESOLVED' THEN
        NEW.resolved_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_ticket_resolved_at ON tickets;
CREATE TRIGGER update_ticket_resolved_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_resolved_at();

-- Drop the function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS get_worker_stats;

-- Create function to calculate worker stats
CREATE OR REPLACE FUNCTION get_worker_stats(_worker_id UUID)
RETURNS TABLE (
    open_tickets BIGINT,
    resolved_last_7_days BIGINT,
    avg_resolution_hours FLOAT,
    total_tickets BIGINT
) SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) FILTER (WHERE status != 'RESOLVED') as open_count,
            COUNT(*) FILTER (WHERE resolved_at >= NOW() - INTERVAL '7 days') as recent_resolved,
            CAST(
                COALESCE(
                    AVG(
                        EXTRACT(EPOCH FROM (resolved_at - created_at))/3600
                    ) FILTER (WHERE resolved_at IS NOT NULL),
                    0
                ) AS FLOAT
            ) as avg_hours,
            COUNT(*) as total_count
        FROM tickets
        WHERE assigned_to_id = _worker_id
    )
    SELECT 
        open_count,
        recent_resolved,
        avg_hours,
        total_count
    FROM stats;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_worker_stats TO authenticated;

-- Add RLS policy for the function (if needed)
ALTER FUNCTION get_worker_stats SECURITY DEFINER SET search_path = public;

-- Update existing resolved tickets to have resolved_at set
UPDATE tickets 
SET resolved_at = updated_at 
WHERE status = 'RESOLVED' 
AND resolved_at IS NULL; 