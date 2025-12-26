import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Zap, Share2, Shield, Heart } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Logo from "@/components/Logo";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: "Study Materials",
      description: "Share PDFs, notes, and academic resources with fellow BUETians",
    },
    {
      icon: Users,
      title: "Senior to Junior",
      description: "Seniors can donate or sell equipment to help juniors succeed",
    },
    {
      icon: Zap,
      title: "Quick & Easy",
      description: "Simple process to list and find the resources you need",
    },
  ];

  const stats = [
    { value: "11", label: "Departments" },
    { value: "1000+", label: "Students" },
    { value: "Free", label: "& Affordable" },
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="md" />
          <button 
            onClick={() => navigate("/login")}
            className="btn-ghost text-sm"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Exclusively for BUET Students</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-slide-up">
            Share Resources,
            <br />
            <span className="gradient-text">Build Community</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up stagger-1">
            The ultimate platform for BUET students to share study materials, 
            lab equipment, books, and more. Connect with peers, help juniors, 
            and grow together.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-2">
            <button 
              onClick={() => navigate("/login")}
              className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-ghost"
            >
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 animate-fade-in stagger-3">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Share & Succeed</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From lab equipment to lecture notes, ShareSphere makes resource sharing seamless
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass-card p-8 card-hover"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How <span className="gradient-text">ShareSphere</span> Works
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Sign Up", desc: "Register with your BUET email" },
              { step: "02", title: "Browse", desc: "Find resources by department" },
              { step: "03", title: "Connect", desc: "Contact sellers or donors" },
              { step: "04", title: "Share", desc: "List your own items to help others" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-6xl font-extrabold gradient-text opacity-20 mb-2">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <Heart className="w-12 h-12 text-accent mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Join the Community?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Start sharing resources and help build a stronger BUET community today.
              </p>
              <button 
                onClick={() => navigate("/login")}
                className="btn-accent flex items-center gap-2 mx-auto text-lg px-8 py-4"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            © 2024 ShareSphere. Made with ❤️ for BUET Students
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
