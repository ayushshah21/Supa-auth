# AutoCRM Product Requirements & Implementation Guide

## Project Structure
```
src/
├── lib/
│   └── supabase/          # Database & Auth
│       ├── client.ts      # Base setup
│       ├── auth.ts        # User management
│       ├── tickets.ts     # Ticket operations
│       ├── notes.ts       # Communications
│       ├── teams.ts       # Team management
│       └── tags.ts        # Categorization
├── types/
│   └── supabase.ts        # Type definitions
└── components/            # React components
```

## Core Features & Implementation

### 1. Authentication & User Management (`auth.ts`)
- [x] Email/Password authentication
- [x] Google OAuth integration
- [x] Role-based access (Customer, Worker, Admin)
```typescript
// Usage
const user = await getCurrentUser();
const role = await getUserRole(user.id);
```

### 2. Ticket Management (`tickets.ts`)
- [x] Create and track support tickets
- [x] Assign to workers
- [x] Status updates
```typescript
// List tickets
const { data: tickets } = await getTickets({ 
  status: 'OPEN',
  assigned_to_id: workerId 
});

// Create ticket
await createTicket({
  title,
  description,
  priority: 'HIGH'
});
```

### 3. Communication (`notes.ts`)
- [x] Internal notes (worker-only)
- [x] Customer communications
- [x] Threaded discussions
```typescript
// Add internal note
await createNote({
  ticket_id: id,
  content: 'Internal update',
  internal: true
});
```

### 4. Team Management (`teams.ts`)
- [x] Create teams
- [x] Assign members
- [x] Set schedules
```typescript
// Create team
await createTeam({
  name: 'Technical Support',
  schedule: { /* coverage */ }
});
```

### 5. Categorization (`tags.ts`)
- [x] Tag system
- [x] Custom fields
- [x] Search and filter
```typescript
// Tag a ticket
await addTagToTicket(ticketId, 'billing');
```

## Security & Access Control

### Row Level Security
- Implemented in Supabase migrations
- Role-based access control
- Data isolation between customers

### Access Patterns
1. **Customers**
   - View own tickets
   - Create new tickets
   - Add notes (non-internal)

2. **Workers**
   - View assigned tickets
   - Internal notes
   - Tag management

3. **Admins**
   - Full system access
   - Team management
   - Worker assignment

## Data Flow

### Ticket Lifecycle
1. Customer creates ticket
2. Auto-assigned or picked by worker
3. Updates via notes
4. Resolution and rating

### Team Assignment
1. Based on ticket category
2. Considers worker skills
3. Respects team schedules

## UI/UX Guidelines

### Customer Portal
- Clean, simple interface
- Clear ticket status
- Easy communication

### Worker Dashboard
- Quick ticket overview
- Efficient note taking
- Team coordination

## Performance Considerations

### Database Queries
- Proper indexing
- Efficient joins
- Pagination

### Real-time Updates
- Supabase subscriptions
- Optimistic UI updates

## Testing Strategy

### Unit Tests
- Core operations
- Data validation
- Access control

### Integration Tests
- End-to-end flows
- Security rules
- Edge cases

## Deployment

