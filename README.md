# SeasonStaff

SeasonStaff is a mobile-first SaaS platform for managing employees, work schedules, shift requests, and attendance for seasonal businesses.

🌐 **Website:** https://sessonapp.world/

## Status

🚧 **Active Development / Work in Progress**

The current repository contains the main Admin Platform functionality, including authentication, organization management, employee management, the Weekly Shift Board, requests, attendance, notifications, settings, and billing-related foundations.

The separate Employee App is designed as a mobile client using the same Supabase backend and security model.

---

## Product Overview

SeasonStaff is built around two user experiences:

### Admin Platform

Used by:

- Owner
- Manager

The Admin Platform provides:

- Dashboard
- Employee management
- Weekly Shift Board
- Shift management
- Request management
- Attendance management
- Notifications
- Business settings
- Position management
- Account settings

### Employee App

Used by:

- Employee

The Employee App is designed as a separate mobile application using the same backend.

Employees can:

- View their schedule
- View upcoming shifts
- Check in / check out
- View worked hours
- Submit shift swap requests
- Submit time-off requests
- View request status
- Receive notifications
- Manage basic profile information

The Employee App is not a separate backend system. Both clients use the same Supabase project, database, authentication, and Row Level Security policies.

---

## Core Workflow

The central workflow of SeasonStaff is shift organization.

    Organization
          ↓
    Employees
          ↓
    Positions
          ↓
    Weekly Shift Board
          ↓
    Employee Schedule
          ↓
    Attendance
          ↓
    Worked Hours

Employees can also submit requests:

    Employee
        ↓
    Swap / Time Off Request
        ↓
    Manager Review
        ↓
    Approve / Reject
        ↓
    Employee Notification

---

## Main Features

### Authentication

The application includes authentication flows for:

- Sign up
- Login
- Email verification
- Password reset
- Account setup
- Authentication callbacks

Authentication is implemented with Supabase Auth.

The application also uses role-based access for:

- Owner
- Manager
- Employee

---

## Organization Management

SeasonStaff uses an organization-based data model.

The current product model is:

- One owner manages an organization
- Employees belong to an organization
- Managers belong to an organization
- Operational data is scoped to the organization

The application uses Supabase Row Level Security to enforce data isolation.

---

## Employee Management

Owners and managers can manage employees from the Admin Platform.

Employee management includes:

- Create employee
- Edit employee
- Change employee status
- Assign position
- Add internal notes
- Employee invitation flow
- Employee overview

Employee statuses include:

- Active
- Inactive
- Suspended

The employee system separates the operational employee record from the authentication profile, allowing an employee to exist before their account invitation has been completed.

---

## Positions

Organizations can define their own positions.

Examples include:

- Waiter
- Bartender
- Chef
- Host
- Cleaning
- Security

Positions are used when organizing and filtering employees and assigning shifts.

---

# Weekly Shift Board

The Weekly Shift Board is the central operational feature of SeasonStaff.

The board is structured as:

- Rows → Employees
- Columns → Days
- Cards → Employee shifts

Managers can:

- Create shifts
- Edit shifts
- Delete shifts
- Cancel shifts
- Assign employees
- Move shifts
- Drag and drop shifts
- Copy the previous week

Shift statuses include:

- Scheduled
- Completed
- Cancelled

---

## Drag & Drop

The Shift Board uses `dnd-kit` for drag-and-drop interactions.

The implementation includes:

- Drag & drop shift movement
- Optimistic UI updates
- Rollback handling
- Position-aware employee matching
- Memoized shift lookup
- Weekly navigation

The project uses optimistic updates to make schedule changes feel immediate while retaining rollback behavior when a backend mutation fails.

---

## Copy Previous Week

The Shift Board includes a `Copy Previous Week` workflow.

The system can copy:

- Employee assignments
- Shift times
- Positions

This provides a faster way to create recurring seasonal schedules.

---

# Request System

SeasonStaff uses a unified request system.

Employees do not directly modify their schedules.

Instead, schedule-related changes go through an approval workflow.

### Shift Swap

An employee can submit a request to swap a shift.

### Time Off

An employee can submit a time-off request for a specific date.

### Request Lifecycle

    Pending
       ↓
    Manager Review
       ↓
    Approved / Rejected

Managers can approve or reject requests from the Admin Platform.

Employees can view their own request history and statuses.

---

## Notifications

The application includes an in-app notification system.

Notifications are generated for events such as:

