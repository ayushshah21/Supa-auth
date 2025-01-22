-- Drop existing function first to avoid conflicts
DROP FUNCTION IF EXISTS get_worker_stats();

-- Function to get worker stats with explicit type casting
CREATE OR REPLACE FUNCTION get_worker_stats()
RETURNS TABLE (
    open_tickets BIGINT,
    resolved_last_7_days BIGINT,
    avg_resolution_hours DOUBLE PRECISION,
    total_tickets BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE status = 'OPEN')::BIGINT as open_tickets,
        COUNT(*) FILTER (WHERE status = 'RESOLVED' AND resolved_at >= NOW() - INTERVAL '7 days')::BIGINT as resolved_last_7_days,
        (
            CASE 
                WHEN COUNT(*) FILTER (WHERE resolved_at IS NOT NULL) > 0 
                THEN (
                    SUM(
                        EXTRACT(EPOCH FROM (resolved_at - created_at))::DOUBLE PRECISION
                    ) FILTER (WHERE resolved_at IS NOT NULL) 
                    / 
                    (COUNT(*) FILTER (WHERE resolved_at IS NOT NULL) * 3600)
                )::DOUBLE PRECISION
                ELSE 0::DOUBLE PRECISION
            END
        ) as avg_resolution_hours,
        COUNT(*)::BIGINT as total_tickets
    FROM tickets;
END;
$$; 