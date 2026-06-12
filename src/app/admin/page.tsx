'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Terminal, ShieldCheck, Users, Layers, Activity, 
  Cpu, Heart, BarChart4, ArrowLeft, RefreshCw, RefreshCcw
} from 'lucide-react';
import { storage } from '@/utils/storage';
import { CommandPalette } from '@/components/command-palette';

export default function AdminPanelPage() {
  const router = useRouter();
  
  // Admin stats states
  const [usersCount, setUsersCount] = useState(0);
  const [portfoliosCount, setPortfoliosCount] = useState(0);
  const [apiStats, setApiStats] = useState({ githubCount: 842, deployCount: 412 });
  const [themeStats, setThemeStats] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = () => {
    setRefreshing(true);
    
    // Retrieve users list
    const usersList = storage.getGlobalUsers();
    setUsersCount(usersList.length);
    
    // Each user has a config. Count stored keys starting with config
    let configsCount = 0;
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('proofforge_config_')) {
          configsCount++;
        }
      }
    }
    // Default mock baseline + custom configs
    setPortfoliosCount(Math.max(3, configsCount) + 1242);

    // Retrieve API usage counters
    setApiStats(storage.getApiUsage());

    // Retrieve theme usage distribution
    setThemeStats(storage.getThemeUsage());

    setTimeout(() => setRefreshing(false), 500);
  };

  const handleResetTelemetry = () => {
    if (confirm('Are you sure you want to reset telemetry logs back to baseline values? This won\'t delete your portfolios.')) {
      localStorage.removeItem('proofforge_api_usage');
      localStorage.removeItem('proofforge_theme_usage');
      loadAdminStats();
    }
  };

  // Convert theme stats to display sorted array
  const sortedThemes = Object.entries(themeStats)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);

  const maxThemeCount = sortedThemes[0]?.count || 1;

  return (
    <div className="relative min-h-screen bg-charcoal-bg text-foreground flex flex-col justify-between">
      
      {/* Background Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#232729_1px,transparent_1px),linear-gradient(to_bottom,#232729_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* Header */}
      <header className="w-full border-b border-charcoal-border glass-panel relative z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="p-1.5 hover:bg-charcoal-light/40 rounded-md transition-colors cursor-pointer text-charcoal-text-muted hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="font-mono text-xs font-bold text-charcoal-text-muted">
              ProofForge / <span className="text-foreground">System Admin Console</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminStats}
              disabled={refreshing}
              className="p-2 border border-charcoal-border hover:border-forest-primary bg-charcoal-card rounded-md text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer text-charcoal-text-muted hover:text-foreground"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleResetTelemetry}
              className="px-3.5 py-1.8 bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-950 font-mono rounded-md text-xs transition-colors cursor-pointer"
            >
              Reset Logs
            </button>
          </div>
        </div>
      </header>

      {/* Core Panels Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 relative z-10 space-y-6">
        
        {/* Title area */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-forest-primary/10 border border-forest-primary/30 flex items-center justify-center">
            <ShieldCheck className="w-5.5 h-5.5 text-forest-accent" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-sans">Platform telemetry logs</h1>
            <p className="text-xs text-charcoal-text-muted">Monitor global usage stats, API rates, and active styling distributions.</p>
          </div>
        </div>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:grid-cols-4">
          <div className="bento-card p-5 rounded-xl glass-panel flex flex-col justify-between h-28">
            <div className="flex items-center justify-between text-charcoal-text-muted">
              <span className="text-[10px] font-mono uppercase">Local Users</span>
              <Users className="w-4 h-4 text-forest-accent" />
            </div>
            <span className="text-xl md:text-2xl font-bold font-mono text-foreground">{usersCount} accounts</span>
          </div>

          <div className="bento-card p-5 rounded-xl glass-panel flex flex-col justify-between h-28">
            <div className="flex items-center justify-between text-charcoal-text-muted">
              <span className="text-[10px] font-mono uppercase">Portfolios Active</span>
              <Layers className="w-4 h-4 text-forest-accent" />
            </div>
            <span className="text-xl md:text-2xl font-bold font-mono text-foreground">{portfoliosCount} sites</span>
          </div>

          <div className="bento-card p-5 rounded-xl glass-panel flex flex-col justify-between h-28">
            <div className="flex items-center justify-between text-charcoal-text-muted">
              <span className="text-[10px] font-mono uppercase">GitHub Requests</span>
              <Cpu className="w-4 h-4 text-forest-accent" />
            </div>
            <span className="text-xl md:text-2xl font-bold font-mono text-foreground">{apiStats.githubCount} queries</span>
          </div>

          <div className="bento-card p-5 rounded-xl glass-panel flex flex-col justify-between h-28">
            <div className="flex items-center justify-between text-charcoal-text-muted">
              <span className="text-[10px] font-mono uppercase">Deploy Scans</span>
              <Activity className="w-4 h-4 text-forest-accent" />
            </div>
            <span className="text-xl md:text-2xl font-bold font-mono text-foreground">{apiStats.deployCount} scans</span>
          </div>
        </div>

        {/* Split Bento Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Theme Usage Distribution (Bento 2 Columns) */}
          <div className="bento-card p-6 rounded-xl glass-panel space-y-4 lg:col-span-2">
            <div className="border-b border-charcoal-border pb-3 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-charcoal-text-muted flex items-center gap-1">
                <BarChart4 className="w-3.5 h-3.5 text-forest-accent" />
                <span>Global Theme Usage Distribution</span>
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {sortedThemes.map((theme) => {
                const pct = Math.round((theme.count / maxThemeCount) * 100);
                return (
                  <div key={theme.id} className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="capitalize">{theme.id.replace('-', ' ')}</span>
                      <span className="text-charcoal-text-muted">{theme.count} active</span>
                    </div>
                    <div className="w-full h-2 bg-charcoal-bg rounded border border-charcoal-border overflow-hidden">
                      <div 
                        className="h-full bg-forest-primary rounded-r transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {sortedThemes.length === 0 && <p className="text-center py-8 text-charcoal-text-muted">No themes parsed yet.</p>}
            </div>
          </div>

          {/* Traffic Logs (Bento 1 Column) */}
          <div className="bento-card p-6 rounded-xl glass-panel space-y-4">
            <div className="border-b border-charcoal-border pb-3">
              <span className="text-[10px] font-mono uppercase text-charcoal-text-muted flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-forest-accent animate-pulse" />
                <span>System Traffic Event Stream</span>
              </span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar font-mono text-[9px] text-charcoal-text-muted">
              {[
                { time: '12:02:14', msg: 'Sync trigger for proof_forge_demo complete' },
                { time: '11:58:32', msg: 'Zip bundle compiled for user alex_forge' },
                { time: '11:42:01', msg: 'Admin reset logged' },
                { time: '11:12:45', msg: 'New oauth connection simulated for octocat' },
                { time: '10:52:19', msg: 'Config override saved for user dan_abramov' },
                { time: '10:14:02', msg: 'Vercel API scan response parsed [200]' },
                { time: '09:54:11', msg: 'Theme Switch -> Futuristic UI recorded' }
              ].map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-forest-accent">[{log.time}]</span>
                  <span className="truncate">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-charcoal-border py-6 bg-charcoal-light/10 text-center text-[10px] font-mono text-charcoal-text-muted relative z-10">
        ProofForge Telemetry and Metrics Engine. Protected Node access.
      </footer>

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}
