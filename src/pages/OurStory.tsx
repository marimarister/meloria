import NavBar from "@/components/NavBar";
import { Heart, Users, Sparkles, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const OurStory = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            {t('ourStory.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('ourStory.heroDescription')}
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-6">
                {t('ourStory.mindfulnessPlatform')}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t('ourStory.mindfulnessDescription1')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('ourStory.mindfulnessDescription2')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-primary" />
                </div>
                <p className="text-lg font-medium text-foreground">{t('ourStory.corporateWellbeing')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-serif font-bold text-foreground text-center mb-12">
            {t('ourStory.whatWeBelieve')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">{t('ourStory.humanCentered')}</h3>
              <p className="text-muted-foreground">
                {t('ourStory.humanCenteredDescription')}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">{t('ourStory.depthClarity')}</h3>
              <p className="text-muted-foreground">
                {t('ourStory.depthClarityDescription')}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">{t('ourStory.measurableImpact')}</h3>
              <p className="text-muted-foreground">
                {t('ourStory.measurableImpactDescription')}
              </p>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-12 text-center">
          <blockquote className="text-2xl md:text-3xl font-serif text-foreground italic mb-6">
            {t('ourStory.quote')}
          </blockquote>
          <p className="text-muted-foreground font-medium">{t('ourStory.quoteAuthor')}</p>
        </section>
      </main>
    </div>
  );
};

export default OurStory;
