# AutoCRM Database Schema & Implementation Guide

## File Structure

```
src/lib/supabase/
├── client.ts     # Base Supabase client
├── auth.ts       # User authentication & management
├── tickets.ts    # Ticket operations
├── notes.ts      # Note operations
├── teams.ts      # Team management
├── tags.ts       # Tagging system
└── index.ts      # Barrel exports
```

## Core Models

### User (`auth.ts`)

- **Purpose**: Central user management for all system actors
- **Key Fields**:

  ```typescript
  {
    id: string;          // UUID
    email: string;       // Unique email
    role: UserRole;      // 'CUSTOMER' | 'WORKER' | 'ADMIN'
    skills: Skill[];     // ['TECHNICAL', 'BILLING', 'GENERAL', 'SALES']
    preferences: Json;   // UI/notification settings
  }
  ```

- **Key Functions**:
  - `getCurrentUser()`: Get authenticated user
  - `getUserRole(userId)`: Get user's role
  - `updateUser(id, updates)`: Modify user data

### Ticket (`tickets.ts`)

- **Purpose**: Core entity tracking customer support requests
- **Key Fields**:

  ```typescript
  {
    id: string;
    title: string;
    description: string;
    status: TicketStatus;    // 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
    priority: TicketPriority; // 'LOW' | 'MEDIUM' | 'HIGH'
    metadata: Json;
    customer_id: string;
    assigned_to_id: string | null;
  }
  ```

- **Key Functions**:
  - `getTickets(options)`: List tickets with filters
  - `createTicket(ticket)`: Create new ticket
  - `updateTicket(id, updates)`: Modify ticket

### Note (`notes.ts`)

- **Purpose**: Communication and internal discussions
- **Key Fields**:

  ```typescript
  {
    id: string;
    content: string;
    internal: boolean;
    metadata: Json;
    ticket_id: string;
    author_id: string;
  }
  ```

- **Key Functions**:
  - `getNotes(ticketId)`: Get ticket notes
  - `createNote(note)`: Add new note

## Team Management (`teams.ts`)

### Team

- **Purpose**: Organize workers into functional groups
- **Key Fields**:

  ```typescript
  {
    id: string;
    name: string;
    description: string;
    schedule: Json;
  }
  ```

- **Key Functions**:
  - `getTeams()`: List all teams
  - `createTeam(team)`: Create new team
  - `addTeamMember(member)`: Add user to team

## Supporting Features (`tags.ts`)

### Tags & Categories

- **Purpose**: Ticket categorization and filtering
- **Key Fields**:

  ```typescript
  {
    id: string;
    name: string;
    color: string;
  }
  ```

- **Key Functions**:
  - `getTags()`: List all tags
  - `createTag(tag)`: Create new tag
  - `addTagToTicket(ticketId, tagId)`: Tag a ticket

## Security Implementation

### Row Level Security (RLS)

- **Tickets**:
  - Customers see only their tickets
  - Workers/admins see all tickets
- **Notes**:
  - Internal notes visible only to workers/admins
  - External notes visible to ticket owner
- **Teams**:
  - Team members see their teams
  - Workers/admins manage teams
- **Tags**:
  - Everyone can view
  - Workers/admins can manage

## Database Design Patterns

1. **Type Safety**
   - All database operations use typed functions
   - Types defined in `types/supabase.ts`

2. **Error Handling**

   ```typescript
   const { data, error } = await operation();
   if (error) handle(error);
   ```

3. **Query Building**

   ```typescript
   let query = supabase.from('table').select('*');
   if (condition) query = query.eq('field', value);
   ```

4. **Relationships**
   - Foreign keys enforced at database level
   - Joins handled in query selects

   ```typescript
   .select(`*, relation:foreign_table(*)`)
   ```

## Common Operations

### Authentication Flow

```typescript
const user = await getCurrentUser();
const role = await getUserRole(user.id);
```

### Ticket Management

