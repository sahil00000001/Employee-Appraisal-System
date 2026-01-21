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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  ClipboardList, 
  CheckCircle2, 
  Star,
  Clock,
  Building2,
  FolderKanban
} from "lucide-react";
import type { Employee, FeedbackRequest, InsertPeerFeedback } from "@shared/schema";

interface FeedbackRequestWithTarget extends FeedbackRequest {
  targetEmployee?: Employee;
}

export default function FeedbackTasks() {
  const [selectedRequest, setSelectedRequest] = useState<FeedbackRequestWithTarget | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    technicalSkills: 3,
    communication: 3,
    teamwork: 3,
    problemSolving: 3,
    leadership: 3,
    strengths: "",
    areasOfImprovement: "",
    additionalComments: "",
  });
  const { toast } = useToast();

  const { data: requests, isLoading } = useQuery<FeedbackRequestWithTarget[]>({
    queryKey: ["/api/feedback-requests/my-tasks"],
  });

  const submitFeedback = useMutation({
    mutationFn: async (data: Omit<InsertPeerFeedback, "reviewerId">) => {
      return await apiRequest("POST", "/api/peer-feedback", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback-requests/my-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setSelectedRequest(null);
      setFeedbackForm({
        technicalSkills: 3,
        communication: 3,
        teamwork: 3,
        problemSolving: 3,
        leadership: 3,
        strengths: "",
        areasOfImprovement: "",
        additionalComments: "",
      });
      toast({
        title: "Feedback submitted",
        description: "Your peer feedback has been submitted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const pendingRequests = requests?.filter(r => r.status === "pending") || [];
  const completedRequests = requests?.filter(r => r.status === "submitted") || [];

  const handleSubmit = () => {
    if (!selectedRequest) return;
    
    if (feedbackForm.strengths.length < 10 || feedbackForm.areasOfImprovement.length < 10) {
      toast({
        title: "Validation error",
        description: "Please provide at least 10 characters for strengths and areas of improvement.",
        variant: "destructive",
      });
      return;
    }

    submitFeedback.mutate({
      feedbackRequestId: selectedRequest.id,
      targetEmployeeId: selectedRequest.targetEmployeeId,
      appraisalCycleId: selectedRequest.appraisalCycleId,
      ...feedbackForm,
    });
  };

  const RatingSelector = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
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
            data-testid={`rating-${label.toLowerCase().replace(/\s+/g, "-")}-${rating}`}
          >
            <Star className={`h-5 w-5 ${rating <= value ? "fill-current" : ""}`} />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground self-center">{value}/5</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-feedback-tasks-title">
          Feedback Tasks
        </h1>
        <p className="text-muted-foreground">
          Peer feedback requests assigned to you
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2" data-testid="tab-pending">
            <Clock className="h-4 w-4" />
            Pending
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2" data-testid="tab-completed">
            <CheckCircle2 className="h-4 w-4" />
            Completed
            <Badge variant="outline" className="ml-1">{completedRequests.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-70" />
                <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                <p className="text-muted-foreground">
                  You have no pending feedback tasks
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id} data-testid={`pending-request-${request.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.targetEmployee?.profileImage || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {request.targetEmployee?.name?.slice(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{request.targetEmployee?.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {request.targetEmployee?.department}
                        </span>
                        {request.targetEmployee?.projectName && (
                          <span className="flex items-center gap-1">
                            <FolderKanban className="h-3.5 w-3.5" />
                            {request.targetEmployee?.projectName}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={() => setSelectedRequest(request)}
                      data-testid={`button-give-feedback-${request.id}`}
                    >
                      Give Feedback
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No completed feedback yet</h3>
                <p className="text-muted-foreground">
                  Feedback you submit will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            completedRequests.map((request) => (
              <Card key={request.id} data-testid={`completed-request-${request.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.targetEmployee?.profileImage || ""} />
                      <AvatarFallback className="bg-green-500/10 text-green-600">
                        {request.targetEmployee?.name?.slice(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{request.targetEmployee?.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {request.targetEmployee?.department}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Submitted
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedRequest?.targetEmployee?.profileImage || ""} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedRequest?.targetEmployee?.name?.slice(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              Feedback for {selectedRequest?.targetEmployee?.name}
            </DialogTitle>
            <DialogDescription>
              Provide your honest and constructive feedback about your colleague's performance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Skill Ratings
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <RatingSelector 
                  label="Technical Skills" 
                  value={feedbackForm.technicalSkills} 
                  onChange={(v) => setFeedbackForm(f => ({ ...f, technicalSkills: v }))} 
                />
                <RatingSelector 
                  label="Communication" 
                  value={feedbackForm.communication} 
                  onChange={(v) => setFeedbackForm(f => ({ ...f, communication: v }))} 
                />
                <RatingSelector 
                  label="Teamwork" 
                  value={feedbackForm.teamwork} 
                  onChange={(v) => setFeedbackForm(f => ({ ...f, teamwork: v }))} 
                />
                <RatingSelector 
                  label="Problem Solving" 
                  value={feedbackForm.problemSolving} 
                  onChange={(v) => setFeedbackForm(f => ({ ...f, problemSolving: v }))} 
                />
                <RatingSelector 
                  label="Leadership" 
                  value={feedbackForm.leadership} 
                  onChange={(v) => setFeedbackForm(f => ({ ...f, leadership: v }))} 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="strengths">Strengths *</Label>
                <Textarea
                  id="strengths"
                  placeholder="What are this person's key strengths? (minimum 10 characters)"
                  value={feedbackForm.strengths}
                  onChange={(e) => setFeedbackForm(f => ({ ...f, strengths: e.target.value }))}
                  className="min-h-24"
                  data-testid="textarea-strengths"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="improvements">Areas of Improvement *</Label>
                <Textarea
                  id="improvements"
                  placeholder="What areas could this person improve on? (minimum 10 characters)"
                  value={feedbackForm.areasOfImprovement}
                  onChange={(e) => setFeedbackForm(f => ({ ...f, areasOfImprovement: e.target.value }))}
                  className="min-h-24"
                  data-testid="textarea-improvements"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Additional Comments</Label>
                <Textarea
                  id="comments"
                  placeholder="Any other observations or feedback (optional)"
                  value={feedbackForm.additionalComments}
                  onChange={(e) => setFeedbackForm(f => ({ ...f, additionalComments: e.target.value }))}
                  className="min-h-20"
                  data-testid="textarea-comments"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedRequest(null)}
                data-testid="button-cancel-feedback"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitFeedback.isPending}
                data-testid="button-submit-feedback"
              >
                {submitFeedback.isPending ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
