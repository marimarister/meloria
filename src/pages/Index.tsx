import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, Heart, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-wellness.jpg";
import NavBar from "@/components/NavBar";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <NavBar showBack={false} showProfile={true} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative px-6 py-24 mx-auto max-w-7xl lg:px-8 lg:py-32">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="text-5xl font-bold tracking-tight lg:text-7xl text-foreground mb-6">
              {t('index.heroTitle1')}<br />
              <span className="text-primary">{t('index.heroTitle2')}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              {t('index.heroDescription')}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button 
                size="lg" 
                className="text-lg font-semibold"
                onClick={() => navigate('/employee')}
              >
                {t('index.employeeDashboard')} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg font-semibold"
                onClick={() => navigate('/company')}
              >
                {t('index.companyDashboard')} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('index.featuresTitle')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('index.featuresDescription')}
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">{t('index.forEmployees')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('index.forEmployeesDescription')}
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">{t('index.forCompanyTeams')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('index.forCompanyTeamsDescription')}
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">{t('index.provenMethods')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('index.provenMethodsDescription')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            {t('index.ctaTitle')}
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            {t('index.ctaDescription')}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row justify-center">
            <Button 
              size="lg" 
              className="text-lg font-semibold"
              onClick={() => navigate('/employee')}
            >
              {t('index.startAssessment')}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg font-semibold"
              onClick={() => navigate('/company')}
            >
              {t('index.exploreCompanyFeatures')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
