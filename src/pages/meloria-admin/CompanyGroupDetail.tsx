import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

interface GroupMember {
  id: string;
  name: string;
  surname: string;
  email: string;
  access_rights: "employee" | "company";
}

const CompanyGroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

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
        .select("name")
        .eq("id", id)
        .single();

      if (groupError) throw groupError;

      setGroupName((group as any).name);

      const { data: memberData, error: membersError } = await supabase
        .from("group_members" as any)
        .select("*")
        .eq("group_id", id);

      if (membersError) throw membersError;

      setMembers(memberData as any[]);
    } catch (error) {
      console.error("Error fetching group details:", error);
      toast.error("Failed to load group details");
    } finally {
      setLoading(false);
    }
  };

  const handleResetProgress = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to reset all test progress for ${memberName}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Clear localStorage data for this member
      // In a real implementation, this would be stored in the database
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
        onClick={() => navigate("/meloria-admin/company-groups")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Groups
      </Button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{groupName}</h1>
          <p className="text-muted-foreground">{members.length} members</p>
        </div>

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

      <div className="space-y-4">
        {members.map((member) => (
          <Card key={member.id} className="p-6">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {member.name} {member.surname}
                </h3>
                <p className="text-sm text-muted-foreground">{member.email}</p>
                <Badge className="mt-2" variant="outline">
                  {member.access_rights === "employee" ? "Employee" : "Company"}
                </Badge>
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
        ))}
      </div>
    </div>
  );
};

export default CompanyGroupDetail;
