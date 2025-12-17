import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const Questionnaires = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-2">{t('meloriaDashboard.questionnaires.title')}</h1>
      <p className="text-muted-foreground mb-8">{t('meloriaDashboard.questionnaires.subtitle')}</p>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">{t('meloriaDashboard.questionnaires.burnout.title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('meloriaDashboard.questionnaires.burnout.description')}
          </p>
          <Button onClick={() => navigate("/meloria-admin/questionnaires/burnout")}>
            {t('meloriaDashboard.questionnaires.editQuestionnaire')}
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">{t('meloriaDashboard.questionnaires.perception.title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('meloriaDashboard.questionnaires.perception.description')}
          </p>
          <Button onClick={() => navigate("/meloria-admin/questionnaires/perception")}>
            {t('meloriaDashboard.questionnaires.editQuestionnaire')}
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">{t('meloriaDashboard.questionnaires.preference.title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('meloriaDashboard.questionnaires.preference.description')}
          </p>
          <Button onClick={() => navigate("/meloria-admin/questionnaires/preference")}>
            {t('meloriaDashboard.questionnaires.editQuestionnaire')}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Questionnaires;
