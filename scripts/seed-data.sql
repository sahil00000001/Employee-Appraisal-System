-- ============================================
-- 360 Feedback System - Complete Database Seed Script
-- Author: Sahil Vashisht
-- Version: 1.0.0
-- Date: January 2026
-- ============================================
-- This script contains all data to restore the database
-- Run this after setting up a fresh database with: npm run db:push
-- Usage: psql $DATABASE_URL < scripts/seed-data.sql
-- ============================================

-- ============================================
-- TABLE COVERAGE EXPLANATION
-- ============================================
-- This seed script covers the following tables:
--
-- SEEDED TABLES (included in this script):
--   - appraisal_cycles: Performance review periods
--   - employees: All 67 employees with organizational hierarchy
--   - feedback_requests: Sample peer feedback assignments
--   - peer_feedback: Sample submitted peer feedback
--   - manager_reviews: Sample manager evaluations
--   - lead_reviews: Sample final appraisals
--   - know_about_me: Sample employee self-assessments
--
-- RUNTIME TABLES (NOT seeded - generated automatically):
--   - users: Created when users log in via Replit Auth
--   - sessions: Created/managed by the auth system
--   - otp_codes: Temporary codes for admin login, expire automatically
--
-- The runtime tables are intentionally excluded because:
--   1. User records are created on first login via OpenID Connect
--   2. Session data is temporary and tied to browser sessions
--   3. OTP codes expire and are regenerated for each admin login
--
-- When employees log in, the system automatically links their
-- user account to their employee record based on email matching.
-- ============================================

-- ============================================
-- CLEANUP (Optional - uncomment if needed)
-- ============================================
-- WARNING: This will delete all existing data!
-- DELETE FROM know_about_me;
-- DELETE FROM lead_reviews;
-- DELETE FROM manager_reviews;
-- DELETE FROM peer_feedback;
-- DELETE FROM feedback_requests;
-- DELETE FROM employees;
-- DELETE FROM appraisal_cycles;

