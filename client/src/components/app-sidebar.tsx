import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  ClipboardCheck,
  Star,
  Settings,
  LogOut,
  BarChart3,
  UserCog,
  FileText,
  UserCircle
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import type { Employee } from "@shared/schema";

interface AppSidebarProps {
  employee?: Employee | null;
  pendingFeedbackCount?: number;
}

export function AppSidebar({ employee, pendingFeedbackCount = 0 }: AppSidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location === path;

  const mainItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Employees",
      url: "/employees",
      icon: Users,
    },
    {
      title: "My Feedback Tasks",
      url: "/feedback-tasks",
      icon: ClipboardList,
      badge: pendingFeedbackCount > 0 ? pendingFeedbackCount : undefined,
    },
    {
      title: "My Ratings",
      url: "/my-ratings",
      icon: Star,
    },
    {
      title: "Know About Me",
      url: "/know-about-me",
      icon: UserCircle,
    },
  ];

  const managerItems = [
    {
      title: "Team Reviews",
      url: "/manager-reviews",
      icon: ClipboardCheck,
    },
  ];

  const leadItems = [
    {
      title: "Final Appraisals",
      url: "/lead-reviews",
      icon: FileText,
    },
    {
      title: "All Reports",
      url: "/reports",
      icon: BarChart3,
    },
  ];

  const adminItems = [
    {
      title: "Manage Employees",
      url: "/admin/employees",
      icon: UserCog,
    },
    {
      title: "Appraisal Cycles",
      url: "/admin/cycles",
      icon: Settings,
    },
  ];

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const displayName = employee?.name || user?.firstName || "User";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-semibold text-sm">360 Feedback</span>
            <p className="text-xs text-muted-foreground">Performance Reviews</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    data-testid={`nav-${item.url.replace("/", "") || "dashboard"}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {employee?.role === "manager" && (
          <SidebarGroup>
            <SidebarGroupLabel>Manager</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {managerItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      data-testid={`nav-${item.url.replace("/", "")}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {employee?.role === "lead" && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Manager</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {managerItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        data-testid={`nav-${item.url.replace("/", "")}`}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Lead</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {leadItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        data-testid={`nav-${item.url.replace("/", "")}`}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        data-testid={`nav-${item.url.replace("/", "")}`}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent">
          <Avatar className="h-9 w-9">
            <AvatarImage src={employee?.profileImage || user?.profileImageUrl || ""} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {employee?.role || "Employee"}
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="p-2 rounded-md hover-elevate"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
