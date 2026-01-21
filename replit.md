# 360 Feedback - Employee Performance Review System

## Overview
360 Feedback is a comprehensive employee performance appraisal and review system that streamlines the feedback collection process across organizational hierarchies. The system supports three role levels: Employee, Manager, and Lead.

## Current State
- **Phase**: MVP Complete
- **Status**: Running
- **Last Updated**: January 2026
- **Total Employees**: 67 (imported from PodTech organization)

## Features
- **Peer Feedback System**: Employees can provide anonymous feedback about colleagues
- **Manager Reviews**: Managers evaluate their direct reports on goals, growth, and promotion readiness
- **Lead Final Appraisals**: Leads review all gathered feedback and provide final ratings with remarks
- **Rating Visibility**: Employees can view their final ratings and lead remarks
- **Appraisal Cycles**: Support for multiple review cycles per year
- **Role-Based Access**: Different views and permissions for Employees, Managers, and Leads
- **Know About Me (KAM)**: Self-assessment section for employees to document their yearly achievements
- **Email Notifications**: Outlook email integration for feedback assignment notifications

## Project Architecture

### Tech Stack
- **Frontend**: React with TypeScript, TanStack Query, Wouter routing
- **UI Components**: Shadcn/UI with Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **Email**: Nodemailer with Outlook SMTP

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
│   ├── know-about-me.tsx # Self-assessment form
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
├── email.ts           # Email notification service
└── replit_integrations/auth/  # Authentication module

shared/
├── schema.ts          # Drizzle schemas and types
└── models/auth.ts     # Auth-related schemas

scripts/
└── seed-data.sql      # Database seed script with all employee data
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
- `know_about_me` - Employee self-assessments

### User Roles
1. **Employee**: Basic user, can give/receive peer feedback, view own ratings, fill KAM form
2. **Manager**: Can review team members, access manager dashboard, assign feedback
3. **Lead**: Full access including final appraisals, reports, and admin features

## API Endpoints
- `GET /api/dashboard` - Dashboard data
- `GET /api/employees` - Employee list
- `GET /api/feedback-requests/my-tasks` - Pending feedback tasks
- `POST /api/peer-feedback` - Submit peer feedback
- `GET /api/my-ratings` - Get own ratings
- `GET /api/know-about-me` - Get employee self-assessment
- `POST /api/know-about-me` - Save employee self-assessment
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

---

## Setup Instructions (For Fresh Installation)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Database
The project uses PostgreSQL. Create the database tables:
```bash
npm run db:push
```

### Step 3: Seed Employee Data
Run the seed script to import all 67 employees with their hierarchy:
```bash
# Using psql (if available)
psql $DATABASE_URL < scripts/seed-data.sql

# Or use a database client to run the SQL in scripts/seed-data.sql
```

### Step 4: Configure Environment Variables
Required secrets (set in Replit Secrets):
- `OUTLOOK_EMAIL` - Email address for sending notifications
- `OUTLOOK_PASSWORD` - Email password/app password

### Step 5: Start the Application
```bash
npm run dev
```

---

## Authentication Flow
1. User clicks "Login with Replit" on the landing page
2. System authenticates via OpenID Connect
3. On first login, the system checks if the user's email matches any employee record
4. If a match is found, the employee record is linked to the authenticated user
5. User is redirected to the dashboard with their role-based access

---

## Key Implementation Details

### Auto-Linking Users to Employees
When a user logs in for the first time, the system:
1. Checks if their email exists in the employees table
2. If found, updates the employee's `user_id` field to link the records
3. This allows seamless authentication without manual account setup

Implementation in `server/replit_integrations/auth/replitAuth.ts`:
```typescript
// Check if employee exists with matching email
const existingEmployee = await storage.getEmployeeByEmail(userEmail);
if (existingEmployee && !existingEmployee.userId) {
  await storage.updateEmployee(existingEmployee.id, { userId: userId });
}
```

### Know About Me (KAM) Feature
Employees can document their achievements in these categories:
- **Projects & Contributions**: Project work, role, key achievements
- **Learning & Growth**: Learnings, certifications, technologies
- **Leadership & Team Building**: Mentorship, leadership roles, team building, volunteering
- **Problem Solving & Strengths**: Problems solved, key strengths
- **Extra Efforts & Improvements**: Additional contributions, areas for improvement

The form requires at least one field to be filled before saving.

---

## Backup & Restore

### Export Current Data
To export current data, run SQL queries:
```sql
SELECT * FROM employees;
SELECT * FROM appraisal_cycles;
SELECT * FROM know_about_me;
-- etc.
```

### Restore from Backup
Use the seed script to restore employee data:
```bash
psql $DATABASE_URL < scripts/seed-data.sql
```

---

## Troubleshooting

### Employee not linked to user account
- Ensure the employee's email in the database matches their Replit login email
- The linking happens automatically on first login

### Database schema changes
- Run `npm run db:push` to sync schema changes
- Never manually modify ID column types

### Email notifications not sending
- Verify OUTLOOK_EMAIL and OUTLOOK_PASSWORD secrets are set
- Check server logs for SMTP connection errors
