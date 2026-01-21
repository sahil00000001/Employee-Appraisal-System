import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { 
  Briefcase, 
  GraduationCap, 
  Users, 
  Heart, 
  Lightbulb, 
  Code,
  Save,
  Trophy,
  Target,
  Pencil,
  CheckCircle2
} from "lucide-react";
import type { KnowAboutMe as KnowAboutMeType, AppraisalCycle } from "@shared/schema";

const kamFormSchema = z.object({
  projectContributions: z.string().optional(),
  roleAndResponsibilities: z.string().optional(),
  keyAchievements: z.string().optional(),
  learnings: z.string().optional(),
  certifications: z.string().optional(),
  technologiesWorkedOn: z.string().optional(),
  mentorship: z.string().optional(),
  volunteeringActivities: z.string().optional(),
  leadershipRoles: z.string().optional(),
  teamBuildingActivities: z.string().optional(),
  problemsSolved: z.string().optional(),
  strengths: z.string().optional(),
  extraEfforts: z.string().optional(),
  improvements: z.string().optional(),
}).refine((data) => {
  return Object.values(data).some(value => value && value.trim().length > 0);
}, {
  message: "Please fill in at least one field before saving",
  path: ["projectContributions"],
});

type KamFormValues = z.infer<typeof kamFormSchema>;

interface DashboardData {
  activeCycle: AppraisalCycle | null;
}