### Environment Setup
```bash
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### Database Migrations
1. Run initial schema
2. Apply RLS policies
3. Verify security rules

## 1. Overview

- **Project Name:** AutoCRM - AI-powered Customer Relationship Management
- **Objective:** Minimize manual ticket handling using generative AI to enhance efficiency, profitability, and user experience.
- **Duration:** 2 weeks (MVP due end of Week 1, AI integration due end of Week 2).

## 2. Background & Rationale

- CRMs like Zendesk automate FAQ routing but still involve heavy manual support.
- AutoCRM integrates generative AI (LLMs) + RAG systems to handle most tickets.
- Human intervention is only for complex or edge-case issues.

## 3. Key Features

1. **Core Architecture**
   - **Ticket Model:** Flexible fields (ID, timestamps, status, priority, tags, etc.).
   - **API-First Design:** Enables integrations, automations, AI features, analytics.

2. **Employee Interface**
   - **Queue Management:** Real-time updates, bulk operations, priority filters.
   - **Ticket Handling:** Internal notes, quick responses, collaboration tools.
   - **Performance Tools:** Personal stats, macros, response-time metrics.

3. **Administrative Control**
   - **Team Management:** Skills-based routing, scheduling, performance tracking.
   - **Routing Intelligence:** Rule-based/skills-based assignment, load balancing.
   - **Data Management:** Schema flexibility, migrations, caching, archival.

4. **Customer Features**
   - **Customer Portal:** Ticket creation, viewing, status updates, secure login.
   - **Self-Service Tools:** Knowledge base, AI chatbots, tutorials.
   - **Communication Tools:** Live chat, email integration, embedded widgets.

5. **Advanced (AI-Driven) Features**
   - **LLM-Generated Responses:** Auto-drafting of replies.
   - **Human-Assisted Suggestions:** AI proposes text for workers to finalize.
   - **RAG Knowledge Retrieval:** Factual responses using knowledge base.
   - **Agentic Tool Usage:** Auto-analyze/route tickets by type, priority, etc.
   - **Self-Service Automation:** AI resolves common issues end-to-end.
   - **Human-in-the-Loop Enhancements:** Streamlined review queue for humans.
   - **Multi-Modal Support:** Phone, chat, email, possibly audio/video.
   - **AI-Summarized Dashboard:** Real-time insights and Q&A for admins.
   - **Learning & Growth System:** Logs human interventions to continually train AI.

## 4. Technical Decisions (ITDs)

1. **Backend Infrastructure:** Supabase (Auth, DB, Storage, Edge Functions, Vector Store).
2. **Development Tools:** Lovable + Cursor for speed; GitHub for source control.
3. **Cursor Approach:** Use Cursor Agent for iterative dev over single-shot Composer.
4. **Code Organization:** AI-optimized (fewer files, <250 lines each, minimal refactoring).
5. **Multi-Frontend Architecture:** Centralized edge functions, single source of truth.
6. **CI/CD:** AWS Amplify 2.0 for quick deployments, custom domain support.
7. **Framework Selection:** Recommended LangChain but not mandatory.

## 5. T2P Requirements

- **Brainlift Documentation:** Purpose, Experts, Spiky POVs, Knowledge Tree, 5 external resources, demonstration of impact.
- **Video Walkthrough:** 3-5 minutes, public link, covers ticket lifecycle + AI agent support.
- **Git Repository:** Production-grade code, tests for critical paths, CI/CD pipeline.
- **AI Tools & Resources:** Familiarize with LangChain tutorials, LLM agent concepts, tools integrations. Reference Zendesk tutorials for CRM design.

## 6. Deliverables & Milestones

- **Jan 21 (MVP):**
  - Basic CRM with Ticket entity (create, read, update), user roles (customer, worker, admin).
  - Simple assignment, listing, and status changes.
- **Jan 22 (Check-In 1)**
- **Jan 24 (App Complete - Week 1)**
  - Full baseline app with queue management, admin controls, self-service portal.
- **Jan 27 (AI Objectives Start)**
- **Jan 29 (Check-In 2)**
- **Jan 31 (AI Features Complete)**
  - LLM auto-responses, RAG system, agentic routing, human-in-loop enhancements.

## 7. Schema (Prisma + Supabase)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../db_client"
}

enum UserRole {
  CUSTOMER
  WORKER
  ADMIN
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
}

model User {
  id          String   @id @default(uuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  email       String   @unique
  name        String?
  role        UserRole @default(CUSTOMER)
  tickets     Ticket[] @relation("TicketCustomer")
  assignments Ticket[] @relation("TicketAssigned")
}

model Ticket {
  id           String         @id @default(uuid())
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  title        String
  description  String
  status       TicketStatus   @default(OPEN)
  priority     TicketPriority @default(MEDIUM)
  customer     User           @relation("TicketCustomer", fields: [customerId], references: [id])
  customerId   String
  assignedTo   User?          @relation("TicketAssigned", fields: [assignedToId], references: [id])
  assignedToId String?
  notes        Note[]
}

model Note {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  content   String
  internal  Boolean  @default(true)
  ticket    Ticket   @relation(fields: [ticketId], references: [id])
  ticketId  String
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
}
