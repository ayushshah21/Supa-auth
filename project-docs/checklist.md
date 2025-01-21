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

- [x] **Assign Ticket**  
  - Worker/Admin can set `assignedToId` to themselves or another worker.  
  - Include a simple dropdown or user list.
- [x] **Change Ticket Status**  
  - Worker/Admin can update status to `OPEN`, `IN_PROGRESS`, `RESOLVED`, or `CLOSED`.
- [x] **Internal Notes**  
  - Worker/Admin can add an internal note (e.g., "Reached out to customer").

### 6. Minimal UI (via React + Tailwind)

- [x] **Page Generation**  
  - Generate at least a **Ticket List Page** (for workers/admin) and a **Ticket Detail Page**.  
  - Generate a **Customer Portal** page ("My Tickets") for viewing + creating tickets.
- [x] **Integrate Tailwind**  
  - Ensure code uses Tailwind classes for styling consistency.
- [x] **Auth Handling**  
  - Protect routes for Worker/Admin pages, redirect if unauthorized.  
  - Show or hide UI elements based on `User.role` (Customer vs. Worker vs. Admin).

### 7. Basic Testing & Deployment

- [x] **Local Testing**  
  - Confirm sign-up/sign-in, ticket creation, listing, assignment.  
  - Log out and in as different roles to verify correct access.
- [ ] **Deploy to AWS Amplify** (High Priority)  
  - Connect GitHub, configure build settings.  
  - Ensure `.env` variables are set in Amplify environment.
- [ ] **Smoke Test Live App**  
  - Create tickets, assign them, update statuses in the deployed environment.
  - Test all core workflows in production.

---

## Additional Baseline Tasks (Due by Friday)

### 8. Queue Management & Bulk Operations (High Priority)

- [x] **Queue Views**  
  - Filter tickets by `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`.  
  - Sort tickets by priority or creation date.
- [ ] **Bulk Updates** (Next Task)  
  - Add checkboxes to ticket rows for multi-select.
  - Implement "Update Selected" for status changes and assignments.
- [ ] **Real-Time Updates** (Must do)  
  - Enable Supabase Realtime for tickets table.
  - Implement frontend subscription for live updates.

### 9. Collaboration & Templates (High Priority)

- [x] **Collaboration Tools**  
  - Internal notes visible only to Workers/Admins.  
  - Potential mention/tag system for referencing colleagues (optional).
- [ ] **Quick Responses (Macros)** (Next Task)  
  - Create templates table or hardcode initial set.
  - Add dropdown in note creation form.
  - Implement template selection and auto-fill.

### 10. Performance Tools & Metrics (Medium Priority)

- [ ] **Metrics Tracking**  
  - Implement worker dashboard with key metrics.
  - Track tickets resolved per day.
  - Calculate average resolution times.
- [ ] **Personal Stats**  
  - Add stats widget to dashboard.
  - Show daily/weekly performance metrics.
  - Display current workload indicators.

### 11. Administrative Control

- [x] **Team Management**  
  - Admin can promote users to WORKER or ADMIN roles.  
  - Manage user roles and permissions.
- [ ] **Audit Logging** (Medium Priority)  
  - Create audit_log table for tracking changes.
  - Log status and assignment changes.
  - Add audit history view for admins.
- [ ] **Routing Intelligence** (Week 2 - AI Phase)  
  - Move to AI integration phase.
- [ ] **Coverage Schedules** (Optional)  
  - Defer to post-baseline phase.

### 12. Data Management & Scalability

- [x] **Schema Flexibility**  
  - Confirm `CustomField` and `Tag` models are ready for expansion.
- [ ] **Audit Logging** (Medium Priority)  
  - Implement change tracking system.
  - Record all significant ticket modifications.
- [ ] **Archival Strategies** (Low Priority)  
  - Defer to post-baseline phase.
- [ ] **Performance Optimization** (Low Priority)  
  - Defer to post-baseline phase.

### 13. Customer-Facing Enhancements

- [x] **History of Interactions**  
  - Let customers see all notes relevant to them or external messages.
- [ ] **Feedback & Ratings** (Medium Priority)  
  - Add rating form for resolved tickets.
  - Implement simple star rating system.
  - Store feedback in new ratings table.
- [ ] **Knowledge Base Link** (Week 2 - AI Phase)  
  - Move to AI integration phase.

### 14. Communication Tools (Week 2 - AI Phase)

- [ ] **Live Chat**  
  - Move to AI integration phase.
- [ ] **Email Integration**  
  - Move to AI integration phase.
- [ ] **Widget Embeds**  
  - Move to AI integration phase.

### 15. Finish & Validate

- [x] **Run Through All Workflows**  
  - Customer sign-up → ticket creation → worker assignment → resolution.  
  - Check each role sees the correct data.
- [x] **Polish UI & UX**  
  - Ensure navigation is intuitive, error messages are clear.  
  - Added responsive navbar and role-based navigation.
- [ ] **Final Baseline Demo** (High Priority)  
  - Deploy to AWS Amplify.
  - Verify all baseline features in production.
  - Document any remaining issues.
  - Prepare for AI phase transition.

---

**Baseline Completion Checklist**

High Priority (Next Tasks):
1. [ ] Deploy to AWS Amplify
2. [ ] Implement Bulk Operations
3. [ ] Add Quick Response Templates
4. [ ] Complete Final Baseline Demo

Medium Priority:
1. [ ] Add Personal Stats & Metrics
2. [ ] Implement Audit Logging
3. [ ] Add Customer Feedback System

Optional/If Time Permits:
1. [ ] Real-Time Updates
2. [ ] Archival Strategies
3. [ ] Performance Optimization

Week 2 (AI Phase):
1. [ ] Knowledge Base Integration
2. [ ] Routing Intelligence
3. [ ] Communication Tools
4. [ ] AI-Powered Features

**Done!**  

This checklist should guide you from the minimal MVP to a complete baseline CRM.  
Use **Lovable.dev** to rapidly generate or refine your UI pages, especially for listing and detail views.  
Good luck building your **baseline AutoCRM** system!
