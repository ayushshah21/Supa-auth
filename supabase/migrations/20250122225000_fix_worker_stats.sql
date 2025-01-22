-- Drop existing function
DROP FUNCTION IF EXISTS get_worker_stats();

-- Recreate function with fixed types
CREATE OR REPLACE FUNCTION get_worker_stats()
RETURNS TABLE (
    open_tickets BIGINT,
    resolved_last_7_days BIGINT,
    avg_resolution_hours DOUBLE PRECISION,
    total_tickets BIGINT
) LANGUAGE sql SECURITY DEFINER AS $$
    SELECT 
        COUNT(*) FILTER (WHERE status = 'OPEN')::BIGINT,
        COUNT(*) FILTER (WHERE status = 'RESOLVED' AND resolved_at >= NOW() - INTERVAL '7 days')::BIGINT,
        COALESCE(
            (
                SUM(
                    EXTRACT(EPOCH FROM (resolved_at - created_at))::DOUBLE PRECISION
                ) FILTER (WHERE resolved_at IS NOT NULL) 
                / 
                (NULLIF(COUNT(*) FILTER (WHERE resolved_at IS NOT NULL), 0) * 3600.0)
            )::DOUBLE PRECISION,
            0::DOUBLE PRECISION
        ),
        COUNT(*)::BIGINT
    FROM tickets;
$$; 