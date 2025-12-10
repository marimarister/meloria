import NavBar from "@/components/NavBar";
import { Heart, Users, Sparkles, Target } from "lucide-react";

const OurStory = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Our Story
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Because people are the heartbeat of every organization. When they grow, the company grows. When they breathe, the whole system expands.
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-6">
                Mindfulness Platform
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Meloria creates spaces where teams can reset, reconnect and rise — with clarity, presence and purpose.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Curated practices designed for companies that value clarity, depth and sustainable human potential.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-primary" />
                </div>
                <p className="text-lg font-medium text-foreground">Corporate Wellbeing & Human Potential</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-serif font-bold text-foreground text-center mb-12">
            What We Believe
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Human-Centered</h3>
              <p className="text-muted-foreground">
                We put people first, recognizing that sustainable success comes from nurturing individual and collective wellbeing.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Depth & Clarity</h3>
              <p className="text-muted-foreground">
                We believe in going beyond surface-level solutions to create lasting transformation through meaningful practices.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Measurable Impact</h3>
              <p className="text-muted-foreground">
                We track wellbeing and performance indicators over time to ensure our programs deliver real, tangible results.
              </p>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-12 text-center">
          <blockquote className="text-2xl md:text-3xl font-serif text-foreground italic mb-6">
            "Let's create a space where your people thrive. With clarity. With intention. With depth."
          </blockquote>
          <p className="text-muted-foreground font-medium">— The Meloria Team</p>
        </section>
      </main>
    </div>
  );
};

export default OurStory;
