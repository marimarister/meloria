import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const PremiumPlans = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-2">{t('meloria.premiumPlansTitle')}</h1>
      <p className="text-muted-foreground mb-8">{t('meloria.premiumPlansDescription')}</p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">{t('meloria.free')}</h2>
            <p className="text-3xl font-bold mb-4">$0<span className="text-lg font-normal text-muted-foreground">/{t('common.month')}</span></p>
            <p className="text-muted-foreground mb-4">
              {t('company.freePlanDescription')}
            </p>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{t('company.freeFeature1')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{t('company.freeFeature2')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{t('company.freeFeature3')}</span>
            </div>
          </div>
          
          <Button variant="outline" onClick={() => navigate("/meloria-admin/premium-plans/free")}>
            {t('meloria.editPlan')}
          </Button>
        </Card>

        <Card className="p-6 border-primary">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">{t('meloria.premium')}</h2>
            <p className="text-3xl font-bold mb-4">$99<span className="text-lg font-normal text-muted-foreground">/{t('common.month')}</span></p>
            <p className="text-muted-foreground mb-4">
              {t('company.premiumPlanDescription')}
            </p>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{t('company.premiumFeature1')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{t('company.premiumFeature2')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{t('company.premiumFeature3')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{t('company.premiumFeature4')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{t('company.premiumFeature5')}</span>
            </div>
          </div>
          
          <Button onClick={() => navigate("/meloria-admin/premium-plans/premium")}>
            {t('meloria.editPlan')}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default PremiumPlans;