```typescript
// Create ticket
await createTicket({
  title: 'Issue',
  description: 'Details',
  customer_id: userId
});

// Add note
await createNote({
  ticket_id: ticketId,
  content: 'Update',
  internal: false
});
```

## Database Tables & Relationships

### Users Table (`users`)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('CUSTOMER', 'WORKER', 'ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "Workers and admins can view all users" ON users
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' IN ('WORKER', 'ADMIN'));
```

### Tickets Table (`tickets`)

```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- RLS Policies
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their own tickets" ON tickets
  FOR SELECT TO authenticated
  USING (auth.uid() = customer_id);
CREATE POLICY "Workers and admins can view all tickets" ON tickets
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' IN ('WORKER', 'ADMIN'));
CREATE POLICY "Customers can create tickets" ON tickets
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Workers and admins can update tickets" ON tickets
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'role' IN ('WORKER', 'ADMIN'));
```

### Notes Table (`notes`)

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- RLS Policies
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view non-internal notes on their tickets" ON notes
  FOR SELECT TO authenticated
  USING (
    NOT internal AND
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE tickets.id = notes.ticket_id 
      AND tickets.customer_id = auth.uid()
    )
  );
CREATE POLICY "Workers and admins can view all notes" ON notes
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' IN ('WORKER', 'ADMIN'));
CREATE POLICY "Workers and admins can create notes" ON notes
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('WORKER', 'ADMIN'));
```

### Interactions Table (`interactions`)

```sql
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('NOTE', 'STATUS_CHANGE', 'ASSIGNMENT', 'CREATION')),
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- RLS Policies
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view interactions on their tickets" ON interactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE tickets.id = interactions.ticket_id 
      AND tickets.customer_id = auth.uid()
    )
  );
CREATE POLICY "Workers and admins can view all interactions" ON interactions
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' IN ('WORKER', 'ADMIN'));
CREATE POLICY "Workers and admins can create interactions" ON interactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('WORKER', 'ADMIN'));
```

## Key Relationships

1. **Tickets → Users (Customer)**
   - `tickets.customer_id` references `users.id`
   - Represents ticket ownership
   - CASCADE delete: When a user is deleted, their tickets are deleted

2. **Tickets → Users (Assigned To)**
   - `tickets.assigned_to_id` references `users.id`
   - Represents ticket assignment
   - SET NULL on delete: When a user is deleted, their assignments become null

3. **Notes → Tickets**
   - `notes.ticket_id` references `tickets.id`
   - Represents note attachment to ticket
   - CASCADE delete: When a ticket is deleted, its notes are deleted

4. **Notes → Users**
   - `notes.author_id` references `users.id`
   - Represents note authorship
   - CASCADE delete: When a user is deleted, their notes are deleted

5. **Interactions → Tickets**
   - `interactions.ticket_id` references `tickets.id`
   - Represents interaction attachment to ticket
   - CASCADE delete: When a ticket is deleted, its interactions are deleted

6. **Interactions → Users**
   - `interactions.author_id` references `users.id`
   - Represents interaction authorship
   - CASCADE delete: When a user is deleted, their interactions are deleted

## Type Definitions

```typescript
type UserRole = 'CUSTOMER' | 'WORKER' | 'ADMIN';
type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
type InteractionType = 'NOTE' | 'STATUS_CHANGE' | 'ASSIGNMENT' | 'CREATION';
```

## Common Queries

### Fetch Ticket with Relations

```typescript
const { data, error } = await supabase
  .from('tickets')
  .select(`
    *,
    customer:users!customer_id(*),
    assigned_to:users!assigned_to_id(*),
    notes(*)
  `)
  .eq('id', ticketId)
  .single();
```

### Fetch Interactions with Authors

```typescript
// Two-step fetch for better reliability
const { data: interactions } = await supabase
  .from('interactions')
  .select('*')
  .eq('ticket_id', ticketId);

const authorIds = [...new Set(interactions.map(i => i.author_id))];
const { data: authors } = await supabase
  .from('users')
  .select('id, email')
  .in('id', authorIds);
```