-- ============================================
-- APPRAISAL CYCLES
-- ============================================
INSERT INTO appraisal_cycles (id, name, year, start_date, end_date, is_active, created_at) VALUES
('e7ecda10-f9f2-4bb4-b7c8-7ee30ff501ec', 'Q1 2026 Appraisal', 2026, '2026-01-01', '2026-03-31', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- EMPLOYEES (Lead Level - Director)
-- ============================================
INSERT INTO employees (id, user_id, name, email, role, designation, department, manager_id, lead_id, created_at) VALUES
('0d733541-9400-453c-ba79-783740eee6ef', '', 'Harry Pod', 'harry@podtech.com', 'lead', 'Director', 'HR (UK)', NULL, NULL, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  designation = EXCLUDED.designation,
  department = EXCLUDED.department;

-- ============================================
-- EMPLOYEES (Lead Level - Reports to Director)
-- ============================================
INSERT INTO employees (id, user_id, name, email, role, designation, department, manager_id, lead_id, created_at) VALUES
('56bcf5a0-69ca-488b-a801-93717a0a8e3f', '', 'Vipin Mehta', 'vipin@podtech.com', 'lead', 'Head of Delivery and Operations', 'Software Development (India)', '0d733541-9400-453c-ba79-783740eee6ef', NULL, NOW()),
('9be6c320-f904-43fc-a06e-b995fd0d9480', '', 'Anastasia Podciborski', 'anastasia@podtech.com', 'lead', 'Director', 'HR (UK)', '0d733541-9400-453c-ba79-783740eee6ef', NULL, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  designation = EXCLUDED.designation,
  department = EXCLUDED.department;

-- ============================================
-- EMPLOYEES (Manager Level)
-- ============================================
INSERT INTO employees (id, user_id, name, email, role, designation, department, manager_id, lead_id, created_at) VALUES
('c5c11f5c-7a6b-4a7b-8ba1-a643932f90c8', '', 'Ajeet Mishra', 'ajeet@podtech.com', 'manager', 'Technical Project Manager', 'Software Development (UK)', '0d733541-9400-453c-ba79-783740eee6ef', NULL, NOW()),
('ff38ed52-e9bf-4d5d-87da-c770e8f6ee8d', '', 'Daisy Rani', 'daisy@podtech.com', 'manager', 'Senior Software Developer', 'Software Development (UK)', '0d733541-9400-453c-ba79-783740eee6ef', NULL, NOW()),
('99bdc505-7b30-4980-b0ae-ef50a19d9569', '', 'Mark David Page', 'mark@podtech.com', 'manager', 'HSE Product Owner', 'Software Development (UK)', '0d733541-9400-453c-ba79-783740eee6ef', NULL, NOW()),
('ca5ebe71-7ea0-4cbe-aab8-166bc28a5f56', '', 'Shweta Barmi', 'shweta@podtech.com', 'manager', 'HR Manager', 'HR (India)', '0d733541-9400-453c-ba79-783740eee6ef', NULL, NOW()),
('11438960-fb45-4cf4-9e30-a58a364f2ace', '', 'Anuj Kumar', 'anuj@podtech.com', 'manager', 'Senior Tech Lead', 'Software Development (India)', '56bcf5a0-69ca-488b-a801-93717a0a8e3f', NULL, NOW()),
('c5ff2ba4-06e2-447c-b45b-95531888427b', '', 'Deepak Padukone Manjunath', 'deepak@podtech.com', 'manager', 'Technical Lead', 'Software Development (India)', '56bcf5a0-69ca-488b-a801-93717a0a8e3f', NULL, NOW()),
('75469d88-9148-47c1-a7b5-ca11dec5b3bb', '', 'Gaurav Sharma', 'gaurav.sharma@podtech.com', 'manager', 'Software Engineer Manager', 'Software Development (India)', '56bcf5a0-69ca-488b-a801-93717a0a8e3f', NULL, NOW()),
('dd6fffec-6211-4318-9a09-c64d3e694357', '', 'Prem Narayan Jha', 'prem@podtech.com', 'manager', 'Senior Software Developer', 'Software Development (India)', '56bcf5a0-69ca-488b-a801-93717a0a8e3f', NULL, NOW()),
('90891e71-5975-4ee0-b4c6-1fb44deb97c5', '', 'Rajeev Bansal', 'rajeev@podtech.com', 'manager', 'Technical Project Manager', 'Software Development (India)', '56bcf5a0-69ca-488b-a801-93717a0a8e3f', NULL, NOW()),
('5f795c6e-16df-4eb7-9b67-42704ec0b653', '', 'Rishi Kumar', 'rishi@podtech.com', 'manager', 'Senior DevOps Engineer', 'Software Development (India)', '56bcf5a0-69ca-488b-a801-93717a0a8e3f', NULL, NOW()),
('cc9d0086-b33f-4e61-a34f-e3bb7e8b1cad', '', 'Sunandan Handoo', 'sunandan.handoo@podtech.com', 'manager', 'Scrum Master', 'Software Development (India)', '56bcf5a0-69ca-488b-a801-93717a0a8e3f', NULL, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  designation = EXCLUDED.designation,
  department = EXCLUDED.department,
  manager_id = EXCLUDED.manager_id;

-- ============================================
-- EMPLOYEES (Employee Level - UK Team)
-- ============================================
INSERT INTO employees (id, user_id, name, email, role, designation, department, manager_id, lead_id, created_at) VALUES
('e3efe314-faa4-4cfb-9c14-edfe03f0e770', '', 'Adam Trach', 'adam@podtech.com', 'employee', 'Junior Software Developer', 'Software Development (UK)', 'c5c11f5c-7a6b-4a7b-8ba1-a643932f90c8', NULL, NOW()),
('c2b529d1-4fd3-43a8-b45c-1c5e9a07918f', '', 'Chris Mok', 'chrismok@podtech.com', 'employee', 'Software Developer', 'Software Development (UK)', 'c5c11f5c-7a6b-4a7b-8ba1-a643932f90c8', NULL, NOW()),
('22c99d49-a646-4dda-a7d7-14c1aed4e2ae', '', 'Christopher Lee', 'chris@podtech.com', 'employee', 'Software Developer', 'Software Development (UK)', 'c5c11f5c-7a6b-4a7b-8ba1-a643932f90c8', NULL, NOW()),
('42467e45-be2b-4260-b576-6519d1b95547', '', 'Vaibhav Goel', 'vaibhav@podtech.com', 'employee', 'Software Developer', 'Software Development (UK)', 'c5c11f5c-7a6b-4a7b-8ba1-a643932f90c8', NULL, NOW()),
('66337a64-455d-495e-8eb6-3e705f69cdc0', '', 'Abbaas Ibn - Zubair', 'abbaas@podtech.com', 'employee', 'Junior DevOps Engineer', 'Software Development (UK)', 'ff38ed52-e9bf-4d5d-87da-c770e8f6ee8d', NULL, NOW()),
('2323e9b3-c7ef-4776-9335-29a9692ebfc6', '', 'Aditi Verma', 'aditi.verma@podtech.com', 'employee', 'Software Developer', 'Software Development (UK)', 'ff38ed52-e9bf-4d5d-87da-c770e8f6ee8d', NULL, NOW()),
('1995648e-22ef-4a0a-bfde-7eab0c48ca8a', '', 'Dev Sharma', 'dev@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', 'ff38ed52-e9bf-4d5d-87da-c770e8f6ee8d', NULL, NOW()),
('267471c3-c756-42cb-aa97-4a1cc1e3868c', '', 'Keith Drewrey', 'keith@podtech.com', 'employee', 'Junior Software Developer', 'Software Development (UK)', 'ff38ed52-e9bf-4d5d-87da-c770e8f6ee8d', NULL, NOW()),
('8cad1a5f-f33c-402c-9512-00d5d3adc8e1', '', 'Mohammed Afaq', 'mohammed.afaq@podtech.com', 'employee', 'Intern', 'Software Development (India)', 'ff38ed52-e9bf-4d5d-87da-c770e8f6ee8d', NULL, NOW()),
('96dfbfaf-c48f-45ea-b34a-0931412af78d', '', 'Shempy Tamrakar', 'shempy.tamrakar@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', 'ff38ed52-e9bf-4d5d-87da-c770e8f6ee8d', NULL, NOW()),
('8326302f-937a-44dc-8e1e-9de58d2fadd0', '', 'Shubham Sharma', 'shubham.sharma@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', 'ff38ed52-e9bf-4d5d-87da-c770e8f6ee8d', NULL, NOW()),
('3f2e6749-f80b-45eb-97bd-a70e1707e361', '', 'Shivani Singh', 'shivani.singh@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', 'ff38ed52-e9bf-4d5d-87da-c770e8f6ee8d', NULL, NOW()),
('817651b3-bbf9-435f-9690-4937183821e9', '', 'Callum Wild', 'callum@podtech.com', 'employee', 'Intern', 'Software Development (UK)', '99bdc505-7b30-4980-b0ae-ef50a19d9569', NULL, NOW()),
('80669919-af9e-4dee-b145-f3b8e2efcc7a', '', 'Nathan Cherry', 'nathan@podtech.com', 'employee', 'Intern', 'Software Development (UK)', '99bdc505-7b30-4980-b0ae-ef50a19d9569', NULL, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  designation = EXCLUDED.designation,
  department = EXCLUDED.department,
  manager_id = EXCLUDED.manager_id;

-- ============================================
-- EMPLOYEES (Employee Level - India Team)
-- ============================================
INSERT INTO employees (id, user_id, name, email, role, designation, department, manager_id, lead_id, created_at) VALUES
('b9911c60-0643-492c-a62a-ab12fba79623', '', 'Ashish Singh', 'ashish.singh@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', '11438960-fb45-4cf4-9e30-a58a364f2ace', NULL, NOW()),
('8ad7d2f7-11ce-46af-bdc1-fca3d013db53', '', 'Dhawal Jain', 'dhawal.jain@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', '11438960-fb45-4cf4-9e30-a58a364f2ace', NULL, NOW()),
('0ad6d6de-661a-406b-af18-5bdd5aa5d71d', '', 'Mohit Yadav', 'mohit.yadav@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', '11438960-fb45-4cf4-9e30-a58a364f2ace', NULL, NOW()),
('5e0d8d98-7953-4c60-86e3-b9e148787790', '', 'Mukesh Goswami', 'mukesh.goswami@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', '11438960-fb45-4cf4-9e30-a58a364f2ace', NULL, NOW()),
('a58d3847-fa22-4d95-a87c-384fc5b43012', '', 'Prachi Sinha', 'prachi.sinha@podtech.com', 'employee', 'Intern', 'Software Development (India)', '11438960-fb45-4cf4-9e30-a58a364f2ace', NULL, NOW()),
('0e18e93d-09f2-4596-b072-7bfd7fe1a3e3', '', 'Shivam Middha', 'shivam.middha@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', '11438960-fb45-4cf4-9e30-a58a364f2ace', NULL, NOW()),
('4d9785c5-1c09-4759-b672-47495521ba14', '', 'Shreya Jain', 'shreya.jain@podtech.com', 'employee', 'Intern', 'Software Development (India)', '11438960-fb45-4cf4-9e30-a58a364f2ace', NULL, NOW()),
('d6967041-5aaf-4b90-a36b-6d04808f33ae', '', 'Sonakshi Jha', 'sonakshi.jha@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', '11438960-fb45-4cf4-9e30-a58a364f2ace', NULL, NOW()),
('8538df22-1adf-4fbf-be27-9dae12a2a676', '', 'Aditya Soni', 'aditya.soni@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', 'c5ff2ba4-06e2-447c-b45b-95531888427b', NULL, NOW()),
('00a0b7b5-3f1b-4cfa-bde3-5c7a74634c38', '', 'Aman Kashyap', 'aman@podtech.com', 'employee', 'UI/UX Designer', 'Software Development (India)', 'c5ff2ba4-06e2-447c-b45b-95531888427b', NULL, NOW()),
('dd97ae15-569e-4bc8-9c3a-9d975083f45c', '', 'Karan Bandekar', 'karan.bandekar@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', 'c5ff2ba4-06e2-447c-b45b-95531888427b', NULL, NOW()),
('b16745ff-4c76-4d9f-8199-a021f4ffb8b9', '', 'Naini Yadav', 'naini.yadav@podtech.com', 'employee', 'Senior Software Developer', 'Software Development (India)', 'c5ff2ba4-06e2-447c-b45b-95531888427b', NULL, NOW()),
('8b1e9cd7-dd0a-440e-a1bd-06076f24c1b8', '', 'Rohan D J', 'rohan.dj@podtech.com', 'employee', 'Intern', 'Software Development (India)', 'c5ff2ba4-06e2-447c-b45b-95531888427b', NULL, NOW()),
('73742daf-6b4c-4300-8719-720934786a86', '', 'Sahil Vashisht', 'sahil.vashisht@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', 'c5ff2ba4-06e2-447c-b45b-95531888427b', NULL, NOW()),
('c3a20b79-14a3-4bb8-9cd3-d58e10bd27a7', '', 'Abhishek Kumar Gautam', 'abhishek@podtech.com', 'employee', 'Database Administrator (DBA)', 'Software Development (India)', 'dd6fffec-6211-4318-9a09-c64d3e694357', NULL, NOW()),
('4080f802-6a11-42d6-85f2-47f4dbb9cc01', '', 'Avantika Upadhyay', 'avantika@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', 'dd6fffec-6211-4318-9a09-c64d3e694357', NULL, NOW()),
('da0bf59b-a173-42ca-b1f3-4cc27e7f2feb', '', 'Dharmendra SIngh Yadav', 'dharmendra.yadav@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', 'dd6fffec-6211-4318-9a09-c64d3e694357', NULL, NOW()),
('0588389c-79c9-4378-bec1-ec8c416ae9ea', '', 'Megha Jain', 'megha.jain@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', 'dd6fffec-6211-4318-9a09-c64d3e694357', NULL, NOW()),
('d66544b4-206e-4ab2-a791-4da674139f4c', '', 'Mimansa .', 'mimansa.jha@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', 'dd6fffec-6211-4318-9a09-c64d3e694357', NULL, NOW()),
('d1798d9f-02d1-4b53-bef4-ae7295c67f88', '', 'Nisha Rani', 'nisha.rani@podtech.com', 'employee', 'Data Analyst', 'Software Development (India)', 'dd6fffec-6211-4318-9a09-c64d3e694357', NULL, NOW()),
('1b2fbb91-1091-4c3e-8d89-d9399e194c62', '', 'Shrishti Ravindra Singh', 'shrishti.singh@podtech.com', 'employee', 'Software Developer', 'Software Development (India)', 'dd6fffec-6211-4318-9a09-c64d3e694357', NULL, NOW()),
('bc0f6dd4-cdf3-479f-a729-dcbfef1915bf', '', 'Tushar Jha', 'ravi.jha@podtech.com', 'employee', 'Senior Software Developer', 'Software Development (India)', 'dd6fffec-6211-4318-9a09-c64d3e694357', NULL, NOW()),
('0949f4d8-2483-4a7d-b8c3-860cfd5dcada', '', 'Akash Yadav', 'akash.yadav@podtech.com', 'employee', 'QA Engineer (Manual+Automation)', 'Software Development (India)', '90891e71-5975-4ee0-b4c6-1fb44deb97c5', NULL, NOW()),
('d60e4cd9-3d7c-4ca2-b0b9-1b24ceff8898', '', 'Amit Sharma', 'amit.sharma@podtech.com', 'employee', 'QA Engineer (Manual)', 'Software Development (India)', '90891e71-5975-4ee0-b4c6-1fb44deb97c5', NULL, NOW()),
('b9dab322-e3b3-46dd-bb76-6a8c42293ec7', '', 'B S Saanvi', 'bs.saanvi@podtech.com', 'employee', 'Intern', 'Software Development (India)', '90891e71-5975-4ee0-b4c6-1fb44deb97c5', NULL, NOW()),
('eb7b436d-b6a6-4dbc-a833-0245912bd807', '', 'Pragati Naik', 'pragati.naik@podtech.com', 'employee', 'Intern', 'Software Development (India)', '90891e71-5975-4ee0-b4c6-1fb44deb97c5', NULL, NOW()),
('1fde203e-20ff-4631-8619-c6c09284820d', '', 'Rishika Jha', 'rishika.jha@podtech.com', 'employee', 'Intern', 'Software Development (India)', '90891e71-5975-4ee0-b4c6-1fb44deb97c5', NULL, NOW()),
('accaea5d-bcab-4ad2-8915-bbd6c74da090', '', 'Shakti Mohan', 'shakthi.mohan@podtech.com', 'employee', 'Intern', 'Software Development (India)', '90891e71-5975-4ee0-b4c6-1fb44deb97c5', NULL, NOW()),
('36467292-ddda-4e87-b960-48ce5b601f80', '', 'Shivam Patel', 'shivam.patel@podtech.com', 'employee', 'Intern', 'Software Development (India)', '90891e71-5975-4ee0-b4c6-1fb44deb97c5', NULL, NOW()),
('8c75c0fe-d506-44e2-98a1-b5d199ba6001', '', 'Susil Kumar Sahu', 'susil@podtech.com', 'employee', 'Quality Assurance (QA) Automation Engineer', 'Software Development (India)', '90891e71-5975-4ee0-b4c6-1fb44deb97c5', NULL, NOW()),
('cc6183f8-ad6e-4560-a44e-946f32000209', '', 'Vaibhav Kumar Singh', 'vaibhav.singh@podtech.com', 'employee', 'QA Engineer (Manual+Automation)', 'Software Development (India)', '90891e71-5975-4ee0-b4c6-1fb44deb97c5', NULL, NOW()),
('d42f8693-d19f-4efd-a677-cc1f69df22e3', '', 'Rohit Prakash', 'rohit@podtech.com', 'employee', 'Release Architect', 'Software Development (India)', '5f795c6e-16df-4eb7-9b67-42704ec0b653', NULL, NOW()),
('dee39af1-fcd2-4898-b44a-4510a2fa7f22', '', 'Sanjay Kumar Ranjan', 'sanjay.ranjan@podtech.com', 'employee', 'Sr. DevOps Engineer', 'Software Development (India)', '5f795c6e-16df-4eb7-9b67-42704ec0b653', NULL, NOW()),
('720e34b9-a39d-4dbd-9cc1-d773d5a72059', '', 'Utkarsh Pal', 'utkarsh.pal@podtech.com', 'employee', 'Intern', 'Software Development (India)', '5f795c6e-16df-4eb7-9b67-42704ec0b653', NULL, NOW()),
('4d58a47d-8706-4c98-a83b-a9c5905b457c', '', 'Abhishek P', 'abhishek.p@podtech.com', 'employee', 'Intern', 'Software Development (India)', 'cc9d0086-b33f-4e61-a34f-e3bb7e8b1cad', NULL, NOW()),
('b8f71018-1da6-44ac-9db8-70c07bdc8454', '', 'Dikshant Singh', 'dikshant.singh@podtech.com', 'employee', 'Business Analyst', 'Software Development (India)', 'cc9d0086-b33f-4e61-a34f-e3bb7e8b1cad', NULL, NOW()),
('8a83760e-d065-403f-8100-e7ea79e064d8', '', 'Muralidharan D', 'muralidharan@podtech.com', 'employee', 'Business Analyst', 'Software Development (India)', 'cc9d0086-b33f-4e61-a34f-e3bb7e8b1cad', NULL, NOW()),
('9ccb7c61-2824-4c2e-9ee9-76fb8285433f', '', 'Rishabh Kumar', 'rishabh@podtech.com', 'employee', 'UI/UX Designer', 'Software Development (India)', '0d733541-9400-453c-ba79-783740eee6ef', NULL, NOW()),
('c498c858-1afb-4630-83d5-3b51ddefaba6', '', 'Vandana Pathak', 'vandana@podtech.com', 'employee', 'Intern', 'HR (India)', 'ca5ebe71-7ea0-4cbe-aab8-166bc28a5f56', NULL, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  designation = EXCLUDED.designation,
  department = EXCLUDED.department,
  manager_id = EXCLUDED.manager_id;

-- ============================================
-- SAMPLE FEEDBACK REQUESTS
-- These are example assignments for demonstration
-- ============================================
INSERT INTO feedback_requests (id, target_employee_id, reviewer_employee_id, appraisal_cycle_id, status, created_at) VALUES
('b3de4c4b-480b-4190-bd00-a2ba5b75dc3e', '73742daf-6b4c-4300-8719-720934786a86', '1995648e-22ef-4a0a-bfde-7eab0c48ca8a', 'e7ecda10-f9f2-4bb4-b7c8-7ee30ff501ec', 'pending', NOW()),
('641b8acc-43a5-47d3-a564-749010b42d8b', '73742daf-6b4c-4300-8719-720934786a86', '3f2e6749-f80b-45eb-97bd-a70e1707e361', 'e7ecda10-f9f2-4bb4-b7c8-7ee30ff501ec', 'pending', NOW()),
('7aa60a28-2086-4438-9359-242ee74927e3', '1995648e-22ef-4a0a-bfde-7eab0c48ca8a', '3f2e6749-f80b-45eb-97bd-a70e1707e361', 'e7ecda10-f9f2-4bb4-b7c8-7ee30ff501ec', 'pending', NOW()),
('044ddd87-c5fa-49ab-839c-127eeea37eca', '1995648e-22ef-4a0a-bfde-7eab0c48ca8a', '73742daf-6b4c-4300-8719-720934786a86', 'e7ecda10-f9f2-4bb4-b7c8-7ee30ff501ec', 'submitted', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE PEER FEEDBACK
-- Example submitted feedback for demonstration
-- ============================================
INSERT INTO peer_feedback (id, feedback_request_id, reviewer_id, target_employee_id, appraisal_cycle_id, technical_skills, communication, teamwork, problem_solving, leadership, strengths, areas_of_improvement, additional_comments, submitted_at) VALUES
('3a93183f-bc8f-4423-bf18-203b356673c6', '044ddd87-c5fa-49ab-839c-127eeea37eca', '73742daf-6b4c-4300-8719-720934786a86', '1995648e-22ef-4a0a-bfde-7eab0c48ca8a', 'e7ecda10-f9f2-4bb4-b7c8-7ee30ff501ec', 3, 2, 5, 5, 2, 'He is good in solving things', 'He is good in solving things', 'He is good in solving things', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE MANAGER REVIEWS
-- Example manager evaluations for demonstration
-- ============================================
INSERT INTO manager_reviews (id, manager_id, employee_id, appraisal_cycle_id, performance_rating, goals_achieved, areas_of_growth, training_needs, promotion_readiness, overall_comments, status, submitted_at, created_at) VALUES
('mr-001-sample', 'c5ff2ba4-06e2-447c-b45b-95531888427b', '73742daf-6b4c-4300-8719-720934786a86', 'e7ecda10-f9f2-4bb4-b7c8-7ee30ff501ec', 4, 'Successfully delivered the 360 Feedback system on time. Met all project milestones and maintained high code quality standards.', 'Could improve on documentation practices and take more initiative in architectural decisions.', 'Advanced React patterns, System Design courses', 'Ready for next level', 'Excellent performer who consistently delivers quality work. Strong team player with good problem-solving skills.', 'completed', NOW(), NOW()),
('mr-002-sample', 'ff38ed52-e9bf-4d5d-87da-c770e8f6ee8d', '1995648e-22ef-4a0a-bfde-7eab0c48ca8a', 'e7ecda10-f9f2-4bb4-b7c8-7ee30ff501ec', 3, 'Completed assigned tasks satisfactorily. Contributed to multiple projects during the quarter.', 'Need to improve communication and proactive status updates. Can work on time management skills.', 'Project Management, Communication skills workshop', 'Needs more experience', 'Good developer with potential for growth. Should focus on leadership skills development.', 'completed', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE LEAD REVIEWS (Final Appraisals)
-- Example final appraisals with decisions
-- ============================================
INSERT INTO lead_reviews (id, lead_id, employee_id, appraisal_cycle_id, final_rating, increment_percentage, promotion_decision, remarks, status, submitted_at, created_at) VALUES
('lr-001-sample', '56bcf5a0-69ca-488b-a801-93717a0a8e3f', '73742daf-6b4c-4300-8719-720934786a86', 'e7ecda10-f9f2-4bb4-b7c8-7ee30ff501ec', 4, '12%', 'Recommended for Promotion', 'Outstanding contribution to the 360 Feedback project. Demonstrated excellent technical skills and leadership potential. Ready for senior developer role.', 'completed', NOW(), NOW()),
('lr-002-sample', '56bcf5a0-69ca-488b-a801-93717a0a8e3f', '1995648e-22ef-4a0a-bfde-7eab0c48ca8a', 'e7ecda10-f9f2-4bb4-b7c8-7ee30ff501ec', 3, '8%', 'Not Ready for Promotion', 'Solid performer meeting expectations. Continue to develop skills and take on more responsibility. Review again in next cycle.', 'completed', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE KNOW ABOUT ME (Self-Assessments)
-- Example employee self-assessments
-- ============================================
INSERT INTO know_about_me (id, employee_id, appraisal_cycle_id, project_contributions, role_and_responsibilities, key_achievements, learnings, certifications, technologies_worked_on, mentorship, volunteering_activities, leadership_roles, team_building_activities, problems_solved, strengths, extra_efforts, improvements, created_at, updated_at) VALUES
('kam-001-sample', '73742daf-6b4c-4300-8719-720934786a86', 'e7ecda10-f9f2-4bb4-b7c8-7ee30ff501ec', 
'Led the development of 360 Feedback Performance Review System. Implemented complete frontend architecture using React, TypeScript, and Tailwind CSS. Built admin dashboard with PDF report generation capabilities.',
'Full-stack developer responsible for feature implementation, code review, and technical documentation.',
'Successfully delivered the 360 Feedback system ahead of schedule. Implemented innovative PDF export feature. Achieved 95% code coverage in unit tests.',
'Learned Drizzle ORM, jsPDF library integration, and advanced React patterns. Deepened understanding of OpenID Connect authentication.',
'AWS Cloud Practitioner, React Advanced Patterns certification',
'React, TypeScript, Tailwind CSS, PostgreSQL, Drizzle ORM, Express.js, jsPDF',
'Mentored 2 junior developers on React best practices and code review standards.',
'Organized monthly tech talks. Participated in college outreach program.',
'Led frontend development team for 360 Feedback project. Coordinated with backend team for API integration.',
'Organized virtual team building activities during remote work period.',
'Resolved critical performance issue in admin dashboard by implementing pagination. Fixed authentication edge cases.',
'Strong problem-solving skills. Quick learner. Good at translating requirements into technical solutions.',
'Worked extra hours during critical project phases. Created comprehensive documentation for the project.',
'Can improve on estimation accuracy and public speaking skills.',
NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- NOTE: User IDs are linked on first login
-- The system automatically links employee records to authenticated 
-- users when they log in using their @podtech.com email address
-- ============================================

-- ============================================
-- VERIFICATION QUERIES (Run these to verify data)
-- ============================================
-- SELECT COUNT(*) as employee_count FROM employees;
-- SELECT role, COUNT(*) as count FROM employees GROUP BY role;
-- SELECT COUNT(*) as cycle_count FROM appraisal_cycles;
-- SELECT COUNT(*) as feedback_request_count FROM feedback_requests;
-- SELECT COUNT(*) as peer_feedback_count FROM peer_feedback;
-- SELECT COUNT(*) as manager_review_count FROM manager_reviews;
-- SELECT COUNT(*) as lead_review_count FROM lead_reviews;
-- SELECT COUNT(*) as kam_count FROM know_about_me;

-- ============================================
-- END OF SEED SCRIPT
-- ============================================
