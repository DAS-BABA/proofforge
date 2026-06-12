'use client';

import React from 'react';
import { 
  Globe, Mail, Star, GitFork, Calendar, Award, ExternalLink, 
  Flame, CheckCircle, Terminal, Layers
} from 'lucide-react';
import { GitHubProfileData } from '@/services/github';
import { PortfolioConfig } from '@/utils/storage';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);


interface PortfolioPreviewProps {
  profile: GitHubProfileData;
  config: PortfolioConfig;
  isPreview?: boolean;
}

export default function PortfolioPreview({ profile, config, isPreview = false }: PortfolioPreviewProps) {
  const { theme, customBio, customRole, socials, visibleSections, featuredProjects } = config;

  // Derive active bio and role
  const bioText = customBio || profile.bio;
  const roleText = customRole || profile.roles[0] || 'Software Engineer';

  // Get visible sections in order
  const isVisible = (secId: string) => visibleSections.includes(secId);

  // Group and select projects
  const displayProjects = profile.repositories.filter(repo => {
    if (featuredProjects && featuredProjects.length > 0) {
      return featuredProjects.includes(repo.name);
    }
    return true; // Show all (top starred first) if none featured
  }).slice(0, 6);

  // Resolve theme-specific styles
  const themeStyles: Record<string, {
    container: string;
    card: string;
    textPrimary: string;
    textMuted: string;
    border: string;
    highlight: string;
    badge: string;
    accent: string;
    font: string;
    backgroundStyle?: React.CSSProperties;
  }> = {
    'cyberpunk': {
      container: 'bg-black text-[#ffea00] min-h-full p-6 relative',
      card: 'border-2 border-[#ff0055] bg-neutral-950 p-5 rounded-none shadow-[4px_4px_0px_#ff0055]',
      textPrimary: 'text-[#ffea00] font-black uppercase tracking-wider',
      textMuted: 'text-neutral-400 font-mono text-xs',
      border: 'border-2 border-[#ff0055]',
      highlight: 'text-white bg-[#ff0055] px-1 font-bold',
      badge: 'border border-[#ffea00] text-[#ffea00] bg-black font-mono',
      accent: 'text-[#ff0055]',
      font: 'font-mono uppercase',
    },
    'neon-blue': {
      container: 'bg-[#030712] text-slate-100 min-h-full p-6',
      card: 'border border-cyan-500/30 bg-[#0b132b]/80 p-5 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-md',
      textPrimary: 'text-cyan-400 font-extrabold',
      textMuted: 'text-slate-400 text-xs',
      border: 'border border-cyan-500/30',
      highlight: 'text-cyan-300 font-bold',
      badge: 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/40 font-mono',
      accent: 'text-cyan-400',
      font: 'font-sans',
    },
    'purple-glow': {
      container: 'bg-[#0f0a1c] text-indigo-50 min-h-full p-6 relative overflow-hidden',
      card: 'border border-violet-500/20 bg-indigo-950/40 p-5 rounded-2xl backdrop-blur-lg shadow-xl',
      textPrimary: 'text-violet-300 font-bold',
      textMuted: 'text-indigo-300/70 text-xs',
      border: 'border border-violet-500/20',
      highlight: 'text-white bg-gradient-to-r from-violet-600 to-indigo-600 px-2 rounded',
      badge: 'bg-violet-950/50 text-violet-300 border border-violet-500/30',
      accent: 'text-violet-400',
      font: 'font-sans',
    },
    'futuristic-ui': {
      container: 'bg-[#0d0e0f] text-slate-200 min-h-full p-6 border border-charcoal-border',
      card: 'border border-[#232729] bg-[#131517] p-5 rounded-lg hover:border-forest-primary transition-colors',
      textPrimary: 'text-[#74c69d] font-bold font-mono',
      textMuted: 'text-slate-400 text-xs font-mono',
      border: 'border border-[#232729]',
      highlight: 'text-forest-accent bg-forest-primary/20 px-1.5 py-0.5 rounded border border-forest-primary/30 font-mono',
      badge: 'bg-forest-primary/10 text-forest-accent border border-forest-primary/30 font-mono',
      accent: 'text-forest-accent',
      font: 'font-mono',
    },
    'minimal': {
      container: 'bg-[#fafafa] text-stone-800 min-h-full p-8 max-w-4xl mx-auto',
      card: 'border border-stone-200 bg-white p-6 rounded-none hover:shadow-sm transition-all',
      textPrimary: 'text-stone-900 font-normal tracking-tight',
      textMuted: 'text-stone-500 text-xs font-serif italic',
      border: 'border border-stone-200',
      highlight: 'text-stone-900 font-semibold underline decoration-stone-400 decoration-1',
      badge: 'bg-stone-100 text-stone-700 border border-stone-200 font-sans text-[10px] rounded-none',
      accent: 'text-stone-900',
      font: 'font-serif',
    },
    'clean-white': {
      container: 'bg-slate-50 text-slate-800 min-h-full p-6',
      card: 'border border-slate-200 bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow',
      textPrimary: 'text-slate-900 font-bold',
      textMuted: 'text-slate-500 text-xs',
      border: 'border border-slate-200',
      highlight: 'text-white bg-slate-900 px-2 py-0.5 rounded-md',
      badge: 'bg-slate-100 text-slate-700 border border-slate-200 font-sans',
      accent: 'text-slate-700',
      font: 'font-sans',
    },
    'elegant-typography': {
      container: 'bg-[#faf7f2] text-[#2c221e] min-h-full p-8',
      card: 'border border-[#dcd7ce] bg-white p-6 rounded-none shadow-sm',
      textPrimary: 'text-[#1a120e] font-serif font-semibold italic',
      textMuted: 'text-[#6e635c] text-xs font-sans',
      border: 'border border-[#dcd7ce]',
      highlight: 'text-[#faf7f2] bg-[#423129] px-2 py-0.5 font-serif rounded-sm',
      badge: 'bg-[#f4efe6] text-[#423129] border border-[#dcd7ce] font-serif',
      accent: 'text-[#423129]',
      font: 'font-serif',
    },
    'developer-dark': {
      container: 'bg-[#181818] text-[#d4d4d4] min-h-full p-6 font-mono',
      card: 'border border-[#2d2d2d] bg-[#1e1e1e] p-5 rounded-sm hover:bg-[#252526] transition-colors',
      textPrimary: 'text-[#9cdcfe] font-bold',
      textMuted: 'text-[#808080] text-xs',
      border: 'border border-[#2d2d2d]',
      highlight: 'text-[#ce9178] bg-black/30 px-1 rounded',
      badge: 'bg-[#252526] text-[#4fc1ff] border border-[#3c3c3c]',
      accent: 'text-[#b5cea8]',
      font: 'font-mono',
    },
    'github-style': {
      container: 'bg-[#0d1117] text-[#c9d1d9] min-h-full p-6',
      card: 'border border-[#30363d] bg-[#161b22] p-5 rounded-md',
      textPrimary: 'text-[#f0f6fc] font-semibold',
      textMuted: 'text-[#8b949e] text-xs',
      border: 'border border-[#30363d]',
      highlight: 'text-[#58a6ff] font-bold hover:underline',
      badge: 'bg-[#21262d] text-[#c9d1d9] border border-[#30363d] font-mono rounded-full',
      accent: 'text-[#39d353]',
      font: 'font-sans',
    },
    'dark-code': {
      container: 'bg-[#272822] text-[#f8f8f2] min-h-full p-6 font-mono',
      card: 'border border-[#3e3d32] bg-[#1e1f1c] p-5 rounded-none',
      textPrimary: 'text-[#a6e22e] font-bold',
      textMuted: 'text-[#75715e] text-xs',
      border: 'border border-[#3e3d32]',
      highlight: 'text-[#f92672] bg-black/20 px-1',
      badge: 'bg-[#272822] text-[#66d9ef] border border-[#3e3d32]',
      accent: 'text-[#e6db74]',
      font: 'font-mono',
    },
    'ai-futurism': {
      container: 'bg-[#050b14] text-slate-100 min-h-full p-6 relative overflow-hidden',
      card: 'border border-teal-500/20 bg-[#0d1b2a]/90 p-5 rounded-2xl hover:border-teal-500/50 transition-all shadow-md backdrop-blur-md',
      textPrimary: 'text-teal-400 font-extrabold tracking-wider',
      textMuted: 'text-slate-400 text-xs',
      border: 'border border-teal-500/20',
      highlight: 'text-teal-200 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/40',
      badge: 'bg-teal-950/40 text-teal-300 border border-teal-500/30',
      accent: 'text-teal-400',
      font: 'font-sans',
    },
    'animated-gradients': {
      container: 'bg-[#0f172a] text-slate-100 min-h-full p-6 relative overflow-hidden',
      card: 'border border-white/10 bg-white/5 p-5 rounded-xl hover:border-white/20 transition-all backdrop-blur-md shadow-2xl',
      textPrimary: 'text-white font-bold',
      textMuted: 'text-slate-300/70 text-xs',
      border: 'border border-white/10',
      highlight: 'text-slate-100 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-2 rounded',
      badge: 'bg-white/10 text-slate-200 border border-white/10',
      accent: 'text-indigo-300',
      font: 'font-sans',
    }
  };

  const rawStyle = themeStyles[theme] || themeStyles['futuristic-ui'];
  const style = {
    ...rawStyle,
    card: `${rawStyle.card} theme-card`
  };

  // Shifting background meshes for animated gradients theme
  const renderThemeBackground = () => {
    if (theme === 'animated-gradients') {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-purple-800 to-indigo-800 opacity-20 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-800 to-blue-800 opacity-20 blur-[120px]" />
        </div>
      );
    }
    if (theme === 'purple-glow') {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[30%] left-[20%] w-[350px] h-[350px] rounded-full bg-violet-800/10 blur-[100px]" />
        </div>
      );
    }
    if (theme === 'cyberpunk') {
      return (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40 pointer-events-none z-0" />
      );
    }
    return null;
  };

  return (
    <div id="proofforge-portfolio-preview-content" className={`${style.container} ${style.font} select-none relative`} style={style.backgroundStyle}>
      {renderThemeBackground()}

      {/* Actual Content Wrapper */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-12">
        
        {/* HERO SECTION */}
        {isVisible('hero') && (
          <header className={`flex flex-col md:flex-row items-center justify-between gap-6 py-6 border-b ${theme === 'minimal' ? 'border-stone-200' : 'border-transparent'}`}>
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                className={`w-24 h-24 object-cover ${
                  theme === 'cyberpunk' 
                    ? 'rounded-none border-4 border-[#ff0055] shadow-[4px_4px_0px_#ffea00]' 
                    : theme === 'minimal' || theme === 'elegant-typography'
                      ? 'rounded-none border border-stone-300' 
                      : 'rounded-2xl border'
                }`}
                style={{ borderColor: style.border.split(' ').pop()?.replace('border-', '') }}
              />
              <div className="space-y-1">
                <h1 className={`text-2xl md:text-3xl font-extrabold ${style.textPrimary}`}>
                  {profile.name}
                </h1>
                <p className={`text-sm ${style.accent} font-mono font-bold`}>
                  {roleText}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pt-1.5">
                  {profile.roles.map((r, i) => (
                    <span key={i} className={`text-[9px] px-2 py-0.5 rounded ${style.badge}`}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Links Block */}
            <div className="flex items-center gap-3">
              {socials.github && (
                <a href={socials.github} target="_blank" rel="noreferrer" className={`p-2 hover:opacity-85 ${style.card} border flex items-center justify-center`}>
                  <GithubIcon className="w-4 h-4" />
                </a>
              )}
              {socials.twitter && (
                <a href={socials.twitter} target="_blank" rel="noreferrer" className={`p-2 hover:opacity-85 ${style.card} border flex items-center justify-center`}>
                  <TwitterIcon className="w-4 h-4" />
                </a>
              )}
              {socials.linkedin && (
                <a href={socials.linkedin} target="_blank" rel="noreferrer" className={`p-2 hover:opacity-85 ${style.card} border flex items-center justify-center`}>
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              )}
              {socials.website && (
                <a href={socials.website} target="_blank" rel="noreferrer" className={`p-2 hover:opacity-85 ${style.card} border flex items-center justify-center`}>
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {socials.email && (
                <a href={`mailto:${socials.email}`} className={`p-2 hover:opacity-85 ${style.card} border flex items-center justify-center`}>
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          </header>
        )}

        {/* ABOUT SECTION */}
        {isVisible('about') && (
          <section className="space-y-4">
            <h2 className={`text-sm tracking-widest uppercase border-b pb-1 font-bold ${style.textPrimary}`}>
              About Me
            </h2>
            <div className={style.card}>
              <p className={`text-xs leading-relaxed ${style.textMuted}`}>
                {bioText}
              </p>
            </div>
          </section>
        )}

        {/* SKILLS SECTION */}
        {isVisible('skills') && (
          <section className="space-y-4">
            <h2 className={`text-sm tracking-widest uppercase border-b pb-1 font-bold ${style.textPrimary}`}>
              Technical Proficiencies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: 'Frontend', skills: ['React', 'Next.js', 'TailwindCSS', 'TypeScript'] },
                { title: 'Backend', skills: ['Node.js', 'Go', 'Rust', 'Python'] },
                { title: 'Database', skills: ['PostgreSQL', 'IndexedDB', 'MongoDB', 'Redis'] },
                { title: 'Cloud/Ops', skills: ['Vercel', 'Netlify', 'Railway', 'GitHub Actions'] }
              ].map((cat, i) => (
                <div key={i} className={style.card}>
                  <h3 className={`text-xs font-bold font-mono mb-2.5 pb-1 border-b border-white/5 ${style.accent}`}>
                    {cat.title}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.skills.map((s, idx) => (
                      <span key={idx} className={`text-[10px] px-2 py-0.5 rounded ${style.badge}`}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PROJECTS SECTION */}
        {isVisible('projects') && (
          <section className="space-y-4">
            <h2 className={`text-sm tracking-widest uppercase border-b pb-1 font-bold ${style.textPrimary}`}>
              Scanned Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayProjects.map((repo, i) => (
                <div key={i} className={`${style.card} flex flex-col justify-between gap-4`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold truncate">{repo.name}</h3>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span>{repo.stars}</span>
                        </span>
                        <span className="flex items-center gap-0.5">
                          <GitFork className="w-3 h-3" />
                          <span>{repo.forks}</span>
                        </span>
                      </div>
                    </div>
                    <p className={`text-[11px] line-clamp-2 leading-relaxed ${style.textMuted}`}>
                      {repo.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {repo.languages.slice(0, 3).map((l, idx) => (
                      <span key={idx} className={`text-[9px] px-1.5 py-0.2 rounded ${style.badge}`}>
                        {l.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-2.5 text-[10px] font-mono">
                    <a href={repo.url} target="_blank" rel="noreferrer" className={`hover:underline flex items-center gap-1 ${style.highlight}`}>
                      <span>Source</span>
                      <GithubIcon className="w-3 h-3" />
                    </a>
                    {repo.homepageUrl && (
                      <a href={repo.homepageUrl} target="_blank" rel="noreferrer" className={`hover:underline flex items-center gap-1 ${style.accent}`}>
                        <span>Demo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* HEATMAP CALENDAR */}
        {isVisible('heatmap') && (
          <section className="space-y-4">
            <h2 className={`text-sm tracking-widest uppercase border-b pb-1 font-bold ${style.textPrimary}`}>
              Commit calendar
            </h2>
            <div className={`${style.card} overflow-x-auto no-scrollbar`}>
              <div className="flex gap-[3px] min-w-[500px]">
                {Array.from({ length: 40 }).map((_, wIdx) => {
                  const weekDays = profile.contributions.calendar.slice(wIdx * 7, (wIdx + 1) * 7);
                  return (
                    <div key={wIdx} className="flex flex-col gap-[3px] shrink-0">
                      {weekDays.map((day, dIdx) => {
                        const cellLevel = day.level;
                        
                        // Default forest scaling, or cyberpunk/neon scaling depending on theme
                        let cellBg = 'bg-slate-500/10';
                        if (cellLevel > 0) {
                          if (theme === 'cyberpunk') {
                            cellBg = cellLevel === 4 ? 'bg-[#ffea00]' : cellLevel === 3 ? 'bg-[#ff0055]/80' : 'bg-[#ff0055]/40';
                          } else if (theme === 'neon-blue') {
                            cellBg = cellLevel === 4 ? 'bg-cyan-400' : cellLevel === 3 ? 'bg-cyan-500/80' : 'bg-cyan-600/40';
                          } else {
                            cellBg = cellLevel === 4 ? 'bg-forest-primary' : cellLevel === 3 ? 'bg-forest-primary/80' : 'bg-forest-primary/40';
                          }
                        }
                        return (
                          <div 
                            key={dIdx} 
                            className={`w-[8px] h-[8px] rounded-sm shrink-0 ${cellBg}`} 
                            title={`${day.count} commits on ${day.date}`}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* TIMELINE */}
        {isVisible('timeline') && (
          <section className="space-y-4">
            <h2 className={`text-sm tracking-widest uppercase border-b pb-1 font-bold ${style.textPrimary}`}>
              Activity Stream
            </h2>
            <div className="space-y-3 font-mono text-xs">
              {profile.timeline.slice(0, 4).map((time, idx) => (
                <div key={idx} className={`p-4 border-l-2 flex justify-between gap-4 ${style.card}`} style={{ borderColor: style.accent.split(' ').pop()?.replace('text-', '') }}>
                  <div className="space-y-1">
                    <p className="font-bold">{time.title}</p>
                    <p className={`text-[10px] ${style.textMuted}`}>{time.description}</p>
                  </div>
                  <span className={`text-[9px] uppercase tracking-tighter shrink-0 ${style.textMuted} pt-0.5`}>
                    {new Date(time.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ACHIEVEMENTS / BADGES */}
        {isVisible('achievements') && (
          <section className="space-y-4">
            <h2 className={`text-sm tracking-widest uppercase border-b pb-1 font-bold ${style.textPrimary}`}>
              Earned Badges
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {profile.achievements.map((ach) => (
                <div 
                  key={ach.id} 
                  className={`p-3 rounded-lg border text-center flex flex-col items-center justify-between gap-2 transition-opacity ${style.card} ${
                    ach.unlocked ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <span className="text-xl select-none">{ach.icon}</span>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold leading-tight">{ach.title}</p>
                    <p className="text-[7px] text-slate-400 font-mono tracking-tighter">{ach.unlocked ? 'UNLOCKED' : 'LOCKED'}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
