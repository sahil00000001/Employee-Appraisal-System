import { 
  employees, 
  feedbackRequests, 
  peerFeedback, 
  managerReviews, 
  leadReviews, 
  appraisalCycles,
  knowAboutMe,
  type Employee, 
  type InsertEmployee,
  type FeedbackRequest,
  type InsertFeedbackRequest,
  type PeerFeedback,
  type InsertPeerFeedback,
  type ManagerReview,
  type InsertManagerReview,
  type LeadReview,
  type InsertLeadReview,
  type AppraisalCycle,
  type InsertAppraisalCycle,
  type KnowAboutMe,
  type InsertKnowAboutMe,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface EmployeeFeedbackStatus {
  employee: Employee;
  manager?: Employee | null;
  totalAssigned: number;
  totalCompleted: number;
  latestFeedbackAt: Date | null;
  feedbackRequests: (FeedbackRequest & { 
    reviewer?: Employee; 
    submitted: boolean;
    submittedAt?: Date | null;
  })[];
}

export interface IStorage {
  getEmployeeByUserId(userId: string): Promise<Employee | undefined>;
  getEmployeeById(id: string): Promise<Employee | undefined>;
  getEmployeeByEmail(email: string): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  getEmployeesWithRelations(): Promise<(Employee & { manager?: Employee | null; lead?: Employee | null })[]>;
  getEmployeesWithFeedbackActivity(cycleId: string): Promise<EmployeeFeedbackStatus[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, data: Partial<InsertEmployee>): Promise<Employee | undefined>;

  getActiveCycle(): Promise<AppraisalCycle | undefined>;
  getAllCycles(): Promise<AppraisalCycle[]>;
  createCycle(cycle: InsertAppraisalCycle): Promise<AppraisalCycle>;
  updateCycle(id: string, data: Partial<InsertAppraisalCycle>): Promise<AppraisalCycle | undefined>;

  getFeedbackRequestById(id: string): Promise<FeedbackRequest | undefined>;
  getFeedbackRequestsByReviewer(reviewerId: string): Promise<(FeedbackRequest & { targetEmployee?: Employee })[]>;
  getFeedbackRequestsByTarget(targetId: string): Promise<FeedbackRequest[]>;
  getFeedbackRequestsByCycle(cycleId: string): Promise<FeedbackRequest[]>;
  createFeedbackRequest(request: InsertFeedbackRequest): Promise<FeedbackRequest>;
  updateFeedbackRequestStatus(id: string, status: "pending" | "submitted"): Promise<void>;

  getPeerFeedbackByTarget(targetId: string, cycleId: string): Promise<(PeerFeedback & { reviewer?: Employee })[]>;
  createPeerFeedback(feedback: InsertPeerFeedback): Promise<PeerFeedback>;

  getManagerReviewsByManager(managerId: string): Promise<(ManagerReview & { employee?: Employee })[]>;
  getManagerReviewForEmployee(employeeId: string, cycleId: string): Promise<ManagerReview | undefined>;
  createManagerReview(review: InsertManagerReview): Promise<ManagerReview>;
  updateManagerReview(id: string, data: Partial<InsertManagerReview>): Promise<ManagerReview | undefined>;

  getLeadReviewsForEmployee(employeeId: string): Promise<(LeadReview & { appraisalCycle?: AppraisalCycle })[]>;
  getLeadReviewForEmployee(employeeId: string, cycleId: string): Promise<LeadReview | undefined>;
  createLeadReview(review: InsertLeadReview): Promise<LeadReview>;
  updateLeadReview(id: string, data: Partial<InsertLeadReview>): Promise<LeadReview | undefined>;

  getTeamMembersByManager(managerId: string): Promise<Employee[]>;
  getEmployeesByLead(leadId: string): Promise<Employee[]>;

  getDashboardStats(employeeId: string): Promise<{
    pendingFeedbackCount: number;
    completedFeedbackCount: number;
    myLatestRating: number | null;
  }>;

  getReportStats(): Promise<{
    totalEmployees: number;
    completedFeedback: number;
    pendingFeedback: number;
    completedManagerReviews: number;
    pendingManagerReviews: number;
    completedLeadReviews: number;
    pendingLeadReviews: number;
    averageRating: number | null;
    ratingDistribution: { rating: number; count: number }[];
  }>;

  // Know About Me (KAM)
  getKnowAboutMe(employeeId: string, cycleId: string): Promise<KnowAboutMe | undefined>;
  upsertKnowAboutMe(data: InsertKnowAboutMe): Promise<KnowAboutMe>;
}

export class DatabaseStorage implements IStorage {
  async getEmployeeByUserId(userId: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.userId, userId));
    return employee;
  }

  async getEmployeeById(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.email, email));
    return employee;
  }

  async getAllEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(employees.name);
  }

  async getEmployeesWithRelations(): Promise<(Employee & { manager?: Employee | null; lead?: Employee | null })[]> {
    const allEmployees = await db.select().from(employees).orderBy(employees.name);
    const employeeMap = new Map(allEmployees.map(e => [e.id, e]));
    
    return allEmployees.map(emp => ({
      ...emp,
      manager: emp.managerId ? employeeMap.get(emp.managerId) || null : null,
      lead: emp.leadId ? employeeMap.get(emp.leadId) || null : null,
    }));
  }

  async getEmployeesWithFeedbackActivity(cycleId: string): Promise<EmployeeFeedbackStatus[]> {
    const allEmployees = await db.select().from(employees).orderBy(employees.name);
    const employeeMap = new Map(allEmployees.map(e => [e.id, e]));
    
    const allRequests = await db.select().from(feedbackRequests).where(
      eq(feedbackRequests.appraisalCycleId, cycleId)
    );
    
    const allFeedback = await db.select().from(peerFeedback).where(
      eq(peerFeedback.appraisalCycleId, cycleId)
    );
    
    const feedbackByRequest = new Map(allFeedback.map(f => [f.feedbackRequestId, f]));
    
    const employeeRequestsMap = new Map<string, typeof allRequests>();
    for (const req of allRequests) {
      const existing = employeeRequestsMap.get(req.targetEmployeeId) || [];
      existing.push(req);
      employeeRequestsMap.set(req.targetEmployeeId, existing);
    }
    
    const results: EmployeeFeedbackStatus[] = [];
    
    for (const emp of allEmployees) {
      const empRequests = employeeRequestsMap.get(emp.id) || [];
      
      if (empRequests.length === 0) continue;
      
      const enrichedRequests = empRequests.map(req => {
        const feedback = feedbackByRequest.get(req.id);
        const reviewer = employeeMap.get(req.reviewerEmployeeId);
        return {
          ...req,
          reviewer,
          submitted: !!feedback,
          submittedAt: feedback?.submittedAt || null,
        };
      });
      
      const completedCount = enrichedRequests.filter(r => r.submitted).length;
      
      const submittedFeedback = enrichedRequests
        .filter(r => r.submittedAt)
        .map(r => r.submittedAt!)
        .sort((a, b) => b.getTime() - a.getTime());
      
      const latestFeedbackAt = submittedFeedback.length > 0 ? submittedFeedback[0] : null;
      
      results.push({
        employee: emp,
        manager: emp.managerId ? employeeMap.get(emp.managerId) || null : null,
        totalAssigned: empRequests.length,
        totalCompleted: completedCount,
        latestFeedbackAt,
        feedbackRequests: enrichedRequests,
      });
    }
    
    results.sort((a, b) => {
      if (a.latestFeedbackAt && b.latestFeedbackAt) {
        return b.latestFeedbackAt.getTime() - a.latestFeedbackAt.getTime();
      }
      if (a.latestFeedbackAt) return -1;
      if (b.latestFeedbackAt) return 1;
      return b.totalCompleted - a.totalCompleted;
    });
    
    return results;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [created] = await db.insert(employees).values(employee).returning();
    return created;
  }

  async updateEmployee(id: string, data: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updated] = await db.update(employees).set(data).where(eq(employees.id, id)).returning();
    return updated;
  }

  async getActiveCycle(): Promise<AppraisalCycle | undefined> {
    const [cycle] = await db.select().from(appraisalCycles).where(eq(appraisalCycles.isActive, true));
    return cycle;
  }

  async getAllCycles(): Promise<AppraisalCycle[]> {
    return await db.select().from(appraisalCycles).orderBy(desc(appraisalCycles.year));
  }

  async createCycle(cycle: InsertAppraisalCycle): Promise<AppraisalCycle> {
    const [created] = await db.insert(appraisalCycles).values(cycle).returning();
    return created;
  }

  async updateCycle(id: string, data: Partial<InsertAppraisalCycle>): Promise<AppraisalCycle | undefined> {
    if (data.isActive === true) {
      await db.update(appraisalCycles).set({ isActive: false }).where(eq(appraisalCycles.isActive, true));
    }
    const [updated] = await db.update(appraisalCycles).set(data).where(eq(appraisalCycles.id, id)).returning();
    return updated;
  }

  async getFeedbackRequestById(id: string): Promise<FeedbackRequest | undefined> {
    const [request] = await db.select().from(feedbackRequests).where(eq(feedbackRequests.id, id));
    return request;
  }

  async getFeedbackRequestsByReviewer(reviewerId: string): Promise<(FeedbackRequest & { targetEmployee?: Employee })[]> {
    const requests = await db.select().from(feedbackRequests).where(eq(feedbackRequests.reviewerEmployeeId, reviewerId));
    const targetIds = [...new Set(requests.map(r => r.targetEmployeeId))];
    const targets = targetIds.length > 0 
      ? await db.select().from(employees).where(sql`${employees.id} IN (${sql.join(targetIds.map(id => sql`${id}`), sql`,`)})`)
      : [];
    const targetMap = new Map(targets.map(t => [t.id, t]));
    
    return requests.map(req => ({
      ...req,
      targetEmployee: targetMap.get(req.targetEmployeeId),
    }));
  }

  async getFeedbackRequestsByTarget(targetId: string): Promise<FeedbackRequest[]> {
    return await db.select().from(feedbackRequests).where(eq(feedbackRequests.targetEmployeeId, targetId));
  }

  async getFeedbackRequestsByCycle(cycleId: string): Promise<FeedbackRequest[]> {
    return await db.select().from(feedbackRequests).where(eq(feedbackRequests.appraisalCycleId, cycleId));
  }

  async createFeedbackRequest(request: InsertFeedbackRequest): Promise<FeedbackRequest> {
    const [created] = await db.insert(feedbackRequests).values(request).returning();
    return created;
  }

  async updateFeedbackRequestStatus(id: string, status: "pending" | "submitted"): Promise<void> {
    await db.update(feedbackRequests).set({ status }).where(eq(feedbackRequests.id, id));
  }

  async getPeerFeedbackByTarget(targetId: string, cycleId: string): Promise<(PeerFeedback & { reviewer?: Employee })[]> {
    const feedback = await db.select().from(peerFeedback).where(
      and(eq(peerFeedback.targetEmployeeId, targetId), eq(peerFeedback.appraisalCycleId, cycleId))
    );
    const reviewerIds = [...new Set(feedback.map(f => f.reviewerId))];
    const reviewers = reviewerIds.length > 0
      ? await db.select().from(employees).where(sql`${employees.id} IN (${sql.join(reviewerIds.map(id => sql`${id}`), sql`,`)})`)
      : [];
    const reviewerMap = new Map(reviewers.map(r => [r.id, r]));
    
    return feedback.map(f => ({
      ...f,
      reviewer: reviewerMap.get(f.reviewerId),
    }));
  }

  async createPeerFeedback(feedback: InsertPeerFeedback): Promise<PeerFeedback> {
    const [created] = await db.insert(peerFeedback).values(feedback).returning();
    return created;
  }

  async getManagerReviewsByManager(managerId: string): Promise<(ManagerReview & { employee?: Employee })[]> {
    const reviews = await db.select().from(managerReviews).where(eq(managerReviews.managerId, managerId));
    const employeeIds = [...new Set(reviews.map(r => r.employeeId))];
    const employeesList = employeeIds.length > 0
      ? await db.select().from(employees).where(sql`${employees.id} IN (${sql.join(employeeIds.map(id => sql`${id}`), sql`,`)})`)
      : [];
    const employeeMap = new Map(employeesList.map(e => [e.id, e]));
    
    return reviews.map(r => ({
      ...r,
      employee: employeeMap.get(r.employeeId),
    }));
  }

  async getManagerReviewForEmployee(employeeId: string, cycleId: string): Promise<ManagerReview | undefined> {
    const [review] = await db.select().from(managerReviews).where(
      and(eq(managerReviews.employeeId, employeeId), eq(managerReviews.appraisalCycleId, cycleId))
    );
    return review;
  }

  async createManagerReview(review: InsertManagerReview): Promise<ManagerReview> {
    const [created] = await db.insert(managerReviews).values(review).returning();
    return created;
  }

  async updateManagerReview(id: string, data: Partial<InsertManagerReview>): Promise<ManagerReview | undefined> {
    const [updated] = await db.update(managerReviews).set(data).where(eq(managerReviews.id, id)).returning();
    return updated;
  }

  async getLeadReviewsForEmployee(employeeId: string): Promise<(LeadReview & { appraisalCycle?: AppraisalCycle })[]> {
    const reviews = await db.select().from(leadReviews)
      .where(and(eq(leadReviews.employeeId, employeeId), eq(leadReviews.status, "completed")))
      .orderBy(desc(leadReviews.submittedAt));
    
    const cycleIds = [...new Set(reviews.map(r => r.appraisalCycleId))];
    const cycles = cycleIds.length > 0
      ? await db.select().from(appraisalCycles).where(sql`${appraisalCycles.id} IN (${sql.join(cycleIds.map(id => sql`${id}`), sql`,`)})`)
      : [];
    const cycleMap = new Map(cycles.map(c => [c.id, c]));
    
    return reviews.map(r => ({
      ...r,
      appraisalCycle: cycleMap.get(r.appraisalCycleId),
    }));
  }

  async getLeadReviewForEmployee(employeeId: string, cycleId: string): Promise<LeadReview | undefined> {
    const [review] = await db.select().from(leadReviews).where(
      and(eq(leadReviews.employeeId, employeeId), eq(leadReviews.appraisalCycleId, cycleId))
    );
    return review;
  }

  async createLeadReview(review: InsertLeadReview): Promise<LeadReview> {
    const [created] = await db.insert(leadReviews).values(review).returning();
    return created;
  }

  async updateLeadReview(id: string, data: Partial<InsertLeadReview>): Promise<LeadReview | undefined> {
    const [updated] = await db.update(leadReviews).set(data).where(eq(leadReviews.id, id)).returning();
    return updated;
  }

  async getTeamMembersByManager(managerId: string): Promise<Employee[]> {
    return await db.select().from(employees).where(eq(employees.managerId, managerId));
  }

  async getEmployeesByLead(leadId: string): Promise<Employee[]> {
    return await db.select().from(employees).where(eq(employees.leadId, leadId));
  }

  async getDashboardStats(employeeId: string): Promise<{
    pendingFeedbackCount: number;
    completedFeedbackCount: number;
    myLatestRating: number | null;
  }> {
    const requests = await db.select().from(feedbackRequests).where(eq(feedbackRequests.reviewerEmployeeId, employeeId));
    const pendingFeedbackCount = requests.filter(r => r.status === "pending").length;
    const completedFeedbackCount = requests.filter(r => r.status === "submitted").length;

    const [latestReview] = await db.select().from(leadReviews)
      .where(and(eq(leadReviews.employeeId, employeeId), eq(leadReviews.status, "completed")))
      .orderBy(desc(leadReviews.submittedAt))
      .limit(1);
    
    return {
      pendingFeedbackCount,
      completedFeedbackCount,
      myLatestRating: latestReview?.finalRating || null,
    };
  }

  async getReportStats(): Promise<{
    totalEmployees: number;
    completedFeedback: number;
    pendingFeedback: number;
    completedManagerReviews: number;
    pendingManagerReviews: number;
    completedLeadReviews: number;
    pendingLeadReviews: number;
    averageRating: number | null;
    ratingDistribution: { rating: number; count: number }[];
  }> {
    const allEmployees = await db.select().from(employees);
    const allFeedbackRequests = await db.select().from(feedbackRequests);
    const allManagerReviews = await db.select().from(managerReviews);
    const allLeadReviews = await db.select().from(leadReviews);

    const completedLeadReviewsList = allLeadReviews.filter(r => r.status === "completed");
    const avgRating = completedLeadReviewsList.length > 0
      ? completedLeadReviewsList.reduce((sum, r) => sum + r.finalRating, 0) / completedLeadReviewsList.length
      : null;

    const ratingCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    completedLeadReviewsList.forEach(r => {
      if (ratingCounts[r.finalRating] !== undefined) {
        ratingCounts[r.finalRating]++;
      }
    });

    return {
      totalEmployees: allEmployees.length,
      completedFeedback: allFeedbackRequests.filter(r => r.status === "submitted").length,
      pendingFeedback: allFeedbackRequests.filter(r => r.status === "pending").length,
      completedManagerReviews: allManagerReviews.filter(r => r.status === "completed").length,
      pendingManagerReviews: allManagerReviews.filter(r => r.status !== "completed").length,
      completedLeadReviews: completedLeadReviewsList.length,
      pendingLeadReviews: allLeadReviews.filter(r => r.status !== "completed").length,
      averageRating: avgRating,
      ratingDistribution: Object.entries(ratingCounts).map(([rating, count]) => ({
        rating: parseInt(rating),
        count,
      })),
    };
  }

  async getKnowAboutMe(employeeId: string, cycleId: string): Promise<KnowAboutMe | undefined> {
    const [kam] = await db.select().from(knowAboutMe).where(
      and(eq(knowAboutMe.employeeId, employeeId), eq(knowAboutMe.appraisalCycleId, cycleId))
    );
    return kam;
  }

  async upsertKnowAboutMe(data: InsertKnowAboutMe): Promise<KnowAboutMe> {
    const existing = await this.getKnowAboutMe(data.employeeId, data.appraisalCycleId);
    if (existing) {
      const [updated] = await db.update(knowAboutMe)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(knowAboutMe.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(knowAboutMe).values(data).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
