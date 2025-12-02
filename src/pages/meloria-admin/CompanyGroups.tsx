import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CompanyGroup {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count: number;
  service_type: "free" | "premium";
  stress_level: number | null;
  tests_completed: number;
}

const CompanyGroups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<CompanyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingGroup, setDeletingGroup] = useState<CompanyGroup | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from("company_groups" as any)
        .select(`
          id,
          name,
          description,
          created_at,
          service_type,
          group_members (count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Set default values - will be calculated from actual test data when available
      const groupsWithStats = (data as any[]).map((group: any) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        created_at: group.created_at,
        member_count: group.group_members?.[0]?.count || 0,
        service_type: group.service_type || "free",
        stress_level: null, // Will be calculated from actual burnout test results
        tests_completed: 0, // Will be calculated from actual test completions
      }));

      setGroups(groupsWithStats);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStressColor = (level: number | null) => {
    if (level === null) return "text-muted-foreground";
    if (level < 30) return "text-green-600";
    if (level < 60) return "text-yellow-600";
    return "text-red-600";
  };

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;

    try {
      // First delete all members of the group
      const { error: membersError } = await supabase
        .from("group_members" as any)
        .delete()
        .eq("group_id", deletingGroup.id);

      if (membersError) throw membersError;

      // Then delete the group
      const { error: groupError } = await supabase
        .from("company_groups" as any)
        .delete()
        .eq("id", deletingGroup.id);

      if (groupError) throw groupError;

      toast.success("Group deleted successfully");
      setDeletingGroup(null);
      fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Company Groups</h1>
          <p className="text-muted-foreground">Manage company groups and their members</p>
        </div>
        <Button onClick={() => navigate("/meloria-admin/company-groups/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No company groups created yet</p>
          <Button onClick={() => navigate("/meloria-admin/company-groups/create")}>
            Create Your First Group
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer relative"
              onClick={() => navigate(`/meloria-admin/company-groups/${group.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{group.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={group.service_type === "premium" ? "default" : "secondary"}>
                    {group.service_type === "premium" ? "Premium" : "Free"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/meloria-admin/company-groups/${group.id}`);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingGroup(group);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {group.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {group.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employees:</span>
                  <span className="font-medium">{group.member_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stress Level:</span>
                  <span className={`font-medium ${getStressColor(group.stress_level)}`}>
                    {group.stress_level !== null ? `${group.stress_level}%` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tests Completed:</span>
                  <span className="font-medium">
                    {group.tests_completed}/{group.member_count}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingGroup} onOpenChange={() => setDeletingGroup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingGroup?.name}</strong>?
              This will also remove all members from the group. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteGroup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CompanyGroups;
