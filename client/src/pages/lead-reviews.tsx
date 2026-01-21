import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  FileText, 
  CheckCircle2, 
  Star,
  Clock,
  Building2,
  User,
  TrendingUp,
  MessageSquare,
  Download
} from "lucide-react";
import type { Employee, ManagerReview, LeadReview, PeerFeedback, InsertLeadReview } from "@shared/schema";

interface AppraisalData {
  employee: Employee;
  managerReview?: ManagerReview & { manager?: Employee };
  peerFeedback: (PeerFeedback & { reviewer?: Employee })[];
  leadReview?: LeadReview;
}

export default function LeadReviews() {
  const [selectedEmployee, setSelectedEmployee] = useState<AppraisalData | null>(null);
  const [reviewForm, setReviewForm] = useState({
    finalRating: 3,
    incrementPercentage: "",
    promotionDecision: "",
    remarks: "",
  });
  const { toast } = useToast();

  const { data: appraisals, isLoading } = useQuery<AppraisalData[]>({
    queryKey: ["/api/lead/appraisals"],
  });

  const submitReview = useMutation({
    mutationFn: async (data: Omit<InsertLeadReview, "leadId">) => {
      return await apiRequest("POST", "/api/lead-reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead/appraisals"] });
      setSelectedEmployee(null);
      setReviewForm({
        finalRating: 3,
        incrementPercentage: "",
        promotionDecision: "",
        remarks: "",
      });
      toast({
        title: "Final review submitted",
        description: "The employee's appraisal has been completed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const pendingAppraisals = appraisals?.filter(a => !a.leadReview || a.leadReview.status !== "completed") || [];
  const completedAppraisals = appraisals?.filter(a => a.leadReview?.status === "completed") || [];

  const handleSubmit = () => {
    if (!selectedEmployee) return;
    
    if (reviewForm.remarks.length < 10 || !reviewForm.promotionDecision) {
      toast({
        title: "Validation error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    submitReview.mutate({
      employeeId: selectedEmployee.employee.id,
      appraisalCycleId: "active",
      ...reviewForm,
      incrementPercentage: reviewForm.incrementPercentage || null,
      status: "completed",
    });
  };

  const openReviewDialog = (appraisal: AppraisalData) => {
    setSelectedEmployee(appraisal);
    if (appraisal.leadReview) {
      setReviewForm({
        finalRating: appraisal.leadReview.finalRating,
        incrementPercentage: appraisal.leadReview.incrementPercentage || "",
        promotionDecision: appraisal.leadReview.promotionDecision,
        remarks: appraisal.leadReview.remarks,
      });
    }
  };

  const RatingSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className={`p-2 rounded-md transition-colors ${
            rating <= value 
              ? "text-yellow-500" 
              : "text-muted-foreground hover:text-yellow-400"
          }`}
          data-testid={`rating-final-${rating}`}
        >
          <Star className={`h-6 w-6 ${rating <= value ? "fill-current" : ""}`} />
        </button>
      ))}
      <span className="ml-3 text-lg font-medium self-center">{value}/5</span>
    </div>
  );

  const calculateAveragePeerRating = (feedback: PeerFeedback[]) => {
    if (feedback.length === 0) return null;
    const total = feedback.reduce((sum, f) => {
      return sum + (f.technicalSkills + f.communication + f.teamwork + f.problemSolving + f.leadership) / 5;
    }, 0);
    return (total / feedback.length).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-lead-reviews-title">
          Final Appraisals
        </h1>
        <p className="text-muted-foreground">
          Review all feedback and provide final ratings and decisions
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2" data-testid="tab-pending-appraisals">
            <Clock className="h-4 w-4" />
            Pending
            {pendingAppraisals.length > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingAppraisals.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2" data-testid="tab-completed-appraisals">
            <CheckCircle2 className="h-4 w-4" />
            Completed
            <Badge variant="outline" className="ml-1">{completedAppraisals.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-14 w-14 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-72" />
                      </div>
                      <Skeleton className="h-9 w-36" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingAppraisals.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-70" />
                <h3 className="text-lg font-medium mb-2">All appraisals completed!</h3>
                <p className="text-muted-foreground">
                  All employees have received their final ratings
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingAppraisals.map((appraisal) => (
              <Card key={appraisal.employee.id} data-testid={`appraisal-${appraisal.employee.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={appraisal.employee.profileImage || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {appraisal.employee.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{appraisal.employee.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {appraisal.employee.department}
                        </span>
                        {appraisal.employee.projectName && (
                          <span>• {appraisal.employee.projectName}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {appraisal.managerReview?.status === "completed" && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                            <User className="h-3 w-3 mr-1" />
                            Manager reviewed
                          </Badge>
                        )}
                        {appraisal.peerFeedback.length > 0 && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950 dark:border-purple-800">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {appraisal.peerFeedback.length} peer feedback
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={() => openReviewDialog(appraisal)}
                      data-testid={`button-finalize-${appraisal.employee.id}`}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Finalize Appraisal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedAppraisals.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No completed appraisals yet</h3>
                <p className="text-muted-foreground">
                  Finalized appraisals will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            completedAppraisals.map((appraisal) => (
              <Card key={appraisal.employee.id} data-testid={`completed-appraisal-${appraisal.employee.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={appraisal.employee.profileImage || ""} />
                      <AvatarFallback className="bg-green-500/10 text-green-600 text-lg">
                        {appraisal.employee.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{appraisal.employee.name}</h3>
                      <p className="text-sm text-muted-foreground">{appraisal.employee.department}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {appraisal.leadReview?.promotionDecision}
                        {appraisal.leadReview?.incrementPercentage && (
                          <span> • {appraisal.leadReview.incrementPercentage} increment</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-1 justify-end mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-5 w-5 ${
                              star <= (appraisal.leadReview?.finalRating || 0)
                                ? "text-yellow-500 fill-yellow-500" 
                                : "text-muted-foreground/30"
                            }`} 
                          />
                        ))}
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Finalized
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedEmployee?.employee.profileImage || ""} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedEmployee?.employee.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              Final Appraisal: {selectedEmployee?.employee.name}
            </DialogTitle>
            <DialogDescription>
              Review all feedback and provide the final rating and decisions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {selectedEmployee?.managerReview && (
              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Manager Review
                  </CardTitle>
                  <CardDescription>
                    By {selectedEmployee.managerReview.manager?.name || "Manager"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rating:</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-4 w-4 ${
                            star <= selectedEmployee.managerReview!.performanceRating
                              ? "text-yellow-500 fill-yellow-500" 
                              : "text-muted-foreground/30"
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {selectedEmployee.managerReview.performanceRating}/5
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Goals Achieved:</p>
                    <p className="text-sm text-muted-foreground">{selectedEmployee.managerReview.goalsAchieved}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Growth Areas:</p>
                    <p className="text-sm text-muted-foreground">{selectedEmployee.managerReview.areasOfGrowth}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Promotion Readiness:</p>
                    <Badge variant="secondary">{selectedEmployee.managerReview.promotionReadiness.replace(/_/g, " ")}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedEmployee?.peerFeedback && selectedEmployee.peerFeedback.length > 0 && (
              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    Peer Feedback Summary
                  </CardTitle>
                  <CardDescription>
                    Average Rating: {calculateAveragePeerRating(selectedEmployee.peerFeedback)}/5 from {selectedEmployee.peerFeedback.length} peers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedEmployee.peerFeedback.map((feedback, idx) => (
                      <div key={feedback.id} className="p-3 bg-background rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Reviewer {idx + 1}</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const avg = (feedback.technicalSkills + feedback.communication + feedback.teamwork + feedback.problemSolving + feedback.leadership) / 5;
                              return (
                                <Star 
                                  key={star} 
                                  className={`h-3 w-3 ${
                                    star <= Math.round(avg)
                                      ? "text-yellow-500 fill-yellow-500" 
                                      : "text-muted-foreground/30"
                                  }`} 
                                />
                              );
                            })}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Strengths:</strong> {feedback.strengths}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Improvements:</strong> {feedback.areasOfImprovement}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium text-lg">Your Final Decision</h4>
              
              <div className="space-y-3">
                <Label className="text-base font-medium">Final Rating</Label>
                <RatingSelector 
                  value={reviewForm.finalRating} 
                  onChange={(v) => setReviewForm(f => ({ ...f, finalRating: v }))} 
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="promotionDecision">Promotion Decision *</Label>
                  <Select 
                    value={reviewForm.promotionDecision} 
                    onValueChange={(v) => setReviewForm(f => ({ ...f, promotionDecision: v }))}
                  >
                    <SelectTrigger data-testid="select-promotion-decision">
                      <SelectValue placeholder="Select decision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Promoted">Promoted</SelectItem>
                      <SelectItem value="Eligible for Promotion">Eligible for Promotion</SelectItem>
                      <SelectItem value="On Track">On Track</SelectItem>
                      <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                      <SelectItem value="No Change">No Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incrementPercentage">Increment Percentage</Label>
                  <Input
                    id="incrementPercentage"
                    placeholder="e.g., 10%"
                    value={reviewForm.incrementPercentage}
                    onChange={(e) => setReviewForm(f => ({ ...f, incrementPercentage: e.target.value }))}
                    data-testid="input-increment-percentage"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks for Employee *</Label>
                <Textarea
                  id="remarks"
                  placeholder="Provide feedback and remarks that will be visible to the employee..."
                  value={reviewForm.remarks}
                  onChange={(e) => setReviewForm(f => ({ ...f, remarks: e.target.value }))}
                  className="min-h-32"
                  data-testid="textarea-remarks"
                />
                <p className="text-xs text-muted-foreground">
                  This will be visible to the employee along with their final rating.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedEmployee(null)}
                data-testid="button-cancel-final"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitReview.isPending}
                data-testid="button-submit-final"
              >
                {submitReview.isPending ? "Submitting..." : "Submit Final Appraisal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
