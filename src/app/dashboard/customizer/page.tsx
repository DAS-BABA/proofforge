'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Terminal, ArrowLeft, Save, Eye, RefreshCw,
  Sliders, Palette, User, Link2, EyeOff, LayoutGrid,
  Download, FileText, FolderArchive, FileJson, Printer
} from 'lucide-react';
import { storage, PortfolioConfig } from '@/utils/storage';
import { fetchGitHubData, getDemoDeveloperData, GitHubProfileData } from '@/services/github';
import PortfolioPreview from '@/components/portfolio-preview';
import { PORTFOLIO_THEMES } from '@/components/theme-provider';
import { exportPortfolioJson, exportPortfolioZip, printResumePdf } from '@/utils/exporter';
import { CommandPalette } from '@/components/command-palette';

export default function CustomizerPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ username: string; token?: string } | null>(null);
  const [profile, setProfile] = useState<GitHubProfileData | null>(null);
  const [config, setConfig] = useState<PortfolioConfig | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
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

    // Load custom config
    const userConfig = storage.getPortfolioConfig(activeSession.username);
    setConfig(userConfig);

    // Load profile
    loadProfile(activeSession.username, activeSession.token);
  }, [router]);

  const loadProfile = async (username: string, token?: string) => {
    setLoading(true);
    try {
      const cache = localStorage.getItem(`proofforge_cache_${username}`);
      let data: GitHubProfileData | null = null;
      
      if (cache) {
        data = JSON.parse(cache);
      } else {
        data = await fetchGitHubData(username, token);
        localStorage.setItem(`proofforge_cache_${username}`, JSON.stringify(data));
      }
      setProfile(data);
    } catch {
      // Fallback
      setProfile(getDemoDeveloperData(username));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!session || !config) return;
    setSaving(true);
    try {
      storage.savePortfolioConfig(session.username, config);
      showToast('Portfolio settings saved successfully!');
    } catch (error) {
      showToast('Could not save configuration.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Field change triggers
  const updateConfigField = (field: keyof PortfolioConfig, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      [field]: value
    });
  };

  const updateSocialField = (socialKey: string, value: string) => {
    if (!config) return;
    setConfig({
      ...config,
      socials: {
        ...config.socials,
        [socialKey]: value
      }
    });
  };

  const toggleSection = (sectionId: string) => {
    if (!config) return;
    const isVisible = config.visibleSections.includes(sectionId);
    const updated = isVisible
      ? config.visibleSections.filter(s => s !== sectionId)
      : [...config.visibleSections, sectionId];
    updateConfigField('visibleSections', updated);
  };

  const toggleFeaturedProject = (repoName: string) => {
    if (!config) return;
    const isFeatured = config.featuredProjects.includes(repoName);
    const updated = isFeatured
      ? config.featuredProjects.filter(p => p !== repoName)
      : [...config.featuredProjects, repoName];
    updateConfigField('featuredProjects', updated);
  };

  // ZIP Static builder
  const handleZipExport = async () => {
    if (!profile || !config) return;
    setExporting(true);
    showToast('Compiling Tailwind style assets & generating ZIP bundle...', 'success');
    try {
      await exportPortfolioZip(profile, config);
      showToast('ZIP website package downloaded!');
    } catch (e) {
      console.error(e);
      showToast('ZIP compilation error.', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (loading || !profile || !config) {
    return (
      <div className="min-h-screen bg-charcoal-bg text-foreground flex flex-col items-center justify-center font-mono text-xs gap-3">
        <RefreshCw className="w-5 h-5 text-forest-accent animate-spin" />
        <span>Loading live customizer workspace...</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-charcoal-bg text-foreground flex flex-col justify-between">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-panel border border-charcoal-border px-5 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 font-mono text-xs no-print">
          <span className={`w-2 h-2 rounded-full ${
            toast.type === 'success' ? 'bg-forest-accent animate-pulse' : 'bg-red-500'
          }`} />
          <span>{toast.message}</span>
        </div>
      )}

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
              ProofForge / <span className="text-foreground">Customizer</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3.5 py-1.5 bg-forest-primary hover:bg-forest-light text-foreground font-mono font-bold rounded-md text-xs flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <Link
              href={`/portfolio/${profile.username}`}
              target="_blank"
              className="px-3.5 py-1.5 border border-charcoal-border hover:border-forest-primary bg-charcoal-card text-charcoal-text-muted hover:text-foreground rounded-md text-xs font-mono flex items-center gap-1.5 transition-all duration-150 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-forest-accent" />
              <span>Launch Live</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Workspace panel */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10 overflow-hidden h-[calc(100vh-4rem)]">
        
        {/* Left Side: Controls sidebar */}
        <aside className="w-full lg:w-[440px] border-b lg:border-b-0 lg:border-r border-charcoal-border shrink-0 overflow-y-auto custom-scrollbar bg-charcoal-card p-6 space-y-6 h-full">
          
          {/* Section 1: Themes select */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-forest-accent flex items-center gap-1.5">
              <Palette className="w-4 h-4" />
              <span>Portfolio Theme Style</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {PORTFOLIO_THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateConfigField('theme', t.id)}
                  className={`p-3 text-left rounded-lg border text-xs font-mono flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                    config.theme === t.id
                      ? 'bg-forest-primary/20 border-forest-primary text-foreground'
                      : 'bg-charcoal-bg border-charcoal-border hover:border-charcoal-light text-charcoal-text-muted hover:text-foreground'
                  }`}
                >
                  <span className="font-bold">{t.name}</span>
                  <span className="text-[8px] opacity-70 truncate">{t.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Bio and role details */}
          <div className="space-y-3 pt-3 border-t border-charcoal-border/50">
            <h3 className="text-xs font-mono font-bold uppercase text-forest-accent flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>Custom Text Overrides</span>
            </h3>
            
            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-charcoal-text-muted">Developer custom role title</label>
                <input
                  type="text"
                  placeholder={profile.roles[0] || 'Software Engineer'}
                  value={config.customRole}
                  onChange={(e) => updateConfigField('customRole', e.target.value)}
                  className="w-full bg-charcoal-bg border border-charcoal-border rounded px-3 py-1.8 text-xs text-foreground focus:outline-none focus:border-forest-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-charcoal-text-muted">Biography Overview text</label>
                <textarea
                  rows={4}
                  placeholder={profile.bio || 'AI generated bio description.'}
                  value={config.customBio}
                  onChange={(e) => updateConfigField('customBio', e.target.value)}
                  className="w-full bg-charcoal-bg border border-charcoal-border rounded px-3 py-1.8 text-xs text-foreground focus:outline-none focus:border-forest-primary resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Social connection detail */}
          <div className="space-y-3 pt-3 border-t border-charcoal-border/50">
            <h3 className="text-xs font-mono font-bold uppercase text-forest-accent flex items-center gap-1.5">
              <Link2 className="w-4 h-4" />
              <span>Social Links</span>
            </h3>
            <div className="space-y-2 font-mono text-xs">
              {['github', 'twitter', 'linkedin', 'website', 'email'].map((platform) => (
                <div key={platform} className="flex items-center gap-2 bg-charcoal-bg border border-charcoal-border rounded px-2.5 py-1">
                  <span className="text-[9px] uppercase text-charcoal-text-muted w-14 shrink-0 font-bold">{platform}</span>
                  <input
                    type="text"
                    placeholder={`Link to ${platform}...`}
                    value={(config.socials as any)[platform] || ''}
                    onChange={(e) => updateSocialField(platform, e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs text-foreground focus:ring-0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Section toggles */}
          <div className="space-y-3 pt-3 border-t border-charcoal-border/50 font-mono text-xs">
            <h3 className="text-xs font-mono font-bold uppercase text-forest-accent flex items-center gap-1.5">
              <LayoutGrid className="w-4 h-4" />
              <span>Portfolio Sections Layout</span>
            </h3>
            <div className="space-y-1.5">
              {[
                { id: 'hero', name: 'Profile Hero Header' },
                { id: 'about', name: 'Bio Description' },
                { id: 'skills', name: 'Dynamic Proficiencies Grid' },
                { id: 'projects', name: 'Scanned Repositories Showcase' },
                { id: 'heatmap', name: 'Commit Calendar Heatmap' },
                { id: 'timeline', name: 'Activity Stream' },
                { id: 'achievements', name: 'Unlocked badging achievements' },
              ].map((sec) => {
                const isActive = config.visibleSections.includes(sec.id);
                return (
                  <button
                    key={sec.id}
                    onClick={() => toggleSection(sec.id)}
                    className={`w-full flex items-center justify-between p-2 rounded border text-left cursor-pointer transition-colors ${
                      isActive 
                        ? 'bg-charcoal-bg border-forest-primary/45 text-foreground' 
                        : 'bg-charcoal-bg border-charcoal-border/50 text-charcoal-text-muted hover:text-foreground'
                    }`}
                  >
                    <span>{sec.name}</span>
                    {isActive ? (
                      <Eye className="w-3.5 h-3.5 text-forest-accent" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-charcoal-text-muted" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Repositories Featured */}
          <div className="space-y-3 pt-3 border-t border-charcoal-border/50 font-mono text-xs">
            <h3 className="text-xs font-mono font-bold uppercase text-forest-accent flex items-center gap-1.5">
              <Sliders className="w-4 h-4" />
              <span>Featured Repositories (Max 6)</span>
            </h3>
            <p className="text-[10px] text-charcoal-text-muted leading-tight mb-2">
              Select specific repositories to showcase on your portfolio. If none are selected, top starred repos show.
            </p>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar bg-charcoal-bg p-2 rounded border border-charcoal-border/60">
              {profile.repositories.map((repo) => {
                const isFeatured = config.featuredProjects.includes(repo.name);
                return (
                  <button
                    key={repo.name}
                    onClick={() => toggleFeaturedProject(repo.name)}
                    className={`w-full flex items-center justify-between p-1.5 rounded text-[10px] cursor-pointer text-left transition-colors ${
                      isFeatured ? 'bg-forest-primary/20 text-foreground font-bold' : 'text-charcoal-text-muted hover:text-foreground'
                    }`}
                  >
                    <span className="truncate pr-2">{repo.name}</span>
                    <span>{isFeatured ? '★ Featured' : '☆ Enable'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: Exporters triggers panel */}
          <div className="space-y-3 pt-3 border-t border-charcoal-border/50 font-mono text-xs">
            <h3 className="text-xs font-mono font-bold uppercase text-forest-accent flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              <span>Export Portfolios & Resume</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => printResumePdf(profile, config)}
                disabled={exporting}
                className="p-2 border border-charcoal-border hover:border-forest-primary bg-charcoal-bg hover:bg-charcoal-light/10 text-charcoal-text-muted hover:text-foreground rounded flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Printer className="w-3.5 h-3.5 text-forest-accent" />
                <span>Print PDF Resume</span>
              </button>

              <button 
                onClick={() => exportPortfolioJson(profile, config)}
                disabled={exporting}
                className="p-2 border border-charcoal-border hover:border-forest-primary bg-charcoal-bg hover:bg-charcoal-light/10 text-charcoal-text-muted hover:text-foreground rounded flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <FileJson className="w-3.5 h-3.5 text-forest-accent" />
                <span>Export JSON</span>
              </button>

              <button 
                onClick={handleZipExport}
                disabled={exporting}
                className="col-span-2 p-2.5 border border-charcoal-border hover:border-forest-primary bg-charcoal-bg hover:bg-charcoal-light/10 text-charcoal-text-muted hover:text-foreground rounded flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <FolderArchive className="w-4 h-4 text-forest-accent" />
                <span>Download Static Site (ZIP bundle)</span>
              </button>
            </div>
          </div>

        </aside>

        {/* Right Side: Live Dynamic Rendering Panel Preview Frame */}
        <section className="flex-1 bg-charcoal-bg p-6 lg:p-10 h-full flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between font-mono text-[10px] text-charcoal-text-muted pb-1.5 border-b border-charcoal-border shrink-0">
            <span>LIVE INTERACTIVE PORTFOLIO SANDBOX PREVIEW</span>
            <span>Theme: {config.theme}</span>
          </div>

          {/* Render target preview wrapper */}
          <div className="flex-1 rounded-xl border border-charcoal-border overflow-y-auto custom-scrollbar shadow-2xl glass-panel relative">
            <PortfolioPreview 
              profile={profile} 
              config={config} 
              isPreview={true} 
            />
          </div>
        </section>

      </div>

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}
