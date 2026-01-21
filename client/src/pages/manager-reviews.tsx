import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  ClipboardCheck, 
  CheckCircle2, 
  Star,
  Clock,
  Building2,
  Users
} from "lucide-react";
import type { Employee, ManagerReview, InsertManagerReview } from "@shared/schema";

interface TeamMemberData {
  employee: Employee;
  review?: ManagerReview;
  hasPeerFeedback: boolean;
}

export default function ManagerReviews() {
  const [selectedMember, setSelectedMember] = useState<TeamMemberData | null>(null);
  const [reviewForm, setReviewForm] = useState({
    performanceRating: 3,
    goalsAchieved: "",
    areasOfGrowth: "",
    trainingNeeds: "",
    promotionReadiness: "",
    overallComments: "",
  });
  const { toast } = useToast();

  const { data: teamMembers, isLoading } = useQuery<TeamMemberData[]>({
    queryKey: ["/api/manager/team-members"],
  });

  const submitReview = useMutation({
    mutationFn: async (data: Omit<InsertManagerReview, "managerId">) => {
      return await apiRequest("POST", "/api/manager-reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manager/team-members"] });
      setSelectedMember(null);
      setReviewForm({
        performanceRating: 3,
        goalsAchieved: "",
        areasOfGrowth: "",
        trainingNeeds: "",
        promotionReadiness: "",
        overallComments: "",
      });
      toast({
        title: "Review submitted",
        description: "Your team member review has been submitted successfully.",
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

  const pendingMembers = teamMembers?.filter(m => !m.review || m.review.status !== "completed") || [];
  const reviewedMembers = teamMembers?.filter(m => m.review?.status === "completed") || [];

  const handleSubmit = () => {
    if (!selectedMember) return;
    
    if (reviewForm.goalsAchieved.length < 10 || reviewForm.areasOfGrowth.length < 10 || 
        reviewForm.overallComments.length < 10 || !reviewForm.promotionReadiness) {
      toast({
        title: "Validation error",
        description: "Please fill all required fields with at least 10 characters.",
        variant: "destructive",
      });
      return;
    }

    submitReview.mutate({
      employeeId: selectedMember.employee.id,
      appraisalCycleId: "active",
      ...reviewForm,
      status: "completed",
    });
  };

  const openReviewDialog = (member: TeamMemberData) => {
    setSelectedMember(member);
    if (member.review) {
      setReviewForm({
        performanceRating: member.review.performanceRating,
        goalsAchieved: member.review.goalsAchieved,
        areasOfGrowth: member.review.areasOfGrowth,
        trainingNeeds: member.review.trainingNeeds || "",
        promotionReadiness: member.review.promotionReadiness,
        overallComments: member.review.overallComments,
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
          data-testid={`rating-performance-${rating}`}
        >
          <Star className={`h-6 w-6 ${rating <= value ? "fill-current" : ""}`} />
        </button>
      ))}
      <span className="ml-3 text-lg font-medium self-center">{value}/5</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-manager-reviews-title">
          Team Reviews
        </h1>
        <p className="text-muted-foreground">
          Review and evaluate your team members' performance
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2" data-testid="tab-pending-reviews">
            <Clock className="h-4 w-4" />
            Pending
            {pendingMembers.length > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingMembers.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="gap-2" data-testid="tab-reviewed">
            <CheckCircle2 className="h-4 w-4" />
            Reviewed
            <Badge variant="outline" className="ml-1">{reviewedMembers.length}</Badge>
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
                        <Skeleton className="h-4 w-60" />
                      </div>
                      <Skeleton className="h-9 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingMembers.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-70" />
                <h3 className="text-lg font-medium mb-2">All reviews completed!</h3>
                <p className="text-muted-foreground">
                  You have reviewed all your team members
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingMembers.map((member) => (
              <Card key={member.employee.id} data-testid={`team-member-${member.employee.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={member.employee.profileImage || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {member.employee.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{member.employee.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {member.employee.department}
                        </span>
                        {member.employee.projectName && (
                          <span>• {member.employee.projectName}</span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {member.hasPeerFeedback && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            Peer feedback available
                          </Badge>
                        )}
                        {member.review?.status === "in_progress" && (
                          <Badge variant="secondary" className="text-xs">
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={() => openReviewDialog(member)}
                      data-testid={`button-review-${member.employee.id}`}
                    >
                      <ClipboardCheck className="h-4 w-4 mr-2" />
                      {member.review ? "Continue Review" : "Start Review"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedMembers.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No reviews completed yet</h3>
                <p className="text-muted-foreground">
                  Reviews you complete will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            reviewedMembers.map((member) => (
              <Card key={member.employee.id} data-testid={`reviewed-member-${member.employee.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={member.employee.profileImage || ""} />
                      <AvatarFallback className="bg-green-500/10 text-green-600 text-lg">
                        {member.employee.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{member.employee.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.employee.department}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-1 justify-end mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${
                              star <= (member.review?.performanceRating || 0)
                                ? "text-yellow-500 fill-yellow-500" 
                                : "text-muted-foreground/30"
                            }`} 
                          />
                        ))}
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Reviewed
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedMember?.employee.profileImage || ""} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedMember?.employee.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              Review: {selectedMember?.employee.name}
            </DialogTitle>
            <DialogDescription>
              Evaluate this team member's performance, goals, and growth areas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">Overall Performance Rating</Label>
              <RatingSelector 
                value={reviewForm.performanceRating} 
                onChange={(v) => setReviewForm(f => ({ ...f, performanceRating: v }))} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalsAchieved">Goals Achieved *</Label>
              <Textarea
                id="goalsAchieved"
                placeholder="Describe the goals achieved by this employee during the review period..."
                value={reviewForm.goalsAchieved}
                onChange={(e) => setReviewForm(f => ({ ...f, goalsAchieved: e.target.value }))}
                className="min-h-24"
                data-testid="textarea-goals-achieved"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="areasOfGrowth">Areas of Growth *</Label>
              <Textarea
                id="areasOfGrowth"
                placeholder="What areas has this employee shown growth in?"
                value={reviewForm.areasOfGrowth}
                onChange={(e) => setReviewForm(f => ({ ...f, areasOfGrowth: e.target.value }))}
                className="min-h-24"
                data-testid="textarea-areas-of-growth"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainingNeeds">Training Needs</Label>
              <Textarea
                id="trainingNeeds"
                placeholder="Any training or development recommendations (optional)"
                value={reviewForm.trainingNeeds}
                onChange={(e) => setReviewForm(f => ({ ...f, trainingNeeds: e.target.value }))}
                className="min-h-20"
                data-testid="textarea-training-needs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promotionReadiness">Promotion Readiness *</Label>
              <Select 
                value={reviewForm.promotionReadiness} 
                onValueChange={(v) => setReviewForm(f => ({ ...f, promotionReadiness: v }))}
              >
                <SelectTrigger data-testid="select-promotion-readiness">
                  <SelectValue placeholder="Select readiness level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ready_now">Ready Now</SelectItem>
                  <SelectItem value="ready_6_months">Ready in 6 Months</SelectItem>
                  <SelectItem value="ready_1_year">Ready in 1 Year</SelectItem>
                  <SelectItem value="needs_development">Needs Further Development</SelectItem>
                  <SelectItem value="not_applicable">Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="overallComments">Overall Comments *</Label>
              <Textarea
                id="overallComments"
                placeholder="Provide your overall assessment and any additional comments..."
                value={reviewForm.overallComments}
                onChange={(e) => setReviewForm(f => ({ ...f, overallComments: e.target.value }))}
                className="min-h-28"
                data-testid="textarea-overall-comments"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedMember(null)}
                data-testid="button-cancel-review"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitReview.isPending}
                data-testid="button-submit-review"
              >
                {submitReview.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
