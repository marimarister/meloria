import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import NavBar from "@/components/NavBar";

interface GroupMember {
  name: string;
  surname: string;
  email: string;
  access_rights: "employee" | "company";
}

interface CompanyGroup {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count?: number;
}

const MeloriaDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [uploadedMembers, setUploadedMembers] = useState<GroupMember[]>([]);
  const [groups, setGroups] = useState<CompanyGroup[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    checkAuthorization();
    fetchGroups();
  }, []);

  const checkAuthorization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("meloria_admins" as any)
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) {
        toast.error("Access denied. You don't have permission to view this page.");
        navigate("/");
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error("Authorization check failed:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from("company_groups" as any)
      .select(`
        id,
        name,
        description,
        created_at,
        group_members (count)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching groups:", error);
      return;
    }

    const groupsWithCounts = (data as any[]).map((group: any) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      created_at: group.created_at,
      member_count: group.group_members?.[0]?.count || 0
    }));

    setGroups(groupsWithCounts);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileExtension === "csv") {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          processUploadedData(results.data);
        },
        error: (error) => {
          toast.error("Error parsing CSV file: " + error.message);
        }
      });
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          processUploadedData(jsonData);
        } catch (error) {
          toast.error("Error parsing Excel file");
        }
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error("Please upload a CSV or Excel file");
    }
  };

  const processUploadedData = (data: any[]) => {
    const members: GroupMember[] = [];
    
    data.forEach((row: any) => {
      const name = row.Name || row.name;
      const surname = row.Surname || row.surname;
      const email = row.Email || row.email;
      const accessRights = (row["Access rights"] || row["access rights"] || row.access_rights || "").toLowerCase();

      if (name && surname && email && (accessRights === "employee" || accessRights === "company")) {
        members.push({
          name: name.trim(),
          surname: surname.trim(),
          email: email.trim().toLowerCase(),
          access_rights: accessRights as "employee" | "company"
        });
      }
    });

    if (members.length === 0) {
      toast.error("No valid members found in file. Please check the format.");
      return;
    }

    setUploadedMembers(members);
    toast.success(`${members.length} members loaded from file`);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (uploadedMembers.length === 0) {
      toast.error("Please upload a file with members");
      return;
    }

    setCreating(true);

    try {
      // Create the group
      const { data: group, error: groupError } = await supabase
        .from("company_groups" as any)
        .insert({
          name: groupName.trim(),
          description: groupDescription.trim() || null
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Insert all members
      const membersToInsert = uploadedMembers.map(member => ({
        group_id: (group as any).id,
        name: member.name,
        surname: member.surname,
        email: member.email,
        access_rights: member.access_rights
      }));

      const { error: membersError } = await supabase
        .from("group_members" as any)
        .insert(membersToInsert);

      if (membersError) throw membersError;

      toast.success(`Group "${groupName}" created with ${uploadedMembers.length} members`);
      
      // Reset form
      setGroupName("");
      setGroupDescription("");
      setUploadedMembers([]);
      
      // Refresh groups list
      fetchGroups();
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group: " + error.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold mb-2">Meloria Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage company groups and member access</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Group Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Create Company Group</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Group Name *</label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Overview</label>
                <Textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Enter a brief description of this group"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Upload Members (CSV/Excel) *</label>
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required columns: Name, Surname, Email, Access rights (Employee/Company)
                </p>
              </div>

              {uploadedMembers.length > 0 && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">
                    {uploadedMembers.length} member{uploadedMembers.length !== 1 ? "s" : ""} ready to add
                  </p>
                </div>
              )}

              <Button
                onClick={handleCreateGroup}
                disabled={creating}
                className="w-full"
              >
                {creating ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </Card>

          {/* Existing Groups Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Existing Groups</h2>
            
            {groups.length === 0 ? (
              <p className="text-muted-foreground">No groups created yet</p>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <h3 className="font-semibold">{group.name}</h3>
                    {group.description && (
                      <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {group.member_count} member{group.member_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MeloriaDashboard;