- New request
- Approved request
- Rejected request
- Time-off approval
- Time-off rejection
- Shift updates
- Shift cancellation
- Attendance-related events

The notification system includes:

- Unread counter
- Mark notification as read
- Mark all notifications as read
- Notification dropdown
- Notification queries
- Notification actions

Notification access is protected by organization and user-level security rules.

---

# Attendance

SeasonStaff implements a deliberately simple attendance system.

Employees can:

- Check in
- Check out
- View their latest attendance activity
- View worked hours

Managers and owners can:

- Review attendance
- Manage attendance records where permitted
- View employee attendance information

Attendance records contain:

- Employee
- Type
- Timestamp
- Optional notes

Attendance types include:

- `check_in`
- `check_out`

---

## Worked Hours

Worked hours are calculated from attendance records and shifts.

The Employee experience provides:

- Current month total hours
- Worked-day history
- Worked shift count
- Attendance history

The project intentionally does not implement payroll or salary calculation logic.

---

# Dashboard

The Admin Platform dashboard provides a quick operational overview.

Current dashboard areas include:

### Statistics

- Today's shifts
- Active employees
- Pending requests
- Checked-in employees

### Quick Actions

- Add Employee
- Create Shift
- Copy Previous Week
- View Requests

### Today's Schedule

Displays today's scheduled shifts and assigned employees.

### Pending Requests

Provides a compact overview of requests requiring manager attention.

The dashboard is designed as an operational screen rather than an analytics or reporting system.

---

# Settings

The application includes a settings section for organization configuration.

Current areas include:

- Business information
- Shift defaults
- Positions
- Account settings
- Team-related settings

Shift defaults can be used when creating new shifts.

Managers have restricted access to owner-only organization settings.

---

# Billing Foundation

The repository also contains billing-related foundations, including:

- Subscription types
- Plan definitions
- Billing queries
- Organization billing models

Billing is part of the broader product architecture and remains an area of ongoing development.

---

# Security

Security is built around Supabase Auth and PostgreSQL Row Level Security.

The application uses organization-scoped access rules to prevent cross-organization data access.

Examples of access boundaries include:

### Owner

Full access to the organization's operational data.

### Manager

Access to the organization's:

- Employees
- Shifts
- Attendance
- Requests
- Operational settings within their permissions

### Employee

Access is restricted to the employee's own:

- Profile
- Shifts
- Requests
- Attendance
- Notifications
- Worked hours

Employees cannot:

- Create shifts
- Modify schedules directly
- Manage other employees
- Approve requests
- Access administrative settings

---

# Frontend Architecture

The Admin Platform uses the Next.js App Router.

The codebase is organized around application routes, reusable components, feature-specific logic, services, hooks, state, and shared types.

High-level structure:

    src/
    ├── app/
    ├── components/
    ├── contexts/
    ├── hooks/
    ├── lib/
    ├── providers/
    ├── services/
    ├── store/
    └── types/

Feature-specific code is separated into areas such as:

- Attendance
- Authentication
- Dashboard
- Employees
- Notifications
- Positions
- Requests
- Settings
- Shifts

---

# Shift Board Architecture

The Shift Board has its own component and data layers.

Key components include:

- `shift-board-page`
- `shift-board-grid`
- `shift-cell`
- `shift-modal`
- `week-navigation`
- `shift-board-empty`
- `shift-board-skeleton`

Shift operations are separated into:

- Actions
- Queries
- Utilities
- Drag-and-drop helpers
- Notification messages
- Type definitions

This keeps schedule-specific behavior isolated from the rest of the application.

---

# Data & Query Strategy

The application follows a lightweight data-fetching strategy.

Queries are designed to avoid unnecessary nested data and large payloads.

Examples include dedicated queries for:

- Dashboard statistics
- Employee lists
- Employee overview
- Weekly shifts
- Requests
- Attendance
- Notifications
- Worked hours

The Shift Board specifically uses lightweight shift payloads containing fields such as:

- `id`
- `employee_id`
- `shift_date`
- `start_time`
- `end_time`
- `position_id`
- `status`

The goal is to keep schedule rendering and updates fast, especially on mobile devices.

---

# State Management

The frontend uses:

- Zustand for client state
- TanStack React Query for server state
- React Context for application-level authentication and selected application state

The project does not use Redux.

---

# Forms & Validation

Forms use:

- React Hook Form
- Zod

Validation is applied across authentication and application workflows.

