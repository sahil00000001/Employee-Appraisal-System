import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BarChart3, Users, Send, LogOut, Loader2, CheckCircle2, User, Mail } from "lucide-react";
import type { Employee } from "@shared/schema";

interface FeedbackAssignment {
  id: string;
  targetEmployeeId: string;
  reviewerEmployeeId: string;
  status: string;
  targetEmployee?: Employee;
  reviewerEmployee?: Employee;
}

export default function AssignFeedback() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);

  // Check manager authentication status
  const { data: authStatus, isLoading: authLoading, isError: authError } = useQuery<{ authenticated: boolean }>({
    queryKey: ["/api/auth/manager-status"],
    retry: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && (authError || !authStatus?.authenticated)) {
      setLocation("/login");
    }
  }, [authLoading, authError, authStatus, setLocation]);

  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ["/api/manager/all-employees"],
    enabled: !!authStatus?.authenticated,
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<FeedbackAssignment[]>({
    queryKey: ["/api/manager/feedback-assignments"],
    enabled: !!authStatus?.authenticated,
  });

  const assignMutation = useMutation({
    mutationFn: async (data: { targetEmployeeId: string; reviewerEmployeeIds: string[] }) => {
      return await apiRequest("POST", "/api/manager/assign-feedback", data);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Feedback assigned",
        description: data.message || "Reviewers have been notified via email",
      });
      setSelectedTarget("");
      setSelectedReviewers([]);
      queryClient.invalidateQueries({ queryKey: ["/api/manager/feedback-assignments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment failed",
        description: error.message || "Failed to assign feedback",
        variant: "destructive",
      });
    },
  });

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!authStatus?.authenticated) {
    return null;
  }

  const handleLogout = () => {
    window.location.href = "/api/auth/manager-logout";
  };

  const handleReviewerToggle = (reviewerId: string) => {
    setSelectedReviewers(prev =>
      prev.includes(reviewerId)
        ? prev.filter(id => id !== reviewerId)
        : [...prev, reviewerId]
    );
  };

  const handleAssign = () => {
    if (!selectedTarget) {
      toast({
        title: "Select employee",
        description: "Please select an employee to receive feedback",
        variant: "destructive",
      });
      return;
    }

    if (selectedReviewers.length === 0) {
      toast({
        title: "Select reviewers",
        description: "Please select at least one reviewer",
        variant: "destructive",
      });
      return;
    }

    assignMutation.mutate({
      targetEmployeeId: selectedTarget,
      reviewerEmployeeIds: selectedReviewers,
    });
  };

  const availableReviewers = employees.filter(e => e.id !== selectedTarget);
  const targetEmployee = employees.find(e => e.id === selectedTarget);

  const groupedAssignments = assignments.reduce((acc, assignment) => {
    const targetId = assignment.targetEmployeeId;
    if (!acc[targetId]) {
      acc[targetId] = {
        target: assignment.targetEmployee,
        reviewers: [],
      };
    }
    acc[targetId].reviewers.push({
      reviewer: assignment.reviewerEmployee,
      status: assignment.status,
    });
    return acc;
  }, {} as Record<string, { target?: Employee; reviewers: { reviewer?: Employee; status: string }[] }>);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <a href="/" className="flex items-center gap-2 hover-elevate rounded-md p-1">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">360 Feedback</span>
              <Badge variant="secondary" className="ml-2">Manager</Badge>
            </a>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-24 px-4 pb-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Assign Peer Feedback</h1>
            <p className="text-muted-foreground">
              Select an employee and assign reviewers who will provide feedback about them
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Create Assignment
                </CardTitle>
                <CardDescription>
                  Select an employee to receive feedback, then choose who will review them
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Employee to receive feedback</Label>
                  <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                    <SelectTrigger data-testid="select-target-employee">
                      <SelectValue placeholder="Select an employee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{employee.name}</span>
                            <span className="text-muted-foreground text-sm">- {employee.department}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTarget && (
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-3 block">Select reviewers for {targetEmployee?.name}</Label>
                      <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
                        {availableReviewers.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            No other employees available
                          </div>
                        ) : (
                          availableReviewers.map((reviewer) => (
                            <label
                              key={reviewer.id}
                              className="flex items-center gap-3 p-3 hover-elevate cursor-pointer"
                            >
                              <Checkbox
                                checked={selectedReviewers.includes(reviewer.id)}
                                onCheckedChange={() => handleReviewerToggle(reviewer.id)}
                                data-testid={`checkbox-reviewer-${reviewer.id}`}
                              />
                              <div className="flex-1">
                                <div className="font-medium">{reviewer.name}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <span>{reviewer.department}</span>
                                  {reviewer.projectName && (
                                    <>
                                      <span>•</span>
                                      <span>{reviewer.projectName}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {reviewer.role}
                              </Badge>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    {selectedReviewers.length > 0 && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm font-medium mb-2">
                          Selected {selectedReviewers.length} reviewer(s):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedReviewers.map((id) => {
                            const reviewer = employees.find(e => e.id === id);
                            return (
                              <Badge key={id} variant="secondary">
                                {reviewer?.name}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full gap-2"
                      onClick={handleAssign}
                      disabled={assignMutation.isPending || selectedReviewers.length === 0}
                      data-testid="button-assign-feedback"
                    >
                      {assignMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Assign Feedback & Send Emails
                    </Button>
                  </div>
                )}

                {!selectedTarget && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an employee above to start assigning reviewers</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Current Assignments
                </CardTitle>
                <CardDescription>
                  View all active feedback assignments for this cycle
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignmentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : Object.keys(groupedAssignments).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No feedback assignments yet</p>
                    <p className="text-sm">Create your first assignment to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {Object.entries(groupedAssignments).map(([targetId, { target, reviewers }]) => (
                      <div key={targetId} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{target?.name || "Unknown"}</div>
                            <div className="text-xs text-muted-foreground">{target?.department}</div>
                          </div>
                        </div>
                        <div className="pl-10 space-y-2">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Reviewers:</p>
                          <div className="space-y-1">
                            {reviewers.map((r, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span>{r.reviewer?.name || "Unknown"}</span>
                                <Badge 
                                  variant={r.status === "submitted" ? "default" : "outline"}
                                  className="text-xs"
                                >
                                  {r.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        360 Feedback Manager Portal © 2025
      </footer>
    </div>
  );
}
