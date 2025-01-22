-- Function to get ticket distribution by priority
CREATE OR REPLACE FUNCTION get_tickets_by_priority()
RETURNS TABLE (
    priority TEXT,
    count BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.priority,
        COUNT(*) as count
    FROM tickets t
    GROUP BY t.priority
    ORDER BY t.priority;
END;
$$;

-- Function to get ticket counts over time (last 30 days)
CREATE OR REPLACE FUNCTION get_tickets_over_time(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    total_tickets BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(
            CURRENT_DATE - (days_back || ' days')::INTERVAL,
            CURRENT_DATE,
            '1 day'
        )::DATE as date
    )
    SELECT 
        d.date,
        COUNT(t.id) as total_tickets
    FROM date_series d
    LEFT JOIN tickets t ON DATE(t.created_at) = d.date
    GROUP BY d.date
    ORDER BY d.date;
END;
$$;
