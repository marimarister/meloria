import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, RotateCcw, Download, Filter, Plus, Building2, Users } from "lucide-react";
import { toast } from "sonner";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";

interface TestResult {
  test_type: string;
  scores: any;
  completed_at: string;
}

interface GroupMember {
  id: string;
  name: string;
  surname: string;
  email: string;
  access_rights: "employee" | "company";
  testResults?: TestResult[];
  burnoutScore?: number;
  burnoutLevel?: string;
}

interface Subgroup {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  service_type: string;
}

type FilterOption = "all" | "completed" | "partial" | "none";

const getBurnoutLevel = (score: number): string => {
  if (score <= 22) return "Perfect Wellbeing";
  if (score <= 44) return "Balanced & Resilient";
  if (score <= 66) return "Mild Fatigue";
  if (score <= 88) return "Noticeable Burnout";
  if (score <= 110) return "Severe Burnout";
  return "Extreme Burnout Risk";
};

const getBurnoutBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
  if (score <= 44) return "default";
  if (score <= 66) return "secondary";
  if (score <= 88) return "outline";
  return "destructive";
};

const getDominantChannel = (scores: any): string | null => {
  if (!scores) return null;
  const channelNames: Record<string, string> = {
    V: "Visual",
    A: "Auditory", 
    K: "Kinesthetic",
    D: "Digital"
  };
  const channels = ['V', 'A', 'K', 'D'];
  let maxChannel = channels[0];
  let maxScore = scores[maxChannel] || 0;
  for (const channel of channels) {
    if ((scores[channel] || 0) > maxScore) {
      maxScore = scores[channel];
      maxChannel = channel;
    }
  }
  return maxScore > 0 ? channelNames[maxChannel] : null;
};

const CompanyGroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [parentGroupId, setParentGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [activeTab, setActiveTab] = useState("members");

  const inviteUrl = `${window.location.origin}/signup?group=${groupName.toLowerCase().replace(/\s+/g, "")}`;

  useEffect(() => {
    if (id) {
      fetchGroupDetails();
    }
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      const { data: group, error: groupError } = await supabase
        .from("company_groups" as any)
        .select("name, parent_group_id")
        .eq("id", id)
        .single();

      if (groupError) throw groupError;

      setGroupName((group as any).name);
      setParentGroupId((group as any).parent_group_id);

      // Fetch subgroups (departments)
      const { data: subgroupsData, error: subgroupsError } = await supabase
        .from("company_groups" as any)
        .select(`
          id,
          name,
          description,
          service_type,
          group_members (id)
        `)
        .eq("parent_group_id", id);

      if (subgroupsError) throw subgroupsError;

      const formattedSubgroups: Subgroup[] = (subgroupsData as any[]).map(sg => ({
        id: sg.id,
        name: sg.name,
        description: sg.description,
        member_count: sg.group_members?.length || 0,
        service_type: sg.service_type || "free"
      }));

      setSubgroups(formattedSubgroups);

      const { data: memberData, error: membersError } = await supabase
        .from("group_members" as any)
        .select("*")
        .eq("group_id", id);

      if (membersError) throw membersError;

      const membersWithResults = await Promise.all(
        (memberData as any[]).map(async (member) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", member.email)
            .maybeSingle();

          if (profile) {
            const { data: testResults } = await supabase
              .from("test_results")
              .select("test_type, scores, completed_at")
              .eq("user_id", profile.id);

            const burnoutResult = testResults?.find((t: any) => t.test_type === "burnout");
            let burnoutScore: number | undefined;
            let burnoutLevel: string | undefined;

            if (burnoutResult?.scores) {
              const scores = burnoutResult.scores as any;
              burnoutScore = (scores.emotionalExhaustion || 0) + 
                            (scores.depersonalization || 0) + 
                            (scores.personalAccomplishment || 0);
              burnoutLevel = getBurnoutLevel(burnoutScore);
            }

            return {
              ...member,
              testResults: testResults || [],
              burnoutScore,
              burnoutLevel,
            };
          }

          return { ...member, testResults: [] };
        })
      );

      setMembers(membersWithResults);
    } catch (error) {
      console.error("Error fetching group details:", error);
      toast.error("Failed to load group details");
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const testsCompleted = member.testResults?.length || 0;
    switch (filter) {
      case "completed":
        return testsCompleted === 3;
      case "partial":
        return testsCompleted > 0 && testsCompleted < 3;
      case "none":
        return testsCompleted === 0;
      default:
        return true;
    }
  });

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Surname", 
      "Email",
      "Role",
      "Tests Completed",
      "Burnout Score",
      "Burnout Level",
      "Channel Perception",
      "Work Preference"
    ];

    const rows = members.map((member) => {
      const channelTest = member.testResults?.find(t => t.test_type === "perception");
      const preferenceTest = member.testResults?.find(t => t.test_type === "preference");
      
      return [
        member.name,
        member.surname,
        member.email,
        member.access_rights === "employee" ? "Employee" : "Company",
        `${member.testResults?.length || 0}/3`,
        member.burnoutScore?.toString() || "N/A",
        member.burnoutLevel || "Not completed",
        getDominantChannel(channelTest?.scores) || "Not completed",
        (preferenceTest?.scores as any)?.archetype || "Not completed"
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${groupName.toLowerCase().replace(/\s+/g, "-")}-test-results.csv`;
    link.click();
    toast.success("CSV exported successfully");
  };

  const handleResetProgress = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to reset all test progress for ${memberName}? This action cannot be undone.`)) {
      return;
    }

    try {
      toast.success(`Progress reset for ${memberName}`);
    } catch (error) {
      console.error("Error resetting progress:", error);
      toast.error("Failed to reset progress");
    }
  };

  const handleViewDashboard = (member: GroupMember, type: "employee" | "company") => {
    navigate(`/meloria-admin/view-dashboard/${member.id}/${type}`);
  };

  const copyInviteUrl = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite URL copied to clipboard");
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => parentGroupId 
          ? navigate(`/meloria-admin/company-groups/${parentGroupId}`)
          : navigate("/meloria-admin/company-groups")
        }
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {parentGroupId ? "Back to Parent Group" : "Back to Groups"}
      </Button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{groupName}</h1>
          <p className="text-muted-foreground">
            {members.length} members{subgroups.length > 0 ? ` • ${subgroups.length} department${subgroups.length !== 1 ? 's' : ''}` : ''}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          
          {!parentGroupId && (
            <Button 
              variant="outline"
              onClick={() => navigate(`/meloria-admin/company-groups/create?parent=${id}`)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          )}
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Share2 className="mr-2 h-4 w-4" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Members</DialogTitle>
                <DialogDescription>
                  Share this link or QR code with new members
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
                  />
                  <Button size="sm" onClick={copyInviteUrl}>
                    Copy
                  </Button>
                </div>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <QRCodeSVG value={inviteUrl} size={200} />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs for Departments and Members */}
      {subgroups.length > 0 || !parentGroupId ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members ({members.length})
            </TabsTrigger>
            {!parentGroupId && (
              <TabsTrigger value="departments" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Departments ({subgroups.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="departments" className="mt-6">
            {subgroups.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No departments created yet</p>
                <Button onClick={() => navigate(`/meloria-admin/company-groups/create?parent=${id}`)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Department
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subgroups.map((subgroup) => (
                  <Card
                    key={subgroup.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/meloria-admin/company-groups/${subgroup.id}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold">{subgroup.name}</h3>
                      <Badge variant={subgroup.service_type === "premium" ? "default" : "secondary"}>
                        {subgroup.service_type === "premium" ? "Premium" : "Free"}
                      </Badge>
                    </div>
                    {subgroup.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {subgroup.description}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="text-muted-foreground">Members:</span>{" "}
                      <span className="font-medium">{subgroup.member_count}</span>
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="members" className="mt-6">

      {/* Filter Section */}
      <div className="flex items-center gap-3 mb-6">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filter} onValueChange={(value: FilterOption) => setFilter(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by completion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="completed">All Tests Completed</SelectItem>
            <SelectItem value="partial">Partially Completed</SelectItem>
            <SelectItem value="none">No Tests Completed</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          Showing {filteredMembers.length} of {members.length} members
        </span>
      </div>

      <div className="space-y-4">
        {filteredMembers.map((member) => {
          const channelTest = member.testResults?.find(t => t.test_type === "perception");
          const preferenceTest = member.testResults?.find(t => t.test_type === "preference");
          const testsCompleted = member.testResults?.length || 0;
          const dominantChannel = getDominantChannel(channelTest?.scores);

          return (
            <Card key={member.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {member.name} {member.surname}
                    </h3>
                    <Badge variant="outline">
                      {member.access_rights === "employee" ? "Employee" : "Company"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{member.email}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {member.burnoutLevel ? (
                      <Badge variant={getBurnoutBadgeVariant(member.burnoutScore || 0)}>
                        Burnout: {member.burnoutLevel} ({member.burnoutScore}/132)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Burnout: Not completed
                      </Badge>
                    )}
                    
                    {dominantChannel ? (
                      <Badge variant="secondary">
                        Channel: {dominantChannel}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Channel: Not completed
                      </Badge>
                    )}
                    
                    {preferenceTest ? (
                      <Badge variant="secondary">
                        Preference: {(preferenceTest.scores as any)?.archetype || "Completed"}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Preference: Not completed
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    Tests completed: {testsCompleted}/3
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDashboard(member, member.access_rights === "employee" ? "employee" : "company")}
                  >
                    View Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResetProgress(member.id, `${member.name} ${member.surname}`)}
                    title="Reset test progress"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
          </TabsContent>
        </Tabs>
      ) : (
        <>
          {/* Filter Section for subgroups without tabs */}
          <div className="flex items-center gap-3 mb-6">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={(value: FilterOption) => setFilter(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by completion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="completed">All Tests Completed</SelectItem>
                <SelectItem value="partial">Partially Completed</SelectItem>
                <SelectItem value="none">No Tests Completed</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              Showing {filteredMembers.length} of {members.length} members
            </span>
          </div>

          <div className="space-y-4">
            {filteredMembers.map((member) => {
              const channelTest = member.testResults?.find(t => t.test_type === "perception");
              const preferenceTest = member.testResults?.find(t => t.test_type === "preference");
              const testsCompleted = member.testResults?.length || 0;
              const dominantChannel = getDominantChannel(channelTest?.scores);

              return (
                <Card key={member.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {member.name} {member.surname}
                        </h3>
                        <Badge variant="outline">
                          {member.access_rights === "employee" ? "Employee" : "Company"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{member.email}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {member.burnoutLevel ? (
                          <Badge variant={getBurnoutBadgeVariant(member.burnoutScore || 0)}>
                            Burnout: {member.burnoutLevel} ({member.burnoutScore}/132)
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Burnout: Not completed
                          </Badge>
                        )}
                        
                        {dominantChannel ? (
                          <Badge variant="secondary">
                            Channel: {dominantChannel}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Channel: Not completed
                          </Badge>
                        )}
                        
                        {preferenceTest ? (
                          <Badge variant="secondary">
                            Preference: {(preferenceTest.scores as any)?.archetype || "Completed"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Preference: Not completed
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        Tests completed: {testsCompleted}/3
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDashboard(member, member.access_rights === "employee" ? "employee" : "company")}
                      >
                        View Dashboard
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResetProgress(member.id, `${member.name} ${member.surname}`)}
                        title="Reset test progress"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default CompanyGroupDetail;
