const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      
      {/* Animated orbs */}
      <div className="orb w-96 h-96 bg-primary/30 top-[-10%] left-[-5%] animate-float" />
      <div className="orb w-80 h-80 bg-purple-500/20 top-[20%] right-[-10%] animate-float-delayed" />
      <div className="orb w-72 h-72 bg-accent/20 bottom-[10%] left-[10%] animate-float-slow" />
      <div className="orb w-64 h-64 bg-cyan-400/15 bottom-[-5%] right-[20%] animate-float" />
      <div className="orb w-48 h-48 bg-primary/20 top-[50%] left-[40%] animate-float-delayed" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/80" />
    </div>
  );
};

export default AnimatedBackground;
