import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ViewDashboard = () => {
  const { memberId, dashboardType } = useParams<{ memberId: string; dashboardType: "employee" | "company" }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (memberId) {
      fetchMember();
    }
  }, [memberId]);

  const fetchMember = async () => {
    try {
      const { data, error } = await supabase
        .from("group_members" as any)
        .select("*")
        .eq("id", memberId)
        .single();

      if (error) throw error;
      setMember(data);
    } catch (error) {
      console.error("Error fetching member:", error);
      toast.error("Failed to load member details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!member) {
    return <div className="p-8">Member not found</div>;
  }

  return (
    <div className="p-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {member.name} {member.surname}'s {dashboardType === "employee" ? "Employee" : "Company"} Dashboard
        </h1>
        <p className="text-muted-foreground">{member.email}</p>
      </div>

      <div className="bg-muted/50 border-2 border-dashed rounded-lg p-12 text-center">
        <p className="text-muted-foreground mb-4">
          Dashboard view for {member.name} {member.surname}
        </p>
        <p className="text-sm text-muted-foreground">
          This would display the actual {dashboardType} dashboard interface with all test results and data
        </p>
      </div>
    </div>
  );
};

export default ViewDashboard;
