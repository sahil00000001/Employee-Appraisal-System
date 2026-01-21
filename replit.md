# 360 Feedback - Employee Performance Review System

## Overview
360 Feedback is a comprehensive employee performance appraisal and review system that streamlines the feedback collection process across organizational hierarchies. The system supports three role levels: Employee, Manager, and Lead.

## Current State
- **Phase**: MVP Complete
- **Status**: Running
- **Last Updated**: January 2025

## Features
- **Peer Feedback System**: Employees can provide anonymous feedback about colleagues
- **Manager Reviews**: Managers evaluate their direct reports on goals, growth, and promotion readiness
- **Lead Final Appraisals**: Leads review all gathered feedback and provide final ratings with remarks
- **Rating Visibility**: Employees can view their final ratings and lead remarks
- **Appraisal Cycles**: Support for multiple review cycles per year
- **Role-Based Access**: Different views and permissions for Employees, Managers, and Leads

## Project Architecture

### Tech Stack
- **Frontend**: React with TypeScript, TanStack Query, Wouter routing
- **UI Components**: Shadcn/UI with Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)

### Directory Structure
```
client/src/
├── components/         # Reusable UI components
│   ├── ui/            # Shadcn components
│   ├── app-sidebar.tsx
│   ├── ThemeProvider.tsx
│   └── ThemeToggle.tsx
├── pages/             # Route pages
│   ├── landing.tsx    # Landing page for logged out users
│   ├── dashboard.tsx  # Main dashboard
│   ├── employees.tsx  # Employee directory
│   ├── feedback-tasks.tsx # Peer feedback tasks
│   ├── my-ratings.tsx # View own ratings
│   ├── manager-reviews.tsx # Manager review page
│   ├── lead-reviews.tsx # Lead final appraisal page
│   ├── reports.tsx    # Analytics reports
│   └── admin/         # Admin pages
├── hooks/             # Custom React hooks
└── lib/               # Utility functions

server/
├── routes.ts          # API endpoints
├── storage.ts         # Database operations
├── db.ts              # Database connection
└── replit_integrations/auth/  # Authentication module

shared/
├── schema.ts          # Drizzle schemas and types
└── models/auth.ts     # Auth-related schemas
```

### Database Tables
- `users` - Auth users (managed by Replit Auth)
- `sessions` - Auth sessions
- `employees` - Employee records with role and hierarchy
- `appraisal_cycles` - Review cycle definitions
- `feedback_requests` - Peer feedback assignments
- `peer_feedback` - Submitted peer reviews
- `manager_reviews` - Manager evaluations
- `lead_reviews` - Final ratings and decisions

### User Roles
1. **Employee**: Basic user, can give/receive peer feedback, view own ratings
2. **Manager**: Can review team members, access manager dashboard
3. **Lead**: Full access including final appraisals, reports, and admin features

## API Endpoints
- `GET /api/dashboard` - Dashboard data
- `GET /api/employees` - Employee list
- `GET /api/feedback-requests/my-tasks` - Pending feedback tasks
- `POST /api/peer-feedback` - Submit peer feedback
- `GET /api/my-ratings` - Get own ratings
- `GET /api/manager/team-members` - Manager's team list
- `POST /api/manager-reviews` - Submit manager review
- `GET /api/lead/appraisals` - Lead appraisal data
- `POST /api/lead-reviews` - Submit final appraisal
- `GET /api/reports` - Analytics data
- `POST /api/admin/employees` - Create employee
- `POST /api/admin/appraisal-cycles` - Create cycle
- `PATCH /api/admin/appraisal-cycles/:id` - Update cycle

## User Preferences
- Theme: Light/Dark mode toggle available
- Professional blue color scheme

## Development Notes
- Run `npm run dev` to start the development server
- Run `npm run db:push` to sync database schema
- Frontend runs on port 5000
