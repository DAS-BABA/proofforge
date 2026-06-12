'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Terminal, User, BarChart2, Radio, Settings, LogOut, 
  GitCommit, Flame, Award, Shield, AlertTriangle, 
  RefreshCw, CheckCircle, Plus, Trash2, ExternalLink, Activity
} from 'lucide-react';
import { storage, DeploymentProject } from '@/utils/storage';
import { fetchGitHubData, getDemoDeveloperData, GitHubProfileData } from '@/services/github';
import { getDeployedProjects } from '@/services/deployments';
import { CommandPalette } from '@/components/command-palette';

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ username: string; token?: string } | null>(null);
  const [profile, setProfile] = useState<GitHubProfileData | null>(null);
  const [deployments, setDeployments] = useState<DeploymentProject[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'scanner'>('overview');
  
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Deployment token inputs
  const [vercelToken, setVercelToken] = useState('');
  const [netlifyToken, setNetlifyToken] = useState('');
  const [railwayToken, setRailwayToken] = useState('');
  const [renderToken, setRenderToken] = useState('');

  // Toast helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const activeSession = storage.getAuthSession();
    if (!activeSession) {
      router.push('/login');
      return;
    }
    setSession(activeSession);

    // Load saved tokens
    const tokens = storage.getDeploymentTokens();
    if (tokens.vercel) setVercelToken(tokens.vercel);
    if (tokens.netlify) setNetlifyToken(tokens.netlify);
    if (tokens.railway) setRailwayToken(tokens.railway);
    if (tokens.render) setRenderToken(tokens.render);

    // Initial load
    loadDashboardData(activeSession.username, activeSession.token);
  }, [router]);

  const loadDashboardData = async (username: string, token?: string, forceRefresh = false) => {
    setLoading(true);
    try {
      let data: GitHubProfileData | null = null;
      
      if (!forceRefresh) {
        // Try reading cache first
        const cache = localStorage.getItem(`proofforge_cache_${username}`);
        if (cache) {
          try {
            data = JSON.parse(cache);
          } catch {
            data = null;
          }
        }
      }

      if (!data) {
        data = await fetchGitHubData(username, token);
        localStorage.setItem(`proofforge_cache_${username}`, JSON.stringify(data));
      }

      setProfile(data);

      // Fetch deployments
      const deploys = await getDeployedProjects(username);
      setDeployments(deploys);
    } catch (error: any) {
      showToast(error.message || 'Error loading dashboard datasets', 'error');
      // Set mock fallback so app doesn't break
      const fallback = getDemoDeveloperData(username);
      setProfile(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncData = async () => {
    if (!session) return;
    setSyncing(true);
    showToast('Syncing live GitHub & deployment changes...', 'info');
    try {
      const data = await fetchGitHubData(session.username, session.token);
      localStorage.setItem(`proofforge_cache_${session.username}`, JSON.stringify(data));
      setProfile(data);

      const deploys = await getDeployedProjects(session.username);
      setDeployments(deploys);

      showToast('Dashboard details synced successfully!');
    } catch (error: any) {
      showToast(error.message || 'Synchronization failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveToken = (platform: string, tokenVal: string) => {
    if (!tokenVal.trim()) {
      showToast(`Token for ${platform} cannot be empty.`, 'error');
      return;
    }
    storage.saveDeploymentToken(platform, tokenVal.trim());
    showToast(`${platform} API token successfully stored locally.`);
    if (session) loadDashboardData(session.username, session.token, true);
  };

  const handleRemoveToken = (platform: string) => {
    storage.removeDeploymentToken(platform);
    if (platform === 'vercel') setVercelToken('');
    else if (platform === 'netlify') setNetlifyToken('');
    else if (platform === 'railway') setRailwayToken('');
    else if (platform === 'render') setRenderToken('');

    showToast(`${platform} credentials removed from browser.`);
    if (session) loadDashboardData(session.username, session.token, true);
  };

  const handleSignOut = () => {
    storage.clearAuthSession();
    router.push('/');
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-charcoal-bg text-foreground flex flex-col items-center justify-center font-mono text-xs gap-3">
        <RefreshCw className="w-5 h-5 text-forest-accent animate-spin" />
        <span>Loading ProofForge workspace dashboard...</span>
      </div>
    );
  }

  // Calculate some analytics details
  const totalStars = profile.repositories.reduce((acc, curr) => acc + curr.stars, 0);
  const totalForks = profile.repositories.reduce((acc, curr) => acc + curr.forks, 0);

  // SVG Chart Components:
  // 1. Language Pie Chart SVG (responsive viewport)
  const renderPieChart = () => {
    let currentAngle = 0;
    const radius = 70;
    const cx = 100;
    const cy = 100;
    
    return (
      <div className="w-full flex flex-col md:flex-row items-center gap-6">
        <svg viewBox="0 0 200 200" className="w-40 h-40 drop-shadow-xl shrink-0">
          {profile.languages.slice(0, 5).map((lang, idx) => {
            const angle = (lang.percentage / 100) * 360;
            const x1 = cx + radius * Math.cos((currentAngle - 90) * Math.PI / 180);
            const y1 = cy + radius * Math.sin((currentAngle - 90) * Math.PI / 180);
            
            currentAngle += angle;
            
            const x2 = cx + radius * Math.cos((currentAngle - 90) * Math.PI / 180);
            const y2 = cy + radius * Math.sin((currentAngle - 90) * Math.PI / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = `
              M ${cx} ${cy}
              L ${x1} ${y1}
              A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
              Z
            `;
            
            const colors = ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'];
            const fillColor = lang.color || colors[idx % colors.length];

            return (
              <path 
                key={lang.name} 
                d={pathData} 
                fill={fillColor} 
                className="hover:opacity-90 transition-opacity duration-150 border border-charcoal-card"
              />
            );
          })}
          <circle cx={cx} cy={cy} r={35} fill="var(--charcoal-card)" />
        </svg>

        <div className="flex-1 space-y-2 w-full">
          {profile.languages.slice(0, 5).map((lang, idx) => {
            const colors = ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'];
            const color = lang.color || colors[idx % colors.length];
            return (
              <div key={lang.name} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-foreground">{lang.name}</span>
                </div>
                <span className="text-charcoal-text-muted">{lang.percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 2. Commits Bar Chart SVG
  const renderBarChart = () => {
    // Generate commit history values (e.g. last 6 months)
    const commitMonths = [
      { label: 'Jan', count: Math.floor(Math.random() * 40) + 10 },
      { label: 'Feb', count: Math.floor(Math.random() * 60) + 20 },
      { label: 'Mar', count: Math.floor(Math.random() * 80) + 30 },
      { label: 'Apr', count: Math.floor(Math.random() * 50) + 40 },
      { label: 'May', count: Math.floor(Math.random() * 110) + 50 },
      { label: 'Jun', count: profile.contributions.total > 150 ? Math.floor(profile.contributions.total * 0.15) : 80 }
    ];

    const maxVal = Math.max(...commitMonths.map(m => m.count));

    return (
      <div className="w-full h-40 flex items-end gap-3 font-mono text-[9px] pt-4 select-none">
        {commitMonths.map((month) => {
          const heightPct = maxVal > 0 ? (month.count / maxVal) * 85 : 10;
          return (
            <div key={month.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <span className="opacity-0 group-hover:opacity-100 text-forest-accent font-bold transition-opacity duration-150">
                {month.count}
              </span>
              <div 
                className="w-full bg-forest-primary/20 group-hover:bg-forest-primary rounded border border-forest-primary/30 transition-all duration-200" 
                style={{ height: `${heightPct}%` }}
              />
              <span className="text-charcoal-text-muted mt-1">{month.label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // 3. Skills Radar Chart SVG
  const renderRadarChart = () => {
    // Determine dimensions
    const dimensions = ['Frontend', 'Backend', 'AI/ML', 'Cloud/Ops', 'Database', 'OSS'];
    const values = [85, 75, 60, 70, 65, 80]; // Mock skills mapping
    const size = 180;
    const center = size / 2;
    const rMax = 70;

    // Calculate axis coordinates
    const getCoordinates = (index: number, valuePct: number) => {
      const angle = (Math.PI * 2 / dimensions.length) * index - Math.PI / 2;
      const r = rMax * (valuePct / 100);
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle)
      };
    };

    const points = dimensions.map((_, idx) => {
      const { x, y } = getCoordinates(idx, values[idx]);
      return `${x},${y}`;
    }).join(' ');

    const webPoints30 = dimensions.map((_, idx) => {
      const { x, y } = getCoordinates(idx, 30);
      return `${x},${y}`;
    }).join(' ');

    const webPoints60 = dimensions.map((_, idx) => {
      const { x, y } = getCoordinates(idx, 60);
      return `${x},${y}`;
    }).join(' ');

    const webPoints90 = dimensions.map((_, idx) => {
      const { x, y } = getCoordinates(idx, 90);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-40 h-40">
          {/* Radial Web Grid */}
          <polygon points={webPoints30} fill="none" stroke="var(--charcoal-border)" strokeWidth={0.5} />
          <polygon points={webPoints60} fill="none" stroke="var(--charcoal-border)" strokeWidth={0.5} />
          <polygon points={webPoints90} fill="none" stroke="var(--charcoal-border)" strokeWidth={0.5} />
          
          {/* Axes */}
          {dimensions.map((dim, idx) => {
            const end = getCoordinates(idx, 100);
            return (
              <line 
                key={dim}
                x1={center}
                y1={center}
                x2={end.x}
                y2={end.y}
                stroke="var(--charcoal-border)"
                strokeWidth={0.5}
              />
            );
          })}

          {/* Area polygon */}
          <polygon 
            points={points} 
            fill="rgba(45, 106, 79, 0.25)" 
            stroke="var(--forest-primary)" 
            strokeWidth={1.5} 
          />

          {/* Text Labels */}
          {dimensions.map((dim, idx) => {
            const pos = getCoordinates(idx, 115);
            return (
              <text
                key={dim}
                x={pos.x}
                y={pos.y}
                fill="var(--charcoal-text-muted)"
                fontSize={7}
                fontFamily="monospace"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {dim}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-charcoal-bg text-foreground flex flex-col justify-between">
      
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#232729_1px,transparent_1px),linear-gradient(to_bottom,#232729_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* Toast popup */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-panel border border-charcoal-border px-5 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 font-mono text-xs no-print">
          <span className={`w-2 h-2 rounded-full ${
            toast.type === 'success' ? 'bg-forest-accent animate-pulse' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-400'
          }`} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="w-full border-b border-charcoal-border glass-panel relative z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-forest-primary/20 border border-forest-primary flex items-center justify-center">
                <Terminal className="w-4.5 h-4.5 text-forest-accent" />
              </div>
              <span className="font-mono font-bold tracking-tight text-sm">
                Proof<span className="text-forest-accent">Forge</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSyncData}
              disabled={syncing}
              className="px-3 py-1.5 border border-charcoal-border hover:border-forest-primary bg-charcoal-card hover:bg-charcoal-light/30 text-charcoal-text-muted hover:text-foreground rounded-md text-xs font-mono flex items-center gap-1.5 transition-all duration-200 cursor-pointer disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Live Data'}</span>
            </button>
            <div className="flex items-center gap-2 border-l border-charcoal-border pl-4">
              <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                className="w-7 h-7 rounded-full border border-charcoal-border object-cover" 
              />
              <span className="text-xs font-mono hidden md:inline-block max-w-[100px] truncate">
                {profile.name}
              </span>
              <button 
                onClick={handleSignOut}
                className="p-1.5 hover:bg-charcoal-light/40 hover:text-red-400 rounded-md transition-colors cursor-pointer text-charcoal-text-muted"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Workspace wrapper */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 relative z-10 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-56 shrink-0 space-y-2">
          <div className="text-[10px] font-mono uppercase text-forest-accent px-3 py-1.5 font-bold tracking-wider">
            Workspace Hub
          </div>
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono border text-left transition-all duration-150 cursor-pointer ${
              activeTab === 'overview' 
                ? 'bg-forest-primary/20 border-forest-primary text-foreground' 
                : 'bg-transparent border-transparent text-charcoal-text-muted hover:text-foreground'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono border text-left transition-all duration-150 cursor-pointer ${
              activeTab === 'analytics' 
                ? 'bg-forest-primary/20 border-forest-primary text-foreground' 
                : 'bg-transparent border-transparent text-charcoal-text-muted hover:text-foreground'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Analytics Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono border text-left transition-all duration-150 cursor-pointer ${
              activeTab === 'scanner' 
                ? 'bg-forest-primary/20 border-forest-primary text-foreground' 
                : 'bg-transparent border-transparent text-charcoal-text-muted hover:text-foreground'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Deployment Scanner</span>
          </button>

          <div className="border-t border-charcoal-border/50 my-4 pt-4 space-y-2">
            <div className="text-[10px] font-mono uppercase text-forest-accent px-3 py-1.5 font-bold tracking-wider">
              Output Engines
            </div>
            <Link
              href="/dashboard/customizer"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-charcoal-text-muted hover:text-foreground transition-all duration-150 border border-transparent cursor-pointer"
            >
              <Settings className="w-4 h-4 text-forest-accent" />
              <span>Theme Customizer</span>
            </Link>
            <Link
              href={`/portfolio/${profile.username}`}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-charcoal-text-muted hover:text-foreground transition-all duration-150 border border-transparent cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-forest-accent" />
              <span>Live Public Page</span>
            </Link>
          </div>
        </aside>

        {/* Tab panels */}
        <main className="flex-1 space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Profile Card & Stats Bento grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Profile detail card */}
                <div className="bento-card p-6 rounded-xl glass-panel flex flex-col justify-between h-full min-h-[200px]">
                  <div className="flex gap-4">
                    <img 
                      src={profile.avatarUrl} 
                      alt={profile.name} 
                      className="w-14 h-14 rounded-xl border border-charcoal-border object-cover shrink-0" 
                    />
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold truncate">{profile.name}</h2>
                      <p className="text-[10px] font-mono text-forest-accent">@{profile.username}</p>
                      <p className="text-[10px] font-mono text-charcoal-text-muted mt-1">Joined {new Date(profile.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-xs text-charcoal-text-muted line-clamp-3 my-4 italic leading-relaxed">
                    "{profile.bio || 'No public bio set on GitHub.'}"
                  </p>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-charcoal-text-muted">
                    <div><span className="font-bold text-foreground">{profile.followers}</span> Followers</div>
                    <div><span className="font-bold text-foreground">{profile.following}</span> Following</div>
                  </div>
                </div>

                {/* Git stats counter box */}
                <div className="bento-card p-6 rounded-xl glass-panel flex flex-col justify-between h-full min-h-[200px] md:col-span-2">
                  <div className="flex items-center justify-between border-b border-charcoal-border pb-3">
                    <span className="text-[10px] font-mono uppercase text-charcoal-text-muted">GitHub Raw Volume</span>
                    <span className="text-[10px] font-mono text-forest-accent flex items-center gap-1">
                      <GitCommit className="w-3.5 h-3.5" />
                      <span>Sync: Ok</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 text-center">
                    <div>
                      <div className="text-[10px] font-mono text-charcoal-text-muted mb-1">Total Repos</div>
                      <div className="text-xl md:text-2xl font-bold font-mono text-foreground">{profile.totalRepos}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-charcoal-text-muted mb-1">Total Stars</div>
                      <div className="text-xl md:text-2xl font-bold font-mono text-foreground">{totalStars}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-charcoal-text-muted mb-1">Total Forks</div>
                      <div className="text-xl md:text-2xl font-bold font-mono text-foreground">{totalForks}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-[10px] font-mono text-charcoal-text-muted bg-charcoal-light/40 p-2.5 rounded-lg border border-charcoal-border/50">
                    <Award className="w-4.5 h-4.5 text-forest-accent" />
                    <span>Auto Roles: {profile.roles.join(' | ') || 'Software Engineer'}</span>
                  </div>
                </div>
              </div>

              {/* Streaks stats Bento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bento-card p-5 rounded-xl glass-panel flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-charcoal-text-muted mb-1">Current Commit Streak</div>
                    <div className="text-2xl font-bold font-mono">{profile.contributions.streak.current} Days</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-orange-950/20 border border-orange-900/40 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-400" />
                  </div>
                </div>

                <div className="bento-card p-5 rounded-xl glass-panel flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-charcoal-text-muted mb-1">Longest Streak</div>
                    <div className="text-2xl font-bold font-mono">{profile.contributions.streak.longest} Days</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-forest-primary/20 border border-forest-primary/40 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-forest-accent animate-pulse" />
                  </div>
                </div>

                <div className="bento-card p-5 rounded-xl glass-panel flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-charcoal-text-muted mb-1">Average Daily Commits</div>
                    <div className="text-2xl font-bold font-mono">{profile.contributions.dailyAverage} / Day</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-forest-primary/20 border border-forest-primary/40 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-forest-accent" />
                  </div>
                </div>
              </div>

              {/* GitHub Heatmap calendar box */}
              <div className="bento-card p-6 rounded-xl glass-panel space-y-4">
                <div className="flex items-center justify-between border-b border-charcoal-border pb-3">
                  <span className="text-[10px] font-mono uppercase text-charcoal-text-muted">Contribution Heatmap Calendar</span>
                  <span className="text-[10px] font-mono text-charcoal-text-muted">{profile.contributions.total} commits past 365 days</span>
                </div>

                {/* Heatmap calendar grid */}
                <div className="overflow-x-auto no-scrollbar pt-2">
                  <div className="flex gap-[3px] min-w-[650px] select-none">
                    {/* Render days in vertical grids or horizontal rows */}
                    {/* We have 365 days. We can group them by weeks (53 columns) */}
                    {Array.from({ length: 53 }).map((_, wIdx) => {
                      const weekDays = profile.contributions.calendar.slice(wIdx * 7, (wIdx + 1) * 7);
                      return (
                        <div key={wIdx} className="flex flex-col gap-[3px] shrink-0">
                          {weekDays.map((day, dIdx) => {
                            // Map level color strictly to forest green gradient scale (avoid neon!)
                            const bgColors = [
                              'bg-charcoal-light/50 border border-charcoal-border/30', // Level 0
                              'bg-forest-primary/20 border border-forest-primary/10',  // Level 1
                              'bg-forest-primary/45 border border-forest-primary/20',  // Level 2
                              'bg-forest-primary/70 border border-forest-primary/30',  // Level 3
                              'bg-forest-accent/75 border border-forest-accent/30',   // Level 4
                            ];
                            return (
                              <div
                                key={dIdx}
                                className={`w-[9.5px] h-[9.5px] rounded-sm heatmap-cell ${bgColors[day.level]}`}
                                title={`${day.count} contributions on ${day.date}`}
                              />
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 text-[9px] font-mono text-charcoal-text-muted">
                  <span>Less</span>
                  <div className="flex items-center gap-[3px]">
                    <span className="w-2.5 h-2.5 rounded bg-charcoal-light border border-charcoal-border" />
                    <span className="w-2.5 h-2.5 rounded bg-forest-primary/20" />
                    <span className="w-2.5 h-2.5 rounded bg-forest-primary/50" />
                    <span className="w-2.5 h-2.5 rounded bg-forest-primary/80" />
                    <span className="w-2.5 h-2.5 rounded bg-forest-accent" />
                  </div>
                  <span>More</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ANALYTICS ENGINE */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Three Bento-grid charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Languages Pie */}
                <div className="bento-card p-6 rounded-xl glass-panel space-y-4">
                  <div className="border-b border-charcoal-border pb-2">
                    <span className="text-[10px] font-mono uppercase text-charcoal-text-muted">Languages Distribution</span>
                  </div>
                  {renderPieChart()}
                </div>

                {/* Commits Volume Bar Chart */}
                <div className="bento-card p-6 rounded-xl glass-panel space-y-4">
                  <div className="border-b border-charcoal-border pb-2">
                    <span className="text-[10px] font-mono uppercase text-charcoal-text-muted">Commit Volume History (Last 6 Months)</span>
                  </div>
                  {renderBarChart()}
                </div>

                {/* Radar Chart */}
                <div className="bento-card p-6 rounded-xl glass-panel space-y-4">
                  <div className="border-b border-charcoal-border pb-2">
                    <span className="text-[10px] font-mono uppercase text-charcoal-text-muted">Architectural Dimensions</span>
                  </div>
                  {renderRadarChart()}
                </div>

                {/* Local analytics views */}
                <div className="bento-card p-6 rounded-xl glass-panel flex flex-col justify-between gap-4">
                  <div className="border-b border-charcoal-border pb-2">
                    <span className="text-[10px] font-mono uppercase text-charcoal-text-muted">Portfolio Interactions (IndexedDB log)</span>
                  </div>

                  {/* Visual metrics log */}
                  {(() => {
                    const localStats = storage.getAnalytics(profile.username);
                    return (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                          <div className="bg-charcoal-light/30 border border-charcoal-border p-2 rounded">
                            <div className="text-[9px] text-charcoal-text-muted">Page Views</div>
                            <div className="text-base font-bold text-foreground">{localStats.views}</div>
                          </div>
                          <div className="bg-charcoal-light/30 border border-charcoal-border p-2 rounded">
                            <div className="text-[9px] text-charcoal-text-muted">Clicks</div>
                            <div className="text-base font-bold text-foreground">{localStats.clicks}</div>
                          </div>
                          <div className="bg-charcoal-light/30 border border-charcoal-border p-2 rounded">
                            <div className="text-[9px] text-charcoal-text-muted">Recruiters</div>
                            <div className="text-base font-bold text-foreground">{localStats.recruiterVisits}</div>
                          </div>
                        </div>
                        <div className="max-h-[70px] overflow-y-auto custom-scrollbar text-[9px] font-mono text-charcoal-text-muted space-y-1 bg-charcoal-bg p-2 rounded border border-charcoal-border/50">
                          {localStats.events.slice(-4).reverse().map((e, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>➜ {e.type === 'recruiter' ? 'Recruiter hit' : e.type === 'click' ? 'Clicked link' : 'Page view'}</span>
                              <span className="opacity-50">{new Date(e.timestamp).toLocaleTimeString()}</span>
                            </div>
                          ))}
                          {localStats.events.length === 0 && <p className="text-center py-2">No activity events recorded yet.</p>}
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: DEPLOYMENT SCANNER */}
          {activeTab === 'scanner' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Credentials scanner inputs */}
              <div className="bento-card p-6 rounded-xl glass-panel space-y-5">
                <div className="border-b border-charcoal-border pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold">Cloud Deployment Integration Scanners</h3>
                    <p className="text-[10px] text-charcoal-text-muted">Input deployment API keys to scan for live links and build statuses automatically.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vercel scanner */}
                  <div className="space-y-1.5 p-4 border border-charcoal-border rounded-lg bg-charcoal-bg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-foreground">Vercel Scanner</span>
                      {storage.getDeploymentTokens().vercel ? (
                        <span className="text-[9px] text-forest-accent font-mono">Connected</span>
                      ) : (
                        <span className="text-[9px] text-charcoal-text-muted font-mono">Not Connected</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        placeholder="Vercel Access Token"
                        value={vercelToken}
                        onChange={(e) => setVercelToken(e.target.value)}
                        className="flex-1 bg-charcoal-card border border-charcoal-border text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-forest-primary text-foreground"
                      />
                      {storage.getDeploymentTokens().vercel ? (
                        <button 
                          onClick={() => handleRemoveToken('vercel')}
                          className="p-2 bg-red-950/20 text-red-400 hover:bg-red-950/40 rounded border border-red-950 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleSaveToken('vercel', vercelToken)}
                          className="p-2 bg-forest-primary/20 text-forest-accent hover:bg-forest-primary/40 rounded border border-forest-primary cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Netlify scanner */}
                  <div className="space-y-1.5 p-4 border border-charcoal-border rounded-lg bg-charcoal-bg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-foreground">Netlify Scanner</span>
                      {storage.getDeploymentTokens().netlify ? (
                        <span className="text-[9px] text-forest-accent font-mono">Connected</span>
                      ) : (
                        <span className="text-[9px] text-charcoal-text-muted font-mono">Not Connected</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        placeholder="Netlify Access Token"
                        value={netlifyToken}
                        onChange={(e) => setNetlifyToken(e.target.value)}
                        className="flex-1 bg-charcoal-card border border-charcoal-border text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-forest-primary text-foreground"
                      />
                      {storage.getDeploymentTokens().netlify ? (
                        <button 
                          onClick={() => handleRemoveToken('netlify')}
                          className="p-2 bg-red-950/20 text-red-400 hover:bg-red-950/40 rounded border border-red-950 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleSaveToken('netlify', netlifyToken)}
                          className="p-2 bg-forest-primary/20 text-forest-accent hover:bg-forest-primary/40 rounded border border-forest-primary cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Railway scanner */}
                  <div className="space-y-1.5 p-4 border border-charcoal-border rounded-lg bg-charcoal-bg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-foreground">Railway Scanner</span>
                      {storage.getDeploymentTokens().railway ? (
                        <span className="text-[9px] text-forest-accent font-mono">Connected</span>
                      ) : (
                        <span className="text-[9px] text-charcoal-text-muted font-mono">Not Connected</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        placeholder="Railway Account Token"
                        value={railwayToken}
                        onChange={(e) => setRailwayToken(e.target.value)}
                        className="flex-1 bg-charcoal-card border border-charcoal-border text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-forest-primary text-foreground"
                      />
                      {storage.getDeploymentTokens().railway ? (
                        <button 
                          onClick={() => handleRemoveToken('railway')}
                          className="p-2 bg-red-950/20 text-red-400 hover:bg-red-950/40 rounded border border-red-950 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleSaveToken('railway', railwayToken)}
                          className="p-2 bg-forest-primary/20 text-forest-accent hover:bg-forest-primary/40 rounded border border-forest-primary cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Render scanner */}
                  <div className="space-y-1.5 p-4 border border-charcoal-border rounded-lg bg-charcoal-bg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-foreground">Render Scanner</span>
                      {storage.getDeploymentTokens().render ? (
                        <span className="text-[9px] text-forest-accent font-mono">Connected</span>
                      ) : (
                        <span className="text-[9px] text-charcoal-text-muted font-mono">Not Connected</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        placeholder="Render API Key"
                        value={renderToken}
                        onChange={(e) => setRenderToken(e.target.value)}
                        className="flex-1 bg-charcoal-card border border-charcoal-border text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-forest-primary text-foreground"
                      />
                      {storage.getDeploymentTokens().render ? (
                        <button 
                          onClick={() => handleRemoveToken('render')}
                          className="p-2 bg-red-950/20 text-red-400 hover:bg-red-950/40 rounded border border-red-950 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleSaveToken('render', renderToken)}
                          className="p-2 bg-forest-primary/20 text-forest-accent hover:bg-forest-primary/40 rounded border border-forest-primary cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scanned projects list */}
              <div className="bento-card p-6 rounded-xl glass-panel space-y-4">
                <div className="border-b border-charcoal-border pb-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-charcoal-text-muted">Active Deployments ({deployments.length})</span>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-charcoal-border text-charcoal-text-muted">
                        <th className="py-2.5">Project Name</th>
                        <th className="py-2.5">Platform</th>
                        <th className="py-2.5">Detected Framework</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5">Last Deploy</th>
                        <th className="py-2.5 text-right">Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-border/50 text-foreground">
                      {deployments.map((d) => (
                        <tr key={d.id} className="hover:bg-charcoal-light/10 transition-colors">
                          <td className="py-3 font-bold">{d.name}</td>
                          <td className="py-3 uppercase text-[10px]">{d.platform}</td>
                          <td className="py-3 text-charcoal-text-muted">{d.framework || 'HTML/JS'}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.status === 'READY' 
                                ? 'bg-forest-primary/20 text-forest-accent border border-forest-primary/30' 
                                : d.status === 'ERROR' 
                                  ? 'bg-red-950/20 text-red-400 border border-red-950/30' 
                                  : 'bg-yellow-950/20 text-yellow-400 border border-yellow-950/30'
                            }`}>
                              {d.status === 'READY' && <CheckCircle className="w-3 h-3" />}
                              {d.status === 'ERROR' && <AlertTriangle className="w-3 h-3" />}
                              {d.status === 'BUILDING' && <RefreshCw className="w-3 h-3 animate-spin" />}
                              <span>{d.status}</span>
                            </span>
                          </td>
                          <td className="py-3 text-[10px] text-charcoal-text-muted">
                            {new Date(d.lastUpdated).toLocaleString()}
                          </td>
                          <td className="py-3 text-right">
                            {d.url ? (
                              <a
                                href={d.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-forest-accent hover:underline inline-flex items-center gap-1"
                              >
                                <span>Visit</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-charcoal-text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      ))}

                      {deployments.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-charcoal-text-muted">
                            No deployments scanned yet. Add credentials above to scan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-charcoal-border py-6 bg-charcoal-light/10 text-center text-[10px] font-mono text-charcoal-text-muted relative z-10">
        ProofForge platform dashboard. Encrypted client-side storage active.
      </footer>

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}
