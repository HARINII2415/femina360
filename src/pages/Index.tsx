import heroAvatar from "@/assets/hero-avatar.jpg";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Zap, Phone, Users, Eye, Heart } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";
import { Dashboard } from "@/components/Dashboard";
import { EmergencyContacts } from "@/components/EmergencyContacts";
import { WomensLaws } from "@/components/WomensLaws";

type PageView = 'landing' | 'auth' | 'dashboard' | 'contacts' | 'laws';

const Index = () => {
  const [currentView, setCurrentView] = useState<PageView>('landing');
  const [user, setUser] = useState<any>(null);

  // Check for existing session on load
  useEffect(() => {
    const session = localStorage.getItem("femina360_session");
    if (session) {
      try {
        const userData = JSON.parse(session);
        setUser(userData);
        setCurrentView('dashboard');
      } catch (error) {
        console.error("Session parse error:", error);
        localStorage.removeItem("femina360_session");
      }
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem("femina360_session");
    setUser(null);
    setCurrentView('landing');
  };

  const showAuth = () => {
    setCurrentView('auth');
  };

  const showDashboard = () => {
    setCurrentView('dashboard');
  };

  const showContacts = () => {
    setCurrentView('contacts');
  };

  const showLaws = () => {
    setCurrentView('laws');
  };

  // Landing Page Component
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              <span className="text-primary">Femina</span>360
            </h1>
          </div>
          <Button 
            onClick={showAuth}
            className="bg-gradient-primary hover:shadow-primary transition-all duration-300"
          >
            Login / Register
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Hero Content */}
            <div className="space-y-8 animate-emerge">
              <div className="space-y-4">
                <h2 className="text-5xl font-bold leading-tight text-foreground lg:text-6xl">
                  Your{" "}
                  <span className="bg-gradient-power bg-clip-text text-transparent">
                    Digital Guardian
                  </span>{" "}
                  Always by Your Side
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Femina360 provides instant protection and empowerment through cutting-edge emergency features, 
                  ensuring your safety with discreet, powerful technology that's always ready when you need it most.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button 
                  onClick={showAuth}
                  size="lg" 
                  className="bg-gradient-primary hover:shadow-primary animate-pulse-glow transition-all duration-300 text-lg px-8 py-3"
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Get Protected Now
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-3"
                >
                  Learn More
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Protection</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">3sec</div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Reliable</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
           <div className="relative animate-slide-up">
  <div className="relative overflow-hidden rounded-2xl bg-gradient-secondary p-8 shadow-card">
    <img 
      src={heroAvatar} 
      alt="Empowering Protection" 
      className="w-full h-auto rounded-xl"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent rounded-2xl" />
    
    {/* Floating Emergency Indicators */}
    <div className="absolute top-6 right-6 animate-pulse-glow">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emergency shadow-emergency">
        <Zap className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
</div>

          </div>
        </div>
      </section>

      {/* Key Features Preview */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Advanced Protection Features
            </h3>
            <p className="text-muted-foreground text-lg">
              Cutting-edge technology designed specifically for women's safety
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Phone,
                title: "Shake for Emergency",
                description: "Rapid 3-shake detection instantly triggers emergency protocols with voice & video recording"
              },
              {
                icon: Users,
                title: "Voice Command",
                description: "Say 'Help' 5 times to activate immediate assistance with live location sharing"
              },
              {
                icon: Eye,
                title: "Background Protection",
                description: "Continuous monitoring and protection even when the app runs in the background"
              },
              {
                icon: Shield,
                title: "Emergency Contacts",
                description: "Secure storage and instant connection to your trusted emergency contacts"
              },
              {
                icon: Heart,
                title: "Women's Laws AI",
                description: "Intelligent chatbot providing guidance on women's rights and legal protections"
              },
              {
                icon: Zap,
                title: "Instant Response",
                description: "Lightning-fast emergency response with real-time location and evidence capture"
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="bg-card border-border hover:shadow-primary transition-all duration-300 p-6 animate-power-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Card className="bg-gradient-secondary border-primary/20 p-12 shadow-primary">
            <div className="space-y-6">
              <h3 className="text-4xl font-bold text-foreground">
                Ready to Feel <span className="text-primary">Empowered</span>?
              </h3>
              <p className="text-xl text-muted-foreground">
                Join thousands of women who trust Femina360 for their safety and protection. 
                Your digital guardian is waiting.
              </p>
              <Button 
                onClick={showAuth}
                size="lg" 
                className="bg-gradient-primary hover:shadow-primary animate-pulse-glow text-xl px-12 py-4"
              >
                Start Your Protection Journey
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );

  // Render appropriate view
  switch (currentView) {
    case 'auth':
      return <AuthForm onLogin={handleLogin} />;
    case 'dashboard':
      return (
        <Dashboard 
          user={user} 
          onLogout={handleLogout}
          onNavigateToLaws={showLaws}
          onNavigateToContacts={showContacts}
        />
      );
    case 'contacts':
      return <EmergencyContacts onBack={showDashboard} />;
    case 'laws':
      return <WomensLaws onBack={showDashboard} />;
    default:
      return <LandingPage />;
  }
};

export default Index;
