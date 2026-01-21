import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Users, 
  Mail,
  Building2,
  FolderKanban,
  User
} from "lucide-react";
import type { Employee } from "@shared/schema";

interface EmployeeWithRelations extends Employee {
  manager?: Employee | null;
  lead?: Employee | null;
}

export default function Employees() {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data: employees, isLoading } = useQuery<EmployeeWithRelations[]>({
    queryKey: ["/api/employees"],
  });

  const departments = [...new Set(employees?.map(e => e.department).filter(Boolean) || [])];

  const filteredEmployees = employees?.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      (emp.projectName?.toLowerCase().includes(search.toLowerCase()));
    
    const matchesDepartment = departmentFilter === "all" || emp.department === departmentFilter;
    const matchesRole = roleFilter === "all" || emp.role === roleFilter;

    return matchesSearch && matchesDepartment && matchesRole;
  }) || [];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "lead": return "default";
      case "manager": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-employees-title">
          Employee Directory
        </h1>
        <p className="text-muted-foreground">
          Browse and search all employees in the organization
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or project..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-employees"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-department">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40" data-testid="select-role">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No employees found</h3>
            <p className="text-muted-foreground">
              {search || departmentFilter !== "all" || roleFilter !== "all"
                ? "Try adjusting your search filters"
                : "No employees have been added yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <Card 
              key={employee.id} 
              className="hover-elevate"
              data-testid={`employee-card-${employee.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={employee.profileImage || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {employee.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{employee.name}</h3>
                      <Badge variant={getRoleBadgeVariant(employee.role)}>
                        {employee.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{employee.department}</span>
                    </div>
                    {employee.projectName && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FolderKanban className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{employee.projectName}</span>
                      </div>
                    )}
                  </div>
                </div>
                {(employee.manager || employee.lead) && (
                  <div className="mt-4 pt-4 border-t border-border space-y-2">
                    {employee.manager && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Manager:</span>
                        <span className="font-medium">{employee.manager.name}</span>
                      </div>
                    )}
                    {employee.lead && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Lead:</span>
                        <span className="font-medium">{employee.lead.name}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="text-sm text-muted-foreground text-center">
        Showing {filteredEmployees.length} of {employees?.length || 0} employees
      </div>
    </div>
  );
}
