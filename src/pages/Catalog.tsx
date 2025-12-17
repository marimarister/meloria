import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FlipCard from "@/components/FlipCard";
import { Calendar, Clock, Users, Palette, Brain, Activity, Flower2, Music, Mountain, Heart, Sparkles, TreeDeciduous } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Catalog images
import sacredGeometryImg from "@/assets/catalog/sacred-geometry-art-practice.jpg";
import mandalaArtImg from "@/assets/catalog/mandala-art.jpg";
import vedicAstrologyImg from "@/assets/catalog/vedic-astrology.jpg";
import executiveCoachingImg from "@/assets/catalog/executive-coaching.jpg";
import spiralDynamicsImg from "@/assets/catalog/spiral-dynamics-seminar.png";
import businessConstellationsImg from "@/assets/catalog/business-constellations.jpg";
import aromatherapyImg from "@/assets/catalog/aromatherapy.jpg";
import floralSeminarImg from "@/assets/catalog/floral-seminar.jpg";
import soundHealingImg from "@/assets/catalog/sound-healing.jpg";
import miniRetreatImg from "@/assets/catalog/mini-retreat.jpg";
import energyDynamicsImg from "@/assets/catalog/energy-dynamics.jpeg";
import intuitiveDanceImg from "@/assets/catalog/intuitive-dance.png";
import winterOutdoorImg from "@/assets/catalog/winter-outdoor.jpeg";
import weekendRetreatImg from "@/assets/catalog/weekend-retreat.jpg";
import deepRechargeImg from "@/assets/catalog/deep-recharge-retreat.jpg";
import womensBathImg from "@/assets/catalog/womens-bath.jpg";
import mensBathImg from "@/assets/catalog/mens-bath.jpg";
import signatureGamesImg from "@/assets/catalog/signature-games.jpg";
import breathingPracticesImg from "@/assets/catalog/breathing-practices.jpg";
import teddybrickImg from "@/assets/catalog/teddybrick.jpg";
import transformationalGamesImg from "@/assets/catalog/transformational-games.jpg";

