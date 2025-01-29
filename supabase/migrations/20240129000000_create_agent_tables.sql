-- Migration: create_agent_tables
-- Description: Creates tables for OutreachGPT agent functionality with safety checks
-- Timestamp: 2024-01-29 00:00:00

-- Create agent_outreach_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS agent_outreach_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_id UUID REFERENCES users(id) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'COMPLETED', 'FAILED', 'PAUSED')),
    session_goals JSONB DEFAULT '{}'::jsonb NOT NULL,
    completion_metrics JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT fk_customer 
        FOREIGN KEY (customer_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Create agent_actions table with proper constraints
CREATE TABLE IF NOT EXISTS agent_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id UUID NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'TOOL_USE', 
        'DECISION', 
        'MESSAGE', 
        'ANALYSIS'
    )),
    tool_name TEXT,
    input_data JSONB DEFAULT '{}'::jsonb,
    output_data JSONB DEFAULT '{}'::jsonb,
    success BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT fk_session 
        FOREIGN KEY (session_id) 
        REFERENCES agent_outreach_sessions(id) 
        ON DELETE CASCADE
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_agent_sessions_customer 
    ON agent_outreach_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_session 
    ON agent_actions(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status 
    ON agent_outreach_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_actions_type 
    ON agent_actions(action_type);

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_agent_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_agent_sessions_updated_at ON agent_outreach_sessions;
CREATE TRIGGER update_agent_sessions_updated_at
    BEFORE UPDATE ON agent_outreach_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_updated_at_column();

-- Enable Row Level Security
ALTER TABLE agent_outreach_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for agent_outreach_sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON agent_outreach_sessions;
CREATE POLICY "Users can view their own sessions"
    ON agent_outreach_sessions
    FOR SELECT
    USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Service role can manage all sessions" ON agent_outreach_sessions;
CREATE POLICY "Service role can manage all sessions"
    ON agent_outreach_sessions
    FOR ALL
    USING (auth.role() = 'service_role');

-- Create RLS Policies for agent_actions
DROP POLICY IF EXISTS "Users can view actions from their sessions" ON agent_actions;
CREATE POLICY "Users can view actions from their sessions"
    ON agent_actions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM agent_outreach_sessions
            WHERE agent_outreach_sessions.id = agent_actions.session_id
            AND agent_outreach_sessions.customer_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Service role can manage all actions" ON agent_actions;
CREATE POLICY "Service role can manage all actions"
    ON agent_actions
    FOR ALL
    USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON agent_outreach_sessions TO service_role;
GRANT ALL ON agent_actions TO service_role;
GRANT SELECT ON agent_outreach_sessions TO authenticated;
GRANT SELECT ON agent_actions TO authenticated; 