import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const Questionnaires = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-2">{t('meloria.questionnairesTitle')}</h1>
      <p className="text-muted-foreground mb-8">{t('meloria.questionnairesDescription')}</p>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">{t('tests.burnout.title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('tests.burnout.subtitle')}
          </p>
          <Button onClick={() => navigate("/meloria-admin/questionnaires/burnout")}>
            {t('meloria.editQuestionnaire')}
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">{t('tests.perception.title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('tests.perception.subtitle')}
          </p>
          <Button onClick={() => navigate("/meloria-admin/questionnaires/perception")}>
            {t('meloria.editQuestionnaire')}
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">{t('tests.preference.title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('tests.preference.subtitle')}
          </p>
          <Button onClick={() => navigate("/meloria-admin/questionnaires/preference")}>
            {t('meloria.editQuestionnaire')}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Questionnaires;
