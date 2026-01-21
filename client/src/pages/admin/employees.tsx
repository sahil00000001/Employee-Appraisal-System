import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  UserPlus, 
  Search, 
  Building2,
  Mail,
  User,
  Users
} from "lucide-react";
import type { Employee, InsertEmployee } from "@shared/schema";

export default function AdminEmployees() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertEmployee>>({
    name: "",
    email: "",
    department: "",
    role: "employee",
    projectName: "",
    managerId: undefined,
    leadId: undefined,
  });
  const { toast } = useToast();

  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const createEmployee = useMutation({
    mutationFn: async (data: Partial<InsertEmployee>) => {
      return await apiRequest("POST", "/api/admin/employees", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setIsDialogOpen(false);
      setFormData({
        name: "",
        email: "",
        department: "",
        role: "employee",
        projectName: "",
        managerId: undefined,
        leadId: undefined,
      });
      toast({
        title: "Employee added",
        description: "New employee has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredEmployees = employees?.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const managers = employees?.filter(e => e.role === "manager" || e.role === "lead") || [];
  const leads = employees?.filter(e => e.role === "lead") || [];

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.department) {
      toast({
        title: "Validation error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }
    createEmployee.mutate(formData);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "lead": return "default";
      case "manager": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-admin-employees-title">
            Manage Employees
          </h1>
          <p className="text-muted-foreground">
            Add and manage employee records
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-employee">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Enter the employee details below
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  data-testid="input-employee-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                  data-testid="input-employee-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  placeholder="Engineering"
                  value={formData.department}
                  onChange={(e) => setFormData(f => ({ ...f, department: e.target.value }))}
                  data-testid="input-employee-department"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select 
                  value={formData.role as string} 
                  onValueChange={(v) => setFormData(f => ({ ...f, role: v as any }))}
                >
                  <SelectTrigger data-testid="select-employee-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project">Project Name</Label>
                <Input
                  id="project"
                  placeholder="Project Alpha"
                  value={formData.projectName || ""}
                  onChange={(e) => setFormData(f => ({ ...f, projectName: e.target.value }))}
                  data-testid="input-employee-project"
                />
              </div>
              {formData.role === "employee" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="manager">Manager</Label>
                    <Select 
                      value={formData.managerId || ""} 
                      onValueChange={(v) => setFormData(f => ({ ...f, managerId: v || undefined }))}
                    >
                      <SelectTrigger data-testid="select-employee-manager">
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Manager</SelectItem>
                        {managers.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead">Lead</Label>
                    <Select 
                      value={formData.leadId || ""} 
                      onValueChange={(v) => setFormData(f => ({ ...f, leadId: v || undefined }))}
                    >
                      <SelectTrigger data-testid="select-employee-lead">
                        <SelectValue placeholder="Select lead" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Lead</SelectItem>
                        {leads.map((l) => (
                          <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={createEmployee.isPending} data-testid="button-save-employee">
                  {createEmployee.isPending ? "Adding..." : "Add Employee"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-admin-employees"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No employees found</h3>
              <p className="text-muted-foreground">
                {search ? "Try adjusting your search" : "Add your first employee to get started"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid={`admin-employee-${employee.id}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee.profileImage || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {employee.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{employee.name}</span>
                      <Badge variant={getRoleBadgeVariant(employee.role)} className="text-xs">
                        {employee.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {employee.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {employee.department}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground text-center">
        Total: {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
