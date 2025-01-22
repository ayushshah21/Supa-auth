-- Create type for user roles first
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'WORKER', 'ADMIN');

-- Create base tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    email TEXT UNIQUE,
    role user_role DEFAULT 'CUSTOMER'::user_role,
    avatar_url TEXT
);

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    customer_id UUID REFERENCES users(id),
    assigned_to_id UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    metadata JSONB
);

CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    content JSONB NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    internal BOOLEAN DEFAULT false,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    scope TEXT NOT NULL DEFAULT 'ALL',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Add constraint for interaction types
ALTER TABLE interactions
ADD CONSTRAINT interactions_type_check
CHECK (type IN ('NOTE', 'STATUS_CHANGE', 'ASSIGNMENT', 'CREATION', 'FEEDBACK', 'RATING'));

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at
CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- Create trigger for resolved_at updates
CREATE TRIGGER update_ticket_resolved_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_resolved_at();

-- Create function to handle auth user creation
CREATE OR REPLACE FUNCTION handle_auth_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    'CUSTOMER'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_user_creation();

-- Basic RLS Policies

-- Users
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Service role can view all users" ON users
    FOR SELECT
    TO service_role
    USING (true);

CREATE POLICY "Workers and admins can view all users" ON users
    FOR SELECT
    TO authenticated
    USING (
        (SELECT role FROM users WHERE id = auth.uid()) IN ('WORKER', 'ADMIN')
    );

-- Tickets
CREATE POLICY "Workers and admins can view all tickets" ON tickets
    FOR SELECT
    TO authenticated
    USING (
        (SELECT role FROM users WHERE id = auth.uid()) IN ('WORKER', 'ADMIN')
    );

CREATE POLICY "Workers and admins can update tickets" ON tickets
    FOR UPDATE
    TO authenticated
    USING (
        (SELECT role FROM users WHERE id = auth.uid()) IN ('WORKER', 'ADMIN')
    );

CREATE POLICY "Customers can view their own tickets" ON tickets
    FOR SELECT
    TO authenticated
    USING (customer_id = auth.uid());

CREATE POLICY "Customers can create tickets" ON tickets
    FOR INSERT
    TO authenticated
    WITH CHECK (customer_id = auth.uid());

-- Templates
CREATE POLICY "Everyone can view active templates" ON templates
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Workers and admins can create templates" ON templates
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (SELECT role FROM users WHERE id = auth.uid()) IN ('WORKER', 'ADMIN')
    );

CREATE POLICY "Workers and admins can update templates" ON templates
    FOR UPDATE
    TO authenticated
    USING (
        (SELECT role FROM users WHERE id = auth.uid()) IN ('WORKER', 'ADMIN')
    );

CREATE POLICY "Admins can delete templates" ON templates
    FOR UPDATE
    TO authenticated
    USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
    )
    WITH CHECK (is_active = false);

-- Feedback
CREATE POLICY "Workers and customers can view feedback" ON feedback
    FOR SELECT
    TO authenticated
    USING (
        (SELECT role FROM users WHERE id = auth.uid()) IN ('WORKER', 'ADMIN')
        OR EXISTS (
            SELECT 1 FROM tickets t
            WHERE t.id = feedback.ticket_id
            AND t.customer_id = auth.uid()
        )
    );

CREATE POLICY "Customers can insert feedback" ON feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tickets 
            WHERE tickets.id = feedback.ticket_id
            AND tickets.customer_id = auth.uid()
        )
    );
