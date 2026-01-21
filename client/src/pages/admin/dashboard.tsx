import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Search,
  Users,
  Eye,
  Download,
  LogOut,
  BarChart3,
  User,
  Building,
  Briefcase,
  Star,
  MessageSquare,
  ClipboardCheck,
  UserCircle,
  Activity,
  CheckCircle2,
  Clock,
  FileText
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Employee, FeedbackRequest, PeerFeedback, ManagerReview, LeadReview, KnowAboutMe, AppraisalCycle } from "@shared/schema";

interface FeedbackRequestWithReviewer extends FeedbackRequest {
  reviewer?: Employee;
  submitted: boolean;
  submittedAt?: Date | null;
}

interface EmployeeFeedbackStatus {
  employee: Employee;
  manager?: Employee | null;
  totalAssigned: number;
  totalCompleted: number;
  latestFeedbackAt: Date | null;
  feedbackRequests: FeedbackRequestWithReviewer[];
}

interface FeedbackActivityResponse {
  employees: EmployeeFeedbackStatus[];
  cycle: AppraisalCycle | null;
}

interface EmployeeReport {
  employee: Employee;
  manager: Employee | null;
  lead: Employee | null;
  peerFeedback: (PeerFeedback & { reviewer?: Employee })[];
  managerReview: ManagerReview | null;
  leadReview: LeadReview | null;
  kamData: KnowAboutMe | null;
  activeCycle: AppraisalCycle | null;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"activity" | "all">("activity");

