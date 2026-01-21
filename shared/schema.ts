import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const roleEnum = pgEnum("role", ["employee", "manager", "lead"]);
export const feedbackStatusEnum = pgEnum("feedback_status", ["pending", "submitted"]);
export const reviewStatusEnum = pgEnum("review_status", ["pending", "in_progress", "completed"]);

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull().default("employee"),
  designation: text("designation"),
  department: text("department").notNull(),
  projectName: text("project_name"),
  managerId: varchar("manager_id"),
  leadId: varchar("lead_id"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const employeesRelations = relations(employees, ({ one, many }) => ({
  manager: one(employees, {
    fields: [employees.managerId],
    references: [employees.id],
    relationName: "managerRelation"
  }),
  lead: one(employees, {
    fields: [employees.leadId],
    references: [employees.id],
    relationName: "leadRelation"
  }),
  subordinates: many(employees, { relationName: "managerRelation" }),
  feedbackRequestsReceived: many(feedbackRequests, { relationName: "targetEmployee" }),
  feedbackRequestsAssigned: many(feedbackRequests, { relationName: "reviewerEmployee" }),
  peerFeedbackGiven: many(peerFeedback, { relationName: "reviewerFeedback" }),
  peerFeedbackReceived: many(peerFeedback, { relationName: "targetFeedback" }),
  managerReviewsGiven: many(managerReviews, { relationName: "managerReviewer" }),
  managerReviewsReceived: many(managerReviews, { relationName: "reviewedEmployee" }),
  leadReviewsGiven: many(leadReviews, { relationName: "leadReviewer" }),
  leadReviewsReceived: many(leadReviews, { relationName: "leadReviewedEmployee" }),
}));

export const feedbackRequests = pgTable("feedback_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  targetEmployeeId: varchar("target_employee_id").notNull(),
  reviewerEmployeeId: varchar("reviewer_employee_id").notNull(),
  appraisalCycleId: varchar("appraisal_cycle_id").notNull(),
  status: feedbackStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedbackRequestsRelations = relations(feedbackRequests, ({ one }) => ({
  targetEmployee: one(employees, {
    fields: [feedbackRequests.targetEmployeeId],
    references: [employees.id],
    relationName: "targetEmployee"
  }),
  reviewerEmployee: one(employees, {
    fields: [feedbackRequests.reviewerEmployeeId],
    references: [employees.id],
    relationName: "reviewerEmployee"
  }),
  appraisalCycle: one(appraisalCycles, {
    fields: [feedbackRequests.appraisalCycleId],
    references: [appraisalCycles.id]
  }),
}));

export const peerFeedback = pgTable("peer_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  feedbackRequestId: varchar("feedback_request_id").notNull(),
  reviewerId: varchar("reviewer_id").notNull(),
  targetEmployeeId: varchar("target_employee_id").notNull(),
  appraisalCycleId: varchar("appraisal_cycle_id").notNull(),
  technicalSkills: integer("technical_skills").notNull(),
  communication: integer("communication").notNull(),
  teamwork: integer("teamwork").notNull(),
  problemSolving: integer("problem_solving").notNull(),
  leadership: integer("leadership").notNull(),
  strengths: text("strengths").notNull(),
  areasOfImprovement: text("areas_of_improvement").notNull(),
  additionalComments: text("additional_comments"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const peerFeedbackRelations = relations(peerFeedback, ({ one }) => ({
  reviewer: one(employees, {
    fields: [peerFeedback.reviewerId],
    references: [employees.id],
    relationName: "reviewerFeedback"
  }),
  targetEmployee: one(employees, {
    fields: [peerFeedback.targetEmployeeId],
    references: [employees.id],
    relationName: "targetFeedback"
  }),
  feedbackRequest: one(feedbackRequests, {
    fields: [peerFeedback.feedbackRequestId],
    references: [feedbackRequests.id]
  }),
  appraisalCycle: one(appraisalCycles, {
    fields: [peerFeedback.appraisalCycleId],
    references: [appraisalCycles.id]
  }),
}));

export const managerReviews = pgTable("manager_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  managerId: varchar("manager_id").notNull(),
  employeeId: varchar("employee_id").notNull(),
  appraisalCycleId: varchar("appraisal_cycle_id").notNull(),
  performanceRating: integer("performance_rating").notNull(),
  goalsAchieved: text("goals_achieved").notNull(),
  areasOfGrowth: text("areas_of_growth").notNull(),
  trainingNeeds: text("training_needs"),
  promotionReadiness: text("promotion_readiness").notNull(),
  overallComments: text("overall_comments").notNull(),
  status: reviewStatusEnum("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const managerReviewsRelations = relations(managerReviews, ({ one }) => ({
  manager: one(employees, {
    fields: [managerReviews.managerId],
    references: [employees.id],
    relationName: "managerReviewer"
  }),
  employee: one(employees, {
    fields: [managerReviews.employeeId],
    references: [employees.id],
    relationName: "reviewedEmployee"
  }),
  appraisalCycle: one(appraisalCycles, {
    fields: [managerReviews.appraisalCycleId],
    references: [appraisalCycles.id]
  }),
}));

export const leadReviews = pgTable("lead_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull(),
  employeeId: varchar("employee_id").notNull(),
  appraisalCycleId: varchar("appraisal_cycle_id").notNull(),
  finalRating: integer("final_rating").notNull(),
  incrementPercentage: text("increment_percentage"),
  promotionDecision: text("promotion_decision").notNull(),
  remarks: text("remarks").notNull(),
  status: reviewStatusEnum("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leadReviewsRelations = relations(leadReviews, ({ one }) => ({
  lead: one(employees, {
    fields: [leadReviews.leadId],
    references: [employees.id],
    relationName: "leadReviewer"
  }),
  employee: one(employees, {
    fields: [leadReviews.employeeId],
    references: [employees.id],
    relationName: "leadReviewedEmployee"
  }),
  appraisalCycle: one(appraisalCycles, {
    fields: [leadReviews.appraisalCycleId],
    references: [appraisalCycles.id]
  }),
}));

export const appraisalCycles = pgTable("appraisal_cycles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  year: integer("year").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appraisalCyclesRelations = relations(appraisalCycles, ({ many }) => ({
  feedbackRequests: many(feedbackRequests),
  peerFeedback: many(peerFeedback),
  managerReviews: many(managerReviews),
  leadReviews: many(leadReviews),
}));

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackRequestSchema = createInsertSchema(feedbackRequests).omit({
  id: true,
  createdAt: true,
});