export default function KnowAboutMe() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: dashboardData } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const { data: kamData, isLoading } = useQuery<KnowAboutMeType | null>({
    queryKey: ["/api/know-about-me"],
  });

  const hasSavedData = kamData && Object.entries(kamData).some(([key, value]) => 
    !["id", "employeeId", "appraisalCycleId", "createdAt", "updatedAt"].includes(key) && 
    value && String(value).trim().length > 0
  );

  const form = useForm<KamFormValues>({
    resolver: zodResolver(kamFormSchema),
    defaultValues: {
      projectContributions: "",
      roleAndResponsibilities: "",
      keyAchievements: "",
      learnings: "",
      certifications: "",
      technologiesWorkedOn: "",
      mentorship: "",
      volunteeringActivities: "",
      leadershipRoles: "",
      teamBuildingActivities: "",
      problemsSolved: "",
      strengths: "",
      extraEfforts: "",
      improvements: "",
    },
    values: kamData ? {
      projectContributions: kamData.projectContributions || "",
      roleAndResponsibilities: kamData.roleAndResponsibilities || "",
      keyAchievements: kamData.keyAchievements || "",
      learnings: kamData.learnings || "",
      certifications: kamData.certifications || "",
      technologiesWorkedOn: kamData.technologiesWorkedOn || "",
      mentorship: kamData.mentorship || "",
      volunteeringActivities: kamData.volunteeringActivities || "",
      leadershipRoles: kamData.leadershipRoles || "",
      teamBuildingActivities: kamData.teamBuildingActivities || "",
      problemsSolved: kamData.problemsSolved || "",
      strengths: kamData.strengths || "",
      extraEfforts: kamData.extraEfforts || "",
      improvements: kamData.improvements || "",
    } : undefined,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: KamFormValues) => {
      const res = await apiRequest("POST", "/api/know-about-me", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/know-about-me"] });
      setIsEditing(false);
      toast({
        title: "Saved successfully",
        description: "Your self-assessment has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your self-assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: KamFormValues) => {
    saveMutation.mutate(data);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  if (isLoading) {
    return <KnowAboutMeSkeleton />;
  }

  const showViewMode = hasSavedData && !isEditing;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-kam-title">
            Know About Me
          </h1>
          <p className="text-muted-foreground">
            Document your achievements, learnings, and contributions for the{" "}
            <span className="font-medium text-foreground">
              {dashboardData?.activeCycle?.name || "current appraisal cycle"}
            </span>
          </p>
        </div>
        {showViewMode && (
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              Saved
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              data-testid="button-edit-kam"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        )}
      </div>

      {showViewMode ? (
        <ViewMode kamData={kamData!} onEdit={handleEdit} />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Projects & Contributions
                </CardTitle>
                <CardDescription>
                  Describe your project work and key responsibilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="projectContributions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Contributions</FormLabel>
                      <FormDescription>
                        List the projects you worked on and your specific contributions
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          data-testid="textarea-project-contributions"
                          placeholder="e.g., Led the migration of legacy system to microservices architecture..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleAndResponsibilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role & Responsibilities</FormLabel>
                      <FormDescription>
                        Describe your role and key responsibilities in projects
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          data-testid="textarea-role-responsibilities"
                          placeholder="e.g., As a senior developer, I was responsible for..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keyAchievements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Achievements</FormLabel>
                      <FormDescription>
                        Highlight your major accomplishments and impact
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          data-testid="textarea-key-achievements"
                          placeholder="e.g., Reduced system downtime by 40%, Improved API response time by 50%..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  Learning & Growth
                </CardTitle>
                <CardDescription>
                  Document your professional development and skill enhancement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="learnings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Learnings</FormLabel>
                      <FormDescription>
                        What new skills or knowledge did you acquire?
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          data-testid="textarea-learnings"
                          placeholder="e.g., Learned Kubernetes orchestration, Mastered React hooks..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certifications</FormLabel>
                      <FormDescription>
                        List any certifications or courses completed
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          data-testid="textarea-certifications"
                          placeholder="e.g., AWS Solutions Architect, Google Cloud Professional..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="technologiesWorkedOn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Technologies Worked On
                      </FormLabel>
                      <FormDescription>
                        List technologies, frameworks, and tools you used
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          data-testid="textarea-technologies"
                          placeholder="e.g., React, Node.js, PostgreSQL, Docker, Kubernetes..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  Leadership & Team Building
                </CardTitle>
                <CardDescription>
                  Describe your leadership activities and team contributions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="mentorship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mentorship</FormLabel>
                      <FormDescription>
                        Describe any mentoring or coaching activities
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          data-testid="textarea-mentorship"
                          placeholder="e.g., Mentored 3 junior developers on best practices..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="leadershipRoles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leadership Roles</FormLabel>
                      <FormDescription>
                        Describe any leadership positions or initiatives
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          data-testid="textarea-leadership-roles"
                          placeholder="e.g., Led the frontend guild, Organized tech talks..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamBuildingActivities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Building Activities</FormLabel>
                      <FormDescription>
                        Activities that helped strengthen team dynamics
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          data-testid="textarea-team-building"
                          placeholder="e.g., Organized hackathons, Created knowledge sharing sessions..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="volunteeringActivities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        Volunteering Activities
                      </FormLabel>
                      <FormDescription>
                        Any volunteering or community contributions
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          data-testid="textarea-volunteering"
                          placeholder="e.g., Conducted coding bootcamp for interns..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Problem Solving & Strengths
                </CardTitle>
                <CardDescription>
                  Highlight your problem-solving abilities and key strengths
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="problemsSolved"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problems Solved</FormLabel>
                      <FormDescription>
                        Describe challenging problems you solved
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          data-testid="textarea-problems-solved"
                          placeholder="e.g., Resolved critical production issue that was affecting 1000+ users..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="strengths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        Strengths
                      </FormLabel>
                      <FormDescription>
                        What are your key professional strengths?
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          data-testid="textarea-strengths"
                          placeholder="e.g., Strong analytical skills, Excellent communication..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Extra Efforts & Improvements
                </CardTitle>
                <CardDescription>
                  Document any additional contributions and areas for improvement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="extraEfforts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extra Efforts</FormLabel>
                      <FormDescription>
                        Any additional contributions beyond regular duties
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          data-testid="textarea-extra-efforts"
                          placeholder="e.g., Worked weekends to meet critical deadline, Helped other teams..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="improvements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Areas for Improvement</FormLabel>
                      <FormDescription>
                        Identify areas where you want to grow
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          data-testid="textarea-improvements"
                          placeholder="e.g., Want to improve public speaking skills, Need to learn system design..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              {hasSavedData && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  data-testid="button-cancel-kam"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                size="lg"
                disabled={saveMutation.isPending}
                data-testid="button-save-kam"
              >
                {saveMutation.isPending ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Self-Assessment
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}

interface ViewModeProps {
  kamData: KnowAboutMeType;
  onEdit: () => void;
}

function ViewMode({ kamData }: ViewModeProps) {
  const sections = [
    {
      title: "Projects & Contributions",
      icon: Briefcase,
      iconColor: "text-primary",
      fields: [
        { label: "Project Contributions", value: kamData.projectContributions },
        { label: "Role & Responsibilities", value: kamData.roleAndResponsibilities },
        { label: "Key Achievements", value: kamData.keyAchievements },
      ],
    },
    {
      title: "Learning & Growth",
      icon: GraduationCap,
      iconColor: "text-blue-500",
      fields: [
        { label: "Learnings", value: kamData.learnings },
        { label: "Certifications", value: kamData.certifications },
        { label: "Technologies Worked On", value: kamData.technologiesWorkedOn },
      ],
    },
    {
      title: "Leadership & Team Building",
      icon: Users,
      iconColor: "text-green-500",
      fields: [
        { label: "Mentorship", value: kamData.mentorship },
        { label: "Leadership Roles", value: kamData.leadershipRoles },
        { label: "Team Building Activities", value: kamData.teamBuildingActivities },
        { label: "Volunteering Activities", value: kamData.volunteeringActivities },
      ],
    },
    {
      title: "Problem Solving & Strengths",
      icon: Lightbulb,
      iconColor: "text-yellow-500",
      fields: [
        { label: "Problems Solved", value: kamData.problemsSolved },
        { label: "Strengths", value: kamData.strengths },
      ],
    },
    {
      title: "Extra Efforts & Improvements",
      icon: Target,
      iconColor: "text-purple-500",
      fields: [
        { label: "Extra Efforts", value: kamData.extraEfforts },
        { label: "Areas for Improvement", value: kamData.improvements },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const hasContent = section.fields.some(f => f.value && f.value.trim().length > 0);
        if (!hasContent) return null;

        return (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <section.icon className={`h-5 w-5 ${section.iconColor}`} />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.fields.map((field) => {
                if (!field.value || field.value.trim().length === 0) return null;
                return (
                  <div key={field.label} className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{field.label}</p>
                    <p className="text-sm whitespace-pre-wrap">{field.value}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {kamData.updatedAt && (
        <p className="text-xs text-muted-foreground text-right">
          Last updated: {new Date(kamData.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}

function KnowAboutMeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
