"use client"; // Required for client-side hooks and animations

import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  Eye, 
  Zap, 
  Radio, 
  Waypoints, 
  Radar, 
  Camera, 
  Network, 
  Lock, 
  Server, 
  Cable, 
  Satellite, 
  Radio as RadioIcon, 
  Scan, 
  AreaChart, 
  LayoutGrid, 
  ArrowRight,
  ChevronDown,
  Menu,
  X, 
  Twitter, 
  Linkedin, 
  Github, 
  Facebook, 
  Clock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Custom hooks for animations
const useTypewriter = (text: string, speed: number) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typing);
      }
    }, speed);

    return () => clearInterval(typing);
  }, [text, speed]);

  return displayText;
};

const useElementOnScreen = (options: IntersectionObserverInit) => {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    observer.observe(ref);

    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [ref, options]);

  return { ref: setRef, isVisible };
};





// Hero Section
const HeroSection = () => {
  const titleText = useTypewriter("Advanced Autonomous Surveillance System", 50);
  const subtitleText = useTypewriter("Multi-sensor data fusion for comprehensive threat detection", 30);
  
  return (
    <section className="relative pt-32 pb-20 min-h-screen flex items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 grid-pattern opacity-20 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-surveillance-accent/5 to-transparent z-0"></div>
      
      {/* Abstract Elements */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-surveillance-accent/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 -left-48 w-96 h-96 bg-surveillance-accent/10 rounded-full blur-3xl"></div>
      
      {/* Animated Scanner Line */}
      <div className="absolute left-0 right-0 h-40 overflow-hidden">
        <div className="scanning-line animate-scanning"></div>
      </div>
      
      {/* Hero Content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-6 max-w-3xl">
            <div className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-surveillance-accent/10 border border-surveillance-accent/20">
              <Zap className="w-4 h-4 mr-2 text-surveillance-accent" />
              <span className="text-sm font-medium text-surveillance-accent">Next-Gen Surveillance</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {titleText}
            </h1>
            
            <p className="text-xl text-foreground/80 mb-8 leading-relaxed h-16">
              {subtitleText}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2 bg-surveillance-accent hover:bg-surveillance-accent/90 text-white shadow-glow-sm">
                Explore Technology <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-surveillance-accent hover:bg-surveillance-accent/10 text-surveillance-accent">
                View Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 max-w-xl">
              <div>
                <div className="text-3xl font-bold text-surveillance-accent">99.8%</div>
                <div className="text-sm text-foreground/60">Detection Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-surveillance-accent">&lt;0.5s</div>
                <div className="text-sm text-foreground/60">Response Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-surveillance-accent">24/7</div>
                <div className="text-sm text-foreground/60">Monitoring</div>
              </div>
            </div>
          </div>
          
          {/* 3D Visualization */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full aspect-square max-w-xl mx-auto">
              {/* Visualization Container */}
              <div className="absolute inset-0 rounded-2xl glassmorphism shadow-glow-md p-6 overflow-hidden">
                {/* Animated Grid */}
                <div className="absolute inset-0 grid-pattern opacity-30"></div>
                
                {/* Radar Display */}
                <div className="absolute inset-10 flex items-center justify-center opacity-50">
                  <div className="w-full h-full border-2 border-surveillance-accent/20 rounded-full"></div>
                  <div className="absolute w-3/4 h-3/4 border border-surveillance-accent/30 rounded-full"></div>
                  <div className="absolute w-1/2 h-1/2 border border-surveillance-accent/40 rounded-full"></div>
                  <div className="absolute w-1/4 h-1/4 border border-surveillance-accent/50 rounded-full"></div>
                  
                  {/* Radar Sweep */}
                  <div className="absolute w-full h-full animate-radar-spin" style={{ animationDuration: '8s' }}>
                    <div className="absolute top-1/2 left-1/2 w-1/2 h-1 bg-gradient-to-r from-surveillance-accent/80 to-transparent origin-left"></div>
                  </div>
                </div>
                
                {/* Sensor Data Visualization */}
                <div className="absolute inset-0 p-4">
                  {/* Camera Feed */}
                  <div className="absolute top-4 left-4 w-36 h-24 rounded bg-surveillance-dark/60 border border-surveillance-accent/20 overflow-hidden">
                    <div className="absolute top-2 left-2 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-surveillance-accent animate-pulse"></div>
                      <span className="text-xs text-surveillance-accent ml-1">CAMERA</span>
                    </div>
                    <div className="h-full w-full flex items-center justify-center opacity-70">
                      <Camera className="w-8 h-8 text-surveillance-accent/70" />
                    </div>
                  </div>
                  
                  {/* Laser Data */}
                  <div className="absolute top-4 right-4 w-36 h-24 rounded bg-surveillance-dark/60 border border-surveillance-accent/20 overflow-hidden">
                    <div className="absolute top-2 left-2 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-surveillance-accent animate-pulse"></div>
                      <span className="text-xs text-surveillance-accent ml-1">LIDAR</span>
                    </div>
                    <div className="h-full w-full flex items-center justify-center opacity-70">
                      <Scan className="w-8 h-8 text-surveillance-accent/70" />
                    </div>
                  </div>
                  
                  {/* Fiber Optic */}
                  <div className="absolute bottom-4 left-4 w-36 h-24 rounded bg-surveillance-dark/60 border border-surveillance-accent/20 overflow-hidden">
                    <div className="absolute top-2 left-2 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-surveillance-accent animate-pulse"></div>
                      <span className="text-xs text-surveillance-accent ml-1">FIBER OPTIC</span>
                    </div>
                    <div className="h-full w-full flex items-center justify-center opacity-70">
                      <Cable className="w-8 h-8 text-surveillance-accent/70" />
                    </div>
                  </div>
                  
                  {/* UGS Data */}
                  <div className="absolute bottom-4 right-4 w-36 h-24 rounded bg-surveillance-dark/60 border border-surveillance-accent/20 overflow-hidden">
                    <div className="absolute top-2 left-2 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-surveillance-accent animate-pulse"></div>
                      <span className="text-xs text-surveillance-accent ml-1">UGS</span>
                    </div>
                    <div className="h-full w-full flex items-center justify-center opacity-70">
                      <RadioIcon className="w-8 h-8 text-surveillance-accent/70" />
                    </div>
                  </div>
                  
                  {/* Central Fusion Display */}
                  <div className="absolute inset-32 rounded-full bg-surveillance-dark/40 border border-surveillance-accent/30 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-surveillance-accent font-mono text-sm mb-1">FUSION CORE</div>
                      <div className="w-16 h-16 mx-auto relative">
                        <div className="absolute inset-0 rounded-full bg-surveillance-accent/20 animate-pulse"></div>
                        <div className="absolute inset-2 rounded-full bg-surveillance-accent/10 flex items-center justify-center">
                          <AreaChart className="w-8 h-8 text-surveillance-accent" />
                        </div>
                      </div>
                      <div className="text-xs text-surveillance-accent/80 mt-1 font-mono">PROCESSING</div>
                    </div>
                  </div>
                  
                  {/* Data Flow Lines */}
                  <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                    {/* Camera to Center */}
                    <line x1="54" y1="54" x2="50%" y2="50%" stroke="rgba(14, 165, 233, 0.3)" strokeWidth="1" strokeDasharray="5,5" />
                    {/* Lidar to Center */}
                    <line x1="calc(100% - 54px)" y1="54" x2="50%" y2="50%" stroke="rgba(14, 165, 233, 0.3)" strokeWidth="1" strokeDasharray="5,5" />
                    {/* Fiber to Center */}
                    <line x1="54" y1="calc(100% - 54px)" x2="50%" y2="50%" stroke="rgba(14, 165, 233, 0.3)" strokeWidth="1" strokeDasharray="5,5" />
                    {/* UGS to Center */}
                    <line x1="calc(100% - 54px)" y1="calc(100% - 54px)" x2="50%" y2="50%" stroke="rgba(14, 165, 233, 0.3)" strokeWidth="1" strokeDasharray="5,5" />
                    
                    {/* Animated Data Particles */}
                    <circle className="animate-data-flow" cx="35%" cy="35%" r="2" fill="#0EA5E9" style={{ animationDelay: '0s' }} />
                    <circle className="animate-data-flow" cx="65%" cy="35%" r="2" fill="#0EA5E9" style={{ animationDelay: '1s' }} />
                    <circle className="animate-data-flow" cx="35%" cy="65%" r="2" fill="#0EA5E9" style={{ animationDelay: '2s' }} />
                    <circle className="animate-data-flow" cx="65%" cy="65%" r="2" fill="#0EA5E9" style={{ animationDelay: '3s' }} />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <span className="text-sm text-foreground/60 mb-2">Scroll to explore</span>
        <ChevronDown className="w-5 h-5 text-surveillance-accent animate-bounce" />
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: <Camera className="w-10 h-10 text-surveillance-accent" />,
      title: "Advanced Camera Systems",
      description: "High-resolution imaging with AI-powered object recognition for visual identification and tracking.",
    },
    {
      icon: <Scan className="w-10 h-10 text-surveillance-accent" />,
      title: "Laser Detection",
      description: "Precision LIDAR mapping for accurate distance measurements and 3D environmental modeling.",
    },
    {
      icon: <Cable className="w-10 h-10 text-surveillance-accent" />,
      title: "Buried Fiber Optics",
      description: "Underground fiber optic networks that detect vibrations and movements for perimeter security.",
    },
    {
      icon: <RadioIcon className="w-10 h-10 text-surveillance-accent" />,
      title: "Unattended Ground Sensors",
      description: "Self-contained sensor units detecting acoustic, seismic, magnetic, and infrared signatures.",
    },
    {
      icon: <AreaChart className="w-10 h-10 text-surveillance-accent" />,
      title: "Data Fusion Core",
      description: "Advanced algorithms merging multi-sensor inputs for comprehensive situational awareness.",
    },
    {
      icon: <Eye className="w-10 h-10 text-surveillance-accent" />,
      title: "AI-Powered Analysis",
      description: "Machine learning systems that continuously improve threat detection and reduce false alarms.",
    },
  ];

  const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
    const { ref, isVisible } = useElementOnScreen({
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    });

    return (
      <div
        ref={ref}
        className={cn(
          "glassmorphism rounded-xl p-6 hover:shadow-glow-sm transition-all duration-300 transform glow-effect",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        <div className="bg-surveillance-accent/10 rounded-lg w-16 h-16 flex items-center justify-center mb-4">
          {feature.icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
        <p className="text-muted-foreground">{feature.description}</p>
      </div>
    );
  };

  const { ref, isVisible } = useElementOnScreen({
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  });

  return (
    <section id="features" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-surveillance-accent/5 blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6">
        <div
          ref={ref}
          className={cn(
            "text-center max-w-3xl mx-auto mb-16 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-surveillance-accent/10 border border-surveillance-accent/20">
            <Radar className="w-4 h-4 mr-2 text-surveillance-accent" />
            <span className="text-sm font-medium text-surveillance-accent">Sensor Technology</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
            Multi-Sensor Architecture
          </h2>
          <p className="text-lg text-muted-foreground">
            Our system integrates multiple sensor types to create an impenetrable surveillance network that detects, identifies, and responds to threats in real-time.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Data Fusion Section
const DataFusionSection = () => {
  const { ref, isVisible } = useElementOnScreen({
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  });

  return (
    <section id="data-fusion" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-surveillance-dark"></div>
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-surveillance-accent/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-surveillance-accent/30 to-transparent"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visualization */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div 
              ref={ref}
              className={cn(
                "relative aspect-square max-w-xl mx-auto transition-all duration-700",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              )}
            >
              {/* Data Fusion Visualization */}
              <div className="absolute inset-0 rounded-2xl glassmorphism shadow-glow-md overflow-hidden">
                <div className="absolute inset-0 grid-pattern opacity-20"></div>
                
                {/* Central Hub */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    {/* Orbiting Rings */}
                    <div className="absolute inset-0 rounded-full border border-surveillance-accent/30 animate-spin-slow" style={{ animationDuration: '20s' }}></div>
                    <div className="absolute inset-4 rounded-full border border-surveillance-accent/40 animate-spin-slow-reverse" style={{ animationDuration: '15s' }}></div>
                    <div className="absolute inset-8 rounded-full border border-surveillance-accent/50 animate-spin-slow" style={{ animationDuration: '10s' }}></div>
                    
                    {/* Core */}
                    <div className="absolute inset-12 rounded-full bg-surveillance-accent/20 flex items-center justify-center shadow-glow-md animate-pulse-slow">
                      <Network className="w-8 h-8 text-surveillance-accent" />
                    </div>
                    
                    {/* Orbiting Nodes */}
                    {[0, 60, 120, 180, 240, 300].map((angle, index) => (
                      <div 
                        key={index}
                        className="absolute w-8 h-8 rounded-full bg-surveillance-dark border border-surveillance-accent/50 flex items-center justify-center shadow-glow-sm orbit-element"
                        style={{ 
                          transform: `rotate(${angle}deg) translateX(80px) rotate(-${angle}deg)`,
                          animationDelay: `${index * -2.5}s`
                        }}
                      >
                        {index === 0 && <Camera className="w-4 h-4 text-surveillance-accent" />}
                        {index === 1 && <Scan className="w-4 h-4 text-surveillance-accent" />}
                        {index === 2 && <Cable className="w-4 h-4 text-surveillance-accent" />}
                        {index === 3 && <RadioIcon className="w-4 h-4 text-surveillance-accent" />}
                        {index === 4 && <Satellite className="w-4 h-4 text-surveillance-accent" />}
                        {index === 5 && <Eye className="w-4 h-4 text-surveillance-accent" />}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Data Flow Lines */}
                <div className="absolute inset-0">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i}
                      className="data-dot"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: `${2 + Math.random() * 3}s`
                      }}
                    ></div>
                  ))}
                </div>
                
                {/* Labels */}
                <div className="absolute top-4 left-4 font-mono text-xs text-surveillance-accent">DATA FUSION SYSTEM</div>
                <div className="absolute bottom-4 right-4 font-mono text-xs text-surveillance-accent">REAL-TIME PROCESSING</div>
              </div>
            </div>
          </div>
          
          {/* Text Content */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div 
              ref={ref}
              className={cn(
                "transition-all duration-700 delay-300",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
            >
              <div className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-surveillance-accent/10 border border-surveillance-accent/20">
                <Server className="w-4 h-4 mr-2 text-surveillance-accent" />
                <span className="text-sm font-medium text-surveillance-accent">Intelligent Integration</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">
                Advanced Data Fusion Technology
              </h2>
              
              <p className="text-lg text-foreground/80 mb-8">
                Our proprietary data fusion system combines inputs from multiple sensor types to create a unified 
                operational picture with unprecedented accuracy and reliability.
              </p>
              
              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surveillance-accent/10 flex-shrink-0 flex items-center justify-center">
                    <LayoutGrid className="w-6 h-6 text-surveillance-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Multi-Level Fusion</h3>
                    <p className="text-muted-foreground">
                      Process data at sensor, feature, and decision levels to maximize detection capabilities while minimizing false alarms.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surveillance-accent/10 flex-shrink-0 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-surveillance-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Real-Time Analysis</h3>
                    <p className="text-muted-foreground">
                      Process multiple data streams simultaneously with sub-second latency for immediate threat response.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surveillance-accent/10 flex-shrink-0 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-surveillance-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Adaptive Security</h3>
                    <p className="text-muted-foreground">
                      Self-adjusting sensitivity based on threat levels and environmental conditions to maintain optimal security.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button className="gap-2 bg-surveillance-accent hover:bg-surveillance-accent/90 text-white shadow-glow-sm">
                Technical Specifications <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Solutions Section
const SolutionsSection = () => {
  const solutions = [
    {
      title: "Perimeter Security",
      description: "Comprehensive surveillance for facility perimeters with multi-layered detection systems.",
      icon: <Shield className="w-12 h-12 text-surveillance-accent" />,
    },
    {
      title: "Critical Infrastructure",
      description: "Protecting vital assets with redundant monitoring and instant threat alerts.",
      icon: <Server className="w-12 h-12 text-surveillance-accent" />,
    },
    {
      title: "Border Security",
      description: "Long-range surveillance systems designed for large-scale deployment in challenging environments.",
      icon: <Waypoints className="w-12 h-12 text-surveillance-accent" />,
    }
  ];

  const { ref, isVisible } = useElementOnScreen({
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  });

  return (
    <section id="solutions" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-surveillance-dark to-surveillance-dark-light"></div>
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-surveillance-accent/5 blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div 
          ref={ref}
          className={cn(
            "text-center max-w-3xl mx-auto mb-16 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-surveillance-accent/10 border border-surveillance-accent/20">
            <Lock className="w-4 h-4 mr-2 text-surveillance-accent" />
            <span className="text-sm font-medium text-surveillance-accent">Security Solutions</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
            Tailored Security Applications
          </h2>
          <p className="text-lg text-muted-foreground">
            Our advanced surveillance systems are deployed across various sectors, providing unmatched security for critical assets and infrastructure.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {solutions.map((solution, index) => (
            <div 
              key={index}
              className={cn(
                "glassmorphism rounded-xl overflow-hidden transition-all duration-500",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              )}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="p-8">
                <div className="bg-surveillance-accent/10 w-20 h-20 rounded-lg flex items-center justify-center mb-6">
                  {solution.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{solution.title}</h3>
                <p className="text-muted-foreground mb-6">{solution.description}</p>
                <a 
                  href="#" 
                  className="inline-flex items-center text-surveillance-accent hover:text-surveillance-accent/80 transition-colors"
                >
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Call To Action
const CallToAction = () => {
  const { ref, isVisible } = useElementOnScreen({
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  });

  return (
    <section id="contact" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-surveillance-dark"></div>
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-surveillance-accent/10 blur-3xl"></div>
      
      <div 
        ref={ref}
        className={cn(
          "container mx-auto px-4 md:px-6 max-w-5xl relative z-10 transition-all duration-700",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        <div className="glassmorphism p-8 md:p-12 rounded-3xl border border-surveillance-accent/20 shadow-glow-md">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
              Ready to Transform Your Security?
            </h2>
            <p className="text-lg text-foreground/80 mb-8">
              Get in touch with our team to schedule a demonstration and see how our autonomous surveillance system can protect your most valuable assets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2 bg-surveillance-accent hover:bg-surveillance-accent/90 text-white shadow-glow-sm">
                Request a Demo <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-surveillance-accent hover:bg-surveillance-accent/10 text-surveillance-accent">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer
// Footer
const Footer = () => (
  <footer className="bg-surveillance-dark text-foreground border-t border-border/10 pt-16 pb-8">
    <div className="container mx-auto px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-8 w-8 text-surveillance-accent" />
            <span className="text-xl font-bold tracking-tight">SenseFusion</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Real-time object detection and multi-sensor fusion for autonomous surveillance.
          </p>
          <div className="flex gap-4">
            {[
              { id: "twitter", href: "https://twitter.com/sensefusion" },
              { id: "linkedin", href: "https://linkedin.com/company/sensefusion" },
              { id: "github", href: "https://github.com/sensefusion" },
              { id: "facebook", href: "https://facebook.com/sensefusion" },
            ].map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-surveillance-dark-light flex items-center justify-center hover:bg-surveillance-accent/20 transition-colors"
                aria-label={`Follow us on ${social.id}`}
              >
                {/* Social icons added dynamically elsewhere */}
              </a>
            ))}
          </div>
        </div>
        {[
          {
            category: "Solutions",
            links: [
              "Object Detection",
              "Threat Monitoring",
              "Perimeter Security",
              "Live Feed",
            ],
          },
          {
            category: "Technology",
            links: [
              "Sensor Fusion",
              "AI Analysis",
              "System Specs",
              "API Access",
            ],
          },
          {
            category: "Resources",
            links: [
              "Docs",
              "Support",
              "Status",
              "Contact",
            ],
          },
        ].map((section) => (
          <div key={section.category}>
            <h3 className="font-semibold mb-4 text-foreground">{section.category}</h3>
            <ul className="space-y-3">
              {section.links.map((link, i) => (
                <li key={i}>
                  <a href={`#${link.toLowerCase().replace(" ", "-")}`} className="text-muted-foreground hover:text-surveillance-accent transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} SenseFusion. All rights reserved.
        </p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="/privacy" className="text-sm text-muted-foreground hover:text-surveillance-accent transition-colors">
            Privacy Policy
          </a>
          <a href="/terms" className="text-sm text-muted-foreground hover:text-surveillance-accent transition-colors">
            Terms of Service
          </a>
          <a href="/contact" className="text-sm text-muted-foreground hover:text-surveillance-accent transition-colors">
            Contact
          </a>
        </div>
      </div>
    </div>
  </footer>
);

// Scroll To Top Button
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-surveillance-accent text-white flex items-center justify-center shadow-glow-md hover:bg-surveillance-accent/90 transition-colors z-20"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ChevronDown className="rotate-180 h-6 w-6" />
        </button>
      )}
    </>
  );
};

// Particles Background Component
const ParticlesBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
    }[] = [];
    
    const createParticles = () => {
      for (let i = 0; i < 100; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.1,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          color: `rgba(14, 165, 233, ${Math.random() * 0.5})`
        });
      }
    };
    
    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        // Connect nearby particles with lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(14, 165, 233, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(animateParticles);
    };
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.length = 0;
      createParticles();
    };
    
    window.addEventListener('resize', handleResize);
    createParticles();
    animateParticles();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 opacity-40"
    />
  );
};

// Main App Component
function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      
      <div className="min-h-screen flex flex-col bg-surveillance-dark text-foreground overflow-x-hidden">
        <ParticlesBackground />
      
        <main className="flex-1 z-10">
          <HeroSection />
          <FeaturesSection />
          <DataFusionSection />
          <SolutionsSection />
          <CallToAction />
        </main>
        <Footer />
        <ScrollToTop />
        
        {/* Custom Styles */}
        <style>
          {`
            :root {
              --background: 220 25% 11%;
              --foreground: 210 40% 98%;
              --card: 222 20% 13%;
              --card-foreground: 210 40% 98%;
              --popover: 222 20% 13%;
              --popover-foreground: 210 40% 98%;
              --primary: 199 89% 48%;
              --primary-foreground: 210 40% 98%;
              --secondary: 217 33% 17%;
              --secondary-foreground: 210 40% 98%;
              --muted: 215 14% 35%;
              --muted-foreground: 215 20% 65%;
              --accent: 215 25% 27%;
              --accent-foreground: 210 40% 98%;
              --destructive: 0 63% 31%;
              --destructive-foreground: 210 40% 98%;
              --border: 216 34% 17%;
              --input: 216 34% 17%;
              --ring: 199 89% 48%;
              --radius: 0.5rem;
              --surveillance-dark: #141b24;
              --surveillance-dark-light: #1e2a36;
              --surveillance-accent: #0EA5E9;
              --surveillance-accent-dark: #0284c7;
            }

            @keyframes pulse-slow {
              0%, 100% { opacity: 0.6; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1.2); }
            }
            
            @keyframes pulse-fast {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.05); opacity: 1; }
            }
            
            @keyframes spin-slow {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            @keyframes spin-slow-reverse {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(-360deg); }
            }
            
            @keyframes data-flow {
              0% { transform: translateX(0) translateY(0); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateX(100px) translateY(-100px); opacity: 0; }
            }
            
            @keyframes scanning {
              0% { transform: translateY(0); opacity: 0.5; }
              50% { transform: translateY(100%); opacity: 0.8; }
              100% { transform: translateY(0); opacity: 0.5; }
            }
            
            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            
            @keyframes radar-spin {
              0% { transform: rotate(0deg) translateX(0); }
              100% { transform: rotate(360deg) translateX(0); }
            }
            
            @keyframes orbit {
              0% { transform: rotate(0deg) translateX(80px) rotate(0deg); }
              100% { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
            }

            .orbit-element {
              animation: orbit 15s linear infinite;
            }
            
            .glassmorphism {
              background-color: rgba(30, 41, 59, 0.2);
              backdrop-filter: blur(12px);
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .text-gradient {
              background: linear-gradient(to right, #f0f0f0, #0EA5E9);
              -webkit-background-clip: text;
              background-clip: text;
              color: transparent;
            }
            
            .shadow-glow-sm {
              box-shadow: 0 0 10px 2px rgba(14, 165, 233, 0.15);
            }
            
            .shadow-glow-md {
              box-shadow: 0 0 20px 5px rgba(14, 165, 233, 0.2);
            }
            
            .border-glow {
              border: 1px solid rgba(14, 165, 233, 0.3);
            }
            
            .grid-pattern {
              background-image: 
                linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px);
              background-size: 20px 20px;
            }
            
            .scanning-line {
              position: absolute;
              height: 2px;
              background: linear-gradient(to right, transparent, rgba(14, 165, 233, 0.8), transparent);
              width: 100%;
              z-index: 2;
              animation: scanning 3s infinite ease-in-out;
            }
            
            .data-dot {
              position: absolute;
              width: 4px;
              height: 4px;
              border-radius: 50%;
              background-color: rgba(14, 165, 233, 0.8);
              box-shadow: 0 0 5px rgba(14, 165, 233, 0.5);
              animation: data-flow 6s infinite linear;
            }
            
            .animate-pulse-glow {
              animation: pulse-slow 2s infinite;
            }
            
            .animate-data-flow {
              animation: data-flow 6s infinite linear;
            }
            
            .animate-scanning {
              animation: scanning 3s infinite ease-in-out;
            }
            
            .animate-float {
              animation: float 3s infinite ease-in-out;
            }
            
            .animate-radar-spin {
              animation: radar-spin 4s infinite linear;
            }
            
            .glow-effect {
              position: relative;
            }
            
            .glow-effect::before {
              content: '';
              position: absolute;
              inset: -10px;
              background: radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, transparent 70%);
              border-radius: inherit;
              z-index: -1;
              opacity: 0;
              transition: opacity 0.3s ease;
            }
            
            .glow-effect:hover::before {
              opacity: 1;
            }
          `}
        </style>
      </div>
    </>
  );
}

export default App;