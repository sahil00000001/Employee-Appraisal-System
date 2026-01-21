import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Users,
  Star,
  TrendingUp,
  CheckCircle2,
  Clock
} from "lucide-react";
import type { AppraisalCycle } from "@shared/schema";

interface ReportsData {
  activeCycle: AppraisalCycle | null;
  totalEmployees: number;
  completedFeedback: number;
  pendingFeedback: number;
  completedManagerReviews: number;
  pendingManagerReviews: number;
  completedLeadReviews: number;
  pendingLeadReviews: number;
  averageRating: number | null;
  ratingDistribution: { rating: number; count: number }[];
}

export default function Reports() {
  const { data, isLoading } = useQuery<ReportsData>({
    queryKey: ["/api/reports"],
  });

  if (isLoading) {
    return <ReportsSkeleton />;
  }

  const feedbackProgress = data?.totalEmployees 
    ? Math.round((data.completedFeedback / (data.completedFeedback + data.pendingFeedback || 1)) * 100)
    : 0;

  const managerProgress = data?.totalEmployees
    ? Math.round((data.completedManagerReviews / (data.completedManagerReviews + data.pendingManagerReviews || 1)) * 100)
    : 0;

  const leadProgress = data?.totalEmployees
    ? Math.round((data.completedLeadReviews / (data.completedLeadReviews + data.pendingLeadReviews || 1)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-reports-title">
          Appraisal Reports
        </h1>
        <p className="text-muted-foreground">
          {data?.activeCycle 
            ? `Overview for: ${data.activeCycle.name}`
            : "No active appraisal cycle"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">
              In the organization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.averageRating ? `${data.averageRating.toFixed(1)}/5` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.completedLeadReviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              Final appraisals done
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pendingLeadReviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting final review
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Review Progress
            </CardTitle>
            <CardDescription>
              Track the progress of the current appraisal cycle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Peer Feedback</span>
                <span className="text-muted-foreground">
                  {data?.completedFeedback || 0} / {(data?.completedFeedback || 0) + (data?.pendingFeedback || 0)}
                </span>
              </div>
              <Progress value={feedbackProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">{feedbackProgress}% complete</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Manager Reviews</span>
                <span className="text-muted-foreground">
                  {data?.completedManagerReviews || 0} / {(data?.completedManagerReviews || 0) + (data?.pendingManagerReviews || 0)}
                </span>
              </div>
              <Progress value={managerProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">{managerProgress}% complete</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Lead Final Reviews</span>
                <span className="text-muted-foreground">
                  {data?.completedLeadReviews || 0} / {(data?.completedLeadReviews || 0) + (data?.pendingLeadReviews || 0)}
                </span>
              </div>
              <Progress value={leadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">{leadProgress}% complete</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Rating Distribution
            </CardTitle>
            <CardDescription>
              How ratings are distributed across employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data?.ratingDistribution && data.ratingDistribution.length > 0 ? (
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const ratingData = data.ratingDistribution.find(r => r.rating === rating);
                  const count = ratingData?.count || 0;
                  const total = data.ratingDistribution.reduce((sum, r) => sum + r.count, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        {[...Array(rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No ratings data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
