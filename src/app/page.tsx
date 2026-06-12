'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Code, Terminal, GitBranch, Shield, Sparkles, Layers, ArrowRight, ExternalLink } from 'lucide-react';
import { CommandPalette } from '@/components/command-palette';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);


export default function LandingPage() {
  const router = useRouter();
  
  // Counters state
  const [projects, setProjects] = useState(0);
  const [users, setUsers] = useState(0);
  const [commits, setCommits] = useState(0);
  const [published, setPublished] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Animate stats on load
  useEffect(() => {
    setMounted(true);
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const targetProjects = 14242;
    const targetUsers = 8924;
    const targetCommits = 2932410;
    const targetPublished = 12831;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      // Easing out quadratic
      const ease = 1 - Math.pow(1 - progress, 2);

      setProjects(Math.floor(targetProjects * ease));
      setUsers(Math.floor(targetUsers * ease));
      setCommits(Math.floor(targetCommits * ease));
      setPublished(Math.floor(targetPublished * ease));

      if (step >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="relative min-h-screen bg-charcoal-bg text-foreground selection:bg-forest-primary/30 selection:text-forest-accent overflow-hidden flex flex-col justify-between">
      
      {/* GitHub/Forest Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#232729_1px,transparent_1px),linear-gradient(to_bottom,#232729_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* Subtle Forest green glow blobs */}
      <div className="absolute top-[-10%] left-[20%] w-[35rem] h-[35rem] rounded-full bg-forest-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-5%] w-[30rem] h-[30rem] rounded-full bg-forest-dark/15 blur-[120px] pointer-events-none" />

      {/* Floating Particles Simulation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {mounted && [...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-forest-accent/10 border border-forest-primary/20"
            style={{
              width: Math.random() * 8 + 4,
              height: Math.random() * 8 + 4,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100 - Math.random() * 100],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 15,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="w-full border-b border-charcoal-border glass-panel relative z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-forest-primary/20 border border-forest-primary flex items-center justify-center transition-all duration-300 group-hover:border-forest-accent group-hover:bg-forest-primary/30">
              <Terminal className="w-4.5 h-4.5 text-forest-accent" />
            </div>
            <span className="font-mono font-bold tracking-tight text-lg group-hover:text-forest-accent transition-colors duration-200">
              Proof<span className="text-forest-accent">Forge</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-mono">
            <Link href="/dashboard" className="text-charcoal-text-muted hover:text-foreground transition-colors duration-150">
              Dashboard
            </Link>
            <Link href="/portfolio/proof_forge_demo" className="text-charcoal-text-muted hover:text-foreground transition-colors duration-150">
              View Demo
            </Link>
            <Link href="/admin" className="text-charcoal-text-muted hover:text-foreground transition-colors duration-150">
              Admin Area
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="px-4 py-1.5 border border-charcoal-border hover:border-forest-primary bg-charcoal-card rounded-md text-xs font-mono transition-all duration-200 cursor-pointer"
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-1.5 bg-forest-primary hover:bg-forest-light text-foreground font-mono font-bold rounded-md text-xs transition-all duration-200 shadow-md shadow-forest-primary/10 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Build Free</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-24 relative z-10 flex flex-col justify-center items-center gap-16 md:gap-24">
        
        {/* Hero Area */}
        <motion.div 
          className="text-center max-w-3xl space-y-6 flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-forest-primary/10 border border-forest-primary/30 rounded-full text-xs font-mono text-forest-accent mb-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next.js 15 & React 19 Local-first Portfolio Creator</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl font-extrabold tracking-tight font-sans text-foreground"
          >
            Your Code Is <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-accent to-forest-light">Your Resume.</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-base md:text-lg text-charcoal-text-muted max-w-xl"
          >
            Transform GitHub activity, commit history, and deployed serverless configurations into a living developer portfolio automatically.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full justify-center"
          >
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-forest-primary hover:bg-forest-light text-foreground text-sm font-mono font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-forest-primary/20 cursor-pointer"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Generate Portfolio</span>
            </Link>
            <Link
              href="/portfolio/proof_forge_demo"
              className="w-full sm:w-auto px-8 py-3.5 bg-charcoal-card border border-charcoal-border hover:border-forest-primary text-sm font-mono text-charcoal-text-muted hover:text-foreground rounded-lg transition-all duration-200 flex items-center justify-center gap-2 glass-panel cursor-pointer"
            >
              <span>View Live Demo</span>
              <ExternalLink className="w-4 h-4 text-forest-accent" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Bento Grid Stats Panel */}
        <motion.div 
          className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {[
            { label: 'Projects Generated', val: projects.toLocaleString() + '+' },
            { label: 'GitHub Connections', val: users.toLocaleString() + '+' },
            { label: 'Commits Parsed', val: commits.toLocaleString() + '+' },
            { label: 'Portfolios Live', val: published.toLocaleString() + '+' }
          ].map((stat, idx) => (
            <div 
              key={idx} 
              className="bento-card p-6 rounded-xl flex flex-col justify-between h-32 md:h-36 glass-panel relative group"
            >
              <span className="text-xs font-mono text-charcoal-text-muted group-hover:text-forest-accent transition-colors duration-200">
                {stat.label}
              </span>
              <span className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-foreground select-none">
                {stat.val}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Floating Code Snippet & Showcase Bento */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Live Scanner Terminal */}
          <div className="bento-card lg:col-span-2 p-6 rounded-2xl glass-panel flex flex-col justify-between gap-6">
            <div className="flex items-center justify-between border-b border-charcoal-border pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-forest-accent" />
                <span className="text-xs font-mono text-charcoal-text-muted">proofforge-scanner --realtime</span>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-charcoal-border" />
                <span className="w-2.5 h-2.5 rounded-full bg-charcoal-border" />
                <span className="w-2.5 h-2.5 rounded-full bg-forest-primary/50" />
              </div>
            </div>

            <div className="font-mono text-xs text-charcoal-text-muted space-y-2.5 bg-charcoal-bg/50 p-4 rounded-lg border border-charcoal-border/50 select-none overflow-x-auto no-scrollbar">
              <p className="text-forest-accent">$ curl -X GET https://api.proofforge.dev/v1/scan/alex_forge</p>
              <p className="text-foreground">[System] Connecting to GitHub GraphQL endpoint...</p>
              <p className="text-foreground">[System] Found 24 Repositories, 2,932 Commits, 4 active Badges.</p>
              <p className="text-foreground">[System] Scanning Vercel & Netlify config arrays...</p>
              <p className="text-forest-accent">✔ Next.js detected in react-nexus-compiler (Deployed Vercel)</p>
              <p className="text-forest-accent">✔ Node.js detected in neuro-agent-db (Deployed Railway)</p>
              <p className="text-foreground">[System] Compiling portfolio build. Active theme: Futuristic UI.</p>
              <p className="text-forest-accent">➜ Portfolio built successfully at /portfolio/alex_forge [242ms]</p>
            </div>

            <div className="flex items-center gap-3 text-xs text-charcoal-text-muted">
              <GitBranch className="w-4 h-4 text-forest-accent shrink-0" />
              <span>Continuous integration syncing automatically as you commit code.</span>
            </div>
          </div>

          {/* Card 2: Features Bento */}
          <div className="bento-card p-6 rounded-2xl glass-panel flex flex-col justify-between gap-6">
            <div className="w-10 h-10 rounded-lg bg-forest-primary/10 border border-forest-primary/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-forest-accent" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-mono font-bold text-foreground text-sm">Privacy-First Architecture</h3>
              <p className="text-xs text-charcoal-text-muted leading-relaxed">
                Zero database hosting. All access tokens and configurations are stored in your browser's LocalStorage and IndexedDB. 
              </p>
            </div>

            <div className="text-xs font-mono text-forest-accent border-t border-charcoal-border/50 pt-3">
              No remote servers tracking you.
            </div>
          </div>
        </div>

        {/* 12 Themes Bento Showcase */}
        <div className="w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold font-sans text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-forest-accent" />
                <span>12 Premium Portfolio Themes</span>
              </h2>
              <p className="text-sm text-charcoal-text-muted">Switch the look of your portfolio instantly with customizable layouts.</p>
            </div>
            <Link 
              href="/portfolio/proof_forge_demo" 
              className="text-xs font-mono text-forest-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Preview themes in live sandbox</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { id: 'cyberpunk', name: 'Cyberpunk', bg: 'bg-[#ff0055]/5 border-[#ff0055]/20 text-[#ff0055]' },
              { id: 'neon-blue', name: 'Neon Blue', bg: 'bg-[#00f2fe]/5 border-[#00f2fe]/20 text-[#00f2fe]' },
              { id: 'purple-glow', name: 'Purple Glow', bg: 'bg-[#a18cd1]/5 border-[#a18cd1]/20 text-[#a18cd1]' },
              { id: 'futuristic-ui', name: 'Futuristic UI', bg: 'bg-forest-primary/10 border-forest-primary/30 text-forest-accent' },
              { id: 'minimal', name: 'Minimal', bg: 'bg-white/5 border-white/10 text-slate-300' },
              { id: 'clean-white', name: 'Clean White', bg: 'bg-white/90 border-slate-300 text-slate-800' },
              { id: 'elegant-typography', name: 'Elegant Typo', bg: 'bg-amber-50/10 border-amber-900/20 text-amber-200' },
              { id: 'developer-dark', name: 'Dev Dark', bg: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' },
              { id: 'github-style', name: 'GitHub Style', bg: 'bg-neutral-800/10 border-neutral-700/30 text-neutral-200' },
              { id: 'dark-code', name: 'Dark Code', bg: 'bg-orange-500/5 border-orange-500/20 text-orange-400' },
              { id: 'ai-futurism', name: 'AI Futurism', bg: 'bg-teal-500/5 border-teal-500/20 text-teal-400' },
              { id: 'animated-gradients', name: 'Animated Grad', bg: 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400' }
            ].map((t) => (
              <div 
                key={t.id} 
                className={`p-3 rounded-lg border text-center font-mono text-xs flex flex-col justify-center gap-1 hover:-translate-y-0.5 transition-all duration-200 select-none ${t.bg}`}
              >
                <span className="font-bold">{t.name}</span>
                <span className="opacity-50 text-[9px]">{t.id}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-charcoal-border py-8 bg-charcoal-light/10 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-charcoal-text-muted">
            <span className="w-2 h-2 rounded-full bg-forest-accent animate-pulse" />
            <span>ProofForge Engines Operational (v1.0)</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono text-charcoal-text-muted">
            <Link href="/login" className="hover:text-foreground">Authentication</Link>
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link href="/admin" className="hover:text-foreground">Platform Admin</Link>
          </div>

          <div className="text-[11px] font-mono text-charcoal-text-muted">
            © {new Date().getFullYear()} ProofForge. Local-First Development.
          </div>
        </div>
      </footer>

      {/* Command Palette component trigger */}
      <CommandPalette />

    </div>
  );
}
