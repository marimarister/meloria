import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Shield, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const plans = [
  {
    name: "Basic",
    price: 150,
    slots: ["core"],
    icons: [Star],
    editPath: "/meloria-admin/premium-plans/basic",
  },
  {
    name: "Standard",
    price: 300,
    slots: ["core", "support"],
    icons: [Star, Shield],
    editPath: "/meloria-admin/premium-plans/standard",
    highlighted: true,
  },
  {
    name: "Premium",
    price: 450,
    slots: ["core", "support", "optional"],
    icons: [Star, Shield, Sparkles],
    editPath: "/meloria-admin/premium-plans/premium",
  },
];

const PremiumPlans = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-2">{t('meloria.premiumPlansTitle')}</h1>
      <p className="text-muted-foreground mb-8">{t('meloria.premiumPlansDescription')}</p>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`p-6 ${plan.highlighted ? 'border-primary ring-1 ring-primary/20' : ''}`}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">{plan.name}</h2>
              <p className="text-3xl font-bold mb-1">
                €{plan.price}
                <span className="text-lg font-normal text-muted-foreground">/{t('common.month')}/person</span>
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">Included activities:</p>
              {plan.slots.map((slot) => {
                const SlotIcon = slot === 'core' ? Star : slot === 'support' ? Shield : Sparkles;
                return (
                  <div key={slot} className="flex items-center gap-2">
                    <SlotIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm capitalize">{t(`marketplace.slot.${slot}`)}</span>
                  </div>
                );
              })}
            </div>

            <Button
              variant={plan.highlighted ? "default" : "outline"}
              onClick={() => navigate(plan.editPath)}
            >
              {t('meloria.editPlan')}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PremiumPlans;
