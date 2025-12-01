import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const PremiumPlans = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-2">Premium Plans</h1>
      <p className="text-muted-foreground mb-8">Create and manage subscription plans</p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Free Plan</h2>
            <p className="text-3xl font-bold mb-4">$0<span className="text-lg font-normal text-muted-foreground">/month</span></p>
            <p className="text-muted-foreground mb-4">
              Basic access to wellness assessments
            </p>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">All 3 assessments</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">Up to 10 users</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">Basic reporting</span>
            </div>
          </div>
          
          <Button variant="outline" onClick={() => navigate("/meloria-admin/premium-plans/free")}>
            Edit Plan
          </Button>
        </Card>

        <Card className="p-6 border-primary">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Premium Plan</h2>
            <p className="text-3xl font-bold mb-4">$99<span className="text-lg font-normal text-muted-foreground">/month</span></p>
            <p className="text-muted-foreground mb-4">
              Full access with advanced features
            </p>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">All 3 assessments</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">Unlimited users</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">Advanced analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">Priority support</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">Custom branding</span>
            </div>
          </div>
          
          <Button onClick={() => navigate("/meloria-admin/premium-plans/premium")}>
            Edit Plan
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default PremiumPlans;
