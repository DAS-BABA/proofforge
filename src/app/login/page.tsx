'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Key, User, ArrowRight, CheckCircle2, ShieldAlert, Terminal } from 'lucide-react';
import { storage } from '@/utils/storage';
import { fetchGitHubData } from '@/services/github';
import { CommandPalette } from '@/components/command-palette';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if session already exists
  useEffect(() => {
    const session = storage.getAuthSession();
    if (session) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please provide a valid GitHub username.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate user by trying to fetch profile data
      const data = await fetchGitHubData(username.trim(), token.trim() || undefined);
      
      // Store session
      storage.setAuthSession({
        username: data.username,
        token: token.trim() || undefined,
        rememberMe
      });

      // Cache the loaded data
      localStorage.setItem(`proofforge_cache_${data.username}`, JSON.stringify(data));

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not verify GitHub username. Check connection or token.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedOAuth = () => {
    setLoading(true);
    setError('');

    // Open a small simulated auth popup
    const width = 600;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;
    
    const popup = window.open(
      '',
      'GitHub OAuth Authorization',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    if (popup) {
      popup.document.write(`
        <html>
          <head>
            <title>Authorize ProofForge</title>
            <style>
              body {
                background-color: #0c0d0e;
                color: #e2e8f0;
                font-family: monospace;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                text-align: center;
              }
              .box {
                border: 1px solid #232729;
                background-color: #131517;
                padding: 40px;
                border-radius: 12px;
                max-width: 400px;
              }
              .title { color: #74c69d; font-size: 20px; font-weight: bold; margin-bottom: 20px; }
              .desc { color: #94a3b8; font-size: 13px; margin-bottom: 30px; line-height: 1.5; }
              .btn {
                background-color: #2d6a4f;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-family: monospace;
                font-weight: bold;
              }
              .btn:hover { background-color: #40916c; }
            </style>
          </head>
          <body>
            <div class="box">
              <div class="title">ProofForge Authorization</div>
              <div class="desc">Granting read access to public/private repositories, commit calendar collection, and profile overview.</div>
              <button class="btn" onclick="window.opener.postMessage('oauth_success', '*'); window.close();">
                Authorize proof_forge_demo
              </button>
            </div>
          </body>
        </html>
      `);
      popup.document.close();
    }

    // Listener for OAuth response
    const handleMessage = async (event: MessageEvent) => {
      if (event.data === 'oauth_success') {
        window.removeEventListener('message', handleMessage);
        
        try {
          // Log in with our high-quality default profile
          const data = await fetchGitHubData('proof_forge_demo');
          
          storage.setAuthSession({
            username: 'proof_forge_demo',
            rememberMe,
            token: undefined
          });

          localStorage.setItem(`proofforge_cache_proof_forge_demo`, JSON.stringify(data));
          
          setSuccess(true);
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        } catch (err: any) {
          setError('Simulated OAuth failed to initialize profile context.');
        } finally {
          setLoading(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Timeout safety closure
    setTimeout(() => {
      window.removeEventListener('message', handleMessage);
      if (loading) setLoading(false);
    }, 45000);
  };

  return (
    <div className="relative min-h-screen bg-charcoal-bg text-foreground overflow-hidden flex flex-col justify-between">
      
      {/* Background Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#232729_1px,transparent_1px),linear-gradient(to_bottom,#232729_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-forest-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] rounded-full bg-forest-dark/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full border-b border-charcoal-border glass-panel relative z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-forest-primary/20 border border-forest-primary flex items-center justify-center transition-all duration-300 group-hover:border-forest-accent">
              <Terminal className="w-4.5 h-4.5 text-forest-accent" />
            </div>
            <span className="font-mono font-bold tracking-tight text-lg">
              Proof<span className="text-forest-accent">Forge</span>
            </span>
          </Link>
          <Link href="/" className="text-xs font-mono text-charcoal-text-muted hover:text-foreground transition-colors cursor-pointer">
            ← Home
          </Link>
        </div>
      </header>

      {/* Form Container */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md bg-charcoal-card border border-charcoal-border rounded-xl p-8 glass-panel shadow-2xl space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-bold font-sans tracking-tight">Access ProofForge</h1>
            <p className="text-xs text-charcoal-text-muted">Connect your GitHub and build your dynamic portfolio.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/20 border border-red-950 text-red-400 rounded-lg text-xs flex items-center gap-2.5">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-forest-primary/10 border border-forest-primary text-forest-accent rounded-lg text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
              <span>Authentication Successful! Loading dashboard...</span>
            </div>
          )}

          {/* OAuth button */}
          <button
            onClick={handleSimulatedOAuth}
            disabled={loading || success}
            className="w-full py-2.5 bg-forest-primary hover:bg-forest-light text-foreground text-xs font-mono font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
          >
            <GithubIcon className="w-4.5 h-4.5" />
            <span>Connect via GitHub OAuth</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-charcoal-border" />
            </div>
            <span className="relative bg-charcoal-card px-3 text-[10px] uppercase font-mono text-charcoal-text-muted">
              Or login manually
            </span>
          </div>

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-charcoal-text-muted">
                GitHub Username
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-charcoal-text-muted absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. proof_forge_demo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading || success}
                  className="w-full bg-charcoal-bg border border-charcoal-border rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-forest-primary placeholder-charcoal-text-muted text-foreground transition-all duration-150"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-mono tracking-wider text-charcoal-text-muted">
                  Personal Access Token (PAT)
                </label>
                <span className="text-[9px] font-mono text-forest-accent">
                  Optional
                </span>
              </div>
              <div className="relative flex items-center">
                <Key className="w-4 h-4 text-charcoal-text-muted absolute left-3 pointer-events-none" />
                <input
                  type="password"
                  placeholder="ghp_..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={loading || success}
                  className="w-full bg-charcoal-bg border border-charcoal-border rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-forest-primary placeholder-charcoal-text-muted text-foreground transition-all duration-150"
                />
              </div>
              <p className="text-[9px] text-charcoal-text-muted leading-relaxed">
                Provide a PAT to access private repositories and bypass public GitHub API rate limiting.
              </p>
            </div>

            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading || success}
                className="w-3.5 h-3.5 rounded bg-charcoal-bg border-charcoal-border text-forest-primary focus:ring-0 cursor-pointer"
              />
              <label
                htmlFor="remember_me"
                className="ml-2.5 text-xs text-charcoal-text-muted font-mono select-none cursor-pointer"
              >
                Remember this developer session
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-2.5 border border-charcoal-border hover:border-forest-primary bg-charcoal-light/40 hover:bg-charcoal-light/75 text-foreground text-xs font-mono font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{loading ? 'Verifying Context...' : 'Initialize Session'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-forest-accent" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-[10px] font-mono text-charcoal-text-muted border-t border-charcoal-border/50 relative z-10">
        ProofForge local authentication runs strictly client-side.
      </footer>

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}
