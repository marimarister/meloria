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
  employee_count: number;
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
      // Fetch groups with members
      // Only fetch top-level groups (no parent)
      const { data: groupsData, error: groupsError } = await supabase
        .from("company_groups" as any)
        .select(`
          id,
          name,
          description,
          created_at,
          service_type,
          parent_group_id,
          group_members (id, email, access_rights)
        `)
        .is("parent_group_id", null)
        .order("created_at", { ascending: false });

      if (groupsError) throw groupsError;

      // Get all profiles to match emails with user_ids
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email");

      if (profilesError) throw profilesError;

      // Get all test results
      const { data: testResults, error: testError } = await supabase
        .from("test_results")
        .select("user_id, test_type, scores");

      if (testError) throw testError;

      // Calculate stats for each group
      const groupsWithStats: CompanyGroup[] = (groupsData as any[]).map((group: any) => {
        const members = group.group_members || [];
        const employeeMembers = members.filter((m: any) => m.access_rights === "employee");
        
        // Find user_ids for employee members
        const employeeUserIds = employeeMembers
          .map((member: any) => {
            const profile = profiles?.find(p => p.email === member.email);
            return profile?.id;
          })
          .filter(Boolean);

        // Get burnout scores for employees
        const burnoutScores: number[] = [];
        let testsCompleted = 0;

        employeeUserIds.forEach((userId: string) => {
          const userResults = testResults?.filter(r => r.user_id === userId) || [];
          const burnoutResult = userResults.find(r => r.test_type === 'burnout');
          
          if (burnoutResult && burnoutResult.scores) {
            burnoutScores.push((burnoutResult.scores as any).total);
          }

          // Count as completed if burnout test is done (since other tests may be optional)
          if (burnoutResult) {
            testsCompleted++;
          }
        });

        // Calculate average stress level (burnout score as percentage of max 132)
        const avgStressLevel = burnoutScores.length > 0
          ? Math.round((burnoutScores.reduce((sum, s) => sum + s, 0) / burnoutScores.length / 132) * 100)
          : null;

        return {
          id: group.id,
          name: group.name,
          description: group.description,
          created_at: group.created_at,
          member_count: members.length,
          employee_count: employeeMembers.length,
          service_type: group.service_type || "free",
          stress_level: avgStressLevel,
          tests_completed: testsCompleted,
        };
      });

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

  const getStressLabel = (level: number | null) => {
    if (level === null) return "N/A";
    if (level < 17) return `${level}% (Perfect)`;
    if (level < 34) return `${level}% (Balanced)`;
    if (level < 50) return `${level}% (Mild)`;
    if (level < 67) return `${level}% (Noticeable)`;
    if (level < 84) return `${level}% (Severe)`;
    return `${level}% (Extreme)`;
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
                  <span className="text-muted-foreground">Total Members:</span>
                  <span className="font-medium">{group.member_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employees:</span>
                  <span className="font-medium">{group.employee_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Stress Level:</span>
                  <span className={`font-medium ${getStressColor(group.stress_level)}`}>
                    {getStressLabel(group.stress_level)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tests Completed:</span>
                  <span className="font-medium">
                    {group.tests_completed}/{group.employee_count}
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