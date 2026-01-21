import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Users, 
  ClipboardCheck, 
  TrendingUp, 
  Shield, 
  ArrowRight,
  Star,
  BarChart3
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">360 Feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <a href="/login">
                <Button data-testid="button-login">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Star className="h-4 w-4" />
                  Streamlined Performance Reviews
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-foreground">
                  Elevate Your{" "}
                  <span className="text-primary">Appraisal</span> Process
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg">
                  A comprehensive performance review system that connects employees, 
                  managers, and leads. Collect peer feedback, track growth, and make 
                  informed decisions with ease.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="/login">
                    <Button size="lg" className="gap-2" data-testid="button-get-started">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                  <Button variant="outline" size="lg" data-testid="button-learn-more">
                    Learn More
                  </Button>
                </div>
                <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Secure & Private
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Team-Friendly
                  </div>
                </div>
              </div>
              <div className="hidden lg:block relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
                <Card className="relative overflow-hidden">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">360° Feedback</h3>
                        <p className="text-sm text-muted-foreground">Collect insights from peers</p>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-primary rounded-full" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-primary">92%</div>
                        <div className="text-xs text-muted-foreground">Completion</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-primary">4.5</div>
                        <div className="text-xs text-muted-foreground">Avg Rating</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-primary">85+</div>
                        <div className="text-xs text-muted-foreground">Reviews</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our streamlined process ensures fair and comprehensive performance evaluations
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="hover-elevate group">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Peer Feedback</h3>
                  <p className="text-muted-foreground">
                    Employees provide anonymous feedback about their colleagues, 
                    rating skills and providing constructive insights.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover-elevate group">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ClipboardCheck className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Manager Review</h3>
                  <p className="text-muted-foreground">
                    Managers evaluate team members on goals, growth areas, 
                    and promotion readiness with detailed assessments.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover-elevate group">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <TrendingUp className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Lead Decision</h3>
                  <p className="text-muted-foreground">
                    Leads review all gathered feedback, provide final ratings, 
                    and make increment and promotion decisions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-serif font-bold mb-4">
              Ready to Transform Your Review Process?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join organizations that trust 360 Feedback for fair, transparent, 
              and efficient performance evaluations.
            </p>
            <a href="/login">
              <Button size="lg" className="gap-2" data-testid="button-start-free">
                Start Free Today
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">
                360 Feedback © 2025
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
