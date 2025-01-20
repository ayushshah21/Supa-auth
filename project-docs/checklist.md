# checklist.md

This file outlines **all tasks** for building the **baseline features** of AutoCRM, **starting with the MVP** (due tomorrow), then moving on to the remaining baseline tasks (due by Friday). Check off each item as you complete it. **Note** that you plan to create the UI pages using [Lovable.dev](https://lovable.dev), so the steps below will also reference that workflow.

---

## MVP Tasks (Due Tomorrow)

### 1. Project & Environment Setup

- [x] **Create Supabase Project**  
  - Reset or retrieve database password.  
  - Enable required features (Auth, Database).
- [x] **Initialize GitHub Repo**  
  - Add `.gitignore` (ensure `.env` is ignored).  
  - Connect your repo to AWS Amplify if using CI/CD.
- [x] **Setup `.env`**  
  - `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` for Supabase client.
- [x] **Install Dependencies**  
  - React, Vite, Tailwind, @supabase/supabase-js, etc.

### 2. Database Schema

- [x] **Define Schema in Supabase**  
  - Models: `User`, `Ticket`, `Note` (minimum).  
  - Enums: `UserRole`, `TicketStatus`, `TicketPriority`.
- [x] **Database Setup**  
  - Create tables in Supabase.  
  - Verify schema in the Supabase dashboard.

### 3. Basic Auth & Roles

- [x] **Supabase Auth**  
  - Enable Email/Password + Google OAuth in the dashboard.  
  - Write utility to handle sign-up/sign-in (supabaseClient.ts).
- [x] **User Model Integration**  
  - Auth components (LoginPage.tsx, RegisterPage.tsx).
  - Protected routes with role-based access (ProtectedRoute.tsx).
  - Role-based UI visibility.

### 4. Ticket Creation & Viewing (Core)

- [x] **Ticket Creation**  
  - **Customer** can create a new ticket with `title`, `description`, `priority`.  
  - Store the `customerId` to link it to the user.
- [x] **Ticket Listing**  
  - **Worker** or **Admin** can see a list of all tickets.  
  - **Customer** can see only their own tickets.
- [x] **Ticket Detail**  
  - Display `title`, `description`, `status`, `priority`.  
  - Verify relationships (e.g., `customer` name/email) are fetched correctly.

### 5. Ticket Assignment & Status Updates

- [ ] **Assign Ticket**  
  - Worker/Admin can set `assignedToId` to themselves or another worker.  
  - Include a simple dropdown or user list.
- [ ] **Change Ticket Status**  
  - Worker/Admin can update status to `OPEN`, `IN_PROGRESS`, `RESOLVED`, or `CLOSED`.
- [ ] **Internal Notes**  
  - Worker/Admin can add an internal note (e.g., "Reached out to customer").

### 6. Minimal UI (via Lovable.dev + React + Tailwind)

- [x] **Lovable.dev Page Generation**  
  - Generate at least a **Ticket List Page** (for workers/admin) and a **Ticket Detail Page**.  
  - Generate a **Customer Portal** page ("My Tickets") for viewing + creating tickets.
- [x] **Integrate Tailwind**  
  - Ensure Lovable.dev code uses Tailwind classes for styling consistency.
- [x] **Auth Handling**  
  - Protect routes for Worker/Admin pages, redirect if unauthorized.  
  - Show or hide UI elements based on `User.role` (Customer vs. Worker vs. Admin).

### 7. Basic Testing & Deployment

- [x] **Local Testing**  
  - Confirm sign-up/sign-in, ticket creation, listing, assignment.  
  - Log out and in as different roles to verify correct access.
- [ ] **Deploy to AWS Amplify**  
  - Connect GitHub, configure build settings.  
  - Ensure `.env` variables are set in Amplify environment.
- [ ] **Smoke Test Live App**  
  - Create tickets, assign them, update statuses in the deployed environment.

---

## Additional Baseline Tasks (Due by Friday)

### 8. Queue Management & Bulk Operations

- [ ] **Queue Views**  
  - Filter tickets by `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`.  
  - Sort tickets by priority or creation date.
- [ ] **Bulk Updates**  
  - Check multiple tickets to change status or assign to a single user.  
  - Integrate a simple UI (can also be generated via Lovable.dev if desired).
- [ ] **Real-Time Updates (Optional)**  
  - Use Supabase Realtime or React Query for live ticket status changes.

### 9. Collaboration & Templates

- [ ] **Collaboration Tools**  
  - Internal notes visible only to Workers/Admins.  
  - Potential mention/tag system for referencing colleagues (optional).
- [ ] **Quick Responses (Macros)**  
  - Create a few templated messages (e.g., "We're looking into this.").  
  - Provide a dropdown to insert these quickly.

### 10. Performance Tools & Metrics

- [ ] **Metrics Tracking**  
  - Show average response time, number of tickets per status.
- [ ] **Personal Stats**  
  - For Workers/Admin: "Tickets resolved today," "Avg. resolution time," etc.

### 11. Administrative Control

- [ ] **Team Management (Optional)**  
  - If needed, add a `Team` model or pivot table for grouping users.  
  - Link to `User` to form teams for skill-based routing.
- [ ] **Routing Intelligence (Phase 1)**  
  - Simple rule-based assignment (e.g., if `priority=HIGH`, auto-assign to certain users).
- [ ] **Coverage Schedules (Optional)**  
  - Let Admin set coverage hours or on-call rotations.

### 12. Data Management & Scalability

- [ ] **Schema Flexibility**  
  - Confirm `CustomField` and `Tag` models (if you included them) are ready for expansion.
- [ ] **Audit Logging**  
  - Record changes to tickets (status changes, assignment) in a log or another table.
- [ ] **Archival Strategies**  
  - Option to archive tickets older than X days.
- [ ] **Performance Optimization**  
  - Index frequently queried fields (e.g., `status`, `assignedToId`).

### 13. Customer-Facing Enhancements

- [ ] **History of Interactions**  
  - Let customers see all notes relevant to them or external messages.
- [ ] **Feedback & Ratings**  
  - Add a rating or feedback form upon ticket closure.
- [ ] **Knowledge Base Link**  
  - Provide a link to an FAQ or docs page (or create a minimal KB system).

### 14. Communication Tools

- [ ] **Live Chat (Optional)**  
  - Implement a simple chat, or embed a third-party widget.  
  - Possibly integrate with Supabase Realtime channels.
- [ ] **Email Integration**  
  - (Future) Let customers reply by email to update a ticket automatically.
- [ ] **Widget Embeds**  
  - Optionally embed a "Create Ticket" form in a public site or help center.

### 15. Finish & Validate

- [ ] **Run Through All Workflows**  
  - Customer sign-up → ticket creation → worker assignment → resolution.  
  - Check each role sees the correct data.
- [ ] **Polish UI & UX**  
  - Ensure navigation is intuitive, error messages are clear.  
  - Possibly use Lovable.dev to refine or update page designs.
- [ ] **Final Demo**  
  - Prepare the baseline app for a quick walk-through or recording.  
  - Verify all baseline features are functional before moving on to AI features.

---

**Done!**  

This checklist should guide you from the minimal MVP to a complete baseline CRM.  
Use **Lovable.dev** to rapidly generate or refine your UI pages, especially for listing and detail views.  
Good luck building your **baseline AutoCRM** system!
