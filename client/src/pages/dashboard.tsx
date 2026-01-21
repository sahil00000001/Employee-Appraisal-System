import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { 
  ClipboardList, 
  Star, 
  Users, 
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Employee, FeedbackRequest, AppraisalCycle } from "@shared/schema";

interface DashboardData {
  employee: Employee | null;
  pendingFeedbackCount: number;
  completedFeedbackCount: number;
  myLatestRating: number | null;
  activeCycle: AppraisalCycle | null;
  recentFeedbackRequests: (FeedbackRequest & { targetEmployee?: Employee })[];
}

export default function Dashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const employee = data?.employee;
  const pendingCount = data?.pendingFeedbackCount ?? 0;
  const completedCount = data?.completedFeedbackCount ?? 0;
  const latestRating = data?.myLatestRating;
  const activeCycle = data?.activeCycle;
  const recentRequests = data?.recentFeedbackRequests ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-dashboard-title">
          Welcome back, {employee?.name?.split(" ")[0] || "User"}
        </h1>
        <p className="text-muted-foreground">
          {activeCycle 
            ? `Current appraisal cycle: ${activeCycle.name}`
            : "No active appraisal cycle"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-pending-feedback">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Reviews awaiting your input
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-completed-feedback">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              Feedback submitted this cycle
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-my-rating">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestRating !== null ? `${latestRating}/5` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {latestRating !== null ? "Latest appraisal rating" : "Not yet rated"}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-role">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{employee?.role || "—"}</div>
            <p className="text-xs text-muted-foreground">
              {employee?.department || "No department"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-pending-tasks">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Pending Feedback Tasks
                </CardTitle>
                <CardDescription>
                  Reviews that need your attention
                </CardDescription>
              </div>
              {pendingCount > 0 && (
                <Link href="/feedback-tasks">
                  <Button variant="outline" size="sm" data-testid="button-view-all-tasks">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No pending feedback tasks</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRequests.slice(0, 4).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    data-testid={`feedback-request-${request.id}`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.targetEmployee?.profileImage || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {request.targetEmployee?.name?.slice(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {request.targetEmployee?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {request.targetEmployee?.department}
                      </p>
                    </div>
                    <Badge variant={request.status === "pending" ? "secondary" : "default"}>
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-quick-actions">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and navigation shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/feedback-tasks">
              <Button variant="outline" className="w-full justify-start gap-3" data-testid="action-feedback-tasks">
                <ClipboardList className="h-4 w-4" />
                Submit Peer Feedback
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {pendingCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/my-ratings">
              <Button variant="outline" className="w-full justify-start gap-3" data-testid="action-my-ratings">
                <Star className="h-4 w-4" />
                View My Ratings & Reviews
              </Button>
            </Link>
            <Link href="/employees">
              <Button variant="outline" className="w-full justify-start gap-3" data-testid="action-employees">
                <Users className="h-4 w-4" />
                Browse Employee Directory
              </Button>
            </Link>
            {(employee?.role === "manager" || employee?.role === "lead") && (
              <Link href="/manager-reviews">
                <Button variant="outline" className="w-full justify-start gap-3" data-testid="action-manager-reviews">
                  <CheckCircle2 className="h-4 w-4" />
                  Review Team Members
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
