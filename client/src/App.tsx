import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Employee, FeedbackRequest } from "@shared/schema";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import FeedbackTasks from "@/pages/feedback-tasks";
import MyRatings from "@/pages/my-ratings";
import ManagerReviews from "@/pages/manager-reviews";
import LeadReviews from "@/pages/lead-reviews";
import Reports from "@/pages/reports";
import AdminEmployees from "@/pages/admin/employees";
import AdminCycles from "@/pages/admin/cycles";
import ManagerAssignFeedback from "@/pages/manager/assign-feedback";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  const { data: employee, isLoading: employeeLoading } = useQuery<Employee | null>({
    queryKey: ["/api/me/employee"],
  });

  const { data: pendingRequests } = useQuery<FeedbackRequest[]>({
    queryKey: ["/api/feedback-requests/my-tasks"],
  });

  const pendingCount = pendingRequests?.filter(r => r.status === "pending").length || 0;

  if (employeeLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar employee={employee} pendingFeedbackCount={pendingCount} />
        <SidebarInset className="flex flex-col flex-1">
          <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/employees" component={Employees} />
              <Route path="/feedback-tasks" component={FeedbackTasks} />
              <Route path="/my-ratings" component={MyRatings} />
              <Route path="/manager-reviews" component={ManagerReviews} />
              <Route path="/lead-reviews" component={LeadReviews} />
              <Route path="/reports" component={Reports} />
              <Route path="/admin/employees" component={AdminEmployees} />
              <Route path="/admin/cycles" component={AdminCycles} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/manager/assign-feedback" component={ManagerAssignFeedback} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
