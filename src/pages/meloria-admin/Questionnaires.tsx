import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Questionnaires = () => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-2">Questionnaires</h1>
      <p className="text-muted-foreground mb-8">Manage and edit assessment questionnaires</p>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Burnout Test</h2>
          <p className="text-muted-foreground mb-4">
            Maslach Burnout Inventory - 22 items measuring emotional exhaustion, 
            depersonalization, and personal accomplishment
          </p>
          <Button>Edit Questionnaire</Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Channel Perception Test</h2>
          <p className="text-muted-foreground mb-4">
            VAK+D assessment - 10 items to determine learning and communication preferences
          </p>
          <Button>Edit Questionnaire</Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Work Preferences & Motivation Test</h2>
          <p className="text-muted-foreground mb-4">
            8 questions across 4 sections mapping to eight personality archetypes
          </p>
          <Button>Edit Questionnaire</Button>
        </Card>
      </div>
    </div>
  );
};

export default Questionnaires;
