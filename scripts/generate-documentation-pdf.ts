import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

function generateDocumentationPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  const addNewPage = () => {
    doc.addPage();
    yPos = margin;
  };

  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      addNewPage();
    }
  };

  const addTitle = (text: string, fontSize: number = 24) => {
    checkPageBreak(20);
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(text, margin, yPos);
    yPos += fontSize * 0.6;
  };

  const addSectionTitle = (text: string) => {
    checkPageBreak(15);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(text, margin, yPos);
    yPos += 8;
  };

  const addSubtitle = (text: string) => {
    checkPageBreak(12);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(text, margin, yPos);
    yPos += 6;
  };

  const addText = (text: string, indent: number = 0) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    for (const line of lines) {
      checkPageBreak(6);
      doc.text(line, margin + indent, yPos);
      yPos += 5;
    }
  };

  const addBulletPoint = (text: string, level: number = 0) => {
    const indent = 5 + level * 5;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    checkPageBreak(6);
    doc.text("\u2022", margin + indent - 4, yPos);
    const lines = doc.splitTextToSize(text, contentWidth - indent - 5);
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) checkPageBreak(5);
      doc.text(lines[i], margin + indent, yPos);
      yPos += 5;
    }
  };

  const addTableRow = (cells: string[], isHeader: boolean = false) => {
    checkPageBreak(8);
    const cellWidth = contentWidth / cells.length;
    doc.setFontSize(9);
    doc.setFont("helvetica", isHeader ? "bold" : "normal");
    
    if (isHeader) {
      doc.setFillColor(37, 99, 235);
      doc.rect(margin, yPos - 4, contentWidth, 7, 'F');
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setTextColor(50, 50, 50);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos + 2, margin + contentWidth, yPos + 2);
    }
    
    cells.forEach((cell, i) => {
      const truncated = cell.length > 30 ? cell.substring(0, 27) + '...' : cell;
      doc.text(truncated, margin + i * cellWidth + 2, yPos);
    });
    yPos += 7;
  };

  const addSpace = (space: number = 5) => {
    yPos += space;
  };

  // ===== COVER PAGE =====
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 80, 'F');

  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("360 Feedback", pageWidth / 2, 40, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("Employee Performance Review System", pageWidth / 2, 55, { align: 'center' });

  doc.setFontSize(12);
  doc.text("Technical Documentation", pageWidth / 2, 70, { align: 'center' });

  yPos = 100;

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Project Information", margin, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const projectInfo = [
    ["Project Name:", "360 Feedback"],
    ["Author:", "Sahil Vashisht"],
    ["Version:", "1.0.0"],
    ["Date:", "January 2026"],
    ["Organization:", "PodTech"]
  ];

  projectInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + 45, yPos);
    yPos += 7;
  });

  yPos += 20;
  doc.setFontSize(12);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text("A comprehensive performance appraisal and review system", margin, yPos);
  yPos += 7;
  doc.text("that streamlines feedback collection across organizational hierarchies.", margin, yPos);

  // Footer on cover page
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("Confidential - For Internal Use Only", pageWidth / 2, pageHeight - 15, { align: 'center' });

  // ===== TABLE OF CONTENTS =====
  addNewPage();
  addTitle("Table of Contents", 20);
  addSpace(10);

  const tocItems = [
    "1. Executive Summary",
    "2. Project Overview",
    "3. System Architecture",
    "4. Database Design",
    "5. Features & Functionality",
    "6. User Roles & Permissions",
    "7. API Documentation",
    "8. Installation Guide",
    "9. User Guide",
    "10. Admin Dashboard",
    "11. Security Features",
    "12. Troubleshooting"
  ];

  tocItems.forEach((item, index) => {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text(item, margin + 10, yPos);
    yPos += 8;
  });

  // ===== SECTION 1: EXECUTIVE SUMMARY =====
  addNewPage();
  addTitle("1. Executive Summary", 18);
  addSpace(5);
  
  addText("360 Feedback is a comprehensive employee performance appraisal and review system designed to streamline the feedback collection process across organizational hierarchies.");
  addSpace(5);
  
  addText("The system enables:");
  addBulletPoint("Peer-to-peer feedback collection for holistic employee evaluation");
  addBulletPoint("Manager reviews for direct report assessments");
  addBulletPoint("Lead final appraisals with ratings and promotion decisions");
  addBulletPoint("Self-assessment through the \"Know About Me\" (KAM) feature");
  addBulletPoint("Admin dashboard for HR to monitor feedback activity and generate reports");
  addSpace(5);
  
  addText("The platform supports multiple user roles (Employee, Manager, Lead) with role-based access control, ensuring data privacy and appropriate visibility of feedback information.");

  // ===== SECTION 2: PROJECT OVERVIEW =====
  addSpace(10);
  addTitle("2. Project Overview", 18);
  addSpace(5);

  addSubtitle("2.1 Purpose");
  addText("The 360 Feedback system addresses the need for a structured, digital approach to employee performance reviews. Traditional paper-based or spreadsheet-driven appraisal systems are time-consuming, prone to data loss, difficult to track, and lack anonymity for peer feedback.");
  addSpace(5);

  addSubtitle("2.2 Key Benefits");
  addBulletPoint("Streamlined Process - Automated workflow from feedback request to final appraisal");
  addBulletPoint("Data Security - Role-based access ensures appropriate data visibility");
  addBulletPoint("Real-time Tracking - Monitor feedback completion status in real-time");
  addBulletPoint("Comprehensive Reports - Generate PDF reports with all feedback data");
  addBulletPoint("Email Notifications - Automatic email alerts for feedback assignments");
  addBulletPoint("Self-Service Portal - Employees can view their ratings and submit self-assessments");
  addSpace(5);

  addSubtitle("2.3 Technology Stack");
  addSpace(3);
  addTableRow(["Component", "Technology"], true);
  addTableRow(["Frontend", "React with TypeScript"]);
  addTableRow(["UI Components", "Shadcn/UI + Tailwind CSS"]);
  addTableRow(["Backend", "Express.js with TypeScript"]);
  addTableRow(["Database", "PostgreSQL"]);
  addTableRow(["ORM", "Drizzle ORM"]);
  addTableRow(["Authentication", "Replit Auth (OpenID Connect)"]);
  addTableRow(["Email Service", "Nodemailer with Outlook SMTP"]);
  addTableRow(["PDF Generation", "jsPDF"]);

  // ===== SECTION 3: SYSTEM ARCHITECTURE =====
  addNewPage();
  addTitle("3. System Architecture", 18);
  addSpace(5);

  addSubtitle("3.1 High-Level Architecture");
  addText("The system follows a three-tier architecture:");
  addBulletPoint("Frontend (React) - User interface layer handling all user interactions");
  addBulletPoint("Backend (Express) - Business logic layer processing requests and managing data");
  addBulletPoint("Database (PostgreSQL) - Data persistence layer storing all application data");
  addSpace(5);

  addSubtitle("3.2 Request Flow");
  addText("1. User makes a request from the React frontend");
  addText("2. Request is sent to Express backend via API");
  addText("3. Backend validates request and checks authentication");
  addText("4. Backend queries PostgreSQL database via Drizzle ORM");
  addText("5. Response is sent back to frontend");
  addText("6. React updates the UI based on response");

  // ===== SECTION 4: DATABASE DESIGN =====
  addSpace(10);
  addTitle("4. Database Design", 18);
  addSpace(5);

  addSubtitle("4.1 Core Tables");
  addBulletPoint("employees - Stores all employee information including role and hierarchy");
  addBulletPoint("appraisal_cycles - Defines time periods for performance reviews");
  addBulletPoint("feedback_requests - Tracks peer feedback assignments");
  addBulletPoint("peer_feedback - Stores submitted peer feedback with ratings");
  addBulletPoint("manager_reviews - Manager evaluations of team members");
  addBulletPoint("lead_reviews - Final appraisals with promotion/increment decisions");
  addBulletPoint("know_about_me - Employee self-assessments");
  addSpace(5);

  addSubtitle("4.2 Key Relationships");
  addText("The database uses foreign key relationships to maintain data integrity:");
  addBulletPoint("Employees can have a manager (manager_id) and lead (lead_id)");
  addBulletPoint("Feedback requests link target employee to reviewer");
  addBulletPoint("All reviews are tied to appraisal cycles for period tracking");

  // ===== SECTION 5: FEATURES =====
  addNewPage();
  addTitle("5. Features & Functionality", 18);
  addSpace(5);

  addSubtitle("5.1 Peer Feedback System");
  addText("Enables employees to provide anonymous feedback about their colleagues. Employees rate colleagues on 5 parameters (1-5 scale): Technical Skills, Communication, Teamwork, Problem Solving, and Leadership.");
  addSpace(5);

  addSubtitle("5.2 Manager Reviews");
  addText("Allows managers to formally evaluate their direct reports. Managers document goals achieved, areas for growth, training needs, and promotion readiness.");
  addSpace(5);

  addSubtitle("5.3 Lead Final Appraisals");
  addText("Leads review all feedback and make final decisions including final rating, increment percentage, promotion decision, and remarks.");
  addSpace(5);

  addSubtitle("5.4 Know About Me (KAM)");
  addText("Employees document their achievements in categories: Projects & Contributions, Learning & Growth, Leadership & Team Building, Problem Solving & Strengths, and Extra Efforts.");
  addSpace(5);

  addSubtitle("5.5 Admin Dashboard");
  addText("Central monitoring hub with Recent Activity view (sorted by feedback recency), All Employees view, detailed reports, and PDF export capability.");

  // ===== SECTION 6: USER ROLES =====
  addSpace(10);
  addTitle("6. User Roles & Permissions", 18);
  addSpace(5);

  addSubtitle("6.1 Role Descriptions");
  addSpace(3);

  addText("Employee: Can submit peer feedback, view own ratings, fill KAM form. Cannot see others' feedback.", 5);
  addSpace(3);
  addText("Manager: All employee permissions plus can review direct reports, assign feedback requests, view team feedback.", 5);
  addSpace(3);
  addText("Lead: All manager permissions plus can provide final appraisals, make promotion/increment decisions, view comprehensive reports.", 5);
  addSpace(3);
  addText("Admin: Separate login, can view all employee data, monitor feedback activity, download detailed PDF reports.", 5);

  // ===== SECTION 7: API DOCUMENTATION =====
  addNewPage();
  addTitle("7. API Documentation", 18);
  addSpace(5);

  addSubtitle("7.1 Key Endpoints");
  addSpace(3);
  addTableRow(["Method", "Endpoint", "Description"], true);
  addTableRow(["GET", "/api/auth/user", "Get current user info"]);
  addTableRow(["GET", "/api/employees", "List all employees"]);
  addTableRow(["GET", "/api/feedback-requests/my-tasks", "Get pending feedback tasks"]);
  addTableRow(["POST", "/api/peer-feedback", "Submit peer feedback"]);
  addTableRow(["GET", "/api/my-ratings", "Get own ratings"]);
  addTableRow(["GET", "/api/know-about-me", "Get employee KAM"]);
  addTableRow(["POST", "/api/know-about-me", "Save KAM data"]);
  addTableRow(["GET", "/api/manager/team-members", "Get manager's team"]);
  addTableRow(["POST", "/api/manager-reviews", "Submit manager review"]);
  addTableRow(["POST", "/api/lead-reviews", "Submit lead review"]);
  addTableRow(["POST", "/api/admin/login", "Admin login"]);

  // ===== SECTION 8: INSTALLATION =====
  addSpace(10);
  addTitle("8. Installation Guide", 18);
  addSpace(5);

  addSubtitle("Prerequisites");
  addBulletPoint("Node.js 18+ installed");
  addBulletPoint("PostgreSQL database");
  addBulletPoint("npm package manager");
  addSpace(5);

  addSubtitle("Installation Steps");
  addText("1. Clone the repository from Git");
  addText("2. Run 'npm install' to install dependencies");
  addText("3. Run 'npm run db:push' to create database tables");
  addText("4. Run 'psql $DATABASE_URL < scripts/seed-data.sql' to seed data");
  addText("5. Configure OUTLOOK_EMAIL and OUTLOOK_PASSWORD secrets");
  addText("6. Run 'npm run dev' to start the application");

  // ===== SECTION 9: USER GUIDE =====
  addNewPage();
  addTitle("9. User Guide", 18);
  addSpace(5);

  addSubtitle("9.1 Employee Login");
  addText("Go to landing page, click 'Sign In', authenticate with Replit. System automatically links account based on email.");
  addSpace(5);

  addSubtitle("9.2 Submitting Peer Feedback");
  addText("Go to 'Feedback Tasks', click 'Give Feedback', rate on all 5 parameters, write feedback, click 'Submit'.");
  addSpace(5);

  addSubtitle("9.3 Viewing Ratings");
  addText("Go to 'My Ratings' to view final rating and lead remarks.");
  addSpace(5);

  addSubtitle("9.4 Know About Me");
  addText("Go to 'Know About Me', fill relevant sections, click 'Save'.");

  // ===== SECTION 10: ADMIN DASHBOARD =====
  addSpace(10);
  addTitle("10. Admin Dashboard", 18);
  addSpace(5);

  addSubtitle("10.1 Access");
  addText("URL: /admin/login");
  addText("Credentials: admin / admin");
  addSpace(5);

  addSubtitle("10.2 Features");
  addBulletPoint("Recent Activity View - Employees sorted by most recent feedback submission");
  addBulletPoint("All Employees View - Complete employee directory with hierarchy");
  addBulletPoint("Feedback Status - Track completed vs pending assignments");
  addBulletPoint("Detailed Reports - View comprehensive employee reports");
  addBulletPoint("PDF Export - Download professional reports");

  // ===== SECTION 11: SECURITY =====
  addNewPage();
  addTitle("11. Security Features", 18);
  addSpace(5);

  addSubtitle("11.1 Authentication");
  addBulletPoint("User Authentication via Replit Auth (OpenID Connect)");
  addBulletPoint("Admin Authentication via separate username/password system");
  addBulletPoint("Secure session management with httpOnly cookies");
  addSpace(5);

  addSubtitle("11.2 Data Protection");
  addBulletPoint("Role-based access control (RBAC)");
  addBulletPoint("SQL injection prevention via parameterized queries");
  addBulletPoint("XSS prevention through proper escaping");
  addBulletPoint("TLS encryption for email transport");

  // ===== SECTION 12: TROUBLESHOOTING =====
  addSpace(10);
  addTitle("12. Troubleshooting", 18);
  addSpace(5);

  addSubtitle("Common Issues");
  addSpace(3);

  addText("Employee account not linked:");
  addText("- Ensure email in database matches Replit login email", 5);
  addText("- Linking happens automatically on first login", 5);
  addSpace(3);

  addText("Database schema changes not applying:");
  addText("- Run 'npm run db:push' to sync schema", 5);
  addSpace(3);

  addText("Email notifications not sending:");
  addText("- Verify OUTLOOK_EMAIL and OUTLOOK_PASSWORD secrets", 5);
  addText("- Check server logs for SMTP errors", 5);

  // ===== FINAL PAGE =====
  addNewPage();
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 60, 'F');

  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Document Information", pageWidth / 2, 35, { align: 'center' });

  yPos = 80;
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  const docInfo = [
    ["Document Title:", "360 Feedback - Technical Documentation"],
    ["Prepared By:", "Sahil Vashisht"],
    ["Project Name:", "360 Feedback"],
    ["Version:", "1.0.0"],
    ["Date:", "January 2026"],
    ["Status:", "Complete"]
  ];

  docInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + 50, yPos);
    yPos += 10;
  });

  yPos += 20;
  doc.setFontSize(11);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text("This document provides comprehensive technical documentation for the", margin, yPos);
  yPos += 7;
  doc.text("360 Feedback Employee Performance Review System.", margin, yPos);

  yPos += 30;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("For questions or support, please contact the development team.", margin, yPos);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("Confidential - For Internal Use Only", pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text("\u00A9 2026 PodTech. All rights reserved.", pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Add page numbers
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  // Save the PDF
  const pdfBuffer = doc.output('arraybuffer');
  const outputPath = path.join(process.cwd(), 'docs', '360-Feedback-Technical-Documentation.pdf');
  fs.writeFileSync(outputPath, Buffer.from(pdfBuffer));
  console.log(`PDF generated successfully: ${outputPath}`);
}

generateDocumentationPDF();
