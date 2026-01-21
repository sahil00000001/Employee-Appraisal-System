import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  TrendingUp,
  Award,
  Calendar,
  MessageSquare,
  FileText
} from "lucide-react";
import type { LeadReview, AppraisalCycle } from "@shared/schema";

interface MyRatingsData {
  reviews: (LeadReview & { appraisalCycle?: AppraisalCycle })[];
  averageRating: number | null;
}

export default function MyRatings() {
  const { data, isLoading } = useQuery<MyRatingsData>({
    queryKey: ["/api/my-ratings"],
  });

  const reviews = data?.reviews || [];
  const averageRating = data?.averageRating;

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-500";
    if (rating >= 3) return "text-yellow-500";
    return "text-orange-500";
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 5) return "Outstanding";
    if (rating >= 4) return "Exceeds Expectations";
    if (rating >= 3) return "Meets Expectations";
    if (rating >= 2) return "Needs Improvement";
    return "Unsatisfactory";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-my-ratings-title">
          My Ratings & Reviews
        </h1>
        <p className="text-muted-foreground">
          View your performance ratings from appraisal cycles
        </p>
      </div>

      {isLoading ? (
        <MyRatingsSkeleton />
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No ratings yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your performance ratings will appear here once your lead completes 
              the appraisal review process.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {averageRating !== null && (
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Overall Performance Rating
                    </p>
                    <div className="flex items-center gap-3">
                      <span className={`text-4xl font-bold ${getRatingColor(averageRating)}`}>
                        {averageRating.toFixed(1)}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-5 w-5 ${
                              star <= Math.round(averageRating) 
                                ? "text-yellow-500 fill-yellow-500" 
                                : "text-muted-foreground/30"
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on {reviews.length} appraisal cycle{reviews.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <Award className="h-16 w-16 text-primary/20" />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Review History</h2>
            {reviews.map((review) => (
              <Card key={review.id} data-testid={`rating-card-${review.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {review.appraisalCycle?.name || "Appraisal Cycle"}
                      </CardTitle>
                      <CardDescription>
                        {review.appraisalCycle?.year || new Date(review.createdAt!).getFullYear()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getRatingColor(review.finalRating)}`}>
                        {review.finalRating}/5
                      </div>
                      <Badge 
                        variant={review.finalRating >= 3 ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {getRatingLabel(review.finalRating)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-6 w-6 ${
                          star <= review.finalRating 
                            ? "text-yellow-500 fill-yellow-500" 
                            : "text-muted-foreground/20"
                        }`} 
                      />
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Promotion Decision</p>
                        <p className="text-muted-foreground">{review.promotionDecision}</p>
                      </div>
                    </div>

                    {review.incrementPercentage && (
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Increment</p>
                          <p className="text-muted-foreground">{review.incrementPercentage}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Lead Remarks</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">{review.remarks}</p>
                      </div>
                    </div>
                  </div>

                  {review.submittedAt && (
                    <p className="text-xs text-muted-foreground pt-2">
                      Reviewed on {new Date(review.submittedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MyRatingsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-16 w-16 rounded-full" />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-12 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
