import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Palette, Brain, Activity, Flower2, Music, Mountain } from "lucide-react";

const Catalog = () => {
  const offerings = [
    {
      category: "Team Diagnostics & Assessments",
      icon: Users,
      description: "We evaluate communication patterns, energetic compatibility, stress factors and development zones to create a precise, effective program.",
      highlight: "Measurable results throughout the program",
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      category: "One-time Experiences",
      icon: Calendar,
      description: "Workshops, rituals, seminars and creative practices tailored to your team's needs.",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      category: "Short-term Programs (3–6 months)",
      icon: Clock,
      description: "Focused development journeys for stress reduction, emotional balance, leadership growth and team dynamics.",
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      category: "Long-term Programs (1–2 years)",
      icon: Activity,
      description: "Deep, systematic human potential development with measurable impact on wellbeing, collaboration and culture.",
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      category: "Corporate & Private Retreats",
      icon: Mountain,
      description: "One-day, weekend or multi-day retreats — for teams or individuals. Fully curated formats with body, mind, creativity and sensory modules.",
      color: "bg-rose-500/10 text-rose-600",
    },
  ];

  const services = [
    {
      section: "1. Art Therapy for Balance & Abundance",
      items: [
        {
          title: "Mandala Art — Sacred Geometry Practice",
          languages: ["EN", "LV", "RU"],
          purpose: "Relaxation, focus, inner balance, team harmony",
          idealFor: "Evening sessions, creative teambuildings",
          description: "A gentle immersion into color, pattern and presence — a way for teams to ground, reconnect and return to clarity through meditative creation.",
        },
      ],
    },
    {
      section: "2. Psychology, Coaching & Transformational Games",
      items: [
        {
          title: "Vedic Astrology & Numerology: Team Compatibility Session",
          format: "Seminar + individual birth date compatibility overview",
          purpose: "Better collaboration, communication, role understanding",
          duration: "2–3 hours",
          description: "A structured yet intuitive tool to understand personal strengths, natural roles and energetic dynamics within a team.",
        },
        {
          title: "Transformational Games (Various Themes)",
          format: "4–8 participants, game at the table",
          purpose: "Clarifying goals, understanding blocks, activating resources",
          duration: "3-4 hours",
          description: "A soft but powerful method to see where a person is stuck, what they truly want, and the next steps that unlock growth.",
        },
        {
          title: 'Signature Games: "Atlas" & "Dream Alchemy"',
          format: "Deep-work mini-group; Ideal for key talents and high-potential employees",
          description: "Atlas: Stability, responsibility, personal backbone. Dream Alchemy: Vision, desire, goal-setting and manifestation.",
        },
        {
          title: "Executive & Team Coaching Sessions",
          format: "Individual or small-group",
          purpose: "Support during change, burnout prevention, career clarity",
          description: "Practical, human-centered support for teams navigating transitions.",
        },
        {
          title: "Spiral Dynamics Seminar",
          format: "Lecture + applied discussion",
          purpose: "Understanding human and organizational development levels, navigating stress and transitions",
          description: "An accessible introduction to Spiral Dynamics as a practical tool for leadership, management and self-awareness.",
        },
        {
          title: "Business Constellations for Team Clarity",
          format: "Systemic mapping + guided facilitation",
          purpose: "Reveal hidden structures, unblock team processes, conflict resolution",
          description: "A systemic practice based on Bert Hellinger's principles, adapted for corporate dynamics.",
        },
      ],
    },
    {
      section: "3. Creativity",
      items: [
        {
          title: "TeddyBrick Creative Workshop",
          format: "Hands-on creation of a personal character/object",
          purpose: "Stress release, creativity, joy, team bonding",
          description: "A light premium teambuilding that brings back play, inspiration and shared energy.",
        },
      ],
    },
    {
      section: "4. Body, Energy & Rejuvenation Rituals",
      items: [
        {
          title: "Energy Dynamics Practice",
          format: "Active body-based session",
          purpose: "Release tension, regain vitality, reset mental overload",
          description: "A grounding practice that helps restore clarity and strength. For men and mixed groups.",
        },
        {
          title: "Intuitive Dance Practice",
          format: "Guided movement session",
          purpose: "Emotional release, freedom, body awareness",
          description: "Perfect for HR wellbeing days and creative teams.",
        },
        {
          title: "Winter Outdoor Practices",
          format: "Guided outdoor sports activities",
          purpose: "Team spirit, health, switching off routines, fresh energy",
          description: "Ideal for refreshing corporate retreats.",
        },
        {
          title: "Women's Bath Ritual",
          format: "Gentle sauna/steam ceremony",
          purpose: "Relaxation, emotional reset, feminine support",
          description: "A soothing embodied experience for female employees.",
        },
        {
          title: "Men's Bath Ritual",
          format: "Sauna/steam ritual",
          purpose: "Recovery, stress relief, masculine support, nervous system reset",
          description: "A structured and rejuvenating wellness experience.",
        },
        {
          title: "Breathing Practices & Energy Flow",
          format: "Breathing practices + energy techniques",
          purpose: "Energy balance, emotional release, grounded presence",
          description: "A guided session combining conscious breathing techniques with gentle energetic practices and chakra-focused regulation.",
        },
      ],
    },
    {
      section: "5. Aroma & Sensory Practices",
      items: [
        {
          title: "Aromatherapy & Olfactotherapy Journey",
          format: "Seminar + sensory practice",
          purpose: "Emotional regulation, stress reduction, burnout support",
          description: "A refined introduction to working with scent as a tool for wellbeing. As a standalone workshop or part of a retreat.",
        },
      ],
    },
    {
      section: "6. Flowers & Elixirs",
      items: [
        {
          title: "Floral Seminar with Botanical Elixir",
          format: "Lecture + hands-on creation/tasting",
          languages: ["LV", "RU"],
          purpose: "Gentle emotional balance through botanicals, beauty and taste",
          description: "A unique wellbeing activity that brings together aesthetics, nature and emotional clarity.",
        },
      ],
    },
    {
      section: "7. Sound Practices",
      items: [
        {
          title: "Sound Healing Session — 1 hour",
          format: "60-minute sound immersion, Group or individual",
          purpose: "Deep relaxation, nervous system reset",
          description: "A quiet, resonant experience that restores balance and calm. Perfect as a standalone wellbeing session or a closing ritual after an intensive corporate day.",
        },
      ],
    },
    {
      section: "8. Recharge Retreats",
      items: [
        {
          title: "Mini One-Day Retreat",
          format: "All inclusive, zero hassle",
          purpose: "Quick energy boost, team spirit uplift, and fresh inspiration",
          description: "Art therapy, mindfulness, and team-building practices. Leave the office in the morning — come back recharged by evening!",
          price: "On request",
        },
        {
          title: "Weekend Retreat (2 days / 1 night)",
          format: "Accommodation and meals included",
          purpose: "Dive deep into mindfulness, creativity, and team connection",
          description: "Immersive program with accommodation and delicious meals. Space to breathe, reflect, and grow together. Return on Monday with fresh ideas and a real sense of unity.",
          price: "On request",
        },
        {
          title: "3–4 Day Deep Recharge Retreat",
          format: "All inclusive",
          purpose: "Reset, refocus, and unlock full potential",
          description: "A powerful journey for teams and leaders. Individual & group practices, diagnostics, personal recommendations. Come back with a new vision, stronger bonds, and lasting energy.",
          price: "Tailored to your team's goals",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Our Catalog
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Corporate Wellbeing & Human Potential — Curated practices designed for companies that value clarity, depth and sustainable human potential.
          </p>
        </section>

        {/* What We Offer Overview */}
        <section className="mb-20">
          <h2 className="text-3xl font-serif font-bold text-foreground text-center mb-12">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offerings.map((offering, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${offering.color}`}>
                    <offering.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg">{offering.category}</CardTitle>
                  {offering.highlight && (
                    <Badge variant="secondary" className="w-fit">{offering.highlight}</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {offering.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Detailed Services */}
        {services.map((section, sectionIndex) => (
          <section key={sectionIndex} className="mb-16">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-8 pb-4 border-b border-border">
              {section.section}
            </h2>
            <div className="grid gap-6">
              {section.items.map((item, itemIndex) => (
                <Card key={itemIndex} className="border-border">
                  <CardHeader>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.format && (
                        <Badge variant="outline" className="text-xs">
                          {item.format}
                        </Badge>
                      )}
                      {item.duration && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.duration}
                        </Badge>
                      )}
                      {item.languages && item.languages.map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                      {item.price && (
                        <Badge className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                          {item.price}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {item.purpose && (
                      <p className="text-sm">
                        <span className="font-medium text-foreground">Purpose: </span>
                        <span className="text-muted-foreground">{item.purpose}</span>
                      </p>
                    )}
                    {item.idealFor && (
                      <p className="text-sm">
                        <span className="font-medium text-foreground">Ideal for: </span>
                        <span className="text-muted-foreground">{item.idealFor}</span>
                      </p>
                    )}
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};

export default Catalog;
