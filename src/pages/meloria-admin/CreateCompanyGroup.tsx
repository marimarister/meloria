import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface GroupMember {
  name: string;
  surname: string;
  email: string;
  access_rights: "employee" | "company";
}

const CreateCompanyGroup = () => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [serviceType, setServiceType] = useState<"free" | "premium">("free");
  const [uploadedMembers, setUploadedMembers] = useState<GroupMember[]>([]);
  const [creating, setCreating] = useState(false);

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
      const { data: group, error: groupError } = await supabase
        .from("company_groups" as any)
        .insert({
          name: groupName.trim(),
          description: groupDescription.trim() || null,
          service_type: serviceType
        })
        .select()
        .single();

      if (groupError) throw groupError;

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
      navigate("/meloria-admin/company-groups");
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group: " + error.message);
    } finally {
      setCreating(false);
    }
  };

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

      <h1 className="text-4xl font-bold mb-8">Create Company Group</h1>

      <Card className="p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <Label htmlFor="groupName">Group Name *</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>

          <div>
            <Label htmlFor="serviceType">Service Type *</Label>
            <Select value={serviceType} onValueChange={(value: "free" | "premium") => setServiceType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="groupDescription">Overview</Label>
            <Textarea
              id="groupDescription"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Enter a brief description of this group"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="fileUpload">Upload Members (CSV/Excel) *</Label>
            <Input
              id="fileUpload"
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
    </div>
  );
};

export default CreateCompanyGroup;
