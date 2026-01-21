# 360 Feedback - Employee Performance Review System

## Technical Documentation

**Project Name:** 360 Feedback  
**Author:** Sahil Vashisht  
**Version:** 1.0.0  
**Last Updated:** January 2026  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [System Architecture](#system-architecture)
4. [Database Design](#database-design)
5. [Features & Functionality](#features--functionality)
6. [User Roles & Permissions](#user-roles--permissions)
7. [API Documentation](#api-documentation)
8. [Installation Guide](#installation-guide)
9. [User Guide](#user-guide)
10. [Admin Dashboard](#admin-dashboard)
11. [Security Features](#security-features)
12. [Troubleshooting](#troubleshooting)

---

## 1. Executive Summary

360 Feedback is a comprehensive employee performance appraisal and review system designed to streamline the feedback collection process across organizational hierarchies. The system enables:

- **Peer-to-peer feedback** collection for holistic employee evaluation
- **Manager reviews** for direct report assessments
- **Lead final appraisals** with ratings and promotion decisions
- **Self-assessment** through the "Know About Me" (KAM) feature
- **Admin dashboard** for HR to monitor feedback activity and generate reports

The platform supports multiple user roles (Employee, Manager, Lead) with role-based access control, ensuring data privacy and appropriate visibility of feedback information.

---

## 2. Project Overview

### 2.1 Purpose

The 360 Feedback system addresses the need for a structured, digital approach to employee performance reviews. Traditional paper-based or spreadsheet-driven appraisal systems are:
- Time-consuming to manage
- Prone to data loss
- Difficult to track and analyze
- Lacking in anonymity for peer feedback

This system solves these challenges by providing a centralized platform where:
- Employees can provide and receive feedback securely
- Managers can evaluate their team members systematically
- Leads can make informed promotion and increment decisions
- HR/Admin can monitor progress and generate comprehensive reports

### 2.2 Key Benefits

| Benefit | Description |
|---------|-------------|
| **Streamlined Process** | Automated workflow from feedback request to final appraisal |
| **Data Security** | Role-based access ensures appropriate data visibility |
| **Real-time Tracking** | Monitor feedback completion status in real-time |
| **Comprehensive Reports** | Generate PDF reports with all feedback data |
| **Email Notifications** | Automatic email alerts for feedback assignments |
| **Self-Service Portal** | Employees can view their ratings and submit self-assessments |

### 2.3 Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React with TypeScript |
| **UI Components** | Shadcn/UI + Tailwind CSS |
| **Routing** | Wouter |
| **State Management** | TanStack Query |
| **Backend** | Express.js with TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Drizzle ORM |
| **Authentication** | Replit Auth (OpenID Connect) |
| **Email Service** | Nodemailer with Outlook SMTP |
| **PDF Generation** | jsPDF |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|    Frontend      |<--->|    Backend       |<--->|    Database      |
|    (React)       |     |    (Express)     |     |  (PostgreSQL)    |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        |                        |
        v                        v
+------------------+     +------------------+
|   Replit Auth    |     |   Email Service  |
|  (OpenID Connect)|     |   (Outlook SMTP) |
+------------------+     +------------------+
```

### 3.2 Directory Structure

```
360-feedback/
|-- client/                    # Frontend React application
|   |-- src/
|       |-- components/        # Reusable UI components
|       |   |-- ui/           # Shadcn components
|       |   |-- app-sidebar.tsx
|       |   |-- ThemeProvider.tsx
|       |   |-- ThemeToggle.tsx
|       |-- pages/            # Route pages
|       |   |-- landing.tsx   # Public landing page
|       |   |-- dashboard.tsx # Main user dashboard
|       |   |-- employees.tsx # Employee directory
|       |   |-- feedback-tasks.tsx
|       |   |-- my-ratings.tsx
|       |   |-- know-about-me.tsx
|       |   |-- manager-reviews.tsx
|       |   |-- lead-reviews.tsx
|       |   |-- reports.tsx
|       |   |-- admin/        # Admin pages
|       |       |-- login.tsx
|       |       |-- dashboard.tsx
|       |-- hooks/            # Custom React hooks
|       |-- lib/              # Utility functions
|
|-- server/                   # Backend Express application
|   |-- routes.ts             # API endpoints
|   |-- storage.ts            # Database operations
|   |-- db.ts                 # Database connection
|   |-- email.ts              # Email service
|   |-- replit_integrations/  # Auth module
|
|-- shared/                   # Shared code
|   |-- schema.ts             # Database schemas and types
|   |-- models/               # Model definitions
|
|-- scripts/                  # Utility scripts
|   |-- seed-data.sql         # Database seed script
|
|-- docs/                     # Documentation
```

### 3.3 Request Flow

1. User makes a request from the React frontend
2. Request is sent to Express backend via API
3. Backend validates request and checks authentication
4. Backend queries PostgreSQL database via Drizzle ORM
5. Response is sent back to frontend
6. React updates the UI based on response

---

## 4. Database Design

### 4.1 Entity Relationship Diagram

```
+---------------+       +-------------------+       +----------------+
|   employees   |       | feedback_requests |       | appraisal_     |
+---------------+       +-------------------+       | cycles         |
| id (PK)       |       | id (PK)           |       +----------------+
| user_id       |       | target_emp_id (FK)|<----->| id (PK)        |
| name          |       | reviewer_id (FK)  |       | name           |
| email         |       | cycle_id (FK)     |------>| year           |
| role          |       | status            |       | start_date     |
| designation   |       | created_at        |       | end_date       |
| department    |       +-------------------+       | is_active      |
| manager_id    |                                   +----------------+
| lead_id       |
+---------------+
        |
        v
+---------------+       +-------------------+       +----------------+
| peer_feedback |       | manager_reviews   |       | lead_reviews   |
+---------------+       +-------------------+       +----------------+
| id (PK)       |       | id (PK)           |       | id (PK)        |
| request_id    |       | manager_id (FK)   |       | lead_id (FK)   |
| reviewer_id   |       | employee_id (FK)  |       | employee_id    |
| target_id     |       | cycle_id (FK)     |       | cycle_id       |
| ratings (1-5) |       | perf_rating       |       | final_rating   |
| strengths     |       | goals_achieved    |       | increment_%    |
| improvements  |       | areas_of_growth   |       | promotion_dec  |
| comments      |       | promotion_ready   |       | remarks        |
+---------------+       +-------------------+       +----------------+
        
+---------------+
| know_about_me |
+---------------+
| id (PK)       |
| employee_id   |
| cycle_id      |
| contributions |
| achievements  |
| learnings     |
| strengths     |
| ...           |
+---------------+
```

### 4.2 Table Descriptions

#### 4.2.1 employees
Stores all employee information including their role in the organization.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR (UUID) | Primary key |
| user_id | VARCHAR | Linked Replit Auth user ID |
| name | TEXT | Employee's full name |
| email | TEXT | Email address (unique) |
| role | ENUM | employee, manager, or lead |
| designation | TEXT | Job title |
| department | TEXT | Department name |
| manager_id | VARCHAR | FK to their manager |
| lead_id | VARCHAR | FK to their lead |
| profile_image | TEXT | Profile picture URL |
| created_at | TIMESTAMP | Record creation time |

#### 4.2.2 appraisal_cycles
Defines the time periods for performance reviews.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR (UUID) | Primary key |
| name | TEXT | Cycle name (e.g., "Q1 2026") |
| year | INTEGER | Year of the cycle |
| start_date | TIMESTAMP | Cycle start date |
| end_date | TIMESTAMP | Cycle end date |
| is_active | BOOLEAN | Whether cycle is currently active |

#### 4.2.3 feedback_requests
Tracks peer feedback assignments.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR (UUID) | Primary key |
| target_employee_id | VARCHAR | Employee receiving feedback |
| reviewer_employee_id | VARCHAR | Employee giving feedback |
| appraisal_cycle_id | VARCHAR | Associated cycle |
| status | ENUM | pending or submitted |
| created_at | TIMESTAMP | Assignment time |

#### 4.2.4 peer_feedback
Stores submitted peer feedback.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR (UUID) | Primary key |
| feedback_request_id | VARCHAR | Related request |
| reviewer_id | VARCHAR | Who gave feedback |
| target_employee_id | VARCHAR | Who received feedback |
| technical_skills | INTEGER | Rating 1-5 |
| communication | INTEGER | Rating 1-5 |
| teamwork | INTEGER | Rating 1-5 |
| problem_solving | INTEGER | Rating 1-5 |
| leadership | INTEGER | Rating 1-5 |
| strengths | TEXT | Written feedback |
| areas_of_improvement | TEXT | Written feedback |
| additional_comments | TEXT | Optional comments |
| submitted_at | TIMESTAMP | Submission time |

#### 4.2.5 manager_reviews
Stores manager evaluations of their team members.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR (UUID) | Primary key |
| manager_id | VARCHAR | Manager giving review |
| employee_id | VARCHAR | Employee being reviewed |
| performance_rating | INTEGER | Rating 1-5 |
| goals_achieved | TEXT | Goals assessment |
| areas_of_growth | TEXT | Growth areas |
| training_needs | TEXT | Training recommendations |
| promotion_readiness | TEXT | Ready/Not Ready/etc. |
| overall_comments | TEXT | Summary comments |
| status | ENUM | pending/in_progress/completed |

#### 4.2.6 lead_reviews
Final appraisals by leads with promotion/increment decisions.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR (UUID) | Primary key |
| lead_id | VARCHAR | Lead giving review |
| employee_id | VARCHAR | Employee being reviewed |
| final_rating | INTEGER | Final rating 1-5 |
| increment_percentage | TEXT | Salary increment % |
| promotion_decision | TEXT | Promotion decision |
| remarks | TEXT | Final remarks |
| status | ENUM | pending/in_progress/completed |

#### 4.2.7 know_about_me
Employee self-assessments and achievements.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR (UUID) | Primary key |
| employee_id | VARCHAR | Employee ID |
| project_contributions | TEXT | Project work |
| key_achievements | TEXT | Achievements |
| learnings | TEXT | What they learned |
| certifications | TEXT | Certifications earned |
| technologies_worked_on | TEXT | Technologies used |
| mentorship | TEXT | Mentoring activities |
| leadership_roles | TEXT | Leadership taken |
| problems_solved | TEXT | Problems resolved |
| strengths | TEXT | Self-identified strengths |

---

## 5. Features & Functionality

### 5.1 Peer Feedback System

**What it does:** Enables employees to provide anonymous feedback about their colleagues.

**How it works:**
1. Manager/Lead assigns feedback requests to employees
2. Assigned employees receive email notifications
3. Employees rate colleagues on 5 parameters (1-5 scale):
   - Technical Skills
   - Communication
   - Teamwork
   - Problem Solving
   - Leadership
4. Employees provide written feedback on strengths and improvements
5. Feedback is stored securely and visible only to appropriate roles

**Benefits:**
- 360-degree view of employee performance
- Anonymous feedback encourages honest responses
- Multiple perspectives for fair evaluation

### 5.2 Manager Reviews

**What it does:** Allows managers to formally evaluate their direct reports.

**How it works:**
1. Manager views list of team members pending review
2. Manager rates employee performance (1-5)
3. Manager documents:
   - Goals achieved during the period
   - Areas requiring growth
   - Training needs
   - Promotion readiness
   - Overall comments
4. Review is submitted and visible to leads

**Benefits:**
- Structured evaluation process
- Clear documentation of performance
- Basis for promotion decisions

### 5.3 Lead Final Appraisals

**What it does:** Leads review all feedback and make final decisions.

**How it works:**
1. Lead views all employees under their purview
2. Lead reviews:
   - All peer feedback received
   - Manager's review
   - Employee's self-assessment (KAM)
3. Lead provides:
   - Final rating (1-5)
   - Increment percentage recommendation
   - Promotion decision
   - Final remarks
4. Employee can view their final rating and remarks

### 5.4 Know About Me (KAM)

**What it does:** Employees document their achievements and contributions.

**Categories covered:**
1. **Projects & Contributions**
   - Project work and deliverables
   - Role and responsibilities
   - Key achievements

2. **Learning & Growth**
   - New skills learned
   - Certifications obtained
   - Technologies worked on

3. **Leadership & Team Building**
   - Mentorship activities
   - Volunteering
   - Leadership roles taken

4. **Problem Solving & Strengths**
   - Problems solved
   - Key strengths

5. **Extra Efforts**
   - Additional contributions
   - Areas for improvement

### 5.5 Admin Dashboard

**What it does:** Central monitoring and reporting hub for HR/Admin.

**Features:**
- **Recent Activity View:** Employees sorted by most recent feedback submission
- **All Employees View:** Complete employee directory with hierarchy
- **Feedback Status:** Track completed vs pending feedback assignments
- **Detailed Reports:** View complete employee report with all feedback
- **PDF Export:** Download professional reports for each employee

---

## 6. User Roles & Permissions

### 6.1 Role Matrix

| Feature | Employee | Manager | Lead | Admin |
|---------|----------|---------|------|-------|
| View own dashboard | Yes | Yes | Yes | N/A |
| Submit peer feedback | Yes | Yes | Yes | N/A |
| View own ratings | Yes | Yes | Yes | N/A |
| Fill KAM form | Yes | Yes | Yes | N/A |
| Review team members | No | Yes | Yes | N/A |
| View team feedback | No | Yes | Yes | N/A |
| Submit final appraisal | No | No | Yes | N/A |
| Assign feedback requests | No | Yes | Yes | N/A |
| View all employees | No | No | Yes | Yes |
| Download reports | No | No | Yes | Yes |
| Admin dashboard | No | No | No | Yes |

### 6.2 Role Descriptions

**Employee:**
- Can submit peer feedback when assigned
- Can view their own ratings and remarks
- Can fill their KAM self-assessment form
- Cannot see others' feedback or ratings

**Manager:**
- All employee permissions
- Can review their direct reports
- Can assign feedback requests
- Can view feedback for their team

**Lead:**
- All manager permissions
- Can provide final appraisals
- Can make promotion/increment decisions
- Can view comprehensive reports

**Admin:**
- Separate login credentials (username/password)
- Can view all employee data
- Can monitor feedback activity
- Can download detailed PDF reports

---

## 7. API Documentation

### 7.1 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/auth/user | Get current user info |
| POST | /api/admin/login | Admin login |
| POST | /api/admin/logout | Admin logout |

### 7.2 Employee Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/employees | List all employees |
| GET | /api/employees/:id | Get employee details |
| POST | /api/admin/employees | Create employee |

### 7.3 Feedback Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/feedback-requests/my-tasks | Get pending feedback tasks |
| POST | /api/feedback-requests | Create feedback request |
| POST | /api/peer-feedback | Submit peer feedback |

### 7.4 Review Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/manager/team-members | Get manager's team |
| POST | /api/manager-reviews | Submit manager review |
| GET | /api/lead/appraisals | Get lead's appraisal list |
| POST | /api/lead-reviews | Submit lead review |

### 7.5 KAM Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/know-about-me | Get employee's KAM |
| POST | /api/know-about-me | Save KAM data |

### 7.6 Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/feedback-activity | Get feedback activity sorted by recency |
| GET | /api/admin/employees-full | Get all employees with relations |
| GET | /api/admin/employee-report/:id | Get detailed employee report |
| GET | /api/admin/employee-feedback/:id | Get employee's feedback status |

---

## 8. Installation Guide

### 8.1 Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- npm or yarn package manager
- Git for version control

### 8.2 Step-by-Step Installation

#### Step 1: Clone Repository
```bash
git clone <repository-url>
cd 360-feedback
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Set Up Database
```bash
# Push schema to database
npm run db:push
```

#### Step 4: Seed Data
```bash
# Run the seed script to populate initial data
psql $DATABASE_URL < scripts/seed-data.sql
```

#### Step 5: Configure Environment Variables
Set the following secrets:
- `DATABASE_URL` - PostgreSQL connection string
- `OUTLOOK_EMAIL` - Email for notifications
- `OUTLOOK_PASSWORD` - Email password

#### Step 6: Start Application
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

---

## 9. User Guide

### 9.1 Employee Login

1. Go to the landing page
2. Click "Sign In" or "Get Started"
3. Authenticate with Replit
4. System automatically links your account based on email

### 9.2 Submitting Peer Feedback

1. Go to "Feedback Tasks" from the sidebar
2. Click "Give Feedback" on a pending assignment
3. Rate the employee on all 5 parameters
4. Write detailed feedback on strengths and improvements
5. Click "Submit Feedback"

### 9.3 Viewing Your Ratings

1. Go to "My Ratings" from the sidebar
2. View your final rating and lead remarks
3. See the date when rating was provided

### 9.4 Filling Know About Me (KAM)

1. Go to "Know About Me" from the sidebar
2. Fill in relevant sections:
   - Projects & Contributions
   - Learning & Growth
   - Leadership & Team Building
   - Problem Solving & Strengths
   - Extra Efforts
3. Click "Save" to store your self-assessment

### 9.5 Manager: Reviewing Team

1. Go to "Manager Reviews" from the sidebar
2. View list of team members pending review
3. Click "Review" on an employee
4. Fill in all assessment fields
5. Submit the review

### 9.6 Lead: Final Appraisal

1. Go to "Lead Reviews" from the sidebar
2. Select an employee to review
3. View all their feedback and self-assessment
4. Provide final rating, increment, and promotion decision
5. Submit the appraisal

---

## 10. Admin Dashboard

### 10.1 Accessing Admin Dashboard

1. Go to `/admin/login`
2. Enter credentials:
   - Username: `admin`
   - Password: `admin`
3. Click "Login"

### 10.2 Recent Activity View

- Shows employees sorted by most recent feedback submission
- Displays feedback completion status (X completed / Y assigned)
- Click "View Details" to see comprehensive report

### 10.3 All Employees View

- Shows complete employee directory
- Displays organizational hierarchy (manager relations)
- Click "View Report" for detailed information

### 10.4 Employee Report

When viewing an employee's report, you'll see:
- Employee details (name, email, designation, department)
- Feedback assignment status with reviewer list
- All peer feedback received with ratings and comments
- Manager review (if submitted)
- Lead final appraisal (if submitted)
- Know About Me self-assessment (if filled)

### 10.5 Downloading PDF Reports

1. Open an employee's report
2. Click "Download PDF" button
3. PDF includes all sections with professional formatting:
   - Blue header with employee name
   - Employee details table
   - Peer feedback with ratings
   - Manager review details
   - Lead appraisal with decisions
   - KAM self-assessment

---

## 11. Security Features

### 11.1 Authentication

- **User Authentication:** Replit Auth (OpenID Connect)
- **Admin Authentication:** Separate username/password system
- **Session Management:** Secure session cookies with httpOnly flag

### 11.2 Authorization

- Role-based access control (RBAC)
- API endpoints validate user permissions
- Data visibility restricted by role

### 11.3 Data Protection

- Passwords never stored in plain text
- Session tokens are cryptographically secure
- SQL injection prevention via parameterized queries
- XSS prevention through proper escaping

### 11.4 Email Security

- SMTP credentials stored as environment secrets
- TLS encryption for email transport

---

## 12. Troubleshooting

### 12.1 Common Issues

**Issue: Employee account not linked**
- Ensure email in database matches Replit login email
- Linking happens automatically on first login

**Issue: Database schema changes not applying**
- Run `npm run db:push` to sync schema
- Never manually modify ID column types

**Issue: Email notifications not sending**
- Verify OUTLOOK_EMAIL and OUTLOOK_PASSWORD secrets
- Check server logs for SMTP connection errors

**Issue: PDF download not working**
- Ensure jspdf package is installed
- Check browser console for JavaScript errors

### 12.2 Getting Help

For technical issues:
1. Check server logs for error messages
2. Verify database connection
3. Ensure all environment variables are set

---

## Appendix A: Sample Data

The system comes pre-configured with 67 employees from the PodTech organization, including:
- 1 Director (Lead)
- 2 Additional Leads
- 9 Managers
- 55 Employees

Departments:
- Software Development (UK)
- Software Development (India)
- HR (UK)
- HR (India)

---

## Appendix B: API Response Examples

### Employee List Response
```json
{
  "employees": [
    {
      "id": "uuid",
      "name": "Sahil Vashisht",
      "email": "sahil.vashisht@podtech.com",
      "role": "employee",
      "designation": "Software Developer",
      "department": "Software Development (India)"
    }
  ]
}
```

### Feedback Activity Response
```json
{
  "employee": {
    "id": "uuid",
    "name": "Employee Name"
  },
  "totalAssigned": 5,
  "totalCompleted": 3,
  "latestFeedback": "2026-01-21T20:05:09.298Z"
}
```

---

**Document Prepared By:** Sahil Vashisht  
**Date:** January 2026  
**Version:** 1.0.0

---

*This document is confidential and intended for internal use only.*
