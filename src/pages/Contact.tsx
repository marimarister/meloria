import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Linkedin, Instagram, Globe } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            For collaborations, corporate programs, retreats, and tailor-made wellbeing solutions.
          </p>
        </section>

        {/* Contact Cards */}
        <section className="max-w-4xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <a 
                  href="mailto:Anastasija@meloria.eu" 
                  className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p className="text-sm">Anastasija@meloria.eu</p>
                  </div>
                </a>
                
                <a 
                  href="https://wa.me/37125272127" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">WhatsApp / Telegram</p>
                    <p className="text-sm">+371 2527 2127</p>
                  </div>
                </a>
                
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Location</p>
                    <p className="text-sm">Baltics / Europe-wide programs / Thailand</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Formats</p>
                    <p className="text-sm">Online • Offline • Hybrid</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social & CTA */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Follow Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <a 
                  href="https://www.linkedin.com/company/meloriaeu/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <Linkedin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">LinkedIn</p>
                    <p className="text-sm">@meloriaeu</p>
                  </div>
                </a>
                
                <a 
                  href="https://www.instagram.com/meloria.eu" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                    <Instagram className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Instagram</p>
                    <p className="text-sm">@meloria.eu</p>
                  </div>
                </a>

                <div className="pt-6 border-t border-border">
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Let's create a space where your people thrive. With clarity. With intention. With depth.
                  </p>
                  <Button asChild className="w-full">
                    <a href="mailto:Anastasija@meloria.eu">
                      Send an Email
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quote Section */}
        <section className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-12 text-center max-w-4xl mx-auto">
          <blockquote className="text-2xl md:text-3xl font-serif text-foreground italic mb-4">
            "Drop by or reach out"
          </blockquote>
          <p className="text-muted-foreground">
            We're here to help your team reset, reconnect and rise.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Contact;