The project also uses shared API/data contracts and TypeScript types to keep frontend data structures consistent.

---

# Mobile-First Design

SeasonStaff is designed around mobile-first operational workflows.

The Admin Platform supports:

### Desktop

- Fixed sidebar
- Top header
- Scrollable content area

### Mobile

- Mobile header
- Bottom navigation
- Stacked content
- Touch-friendly interactions

The Employee App is designed specifically for mobile use.

The intended Employee App navigation contains:

- Home
- Schedule
- Requests
- Attendance
- Profile

---

# Employee App Architecture

The Employee App is planned as a FlutterFlow mobile client.

It uses the same:

- Supabase project
- PostgreSQL database
- Supabase Auth
- RLS policies
- Backend data model

The mobile application therefore acts as another client of the SeasonStaff platform rather than maintaining a separate backend.

The repository includes an `EMPLOYEE_APP_HANDOFF.md` document describing the intended mobile integration, database models, authentication flow, RLS rules, API/query patterns, and employee-facing screens.

---

# Backend / Data Layer

SeasonStaff uses Supabase as its backend platform.

The application communicates with Supabase through:

- Supabase JavaScript SDK
- Supabase SSR
- Server-side clients
- Client-side clients
- Admin/service-role client where server-only operations require elevated permissions

The database is PostgreSQL.

The application contains dedicated query and action modules for each major domain.

---

# Project Structure

    SeasonStaff/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── contexts/
    │   ├── hooks/
    │   ├── lib/
    │   ├── providers/
    │   ├── services/
    │   ├── store/
    │   └── types/
    │
    ├── docs/
    │   ├── Faze/
    │   ├── Master Docs/
    │   └── Plans/
    │
    ├── specs/
    ├── public/
    ├── cursor/
    ├── package.json
    ├── next.config.ts
    ├── eslint.config.mjs
    └── .env.example

The `docs` directory contains product, frontend, backend, execution-phase, and implementation planning documentation.

---

# Tech Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui / Radix UI
- Zustand
- TanStack React Query
- React Hook Form
- Zod
- dnd-kit
- Framer Motion
- Lucide React

## Backend / Platform

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase SSR
- Row Level Security

## Development

- ESLint
- TypeScript
- npm
- Vercel-oriented Next.js deployment setup

---

# Local Development

Install dependencies:

`npm install`

Start the development server:

`npm run dev`

Create a production build:

`npm run build`

Start the production build:

`npm run start`

Run linting:

`npm run lint`

Environment variables are provided through:

`.env.example`

---

# Development Phases

The project is organized into defined development phases:

### Phase 0 — Setup & Infrastructure

- Next.js setup
- Supabase setup
- Development environment
- Shared architecture

### Phase 1 — Authentication & Organization

- Owner onboarding
- Organization creation
- Employee invitations
- Role system
- RLS foundation

### Phase 2 — Employee Management

- Employee CRUD
- Positions
- Employee status
- Employee overview
- Onboarding workflow

### Phase 3 — Weekly Shift Board

- Shift model
- Shift CRUD
- Weekly board
- Drag & drop
- Copy previous week

### Phase 4 — Unified Request System

- Swap requests
- Time-off requests
- Approval workflow
- Request notifications

### Phase 5 — Employee App & Attendance

- Employee mobile navigation
- Home
- Schedule
- Attendance
- Worked hours
- Profile

### Phase 6 — Settings & Notifications

- Business settings
- Position management
- Notification system
- Employee notification flows

### Phase 7 — Polish & Deployment

- QA
- Performance optimization
- Mobile testing
- Production deployment
- Final bug fixing

---

# Engineering Focus

This project demonstrates practical work with:

- Next.js App Router
- TypeScript
- Supabase
- PostgreSQL
- Authentication
- Row Level Security
- Role-based access
- CRUD architecture
- Server/client data boundaries
- Query optimization
- Optimistic UI updates
- Drag & drop interactions
- Mobile-first UX
- Request approval workflows
- Attendance tracking
- Notification systems
- SaaS organization modeling
- Reusable feature architecture

---

## Status

🚧 **Active Development / Work in Progress**

SeasonStaff is being developed as a complete SaaS product rather than a static demo.

The current repository contains substantial implemented functionality across authentication, organization management, employee management, scheduling, requests, attendance, notifications, settings, and the supporting Supabase data architecture.

Further work remains around final QA, optimization, deployment, and completing the Employee App experience.
