import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FlipCard from "@/components/FlipCard";
import { Calendar, Clock, Users, Palette, Brain, Activity, Flower2, Music, Mountain, Heart, Sparkles, TreeDeciduous } from "lucide-react";

const Catalog = () => {
  const offerings = [
    {
      category: "Team Diagnostics & Assessments",
      icon: Users,
      description: "We evaluate communication patterns, energetic compatibility, stress factors and development zones to create a precise, effective program.",
      highlight: "Measurable results throughout the program",
    },
    {
      category: "One-time Experiences",
      icon: Calendar,
      description: "Workshops, rituals, seminars and creative practices tailored to your team's needs.",
    },
    {
      category: "Short-term Programs",
      subtitle: "(3–6 months)",
      icon: Clock,
      description: "Focused development journeys for stress reduction, emotional balance, leadership growth and team dynamics.",
    },
    {
      category: "Long-term Programs",
      subtitle: "(1–2 years)",
      icon: Activity,
      description: "Deep, systematic human potential development with measurable impact on wellbeing, collaboration and culture.",
    },
    {
      category: "Corporate & Private Retreats",
      icon: Mountain,
      description: "One-day, weekend or multi-day retreats — for teams or individuals. Fully curated formats with body, mind, creativity and sensory modules.",
    },
  ];

  const services = [
    {
      section: "Art Therapy for Balance & Abundance",
      icon: Palette,
      gradient: "from-rose-100 via-pink-50 to-purple-100",
      items: [
        {
          title: "Mandala Art — Sacred Geometry Practice",
          languages: ["EN", "LV", "RU"],
          purpose: "Relaxation, focus, inner balance, team harmony",
          idealFor: "Evening sessions, creative teambuildings",
          description: "A gentle immersion into color, pattern and presence — a way for teams to ground, reconnect and return to clarity through meditative creation.",
          image: "https://meloria.my.canva.site/_assets/media/b5a68647b3ffb54144059ebc7ee2115c.jpg",
        },
      ],
    },
    {
      section: "Psychology, Coaching & Transformational Games",
      icon: Brain,
      gradient: "from-teal-50 via-emerald-50 to-cyan-100",
      items: [
        {
          title: "Vedic Astrology & Numerology: Team Compatibility Session",
          format: "Seminar + individual birth date compatibility overview",
          purpose: "Better collaboration, communication, role understanding",
          duration: "2–3 hours",
          description: "A structured yet intuitive tool to understand personal strengths, natural roles and energetic dynamics within a team.",
          image: "https://meloria.my.canva.site/_assets/media/b6f05da217b9952db72eff1c35ec677c.jpg",
        },
        {
          title: "Transformational Games (Various Themes)",
          format: "4–8 participants, game at the table",
          purpose: "Clarifying goals, understanding blocks, activating resources",
          duration: "3-4 hours",
          description: "A soft but powerful method to see where a person is stuck, what they truly want, and the next steps that unlock growth.",
          image: "https://meloria.my.canva.site/_assets/media/013445fe18c1017ca170c20ceb683a2b.jpg",
        },
        {
          title: 'Signature Games: "Atlas" & "Dream Alchemy"',
          format: "Deep-work mini-group; Ideal for key talents and high-potential employees",
          description: "Atlas: Stability, responsibility, personal backbone. Dream Alchemy: Vision, desire, goal-setting and manifestation.",
          image: "https://meloria.my.canva.site/_assets/media/be8f6c72a87d5ec5f1b37927ecf9ffa1.jpg",
        },
        {
          title: "Executive & Team Coaching Sessions",
          format: "Individual or small-group",
          purpose: "Support during change, burnout prevention, career clarity",
          description: "Practical, human-centered support for teams navigating transitions.",
          image: "https://meloria.my.canva.site/_assets/media/74dcbd844041d19ba222a61b0a8ea602.png",
        },
        {
          title: "Spiral Dynamics Seminar",
          format: "Lecture + applied discussion",
          purpose: "Understanding human and organizational development levels",
          description: "An accessible introduction to Spiral Dynamics as a practical tool for leadership, management and self-awareness.",
          image: "https://meloria.my.canva.site/_assets/media/96cdf170ba89628af129d4a8c10f867b.jpg",
        },
        {
          title: "Business Constellations for Team Clarity",
          format: "Systemic mapping + guided facilitation",
          purpose: "Reveal hidden structures, unblock team processes",
          description: "A systemic practice based on Bert Hellinger's principles, adapted for corporate dynamics.",
          image: "https://meloria.my.canva.site/_assets/media/ec767322d8653cc830a8695be2f434f3.png",
        },
      ],
    },
    {
      section: "Creativity",
      icon: Sparkles,
      gradient: "from-amber-50 via-yellow-50 to-orange-100",
      items: [
        {
          title: "TeddyBrick Creative Workshop",
          format: "Hands-on creation of a personal character/object",
          purpose: "Stress release, creativity, joy, team bonding",
          description: "A light premium teambuilding that brings back play, inspiration and shared energy.",
          image: "https://meloria.my.canva.site/_assets/media/4164f95876f016c5d5db67f833f887d8.jpg",
        },
      ],
    },
    {
      section: "Body, Energy & Rejuvenation Rituals",
      icon: Activity,
      gradient: "from-violet-100 via-purple-50 to-fuchsia-100",
      items: [
        {
          title: "Energy Dynamics Practice",
          format: "Active body-based session",
          purpose: "Release tension, regain vitality, reset mental overload",
          description: "A grounding practice that helps restore clarity and strength. For men and mixed groups.",
          image: "https://meloria.my.canva.site/_assets/media/e65275781597d33ac17c48763a7849d4.jpg",
        },
        {
          title: "Intuitive Dance Practice",
          format: "Guided movement session",
          purpose: "Emotional release, freedom, body awareness",
          description: "Perfect for HR wellbeing days and creative teams.",
          image: "https://meloria.my.canva.site/_assets/media/63c8b80b5a3c93dd249ccb775f3d3fec.jpg",
        },
        {
          title: "Winter Outdoor Practices",
          format: "Guided outdoor sports activities",
          purpose: "Team spirit, health, switching off routines",
          description: "Ideal for refreshing corporate retreats.",
          image: "https://meloria.my.canva.site/_assets/media/e1c82d5201f119193e1e660868771ebf.jpg",
        },
        {
          title: "Women's Bath Ritual",
          format: "Gentle sauna/steam ceremony",
          purpose: "Relaxation, emotional reset, feminine support",
          description: "A soothing embodied experience for female employees.",
          image: "https://meloria.my.canva.site/_assets/media/03f7283b54d54afd7e849ed03826a206.jpg",
        },
        {
          title: "Men's Bath Ritual",
          format: "Sauna/steam ritual",
          purpose: "Recovery, stress relief, nervous system reset",
          description: "A structured and rejuvenating wellness experience.",
          image: "https://meloria.my.canva.site/_assets/media/8a0d9b6b13c9523676febd82cd7061ef.jpg",
        },
        {
          title: "Breathing Practices & Energy Flow",
          format: "Breathing practices + energy techniques",
          purpose: "Energy balance, emotional release, grounded presence",
          description: "A guided session combining conscious breathing techniques with gentle energetic practices.",
          image: "https://meloria.my.canva.site/_assets/media/75a90c347ccc14251debfe76bb1b90b4.jpg",
        },
      ],
    },
    {
      section: "Aroma & Sensory Practices",
      icon: Flower2,
      gradient: "from-pink-100 via-rose-50 to-red-100",
      items: [
        {
          title: "Aromatherapy & Olfactotherapy Journey",
          format: "Seminar + sensory practice",
          purpose: "Emotional regulation, stress reduction, burnout support",
          description: "A refined introduction to working with scent as a tool for wellbeing.",
          image: "https://meloria.my.canva.site/_assets/media/25ccbf840684c97b152dc2ec11623e5e.jpg",
        },
      ],
    },
    {
      section: "Flowers & Elixirs",
      icon: TreeDeciduous,
      gradient: "from-lime-50 via-green-50 to-emerald-100",
      items: [
        {
          title: "Floral Seminar with Botanical Elixir",
          format: "Lecture + hands-on creation/tasting",
          languages: ["LV", "RU"],
          purpose: "Gentle emotional balance through botanicals",
          description: "A unique wellbeing activity that brings together aesthetics, nature and emotional clarity.",
          image: "https://meloria.my.canva.site/_assets/media/e87bca0ddd2ffa9cbafee114ed135af2.jpg",
        },
      ],
    },
    {
      section: "Sound Practices",
      icon: Music,
      gradient: "from-sky-100 via-blue-50 to-indigo-100",
      items: [
        {
          title: "Sound Healing Session — 1 hour",
          format: "60-minute sound immersion",
          purpose: "Deep relaxation, nervous system reset",
          description: "A quiet, resonant experience that restores balance and calm. Perfect as a standalone session or closing ritual.",
          image: "https://meloria.my.canva.site/_assets/media/00eb03e9034888c2d69ac54d5501b0ee.jpg",
        },
      ],
    },
    {
      section: "Recharge Retreats",
      icon: Mountain,
      gradient: "from-teal-100 via-cyan-50 to-sky-100",
      items: [
        {
          title: "Mini One-Day Retreat",
          format: "All inclusive, zero hassle",
          purpose: "Quick energy boost, team spirit uplift",
          description: "Art therapy, mindfulness, and team-building practices. Leave in the morning — come back recharged by evening!",
          price: "On request",
          image: "https://meloria.my.canva.site/_assets/media/7312bc04a20ce093ef819e54c6c21402.jpg",
        },
        {
          title: "Weekend Retreat (2 days / 1 night)",
          format: "Accommodation and meals included",
          purpose: "Dive deep into mindfulness and team connection",
          description: "Immersive program with accommodation. Return on Monday with fresh ideas and a real sense of unity.",
          price: "On request",
          image: "https://meloria.my.canva.site/_assets/media/8c311cd0582b4d081cb31a4b9c90c714.jpg",
        },
        {
          title: "3–4 Day Deep Recharge Retreat",
          format: "All inclusive",
          purpose: "Reset, refocus, and unlock full potential",
          description: "A powerful journey for teams and leaders. Come back with a new vision, stronger bonds, and lasting energy.",
          price: "Tailored to your team's goals",
          image: "https://meloria.my.canva.site/_assets/media/4f7b515824b8d09723fe24297eb9f8f0.jpg",
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
            Mindfulness Platform
          </p>
          <h1 className="text-5xl md:text-6xl font-serif italic text-teal-800 mb-4">
            Meloria
          </h1>
          <h2 className="text-3xl md:text-4xl font-serif text-purple-700 mb-6">
            Corporate Wellbeing<br />& Human Potential
          </h2>
          <p className="text-2xl font-serif text-teal-700 mb-8">Catalogue</p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Curated practices designed for companies that value clarity, depth and sustainable human potential.
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
              What we offer
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
              Because people are the heartbeat of every organization.
            </blockquote>
            <p className="text-lg text-purple-700 font-medium">
              When they grow, the company grows.<br />
              When they breathe, the whole system expands.
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
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-200/40 rounded-full blur-2xl" />
            <div className="relative">
              <TreeDeciduous className="w-10 h-10 text-teal-600 mx-auto mb-6" />
              <h3 className="text-2xl md:text-3xl font-serif text-teal-800 mb-4">
                Meloria creates spaces where teams can reset,<br />
                reconnect and rise
              </h3>
              <p className="text-lg text-purple-700 font-medium">
                — with clarity, presence and purpose.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Catalog;
