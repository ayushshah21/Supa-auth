-- Revert Migration: create_agent_tables
-- Description: Safely removes agent tables and related objects
-- Timestamp: 2024-01-29 00:00:00

-- Drop policies if they exist
DROP POLICY IF EXISTS "Users can view their own sessions" ON agent_outreach_sessions;
DROP POLICY IF EXISTS "Service role can manage all sessions" ON agent_outreach_sessions;
DROP POLICY IF EXISTS "Users can view actions from their sessions" ON agent_actions;
DROP POLICY IF EXISTS "Service role can manage all actions" ON agent_actions;

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS update_agent_sessions_updated_at ON agent_outreach_sessions;

-- Drop function if it exists
DROP FUNCTION IF EXISTS update_agent_updated_at_column();

-- Drop indexes if they exist
DROP INDEX IF EXISTS idx_agent_sessions_customer;
DROP INDEX IF EXISTS idx_agent_actions_session;
DROP INDEX IF EXISTS idx_agent_sessions_status;
DROP INDEX IF EXISTS idx_agent_actions_type;

-- Drop tables if they exist (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS agent_actions;
DROP TABLE IF EXISTS agent_outreach_sessions; 