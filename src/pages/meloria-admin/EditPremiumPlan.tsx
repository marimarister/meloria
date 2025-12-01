import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface PlanFeature {
  id: string;
  name: string;
  enabled: boolean;
}

const defaultFeatures: PlanFeature[] = [
  { id: "burnout-test", name: "Burnout Test", enabled: true },
  { id: "perception-test", name: "Channel Perception Test", enabled: true },
  { id: "preference-test", name: "Work Preferences Test", enabled: true },
  { id: "analytics", name: "Advanced Analytics", enabled: false },
  { id: "team-reports", name: "Team Reports", enabled: false },
  { id: "custom-branding", name: "Custom Branding", enabled: false },
  { id: "priority-support", name: "Priority Support", enabled: false },
  { id: "export-data", name: "Export Data", enabled: false },
];

const EditPremiumPlan = () => {
  const { planType } = useParams<{ planType: string }>();
  const navigate = useNavigate();
  
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [yearlyPrice, setYearlyPrice] = useState("");
  const [maxUsers, setMaxUsers] = useState("");
  const [features, setFeatures] = useState<PlanFeature[]>(defaultFeatures);

  useEffect(() => {
    if (planType === "free") {
      setPlanName("Free Plan");
      setPlanDescription("Basic access to wellness assessments");
      setMonthlyPrice("0");
      setYearlyPrice("0");
      setMaxUsers("10");
      setFeatures(defaultFeatures.map(f => 
        f.id.includes("test") ? { ...f, enabled: true } : { ...f, enabled: false }
      ));
    } else if (planType === "premium") {
      setPlanName("Premium Plan");
      setPlanDescription("Full access with advanced features");
      setMonthlyPrice("99");
      setYearlyPrice("999");
      setMaxUsers("unlimited");
      setFeatures(defaultFeatures.map(f => ({ ...f, enabled: true })));
    }
  }, [planType]);

  const toggleFeature = (featureId: string) => {
    setFeatures(features.map(f => 
      f.id === featureId ? { ...f, enabled: !f.enabled } : f
    ));
  };

  const handleSave = () => {
    // TODO: Save to database
    toast.success("Plan updated successfully");
    navigate("/meloria-admin/premium-plans");
  };

  return (
    <div className="p-8 max-w-4xl">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/meloria-admin/premium-plans")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Plans
      </Button>

      <h1 className="text-4xl font-bold mb-8">Edit {planType === "free" ? "Free" : "Premium"} Plan</h1>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Plan Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="planName">Plan Name</Label>
              <Input
                id="planName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Enter plan name"
              />
            </div>

            <div>
              <Label htmlFor="planDescription">Description</Label>
              <Textarea
                id="planDescription"
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                placeholder="Enter plan description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(e.target.value)}
                  placeholder="0"
                  disabled={planType === "free"}
                />
              </div>
              <div>
                <Label htmlFor="yearlyPrice">Yearly Price ($)</Label>
                <Input
                  id="yearlyPrice"
                  type="number"
                  value={yearlyPrice}
                  onChange={(e) => setYearlyPrice(e.target.value)}
                  placeholder="0"
                  disabled={planType === "free"}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="maxUsers">Maximum Users</Label>
              <Input
                id="maxUsers"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                placeholder="10 or 'unlimited'"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Features</h2>
          <div className="space-y-4">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between py-2">
                <Label htmlFor={feature.id} className="cursor-pointer">
                  {feature.name}
                </Label>
                <Switch
                  id={feature.id}
                  checked={feature.enabled}
                  onCheckedChange={() => toggleFeature(feature.id)}
                />
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleSave}>Save Changes</Button>
          <Button variant="outline" onClick={() => navigate("/meloria-admin/premium-plans")}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditPremiumPlan;
