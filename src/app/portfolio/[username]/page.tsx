'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Download, FileJson, FolderArchive, Printer, 
  RefreshCw, ShieldAlert, Award, FileText
} from 'lucide-react';
import { storage, PortfolioConfig } from '@/utils/storage';
import { fetchGitHubData, getDemoDeveloperData, GitHubProfileData } from '@/services/github';
import PortfolioPreview from '@/components/portfolio-preview';
import { exportPortfolioJson, exportPortfolioZip, printResumePdf } from '@/utils/exporter';
import { CommandPalette } from '@/components/command-palette';

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function PublicPortfolioPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { username } = use(params);

  const [profile, setProfile] = useState<GitHubProfileData | null>(null);
  const [config, setConfig] = useState<PortfolioConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) return;

    // Load configuration
    // Check if configuration details are encoded in the URL query hash: ?config=<base64_json>
    const urlConfig = searchParams.get('config');
    let loadedConfig: PortfolioConfig | null = null;

    if (urlConfig) {
      try {
        const decoded = atob(urlConfig);
        loadedConfig = JSON.parse(decoded);
      } catch (e) {
        console.warn('Could not parse config from URL hash, falling back to local.', e);
      }
    }

    if (!loadedConfig) {
      loadedConfig = storage.getPortfolioConfig(username);
    }

    setConfig(loadedConfig);

    // Load profile data
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // First try reading cache
        const cache = localStorage.getItem(`proofforge_cache_${username}`);
        let data: GitHubProfileData | null = null;
        if (cache) {
          data = JSON.parse(cache);
        } else {
          // Fetch live from GitHub using saved auth token if available (or empty)
          const session = storage.getAuthSession();
          const token = session?.username === username ? session.token : undefined;
          data = await fetchGitHubData(username, token);
          localStorage.setItem(`proofforge_cache_${username}`, JSON.stringify(data));
        }

        setProfile(data);

        // Record a view event in analytics
        storage.trackEvent(username, 'view');
      } catch (err: any) {
        console.error(err);
        // Load high-fidelity fallback demo details
        const fallback = getDemoDeveloperData(username);
        setProfile(fallback);
        storage.trackEvent(username, 'view');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, searchParams]);

  // Set click tracker on links
  useEffect(() => {
    if (!profile) return;
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor) {
        const text = anchor.innerText || anchor.getAttribute('href') || 'link';
        storage.trackEvent(username, 'click', text.substring(0, 30));
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [profile, username]);

  const handleShareableUrl = () => {
    if (!config || typeof window === 'undefined') return;
    const b64 = btoa(JSON.stringify(config));
    const shareUrl = `${window.location.origin}/portfolio/${username}?config=${b64}`;
    
    navigator.clipboard.writeText(shareUrl);
    alert('Shareable portfolio URL copied to clipboard! Anyone with this link can view your customized portfolio theme.');
    
    // Log recruiter/interaction event
    storage.trackEvent(username, 'recruiter', 'Copied share link');
  };

  if (loading || !profile || !config) {
    return (
      <div className="min-h-screen bg-charcoal-bg text-foreground flex flex-col items-center justify-center font-mono text-xs gap-3">
        <RefreshCw className="w-5 h-5 text-forest-accent animate-spin" />
        <span>Synthesizing portfolio views & styles...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-bg text-foreground relative flex flex-col justify-between">
      
      {/* Dynamic SEO details inside title tags (handled via custom effects) */}

      {/* Floating control bar for viewing portfolios (hidden in print) */}
      <div className="no-print w-full border-b border-charcoal-border bg-charcoal-card/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between font-mono text-[10px] text-charcoal-text-muted">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1 hover:text-foreground cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-forest-accent" />
              <span>Dashboard</span>
            </button>
            <span className="opacity-30">|</span>
            <span>Developer View Mode</span>
          </div>

          <div className="flex items-center gap-3.5">
            <button 
              onClick={handleShareableUrl}
              className="text-forest-accent hover:underline cursor-pointer font-bold"
            >
              Copy Share Link
            </button>
            <span className="opacity-30">|</span>
            <button 
              onClick={() => printResumePdf(profile, config)}
              className="hover:text-foreground flex items-center gap-1 cursor-pointer"
              title="Print Resume PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button 
              onClick={() => exportPortfolioJson(profile, config)}
              className="hover:text-foreground flex items-center gap-1 cursor-pointer"
              title="Export JSON File"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>
            <button 
              onClick={() => exportPortfolioZip(profile, config)}
              className="hover:text-foreground flex items-center gap-1 cursor-pointer"
              title="Export ZIP Static website bundle"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ZIP Site</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Portfolio Area */}
      <main className="flex-1 w-full relative z-10 print-area">
        <PortfolioPreview profile={profile} config={config} />
      </main>

      {/* Footer */}
      <footer className="no-print w-full border-t border-charcoal-border py-6 bg-charcoal-light/10 text-center text-[10px] font-mono text-charcoal-text-muted relative z-10">
        Generated via <Link href="/" className="text-forest-accent hover:underline">ProofForge</Link>. Sync status operational.
      </footer>

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}
