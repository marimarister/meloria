import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CompanyGroup {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count: number;
  service_type: "free" | "premium";
  stress_level: number;
  tests_completed: number;
}

const CompanyGroups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<CompanyGroup[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Mock data for stress level and tests completed
      const groupsWithStats = (data as any[]).map((group: any) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        created_at: group.created_at,
        member_count: group.group_members?.[0]?.count || 0,
        service_type: group.service_type || "free",
        stress_level: Math.floor(Math.random() * 100), // TODO: Calculate from actual data
        tests_completed: Math.floor(Math.random() * (group.group_members?.[0]?.count || 0)),
      }));

      setGroups(groupsWithStats);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStressColor = (level: number) => {
    if (level < 30) return "text-green-600";
    if (level < 60) return "text-yellow-600";
    return "text-red-600";
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
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/meloria-admin/company-groups/${group.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{group.name}</h3>
                <Badge variant={group.service_type === "premium" ? "default" : "secondary"}>
                  {group.service_type === "premium" ? "Premium" : "Free"}
                </Badge>
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
                    {group.stress_level}%
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
    </div>
  );
};

export default CompanyGroups;
