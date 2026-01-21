import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, ArrowLeft, Mail, KeyRound, Loader2, Shield, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type LoginMode = "select" | "employee" | "manager" | "admin";
type LoginStep = "email" | "otp";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<LoginMode>("select");
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [managerId, setManagerId] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/send-otp", { email });
      
      setStep("otp");
      toast({
        title: "Verification code sent",
        description: "Check your email for the 6-digit code",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send code",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/verify-otp", { email, code: otp });
      
      toast({
        title: "Login successful",
        description: "Welcome to 360 Feedback!",
      });
      
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/send-otp", { email });
      
      toast({
        title: "Code resent",
        description: "Check your email for the new verification code",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend code",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManagerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!managerId || !managerPassword) {
      toast({
        title: "Credentials required",
        description: "Please enter both Manager ID and Password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/manager-login", { 
        managerId, 
        password: managerPassword 
      });
      
      toast({
        title: "Login successful",
        description: "Welcome, Manager!",
      });
      
      window.location.href = "/manager/assign-feedback";
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminUsername || !adminPassword) {
      toast({
        title: "Credentials required",
        description: "Please enter both Username and Password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/admin-login", { 
        username: adminUsername, 
        password: adminPassword 
      });
      
      toast({
        title: "Login successful",
        description: "Welcome, Admin!",
      });
      
      window.location.href = "/admin/dashboard";
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSelect = () => {
    setMode("select");
    setStep("email");
    setEmail("");
    setOtp("");
    setManagerId("");
    setManagerPassword("");
    setAdminUsername("");
    setAdminPassword("");
  };

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
            </a>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center pt-16 px-4">
        {mode === "select" ? (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">Welcome to 360 Feedback</CardTitle>
              <CardDescription>
                Choose how you want to sign in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full h-16 text-base gap-3 justify-start px-6" 
                variant="outline"
                onClick={() => setMode("employee")}
                data-testid="button-employee-login"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Employee Login</div>
                  <div className="text-sm text-muted-foreground">Sign in with email verification</div>
                </div>
              </Button>
              
              <Button 
                className="w-full h-16 text-base gap-3 justify-start px-6" 
                variant="outline"
                onClick={() => setMode("manager")}
                data-testid="button-manager-login"
              >
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Manager Login</div>
                  <div className="text-sm text-muted-foreground">Assign feedback to team members</div>
                </div>
              </Button>

              <Button 
                className="w-full h-16 text-base gap-3 justify-start px-6" 
                variant="outline"
                onClick={() => setMode("admin")}
                data-testid="button-admin-login"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <KeyRound className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Admin Login</div>
                  <div className="text-sm text-muted-foreground">View all employee data and reports</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        ) : mode === "admin" ? (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                <KeyRound className="h-7 w-7 text-purple-500" />
              </div>
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription>
                Enter your admin credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Username</Label>
                  <Input
                    id="admin-username"
                    type="text"
                    placeholder="Enter username"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    disabled={isLoading}
                    data-testid="input-admin-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    disabled={isLoading}
                    data-testid="input-admin-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full gap-2" 
                  disabled={isLoading}
                  data-testid="button-admin-submit"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign In as Admin
                </Button>
                <Button 
                  type="button"
                  variant="ghost"
                  className="w-full gap-2"
                  onClick={handleBackToSelect}
                  data-testid="button-back-select"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login options
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : mode === "manager" ? (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 text-orange-500" />
              </div>
              <CardTitle className="text-2xl">Manager Login</CardTitle>
              <CardDescription>
                Enter your manager credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManagerLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manager-id">Manager ID</Label>
                  <Input
                    id="manager-id"
                    type="text"
                    placeholder="Enter manager ID"
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    disabled={isLoading}
                    data-testid="input-manager-id"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager-password">Password</Label>
                  <Input
                    id="manager-password"
                    type="password"
                    placeholder="Enter password"
                    value={managerPassword}
                    onChange={(e) => setManagerPassword(e.target.value)}
                    disabled={isLoading}
                    data-testid="input-manager-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full gap-2" 
                  disabled={isLoading}
                  data-testid="button-manager-submit"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign In as Manager
                </Button>
                <Button 
                  type="button"
                  variant="ghost"
                  className="w-full gap-2"
                  onClick={handleBackToSelect}
                  data-testid="button-back-select"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login options
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                {step === "email" ? (
                  <Mail className="h-7 w-7 text-primary" />
                ) : (
                  <KeyRound className="h-7 w-7 text-primary" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {step === "email" ? "Employee Login" : "Enter verification code"}
              </CardTitle>
              <CardDescription>
                {step === "email" 
                  ? "Enter your email to receive a verification code"
                  : `We sent a code to ${email}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === "email" ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      data-testid="input-email"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full gap-2" 
                    disabled={isLoading}
                    data-testid="button-send-code"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Send verification code
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    className="w-full gap-2"
                    onClick={handleBackToSelect}
                    data-testid="button-back-select"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login options
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">6-digit code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      disabled={isLoading}
                      className="text-center text-2xl tracking-widest font-mono"
                      maxLength={6}
                      data-testid="input-otp"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full gap-2" 
                    disabled={isLoading || otp.length !== 6}
                    data-testid="button-verify-code"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Verify and sign in
                  </Button>
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                      data-testid="button-change-email"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Change email
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                      data-testid="button-resend-code"
                    >
                      Resend code
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        360 Feedback © 2025
      </footer>
    </div>
  );
}