export const insertPeerFeedbackSchema = createInsertSchema(peerFeedback).omit({
  id: true,
  submittedAt: true,
}).extend({
  technicalSkills: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  teamwork: z.number().min(1).max(5),
  problemSolving: z.number().min(1).max(5),
  leadership: z.number().min(1).max(5),
  strengths: z.string().min(10),
  areasOfImprovement: z.string().min(10),
});

export const insertManagerReviewSchema = createInsertSchema(managerReviews).omit({
  id: true,
  submittedAt: true,
  createdAt: true,
}).extend({
  performanceRating: z.number().min(1).max(5),
  goalsAchieved: z.string().min(10),
  areasOfGrowth: z.string().min(10),
  promotionReadiness: z.string().min(1),
  overallComments: z.string().min(10),
});

export const insertLeadReviewSchema = createInsertSchema(leadReviews).omit({
  id: true,
  submittedAt: true,
  createdAt: true,
}).extend({
  finalRating: z.number().min(1).max(5),
  promotionDecision: z.string().min(1),
  remarks: z.string().min(10),
});

export const insertAppraisalCycleSchema = createInsertSchema(appraisalCycles).omit({
  id: true,
  createdAt: true,
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type FeedbackRequest = typeof feedbackRequests.$inferSelect;
export type InsertFeedbackRequest = z.infer<typeof insertFeedbackRequestSchema>;
export type PeerFeedback = typeof peerFeedback.$inferSelect;
export type InsertPeerFeedback = z.infer<typeof insertPeerFeedbackSchema>;
export type ManagerReview = typeof managerReviews.$inferSelect;
export type InsertManagerReview = z.infer<typeof insertManagerReviewSchema>;
export type LeadReview = typeof leadReviews.$inferSelect;
export type InsertLeadReview = z.infer<typeof insertLeadReviewSchema>;
export type AppraisalCycle = typeof appraisalCycles.$inferSelect;
export type InsertAppraisalCycle = z.infer<typeof insertAppraisalCycleSchema>;