const Catalog = () => {
  const { t } = useLanguage();
  
  const offerings = [
    {
      category: t('catalog.offerings.teamDiagnostics'),
      icon: Users,
      description: t('catalog.offerings.teamDiagnosticsDesc'),
      highlight: t('catalog.offerings.teamDiagnosticsHighlight'),
    },
    {
      category: t('catalog.offerings.oneTimeExperiences'),
      icon: Calendar,
      description: t('catalog.offerings.oneTimeExperiencesDesc'),
    },
    {
      category: t('catalog.offerings.shortTermPrograms'),
      subtitle: t('catalog.offerings.shortTermProgramsSubtitle'),
      icon: Clock,
      description: t('catalog.offerings.shortTermProgramsDesc'),
    },
    {
      category: t('catalog.offerings.longTermPrograms'),
      subtitle: t('catalog.offerings.longTermProgramsSubtitle'),
      icon: Activity,
      description: t('catalog.offerings.longTermProgramsDesc'),
    },
    {
      category: t('catalog.offerings.corporateRetreats'),
      icon: Mountain,
      description: t('catalog.offerings.corporateRetreatsDesc'),
    },
  ];

  const services = [
    {
      section: t('catalog.sections.artTherapy'),
      icon: Palette,
      gradient: "from-rose-100 via-pink-50 to-purple-100",
      items: [
        {
          title: t('catalog.services.sacredGeometry.title'),
          languages: ["EN", "LV", "RU"],
          purpose: t('catalog.services.sacredGeometry.purpose'),
          idealFor: t('catalog.services.sacredGeometry.idealFor'),
          description: t('catalog.services.sacredGeometry.description'),
          image: sacredGeometryImg,
        },
        {
          title: t('catalog.services.mandalaArt.title'),
          languages: ["EN", "LV", "RU"],
          purpose: t('catalog.services.mandalaArt.purpose'),
          idealFor: t('catalog.services.mandalaArt.idealFor'),
          description: t('catalog.services.mandalaArt.description'),
          image: mandalaArtImg,
        },
      ],
    },
    {
      section: t('catalog.sections.psychologyCoaching'),
      icon: Brain,
      gradient: "from-teal-50 via-emerald-50 to-cyan-100",
      items: [
        {
          title: t('catalog.services.vedicAstrology.title'),
          format: t('catalog.services.vedicAstrology.format'),
          purpose: t('catalog.services.vedicAstrology.purpose'),
          duration: t('catalog.services.vedicAstrology.duration'),
          description: t('catalog.services.vedicAstrology.description'),
          image: vedicAstrologyImg,
        },
        {
          title: t('catalog.services.transformationalGames.title'),
          format: t('catalog.services.transformationalGames.format'),
          purpose: t('catalog.services.transformationalGames.purpose'),
          duration: t('catalog.services.transformationalGames.duration'),
          description: t('catalog.services.transformationalGames.description'),
          image: transformationalGamesImg,
        },
        {
          title: t('catalog.services.signatureGames.title'),
          format: t('catalog.services.signatureGames.format'),
          description: t('catalog.services.signatureGames.description'),
          image: signatureGamesImg,
        },
        {
          title: t('catalog.services.executiveCoaching.title'),
          format: t('catalog.services.executiveCoaching.format'),
          purpose: t('catalog.services.executiveCoaching.purpose'),
          description: t('catalog.services.executiveCoaching.description'),
          image: executiveCoachingImg,
        },
        {
          title: t('catalog.services.spiralDynamics.title'),
          format: t('catalog.services.spiralDynamics.format'),
          purpose: t('catalog.services.spiralDynamics.purpose'),
          description: t('catalog.services.spiralDynamics.description'),
          image: spiralDynamicsImg,
        },
        {
          title: t('catalog.services.businessConstellations.title'),
          format: t('catalog.services.businessConstellations.format'),
          purpose: t('catalog.services.businessConstellations.purpose'),
          description: t('catalog.services.businessConstellations.description'),
          image: businessConstellationsImg,
        },
      ],
    },
    {
      section: t('catalog.sections.creativity'),
      icon: Sparkles,
      gradient: "from-amber-50 via-yellow-50 to-orange-100",
      items: [
        {
          title: t('catalog.services.teddybrick.title'),
          format: t('catalog.services.teddybrick.format'),
          purpose: t('catalog.services.teddybrick.purpose'),
          description: t('catalog.services.teddybrick.description'),
          image: teddybrickImg,
        },
      ],
    },
    {
      section: t('catalog.sections.bodyEnergy'),
      icon: Activity,
      gradient: "from-violet-100 via-purple-50 to-fuchsia-100",
      items: [
        {
          title: t('catalog.services.energyDynamics.title'),
          format: t('catalog.services.energyDynamics.format'),
          purpose: t('catalog.services.energyDynamics.purpose'),
          description: t('catalog.services.energyDynamics.description'),
          image: energyDynamicsImg,
        },
        {
          title: t('catalog.services.intuitiveDance.title'),
          format: t('catalog.services.intuitiveDance.format'),
          purpose: t('catalog.services.intuitiveDance.purpose'),
          description: t('catalog.services.intuitiveDance.description'),
          image: intuitiveDanceImg,
        },
        {
          title: t('catalog.services.winterOutdoor.title'),
          format: t('catalog.services.winterOutdoor.format'),
          purpose: t('catalog.services.winterOutdoor.purpose'),
          description: t('catalog.services.winterOutdoor.description'),
          image: winterOutdoorImg,
        },
        {
          title: t('catalog.services.womensBath.title'),
          format: t('catalog.services.womensBath.format'),
          purpose: t('catalog.services.womensBath.purpose'),
          description: t('catalog.services.womensBath.description'),
          image: womensBathImg,
        },
        {
          title: t('catalog.services.mensBath.title'),
          format: t('catalog.services.mensBath.format'),
          purpose: t('catalog.services.mensBath.purpose'),
          description: t('catalog.services.mensBath.description'),
          image: mensBathImg,
        },
        {
          title: t('catalog.services.breathingPractices.title'),
          format: t('catalog.services.breathingPractices.format'),
          purpose: t('catalog.services.breathingPractices.purpose'),
          description: t('catalog.services.breathingPractices.description'),
          image: breathingPracticesImg,
        },
      ],
    },
    {
      section: t('catalog.sections.aromaSensory'),
      icon: Flower2,
      gradient: "from-pink-100 via-rose-50 to-red-100",
      items: [
        {
          title: t('catalog.services.aromatherapy.title'),
          format: t('catalog.services.aromatherapy.format'),
          purpose: t('catalog.services.aromatherapy.purpose'),
          description: t('catalog.services.aromatherapy.description'),
          image: aromatherapyImg,
        },
      ],
    },
    {
      section: t('catalog.sections.flowersElixirs'),
      icon: TreeDeciduous,
      gradient: "from-lime-50 via-green-50 to-emerald-100",
      items: [
        {
          title: t('catalog.services.floralSeminar.title'),
          format: t('catalog.services.floralSeminar.format'),
          languages: ["LV", "RU"],
          purpose: t('catalog.services.floralSeminar.purpose'),
          description: t('catalog.services.floralSeminar.description'),
          image: floralSeminarImg,
        },
      ],
    },
    {
      section: t('catalog.sections.soundPractices'),
      icon: Music,
      gradient: "from-sky-100 via-blue-50 to-indigo-100",
      items: [
        {
          title: t('catalog.services.soundHealing.title'),
          format: t('catalog.services.soundHealing.format'),
          purpose: t('catalog.services.soundHealing.purpose'),
          description: t('catalog.services.soundHealing.description'),
          image: soundHealingImg,
        },
      ],
    },
    {
      section: t('catalog.sections.rechargeRetreats'),
      icon: Mountain,
      gradient: "from-teal-100 via-cyan-50 to-sky-100",
      items: [
        {
          title: t('catalog.services.miniRetreat.title'),
          format: t('catalog.services.miniRetreat.format'),
          purpose: t('catalog.services.miniRetreat.purpose'),
          description: t('catalog.services.miniRetreat.description'),
          price: t('catalog.onRequest'),
          image: miniRetreatImg,
        },
        {
          title: t('catalog.services.weekendRetreat.title'),
          format: t('catalog.services.weekendRetreat.format'),
          purpose: t('catalog.services.weekendRetreat.purpose'),
          description: t('catalog.services.weekendRetreat.description'),
          price: t('catalog.onRequest'),
          image: weekendRetreatImg,
        },
        {
          title: t('catalog.services.deepRechargeRetreat.title'),
          format: t('catalog.services.deepRechargeRetreat.format'),
          purpose: t('catalog.services.deepRechargeRetreat.purpose'),
          description: t('catalog.services.deepRechargeRetreat.description'),
          price: t('catalog.services.deepRechargeRetreat.price'),
          image: deepRechargeImg,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-100 to-indigo-200 opacity-60" />
        <div className="absolute top-10 right-10 w-32 h-32 bg-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-6 py-20 text-center">
          <p className="text-sm tracking-[0.3em] text-teal-700 font-medium mb-4 uppercase">
            {t('catalog.mindfulnessPlatform')}
          </p>
          <h1 className="text-5xl md:text-6xl font-serif italic text-teal-800 mb-4">
            Meloria
          </h1>
          <h2 className="text-3xl md:text-4xl font-serif text-purple-700 mb-6">
            {t('catalog.corporateWellbeing')}<br />{t('catalog.humanPotential')}
          </h2>
          <p className="text-2xl font-serif text-teal-700 mb-8">{t('catalog.catalogueTitle')}</p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('catalog.catalogueSubtitle')}
          </p>
        </div>
      </section>

      <main className="container mx-auto px-6 py-16">
        {/* What We Offer Overview */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-6">
              <Heart className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-teal-700 mb-4">
              {t('catalog.whatWeOffer')}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {offerings.map((offering, index) => (
              <Card 
                key={index}
                className="border-0 bg-gradient-to-b from-white to-purple-50/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 mx-auto mb-4 bg-teal-100/80 rounded-xl flex items-center justify-center group-hover:bg-teal-200/80 transition-colors">
                    <offering.icon className="w-8 h-8 text-teal-600" />
                  </div>
                  <CardTitle className="text-base font-semibold text-teal-800 leading-tight">
                    {offering.category}
                  </CardTitle>
                  {offering.subtitle && (
                    <p className="text-sm text-muted-foreground">{offering.subtitle}</p>
                  )}
                  {offering.highlight && (
                    <Badge className="mt-2 bg-teal-100 text-teal-700 hover:bg-teal-200 border-0">
                      {offering.highlight}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs leading-relaxed text-center">
                    {offering.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quote Section */}
        <section className="mb-24 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-100/50 via-transparent to-purple-100/50 rounded-3xl" />
          <div className="relative bg-gradient-to-br from-teal-50 to-purple-50 rounded-3xl p-12 md:p-16 text-center">
            <TreeDeciduous className="w-12 h-12 text-teal-600 mx-auto mb-6" />
            <blockquote className="text-xl md:text-2xl font-serif text-teal-800 leading-relaxed mb-4">
              {t('catalog.quoteText')}
            </blockquote>
            <p className="text-lg text-purple-700 font-medium">
              {t('catalog.quoteSubtext1')}<br />
              {t('catalog.quoteSubtext2')}
            </p>
          </div>
        </section>

        {/* Detailed Services */}
        {services.map((section, sectionIndex) => (
          <section key={sectionIndex} className="mb-16">
            <div className={`bg-gradient-to-r ${section.gradient} rounded-2xl p-8 md:p-10 mb-6`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center shadow-sm">
                  <section.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h2 className="text-xl md:text-2xl font-serif text-teal-800">
                  {section.section}
                </h2>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item, itemIndex) => (
                <FlipCard
                  key={itemIndex}
                  title={item.title}
                  description={item.description}
                  purpose={item.purpose}
                  format={item.format}
                  duration={item.duration}
                  languages={item.languages}
                  price={item.price}
                  idealFor={item.idealFor}
                  image={item.image}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Final CTA */}
        <section className="mt-24 mb-8">
          <div className="bg-gradient-to-br from-pink-200 via-purple-100 to-teal-100 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-serif text-teal-800 mb-4">
                {t('catalog.ctaTitle')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                {t('catalog.ctaSubtitle')}
              </p>
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-8 py-4 bg-teal-600 text-white rounded-full font-medium hover:bg-teal-700 transition-colors shadow-lg hover:shadow-xl"
              >
                {t('catalog.ctaButton')}
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Catalog;