  const { data: adminCheck, isLoading: checkingAdmin } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/auth/admin-check"],
  });

  const { data: feedbackActivity, isLoading: loadingActivity } = useQuery<FeedbackActivityResponse>({
    queryKey: ["/api/admin/feedback-activity"],
    enabled: adminCheck?.isAdmin === true && activeView === "activity",
  });

  const { data: allEmployees, isLoading: loadingAllEmployees } = useQuery<(Employee & { manager?: Employee | null; lead?: Employee | null })[]>({
    queryKey: ["/api/admin/employees-full"],
    enabled: adminCheck?.isAdmin === true && activeView === "all",
  });

  const { data: employeeReport, isLoading: loadingReport } = useQuery<EmployeeReport>({
    queryKey: [`/api/admin/employee-report/${selectedEmployeeId}`],
    enabled: !!selectedEmployeeId && adminCheck?.isAdmin === true,
  });

  const selectedEmployeeFeedback = feedbackActivity?.employees.find(e => e.employee.id === selectedEmployeeId);

  useEffect(() => {
    if (!checkingAdmin && adminCheck?.isAdmin !== true) {
      setLocation("/login");
    }
  }, [adminCheck, checkingAdmin, setLocation]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/admin-logout", {});
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReport = () => {
    if (!employeeReport) return;

    const { employee, manager, peerFeedback, managerReview, kamData, activeCycle, leadReview } = employeeReport;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Employee Performance Report", pageWidth / 2, 15, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Cycle: ${activeCycle?.name || "N/A"}`, pageWidth / 2, 28, { align: "center" });

    yPos = 50;
    doc.setTextColor(59, 130, 246);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Employee Details", 14, yPos);
    
    yPos += 5;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(14, yPos, pageWidth - 14, yPos);
    
    yPos += 10;
    autoTable(doc, {
      startY: yPos,
      head: [],
      body: [
        ["Name", employee.name],
        ["Email", employee.email],
        ["Designation", employee.designation || "N/A"],
        ["Department", employee.department || "N/A"],
        ["Role", employee.role.charAt(0).toUpperCase() + employee.role.slice(1)],
        ["Reporting Manager", manager?.name || "N/A"],
      ],
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50, fillColor: [241, 245, 249] },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    if (peerFeedback.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Peer Feedback Received (${peerFeedback.length})`, 14, yPos);
      
      yPos += 5;
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 5;

      const feedbackData = peerFeedback.map((fb) => {
        const avgRating = ((fb.technicalSkills + fb.communication + fb.teamwork + fb.problemSolving + fb.leadership) / 5).toFixed(1);
        return [
          fb.reviewer?.name || "Anonymous",
          `${avgRating}/5`,
          fb.strengths || "N/A",
          fb.areasOfImprovement || "N/A",
          fb.additionalComments || "N/A",
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [["Reviewer", "Rating", "Strengths", "Areas for Improvement", "Comments"]],
        body: feedbackData,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 15, halign: 'center' },
          2: { cellWidth: 45 },
          3: { cellWidth: 45 },
          4: { cellWidth: 45 }
        },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    if (managerReview) {
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Manager Review", 14, yPos);
      
      yPos += 5;
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: [
          ["Performance Rating", `${managerReview.performanceRating}/5`],
          ["Promotion Readiness", managerReview.promotionReadiness],
          ["Goals Achieved", managerReview.goalsAchieved],
          ["Areas of Growth", managerReview.areasOfGrowth],
          ["Overall Comments", managerReview.overallComments || "N/A"],
        ],
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50, fillColor: [241, 245, 249] },
          1: { cellWidth: 'auto' }
        },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    if (leadReview) {
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Lead Final Appraisal", 14, yPos);
      
      yPos += 5;
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: [
          ["Final Rating", `${leadReview.finalRating}/5`],
          ["Promotion Decision", leadReview.promotionDecision || "N/A"],
          ["Increment Percentage", leadReview.incrementPercentage || "N/A"],
          ["Remarks", leadReview.remarks || "N/A"],
        ],
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50, fillColor: [241, 245, 249] },
          1: { cellWidth: 'auto' }
        },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    if (kamData) {
      if (yPos > 180) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Know About Me (Self-Assessment)", 14, yPos);
      
      yPos += 5;
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 5;

      const kamEntries: string[][] = [];
      if (kamData.projectContributions) kamEntries.push(["Project Contributions", kamData.projectContributions]);
      if (kamData.roleAndResponsibilities) kamEntries.push(["Role & Responsibilities", kamData.roleAndResponsibilities]);
      if (kamData.keyAchievements) kamEntries.push(["Key Achievements", kamData.keyAchievements]);
      if (kamData.learnings) kamEntries.push(["Learnings", kamData.learnings]);
      if (kamData.certifications) kamEntries.push(["Certifications", kamData.certifications]);
      if (kamData.technologiesWorkedOn) kamEntries.push(["Technologies", kamData.technologiesWorkedOn]);
      if (kamData.mentorship) kamEntries.push(["Mentorship", kamData.mentorship]);
      if (kamData.leadershipRoles) kamEntries.push(["Leadership Roles", kamData.leadershipRoles]);
      if (kamData.problemsSolved) kamEntries.push(["Problems Solved", kamData.problemsSolved]);
      if (kamData.strengths) kamEntries.push(["Strengths", kamData.strengths]);

      if (kamEntries.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [],
          body: kamEntries,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 4 },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50, fillColor: [241, 245, 249] },
            1: { cellWidth: 'auto' }
          },
          margin: { left: 14, right: 14 },
        });
      }
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`360 Feedback - Confidential | Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    }

    doc.save(`${employee.name.replace(/\s+/g, "_")}_Performance_Report.pdf`);

    toast({
      title: "Report downloaded",
      description: `PDF report for ${employee.name} has been downloaded`,
    });
  };

  const filteredActivityEmployees = feedbackActivity?.employees.filter(emp => 
    emp.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredAllEmployees = allEmployees?.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "No feedback yet";
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (checkingAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!adminCheck?.isAdmin) {
    return null;
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-purple-500 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold">Admin Panel</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeView === "activity"}
                      onClick={() => setActiveView("activity")}
                      data-testid="nav-activity"
                    >
                      <Activity className="h-4 w-4" />
                      <span>Recent Activity</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeView === "all"}
                      onClick={() => setActiveView("all")}
                      data-testid="nav-all-employees"
                    >
                      <Users className="h-4 w-4" />
                      <span>All Employees</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel>Current Cycle</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-2 py-1">
                  <Badge variant="secondary" className="w-full justify-center" data-testid="badge-current-cycle">
                    {feedbackActivity?.cycle?.name || "No active cycle"}
                  </Badge>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel>Quick Stats</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">With Feedback</span>
                    <span className="font-medium" data-testid="stat-with-feedback">{feedbackActivity?.employees.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Completed</span>
                    <span className="font-medium text-green-600" data-testid="stat-total-completed">
                      {feedbackActivity?.employees.reduce((acc, e) => acc + e.totalCompleted, 0) || 0}
                    </span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto border-t p-4">
            <Button variant="outline" size="sm" className="w-full" onClick={handleLogout} data-testid="button-admin-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b h-14 flex items-center justify-between px-4 gap-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-lg font-semibold" data-testid="text-header-title">
                {activeView === "activity" ? "Recent Feedback Activity" : "All Employees"}
              </h1>
              <Badge variant="outline" data-testid="badge-admin">Admin</Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9"
                  data-testid="input-search-employees"
                />
              </div>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {(activeView === "activity" && loadingActivity) || (activeView === "all" && loadingAllEmployees) ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : activeView === "activity" ? (
              filteredActivityEmployees.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2" data-testid="text-empty-state">
                      {searchTerm ? "No matching employees" : "No feedback activity yet"}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm 
                        ? "Try adjusting your search term" 
                        : "Employees with assigned feedback will appear here"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3" data-testid="activity-list">
                  {filteredActivityEmployees.map((item) => (
                    <Card 
                      key={item.employee.id} 
                      className="hover-elevate cursor-pointer transition-shadow"
                      onClick={() => setSelectedEmployeeId(item.employee.id)}
                      data-testid={`employee-card-${item.employee.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold truncate" data-testid={`text-name-${item.employee.id}`}>{item.employee.name}</h3>
                                <Badge variant="outline" className="capitalize text-xs" data-testid={`badge-role-${item.employee.id}`}>
                                  {item.employee.role}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate" data-testid={`text-details-${item.employee.id}`}>
                                {item.employee.designation} • {item.employee.department}
                              </p>
                              {item.manager && (
                                <p className="text-xs text-muted-foreground mt-0.5" data-testid={`reports-to-${item.employee.id}`}>
                                  Reports to: {item.manager.name}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 flex-shrink-0">
                            <div className="text-center min-w-[100px]" data-testid={`progress-${item.employee.id}`}>
                              <div className="flex items-center gap-1 justify-center mb-1">
                                <span className="text-lg font-bold text-green-600" data-testid={`count-completed-${item.employee.id}`}>{item.totalCompleted}</span>
                                <span className="text-muted-foreground">/</span>
                                <span className="text-lg font-medium" data-testid={`count-assigned-${item.employee.id}`}>{item.totalAssigned}</span>
                              </div>
                              <Progress 
                                value={item.totalAssigned > 0 ? (item.totalCompleted / item.totalAssigned) * 100 : 0} 
                                className="h-1.5 w-20"
                              />
                              <p className="text-xs text-muted-foreground mt-1">feedback</p>
                            </div>
                            
                            <div className="text-right min-w-[80px]">
                              <Badge variant={item.latestFeedbackAt ? "default" : "secondary"} className="mb-1" data-testid={`badge-status-${item.employee.id}`}>
                                {item.latestFeedbackAt ? (
                                  <><Clock className="h-3 w-3 mr-1" /> Recent</>
                                ) : (
                                  "Pending"
                                )}
                              </Badge>
                              <p className="text-xs text-muted-foreground" data-testid={`text-time-${item.employee.id}`}>
                                {formatTimeAgo(item.latestFeedbackAt)}
                              </p>
                            </div>
                            
                            <Button size="sm" variant="outline" data-testid={`button-view-${item.employee.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              filteredAllEmployees.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2" data-testid="text-empty-all">
                      {searchTerm ? "No matching employees" : "No employees found"}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm && "Try adjusting your search term"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3" data-testid="all-employees-list">
                  {filteredAllEmployees.map((emp) => (
                    <Card 
                      key={emp.id} 
                      className="hover-elevate cursor-pointer transition-shadow"
                      onClick={() => setSelectedEmployeeId(emp.id)}
                      data-testid={`all-employee-card-${emp.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold truncate" data-testid={`all-text-name-${emp.id}`}>{emp.name}</h3>
                                <Badge variant="outline" className="capitalize text-xs" data-testid={`all-badge-role-${emp.id}`}>
                                  {emp.role}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate" data-testid={`all-text-details-${emp.id}`}>
                                {emp.designation} • {emp.department}
                              </p>
                              {emp.manager && (
                                <p className="text-xs text-muted-foreground mt-0.5" data-testid={`reports-to-${emp.id}`}>
                                  Reports to: {emp.manager.name}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" data-testid={`all-button-view-${emp.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            )}
          </main>
        </div>
      </div>

      <Dialog open={!!selectedEmployeeId} onOpenChange={() => setSelectedEmployeeId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <DialogTitle className="text-xl" data-testid="dialog-title-employee-report">Employee Report</DialogTitle>
              {employeeReport && (
                <Button size="sm" onClick={handleDownloadReport} data-testid="button-download-report">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] pr-4">
            {loadingReport ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : employeeReport ? (
              <div className="space-y-6">
                <Card data-testid="section-employee-details">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Employee Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="report-employee-details">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Name:</span>
                          <span className="font-medium" data-testid="report-name">{employeeReport.employee.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Designation:</span>
                          <span className="font-medium" data-testid="report-designation">{employeeReport.employee.designation || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Department:</span>
                          <span className="font-medium" data-testid="report-department">{employeeReport.employee.department || "N/A"}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize" data-testid="report-role">{employeeReport.employee.role}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Email:</span>
                          <span className="font-medium" data-testid="report-email">{employeeReport.employee.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Reports to:</span>
                          <span className="font-medium" data-testid="report-manager">{employeeReport.manager?.name || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedEmployeeFeedback && (
                  <Card data-testid="section-feedback-status">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-orange-500" />
                        Feedback Assignment Status ({selectedEmployeeFeedback.totalCompleted}/{selectedEmployeeFeedback.totalAssigned})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedEmployeeFeedback.feedbackRequests.map((req) => (
                          <div 
                            key={req.id} 
                            className={`flex items-center justify-between p-3 border rounded-lg ${
                              req.submitted ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
                            }`}
                            data-testid={`reviewer-row-${req.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                req.submitted ? 'bg-green-100 dark:bg-green-900' : 'bg-amber-100 dark:bg-amber-900'
                              }`}>
                                {req.submitted ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                ) : (
                                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium" data-testid={`reviewer-name-${req.id}`}>{req.reviewer?.name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">{req.reviewer?.designation}</p>
                              </div>
                            </div>
                            <Badge variant={req.submitted ? "default" : "secondary"} data-testid={`reviewer-status-${req.id}`}>
                              {req.submitted ? (
                                <>Submitted {req.submittedAt ? formatTimeAgo(req.submittedAt) : ""}</>
                              ) : (
                                "Pending"
                              )}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card data-testid="section-peer-feedback">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                      Peer Feedback Received ({employeeReport.peerFeedback.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {employeeReport.peerFeedback.length === 0 ? (
                      <p className="text-muted-foreground text-sm" data-testid="text-no-peer-feedback">No peer feedback received yet</p>
                    ) : (
                      <div className="space-y-4">
                        {employeeReport.peerFeedback.map((fb) => (
                          <div key={fb.id} className="p-4 border rounded-lg space-y-2" data-testid={`peer-feedback-${fb.id}`}>
                            <div className="flex items-center justify-between">
                              <span className="font-medium" data-testid={`peer-feedback-from-${fb.id}`}>
                                Feedback from: {fb.reviewer?.name || "Anonymous"}
                              </span>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-medium" data-testid={`peer-feedback-rating-${fb.id}`}>
                                  {((fb.technicalSkills + fb.communication + fb.teamwork + fb.problemSolving + fb.leadership) / 5).toFixed(1)}/5
                                </span>
                              </div>
                            </div>
                            <Separator />
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Strengths: </span>
                                <span data-testid={`peer-feedback-strengths-${fb.id}`}>{fb.strengths || "N/A"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Areas for Improvement: </span>
                                <span data-testid={`peer-feedback-improvements-${fb.id}`}>{fb.areasOfImprovement || "N/A"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Comments: </span>
                                <span data-testid={`peer-feedback-comments-${fb.id}`}>{fb.additionalComments || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="section-manager-review">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-green-500" />
                      Manager Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!employeeReport.managerReview ? (
                      <p className="text-muted-foreground text-sm" data-testid="text-no-manager-review">No manager review submitted yet</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 border rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Performance Rating</p>
                            <p className="font-medium" data-testid="mgr-performance-rating">{employeeReport.managerReview.performanceRating}/5</p>
                          </div>
                          <div className="p-3 border rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Promotion Readiness</p>
                            <p className="font-medium" data-testid="mgr-promotion-readiness">{employeeReport.managerReview.promotionReadiness}</p>
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Goals Achieved:</p>
                          <p className="text-sm" data-testid="mgr-goals-achieved">{employeeReport.managerReview.goalsAchieved}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Areas of Growth:</p>
                          <p className="text-sm" data-testid="mgr-areas-growth">{employeeReport.managerReview.areasOfGrowth}</p>
                        </div>
                        {employeeReport.managerReview.overallComments && (
                          <div className="p-3 border rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Manager Comments:</p>
                            <p className="text-sm" data-testid="mgr-comments">{employeeReport.managerReview.overallComments}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="section-lead-appraisal">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      Lead Final Appraisal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!employeeReport.leadReview ? (
                      <p className="text-muted-foreground text-sm" data-testid="text-no-lead-review">No lead appraisal submitted yet</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 border rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Final Rating</p>
                            <p className="font-medium" data-testid="lead-final-rating">{employeeReport.leadReview.finalRating}/5</p>
                          </div>
                          <div className="p-3 border rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Promotion Decision</p>
                            <p className="font-medium" data-testid="lead-promotion-decision">{employeeReport.leadReview.promotionDecision}</p>
                          </div>
                          <div className="p-3 border rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Increment</p>
                            <p className="font-medium" data-testid="lead-increment">{employeeReport.leadReview.incrementPercentage || "N/A"}</p>
                          </div>
                        </div>
                        {employeeReport.leadReview.remarks && (
                          <div className="p-3 border rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Lead Remarks:</p>
                            <p className="text-sm" data-testid="lead-remarks">{employeeReport.leadReview.remarks}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="section-kam">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5 text-purple-500" />
                      Know About Me (Self-Assessment)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!employeeReport.kamData ? (
                      <p className="text-muted-foreground text-sm" data-testid="text-no-kam">No self-assessment submitted yet</p>
                    ) : (
                      <div className="space-y-3 text-sm" data-testid="kam-content">
                        {employeeReport.kamData.projectContributions && (
                          <div>
                            <p className="font-medium text-muted-foreground">Project Contributions:</p>
                            <p className="whitespace-pre-wrap">{employeeReport.kamData.projectContributions}</p>
                          </div>
                        )}
                        {employeeReport.kamData.keyAchievements && (
                          <div>
                            <p className="font-medium text-muted-foreground">Key Achievements:</p>
                            <p className="whitespace-pre-wrap">{employeeReport.kamData.keyAchievements}</p>
                          </div>
                        )}
                        {employeeReport.kamData.learnings && (
                          <div>
                            <p className="font-medium text-muted-foreground">Learnings:</p>
                            <p className="whitespace-pre-wrap">{employeeReport.kamData.learnings}</p>
                          </div>
                        )}
                        {employeeReport.kamData.certifications && (
                          <div>
                            <p className="font-medium text-muted-foreground">Certifications:</p>
                            <p className="whitespace-pre-wrap">{employeeReport.kamData.certifications}</p>
                          </div>
                        )}
                        {employeeReport.kamData.technologiesWorkedOn && (
                          <div>
                            <p className="font-medium text-muted-foreground">Technologies:</p>
                            <p className="whitespace-pre-wrap">{employeeReport.kamData.technologiesWorkedOn}</p>
                          </div>
                        )}
                        {employeeReport.kamData.mentorship && (
                          <div>
                            <p className="font-medium text-muted-foreground">Mentorship:</p>
                            <p className="whitespace-pre-wrap">{employeeReport.kamData.mentorship}</p>
                          </div>
                        )}
                        {employeeReport.kamData.leadershipRoles && (
                          <div>
                            <p className="font-medium text-muted-foreground">Leadership Roles:</p>
                            <p className="whitespace-pre-wrap">{employeeReport.kamData.leadershipRoles}</p>
                          </div>
                        )}
                        {employeeReport.kamData.problemsSolved && (
                          <div>
                            <p className="font-medium text-muted-foreground">Problems Solved:</p>
                            <p className="whitespace-pre-wrap">{employeeReport.kamData.problemsSolved}</p>
                          </div>
                        )}
                        {employeeReport.kamData.strengths && (
                          <div>
                            <p className="font-medium text-muted-foreground">Strengths:</p>
                            <p className="whitespace-pre-wrap">{employeeReport.kamData.strengths}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8" data-testid="text-report-load-error">Failed to load employee report</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
