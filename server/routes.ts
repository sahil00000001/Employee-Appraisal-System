import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { sendFeedbackAssignmentEmail } from "./email";
import { 
  insertEmployeeSchema, 
  insertFeedbackRequestSchema,
  insertPeerFeedbackSchema,
  insertManagerReviewSchema,
  insertLeadReviewSchema,
  insertAppraisalCycleSchema,
  insertKnowAboutMeSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get("/api/me/employee", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getEmployeeByUserId(userId);
      res.json(employee || null);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.get("/api/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getEmployeeByUserId(userId);
      const activeCycle = await storage.getActiveCycle();

      if (!employee) {
        return res.json({
          employee: null,
          pendingFeedbackCount: 0,
          completedFeedbackCount: 0,
          myLatestRating: null,
          activeCycle,
          recentFeedbackRequests: [],
        });
      }

      const stats = await storage.getDashboardStats(employee.id);
      const feedbackRequests = await storage.getFeedbackRequestsByReviewer(employee.id);
      const recentRequests = feedbackRequests
        .filter(r => r.status === "pending")
        .slice(0, 5);

      res.json({
        employee,
        ...stats,
        activeCycle,
        recentFeedbackRequests: recentRequests,
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard" });
    }
  });

  app.get("/api/employees", isAuthenticated, async (req, res) => {
    try {
      const employees = await storage.getEmployeesWithRelations();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get("/api/appraisal-cycles", isAuthenticated, async (req, res) => {
    try {
      const cycles = await storage.getAllCycles();
      res.json(cycles);
    } catch (error) {
      console.error("Error fetching cycles:", error);
      res.status(500).json({ message: "Failed to fetch cycles" });
    }
  });

  app.get("/api/feedback-requests/my-tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getEmployeeByUserId(userId);
      
      if (!employee) {
        return res.json([]);
      }

      const requests = await storage.getFeedbackRequestsByReviewer(employee.id);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching feedback requests:", error);
      res.status(500).json({ message: "Failed to fetch feedback requests" });
    }
  });

  app.post("/api/peer-feedback", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getEmployeeByUserId(userId);
      
      if (!employee) {
        return res.status(400).json({ message: "Employee not found" });
      }

      const activeCycle = await storage.getActiveCycle();
      if (!activeCycle) {
        return res.status(400).json({ message: "No active appraisal cycle" });
      }

      const feedbackRequest = await storage.getFeedbackRequestById(req.body.feedbackRequestId);
      if (!feedbackRequest) {
        return res.status(404).json({ message: "Feedback request not found" });
      }

      if (feedbackRequest.reviewerEmployeeId !== employee.id) {
        return res.status(403).json({ message: "You are not authorized to submit this feedback" });
      }

      if (feedbackRequest.appraisalCycleId !== activeCycle.id) {
        return res.status(400).json({ message: "This feedback request is not for the current appraisal cycle" });
      }

      if (feedbackRequest.status === "submitted") {
        return res.status(400).json({ message: "Feedback has already been submitted" });
      }

      const feedbackData = {
        feedbackRequestId: feedbackRequest.id,
        reviewerId: employee.id,
        targetEmployeeId: feedbackRequest.targetEmployeeId,
        appraisalCycleId: activeCycle.id,
        technicalSkills: req.body.technicalSkills,
        communication: req.body.communication,
        teamwork: req.body.teamwork,
        problemSolving: req.body.problemSolving,
        leadership: req.body.leadership,
        strengths: req.body.strengths,
        areasOfImprovement: req.body.areasOfImprovement,
        additionalComments: req.body.additionalComments || null,
      };

      const validated = insertPeerFeedbackSchema.parse(feedbackData);
      const feedback = await storage.createPeerFeedback(validated);
      await storage.updateFeedbackRequestStatus(req.body.feedbackRequestId, "submitted");

      res.json(feedback);
    } catch (error) {
      console.error("Error submitting peer feedback:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  app.get("/api/my-ratings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getEmployeeByUserId(userId);
      
      if (!employee) {
        return res.json({ reviews: [], averageRating: null });
      }

      const reviews = await storage.getLeadReviewsForEmployee(employee.id);
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.finalRating, 0) / reviews.length
        : null;

      res.json({ reviews, averageRating });
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  app.get("/api/manager/team-members", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getEmployeeByUserId(userId);
      
      if (!employee || (employee.role !== "manager" && employee.role !== "lead")) {
        return res.json([]);
      }

      const activeCycle = await storage.getActiveCycle();
      const teamMembers = await storage.getTeamMembersByManager(employee.id);

      const result = await Promise.all(teamMembers.map(async (member) => {
        const review = activeCycle 
          ? await storage.getManagerReviewForEmployee(member.id, activeCycle.id)
          : undefined;
        const peerFeedback = activeCycle
          ? await storage.getPeerFeedbackByTarget(member.id, activeCycle.id)
          : [];

        return {
          employee: member,
          review,
          hasPeerFeedback: peerFeedback.length > 0,
        };
      }));

      res.json(result);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post("/api/manager-reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const manager = await storage.getEmployeeByUserId(userId);
      
      if (!manager || (manager.role !== "manager" && manager.role !== "lead")) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const activeCycle = await storage.getActiveCycle();
      if (!activeCycle) {
        return res.status(400).json({ message: "No active appraisal cycle" });
      }

      const targetEmployee = await storage.getEmployeeById(req.body.employeeId);
      if (!targetEmployee || targetEmployee.managerId !== manager.id) {
        return res.status(403).json({ message: "You can only review your direct reports" });
      }

      const reviewData = {
        managerId: manager.id,
        employeeId: req.body.employeeId,
        appraisalCycleId: activeCycle.id,
        performanceRating: req.body.performanceRating,
        goalsAchieved: req.body.goalsAchieved,
        areasOfGrowth: req.body.areasOfGrowth,
        trainingNeeds: req.body.trainingNeeds || null,
        promotionReadiness: req.body.promotionReadiness,
        overallComments: req.body.overallComments,
        status: req.body.status || "completed",
      };

      const validated = insertManagerReviewSchema.parse(reviewData);
      const existingReview = await storage.getManagerReviewForEmployee(req.body.employeeId, activeCycle.id);
      
      let review;
      if (existingReview) {
        const updateData = {
          performanceRating: validated.performanceRating,
          goalsAchieved: validated.goalsAchieved,
          areasOfGrowth: validated.areasOfGrowth,
          trainingNeeds: validated.trainingNeeds,
          promotionReadiness: validated.promotionReadiness,
          overallComments: validated.overallComments,
          status: validated.status,
        };
        review = await storage.updateManagerReview(existingReview.id, updateData);
      } else {
        review = await storage.createManagerReview(validated);
      }

      res.json(review);
    } catch (error) {
      console.error("Error submitting manager review:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  app.get("/api/lead/appraisals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getEmployeeByUserId(userId);
      
      if (!employee || employee.role !== "lead") {
        return res.json([]);
      }

      const activeCycle = await storage.getActiveCycle();
      const teamEmployees = await storage.getEmployeesByLead(employee.id);
      const allManaged = await storage.getTeamMembersByManager(employee.id);
      const allEmployees = [...teamEmployees, ...allManaged.filter(e => !teamEmployees.find(te => te.id === e.id))];

      const result = await Promise.all(allEmployees.map(async (emp) => {
        const managerReview = activeCycle 
          ? await storage.getManagerReviewForEmployee(emp.id, activeCycle.id)
          : undefined;
        const peerFeedback = activeCycle
          ? await storage.getPeerFeedbackByTarget(emp.id, activeCycle.id)
          : [];
        const leadReview = activeCycle
          ? await storage.getLeadReviewForEmployee(emp.id, activeCycle.id)
          : undefined;

        const manager = managerReview?.managerId 
          ? await storage.getEmployeeById(managerReview.managerId)
          : undefined;

        return {
          employee: emp,
          managerReview: managerReview ? { ...managerReview, manager } : undefined,
          peerFeedback,
          leadReview,
        };
      }));

      res.json(result);
    } catch (error) {
      console.error("Error fetching lead appraisals:", error);
      res.status(500).json({ message: "Failed to fetch appraisals" });
    }
  });

  app.post("/api/lead-reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const lead = await storage.getEmployeeByUserId(userId);
      
      if (!lead || lead.role !== "lead") {
        return res.status(403).json({ message: "Not authorized" });
      }

      const activeCycle = await storage.getActiveCycle();
      if (!activeCycle) {
        return res.status(400).json({ message: "No active appraisal cycle" });
      }

      const targetEmployee = await storage.getEmployeeById(req.body.employeeId);
      if (!targetEmployee || (targetEmployee.leadId !== lead.id && targetEmployee.managerId !== lead.id)) {
        return res.status(403).json({ message: "You can only review employees under your leadership" });
      }

      const reviewData = {
        leadId: lead.id,
        employeeId: req.body.employeeId,
        appraisalCycleId: activeCycle.id,
        finalRating: req.body.finalRating,
        incrementPercentage: req.body.incrementPercentage || null,
        promotionDecision: req.body.promotionDecision,
        remarks: req.body.remarks,
        status: req.body.status || "completed",
      };

      const validated = insertLeadReviewSchema.parse(reviewData);
      const existingReview = await storage.getLeadReviewForEmployee(req.body.employeeId, activeCycle.id);
      
      let review;
      if (existingReview) {
        const updateData = {
          finalRating: validated.finalRating,
          incrementPercentage: validated.incrementPercentage,
          promotionDecision: validated.promotionDecision,
          remarks: validated.remarks,
          status: validated.status,
        };
        review = await storage.updateLeadReview(existingReview.id, updateData);
      } else {
        review = await storage.createLeadReview(validated);
      }

      res.json(review);
    } catch (error) {
      console.error("Error submitting lead review:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  app.get("/api/reports", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getEmployeeByUserId(userId);
      
      if (!employee || employee.role !== "lead") {
        return res.status(403).json({ message: "Not authorized" });
      }

      const activeCycle = await storage.getActiveCycle();
      const stats = await storage.getReportStats();

      res.json({
        activeCycle,
        ...stats,
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post("/api/admin/employees", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentEmployee = await storage.getEmployeeByUserId(userId);
      
      if (!currentEmployee || currentEmployee.role !== "lead") {
        return res.status(403).json({ message: "Not authorized" });
      }

      const validated = insertEmployeeSchema.parse({
        ...req.body,
        userId: req.body.email,
      });

      const existingEmployee = await storage.getEmployeeByEmail(validated.email);
      if (existingEmployee) {
        return res.status(400).json({ message: "Employee with this email already exists" });
      }

      const employee = await storage.createEmployee(validated);
      res.json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.post("/api/admin/appraisal-cycles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentEmployee = await storage.getEmployeeByUserId(userId);
      
      if (!currentEmployee || currentEmployee.role !== "lead") {
        return res.status(403).json({ message: "Not authorized" });
      }

      const validated = insertAppraisalCycleSchema.parse(req.body);
      const cycle = await storage.createCycle(validated);
      res.json(cycle);
    } catch (error) {
      console.error("Error creating cycle:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create cycle" });
    }
  });

  app.patch("/api/admin/appraisal-cycles/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentEmployee = await storage.getEmployeeByUserId(userId);
      
      if (!currentEmployee || currentEmployee.role !== "lead") {
        return res.status(403).json({ message: "Not authorized" });
      }

      const cycle = await storage.updateCycle(req.params.id, req.body);
      res.json(cycle);
    } catch (error) {
      console.error("Error updating cycle:", error);
      res.status(500).json({ message: "Failed to update cycle" });
    }
  });

  app.post("/api/admin/feedback-requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentEmployee = await storage.getEmployeeByUserId(userId);
      
      if (!currentEmployee || currentEmployee.role !== "lead") {
        return res.status(403).json({ message: "Not authorized" });
      }

      const activeCycle = await storage.getActiveCycle();
      if (!activeCycle) {
        return res.status(400).json({ message: "No active appraisal cycle" });
      }

      const validated = insertFeedbackRequestSchema.parse({
        ...req.body,
        appraisalCycleId: activeCycle.id,
      });

      const request = await storage.createFeedbackRequest(validated);
      res.json(request);
    } catch (error) {
      console.error("Error creating feedback request:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create feedback request" });
    }
  });

  // Manager feedback assignment routes (using separate manager session)
  const isManagerSession = (req: any, res: any, next: any) => {
    const managerUser = (req.session as any)?.managerUser;
    if (!managerUser || !managerUser.claims?.isManagerSession) {
      return res.status(401).json({ message: "Manager session required" });
    }
    const now = Math.floor(Date.now() / 1000);
    if (now > managerUser.expires_at) {
      return res.status(401).json({ message: "Session expired" });
    }
    (req as any).user = managerUser;
    return next();
  };

  app.get("/api/manager/all-employees", isManagerSession, async (req, res) => {
    try {
      const employees = await storage.getEmployeesWithRelations();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post("/api/manager/assign-feedback", isManagerSession, async (req: any, res) => {
    try {
      const { targetEmployeeId, reviewerEmployeeIds } = req.body;

      if (!targetEmployeeId || !reviewerEmployeeIds || !Array.isArray(reviewerEmployeeIds)) {
        return res.status(400).json({ message: "Target employee and reviewers are required" });
      }

      if (reviewerEmployeeIds.length === 0) {
        return res.status(400).json({ message: "At least one reviewer must be selected" });
      }

      const activeCycle = await storage.getActiveCycle();
      if (!activeCycle) {
        return res.status(400).json({ message: "No active appraisal cycle. Please create one first." });
      }

      const targetEmployee = await storage.getEmployeeById(targetEmployeeId);
      if (!targetEmployee) {
        return res.status(404).json({ message: "Target employee not found" });
      }

      const results = [];
      const emailResults = [];

      for (const reviewerId of reviewerEmployeeIds) {
        if (reviewerId === targetEmployeeId) {
          continue; // Skip self-review
        }

        const reviewer = await storage.getEmployeeById(reviewerId);
        if (!reviewer) continue;

        // Create feedback request
        const request = await storage.createFeedbackRequest({
          targetEmployeeId,
          reviewerEmployeeId: reviewerId,
          appraisalCycleId: activeCycle.id,
          status: "pending",
        });
        results.push(request);

        // Send email notification
        const emailSent = await sendFeedbackAssignmentEmail(
          reviewer.email,
          reviewer.name,
          targetEmployee.name
        );
        emailResults.push({ reviewer: reviewer.name, emailSent });
      }

      res.json({ 
        message: `Feedback assigned successfully to ${results.length} reviewer(s)`,
        requests: results,
        emailResults,
      });
    } catch (error) {
      console.error("Error assigning feedback:", error);
      res.status(500).json({ message: "Failed to assign feedback" });
    }
  });

  app.get("/api/manager/feedback-assignments", isManagerSession, async (req, res) => {
    try {
      const activeCycle = await storage.getActiveCycle();
      if (!activeCycle) {
        return res.json([]);
      }
      
      const requests = await storage.getFeedbackRequestsByCycle(activeCycle.id);
      
      // Enrich with employee details
      const enrichedRequests = await Promise.all(requests.map(async (req) => {
        const target = await storage.getEmployeeById(req.targetEmployeeId);
        const reviewer = await storage.getEmployeeById(req.reviewerEmployeeId);
        return {
          ...req,
          targetEmployee: target,
          reviewerEmployee: reviewer,
        };
      }));
      
      res.json(enrichedRequests);
    } catch (error) {
      console.error("Error fetching feedback assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // Admin authentication routes
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "admin";

  app.post("/api/auth/admin-login", (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      (req.session as any).isAdmin = true;
      res.json({ success: true, message: "Admin login successful" });
    } else {
      res.status(401).json({ message: "Invalid admin credentials" });
    }
  });

  app.post("/api/auth/admin-logout", (req, res) => {
    (req.session as any).isAdmin = false;
    res.json({ success: true });
  });

  app.get("/api/auth/admin-check", (req, res) => {
    const isAdmin = (req.session as any)?.isAdmin === true;
    res.json({ isAdmin });
  });

  const isAdminSession = (req: Request, res: Response, next: NextFunction) => {
    if ((req.session as any)?.isAdmin === true) {
      next();
    } else {
      res.status(401).json({ message: "Admin authentication required" });
    }
  };

  // Admin data routes
  app.get("/api/admin/employees-full", isAdminSession, async (req, res) => {
    try {
      const employees = await storage.getEmployeesWithRelations();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get("/api/admin/feedback-activity", isAdminSession, async (req, res) => {
    try {
      const activeCycle = await storage.getActiveCycle();
      if (!activeCycle) {
        return res.json({ employees: [], cycle: null });
      }
      
      const employeesWithActivity = await storage.getEmployeesWithFeedbackActivity(activeCycle.id);
      res.json({ employees: employeesWithActivity, cycle: activeCycle });
    } catch (error) {
      console.error("Error fetching feedback activity:", error);
      res.status(500).json({ message: "Failed to fetch feedback activity" });
    }
  });

  app.get("/api/admin/employee-report/:employeeId", isAdminSession, async (req, res) => {
    try {
      const employeeId = req.params.employeeId as string;
      const employee = await storage.getEmployeeById(employeeId);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const activeCycle = await storage.getActiveCycle();
      
      // Get manager info
      let manager = null;
      if (employee.managerId) {
        manager = await storage.getEmployeeById(employee.managerId);
      }

      // Get lead info
      let lead = null;
      if (employee.leadId) {
        lead = await storage.getEmployeeById(employee.leadId);
      }

      // Get peer feedback received
      let peerFeedback: any[] = [];
      if (activeCycle) {
        peerFeedback = await storage.getPeerFeedbackByTarget(employeeId, activeCycle.id);
      }

      // Get manager review
      let managerReview = null;
      if (activeCycle) {
        managerReview = await storage.getManagerReviewForEmployee(employeeId, activeCycle.id);
      }

      // Get lead review
      let leadReview = null;
      if (activeCycle) {
        leadReview = await storage.getLeadReviewForEmployee(employeeId, activeCycle.id);
      }

      // Get KAM data
      let kamData = null;
      if (activeCycle) {
        kamData = await storage.getKnowAboutMe(employeeId, activeCycle.id);
      }

      res.json({
        employee,
        manager,
        lead,
        peerFeedback,
        managerReview,
        leadReview,
        kamData,
        activeCycle,
      });
    } catch (error) {
      console.error("Error fetching employee report:", error);
      res.status(500).json({ message: "Failed to fetch employee report" });
    }
  });

  // Know About Me (KAM) routes
  app.get("/api/know-about-me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getEmployeeByUserId(userId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const activeCycle = await storage.getActiveCycle();
      if (!activeCycle) {
        return res.status(400).json({ message: "No active appraisal cycle" });
      }

      const kam = await storage.getKnowAboutMe(employee.id, activeCycle.id);
      res.json(kam || null);
    } catch (error) {
      console.error("Error fetching KAM:", error);
      res.status(500).json({ message: "Failed to fetch Know About Me data" });
    }
  });

  app.post("/api/know-about-me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getEmployeeByUserId(userId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const activeCycle = await storage.getActiveCycle();
      if (!activeCycle) {
        return res.status(400).json({ message: "No active appraisal cycle" });
      }

      const data = {
        ...req.body,
        employeeId: employee.id,
        appraisalCycleId: activeCycle.id,
      };

      const validated = insertKnowAboutMeSchema.parse(data);
      const kam = await storage.upsertKnowAboutMe(validated);
      res.json(kam);
    } catch (error: any) {
      console.error("Error saving KAM:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save Know About Me data" });
    }
  });

  return httpServer;
}
