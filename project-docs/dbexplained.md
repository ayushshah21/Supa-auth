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

