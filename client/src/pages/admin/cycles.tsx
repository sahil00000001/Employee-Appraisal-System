import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Calendar,
  Clock,
  CheckCircle2,
  Play,
  Pause
} from "lucide-react";
import type { AppraisalCycle } from "@shared/schema";

export default function AdminCycles() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear(),
    startDate: "",
    endDate: "",
  });
  const { toast } = useToast();

  const { data: cycles, isLoading } = useQuery<AppraisalCycle[]>({
    queryKey: ["/api/appraisal-cycles"],
  });

  const createCycle = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/admin/appraisal-cycles", {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appraisal-cycles"] });
      setIsDialogOpen(false);
      setFormData({
        name: "",
        year: new Date().getFullYear(),
        startDate: "",
        endDate: "",
      });
      toast({
        title: "Cycle created",
        description: "New appraisal cycle has been created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create cycle. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleCycle = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiRequest("PATCH", `/api/admin/appraisal-cycles/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appraisal-cycles"] });
      toast({
        title: "Cycle updated",
        description: "Appraisal cycle status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cycle. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast({
        title: "Validation error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }
    createCycle.mutate(formData);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const activeCycle = cycles?.find(c => c.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-admin-cycles-title">
            Appraisal Cycles
          </h1>
          <p className="text-muted-foreground">
            Manage performance review cycles
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-cycle">
              <Plus className="h-4 w-4 mr-2" />
              Create Cycle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Appraisal Cycle</DialogTitle>
              <DialogDescription>
                Set up a new performance review cycle
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Cycle Name *</Label>
                <Input
                  id="name"
                  placeholder="Q1 2025 Performance Review"
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  data-testid="input-cycle-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(f => ({ ...f, year: parseInt(e.target.value) }))}
                  data-testid="input-cycle-year"
                />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(f => ({ ...f, startDate: e.target.value }))}
                    data-testid="input-cycle-start"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(f => ({ ...f, endDate: e.target.value }))}
                    data-testid="input-cycle-end"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={createCycle.isPending} data-testid="button-save-cycle">
                  {createCycle.isPending ? "Creating..." : "Create Cycle"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {activeCycle && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Play className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{activeCycle.name}</h3>
                  <Badge>Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(activeCycle.startDate)} — {formatDate(activeCycle.endDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">All Cycles</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : cycles?.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No appraisal cycles</h3>
              <p className="text-muted-foreground mb-4">
                Create your first appraisal cycle to get started
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Cycle
              </Button>
            </CardContent>
          </Card>
        ) : (
          cycles?.map((cycle) => (
            <Card key={cycle.id} data-testid={`cycle-${cycle.id}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    cycle.isActive ? "bg-primary/10" : "bg-muted"
                  }`}>
                    {cycle.isActive ? (
                      <Play className="h-5 w-5 text-primary" />
                    ) : (
                      <Pause className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{cycle.name}</h3>
                      {cycle.isActive && <Badge>Active</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {cycle.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(cycle.startDate)} — {formatDate(cycle.endDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`toggle-${cycle.id}`} className="text-sm text-muted-foreground">
                      {cycle.isActive ? "Active" : "Inactive"}
                    </Label>
                    <Switch
                      id={`toggle-${cycle.id}`}
                      checked={cycle.isActive}
                      onCheckedChange={(checked) => toggleCycle.mutate({ id: cycle.id, isActive: checked })}
                      disabled={toggleCycle.isPending}
                      data-testid={`toggle-cycle-${cycle.id}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
