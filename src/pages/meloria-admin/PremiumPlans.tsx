import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PremiumPlans = () => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-2">Premium Plans</h1>
      <p className="text-muted-foreground mb-8">Create and manage subscription plans</p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Free Plan</h2>
          <p className="text-muted-foreground mb-4">
            Basic access to questionnaires and results
          </p>
          <Button variant="outline">Edit Plan</Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Premium Plan</h2>
          <p className="text-muted-foreground mb-4">
            Full access with advanced analytics and features
          </p>
          <Button variant="outline">Edit Plan</Button>
        </Card>
      </div>

      <div className="mt-6">
        <Button>Create New Plan</Button>
      </div>
    </div>
  );
};

export default PremiumPlans;
