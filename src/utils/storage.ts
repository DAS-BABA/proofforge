'use client';

// LocalStorage/IndexedDB state keys for ProofForge

export interface SocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  email?: string;
}

export interface PortfolioConfig {
  theme: string;
  customBio: string;
  customRole: string;
  socials: SocialLinks;
  visibleSections: string[]; // e.g. ['hero', 'about', 'skills', 'projects', 'timeline', 'heatmap', 'achievements']
  featuredProjects: string[]; // repository names
}

export interface DeploymentProject {
  id: string;
  name: string;
  platform: 'vercel' | 'netlify' | 'railway' | 'render' | 'github-pages';
  status: 'READY' | 'BUILDING' | 'ERROR' | 'OFFLINE';
  url: string;
  lastUpdated: string;
  framework?: string;
}

export interface VisitorEvent {
  timestamp: string;
  type: 'view' | 'click' | 'recruiter';
  detail?: string;
}

export interface DashboardAnalytics {
  views: number;
  clicks: number;
  recruiterVisits: number;
  visitors: number;
  events: VisitorEvent[];
}

export interface AuthSession {
  username: string;
  token?: string; // GitHub PAT
  rememberMe: boolean;
}

// Helpers for safe Window access during Next.js SSR
const isClient = () => typeof window !== 'undefined';

export const storage = {
  // Authentication
  getAuthSession(): AuthSession | null {
    if (!isClient()) return null;
    const session = localStorage.getItem('proofforge_session');
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  },

  setAuthSession(session: AuthSession) {
    if (!isClient()) return;
    localStorage.setItem('proofforge_session', JSON.stringify(session));
    
    // Add to global user list for admin overview
    const users = this.getGlobalUsers();
    if (!users.includes(session.username)) {
      users.push(session.username);
      localStorage.setItem('proofforge_global_users', JSON.stringify(users));
    }
  },

  clearAuthSession() {
    if (!isClient()) return;
    localStorage.removeItem('proofforge_session');
  },

  // Global Users List for Admin Panel
  getGlobalUsers(): string[] {
    if (!isClient()) return [];
    const users = localStorage.getItem('proofforge_global_users');
    if (!users) return ['octocat', 'dan_abramov', 'proof_forge_demo'];
    try {
      return JSON.parse(users);
    } catch {
      return [];
    }
  },

  // Deployment Credentials
  getDeploymentTokens(): Record<string, string> {
    if (!isClient()) return {};
    const tokens = localStorage.getItem('proofforge_deploy_tokens');
    if (!tokens) return {};
    try {
      return JSON.parse(tokens);
    } catch {
      return {};
    }
  },

  saveDeploymentToken(platform: string, token: string) {
    if (!isClient()) return;
    const tokens = this.getDeploymentTokens();
    tokens[platform] = token;
    localStorage.setItem('proofforge_deploy_tokens', JSON.stringify(tokens));
  },

  removeDeploymentToken(platform: string) {
    if (!isClient()) return;
    const tokens = this.getDeploymentTokens();
    delete tokens[platform];
    localStorage.setItem('proofforge_deploy_tokens', JSON.stringify(tokens));
  },

  // Customizer Configs
  getPortfolioConfig(username: string): PortfolioConfig {
    const defaultConf: PortfolioConfig = {
      theme: 'futuristic-ui',
      customBio: '',
      customRole: '',
      socials: {
        github: `https://github.com/${username}`,
        twitter: '',
        linkedin: '',
        website: '',
        email: '',
      },
      visibleSections: ['hero', 'about', 'skills', 'projects', 'timeline', 'heatmap', 'achievements'],
      featuredProjects: [],
    };

    if (!isClient()) return defaultConf;
    const conf = localStorage.getItem(`proofforge_config_${username}`);
    if (!conf) return defaultConf;
    try {
      return { ...defaultConf, ...JSON.parse(conf) };
    } catch {
      return defaultConf;
    }
  },

  savePortfolioConfig(username: string, config: PortfolioConfig) {
    if (!isClient()) return;
    localStorage.setItem(`proofforge_config_${username}`, JSON.stringify(config));
    this.recordThemeUsage(config.theme);
  },

  // Analytics Engine
  getAnalytics(username: string): DashboardAnalytics {
    const defaultAnalytics: DashboardAnalytics = {
      views: 0,
      clicks: 0,
      recruiterVisits: 0,
      visitors: 0,
      events: []
    };

    if (!isClient()) return defaultAnalytics;
    const key = `proofforge_analytics_${username}`;
    const data = localStorage.getItem(key);
    if (!data) {
      // Seed initial realistic dummy analytics
      const seedData = this.generateSeedAnalytics();
      localStorage.setItem(key, JSON.stringify(seedData));
      return seedData;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultAnalytics;
    }
  },

  saveAnalytics(username: string, analytics: DashboardAnalytics) {
    if (!isClient()) return;
    localStorage.setItem(`proofforge_analytics_${username}`, JSON.stringify(analytics));
  },

  trackEvent(username: string, type: 'view' | 'click' | 'recruiter', detail?: string) {
    if (!isClient()) return;
    const analytics = this.getAnalytics(username);
    const now = new Date().toISOString();
    
    analytics.events.push({ timestamp: now, type, detail });
    if (type === 'view') {
      analytics.views += 1;
      // 50% chance of counting as unique visitor if first event or sparse
      if (Math.random() > 0.5 || analytics.visitors === 0) {
        analytics.visitors += 1;
      }
    } else if (type === 'click') {
      analytics.clicks += 1;
    } else if (type === 'recruiter') {
      analytics.recruiterVisits += 1;
    }

    // Keep events array to last 200 items for performance
    if (analytics.events.length > 200) {
      analytics.events = analytics.events.slice(-200);
    }

    this.saveAnalytics(username, analytics);
  },

  generateSeedAnalytics(): DashboardAnalytics {
    const views = Math.floor(Math.random() * 240) + 120;
    const clicks = Math.floor(views * 0.3) + 15;
    const recruiterVisits = Math.floor(views * 0.08) + 3;
    const visitors = Math.floor(views * 0.7) + 20;

    const events: VisitorEvent[] = [];
    const now = new Date();

    for (let i = 0; i < 50; i++) {
      const pastDate = new Date(now.getTime() - Math.random() * 15 * 24 * 60 * 60 * 1000);
      const rand = Math.random();
      let type: 'view' | 'click' | 'recruiter' = 'view';
      let detail = '';

      if (rand > 0.85) {
        type = 'recruiter';
        detail = 'Recruiter from ' + ['Google', 'Vercel', 'Stripe', 'Meta', 'Netflix', 'Remote.com'][Math.floor(Math.random() * 6)];
      } else if (rand > 0.5) {
        type = 'click';
        detail = ['project_link', 'github_profile', 'linkedin_link', 'resume_pdf'][Math.floor(Math.random() * 4)];
      }

      events.push({
        timestamp: pastDate.toISOString(),
        type,
        detail
      });
    }

    // Sort events by time ascending
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return { views, clicks, recruiterVisits, visitors, events };
  },

  // Global Theme Usage Stats for Admin Dashboard
  getThemeUsage(): Record<string, number> {
    if (!isClient()) return {};
    const data = localStorage.getItem('proofforge_theme_usage');
    if (!data) {
      return {
        'cyberpunk': 14,
        'neon-blue': 25,
        'purple-glow': 32,
        'futuristic-ui': 41,
        'minimal': 18,
        'clean-white': 10,
        'elegant-typography': 8,
        'developer-dark': 35,
        'github-style': 29,
        'dark-code': 22,
        'ai-futurism': 38,
        'animated-gradients': 45
      };
    }
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  },

  recordThemeUsage(themeName: string) {
    if (!isClient()) return;
    const usage = this.getThemeUsage();
    usage[themeName] = (usage[themeName] || 0) + 1;
    localStorage.setItem('proofforge_theme_usage', JSON.stringify(usage));
  },

  // API Call Counters for Admin Dashboard
  getApiUsage(): { githubCount: number; deployCount: number } {
    if (!isClient()) return { githubCount: 0, deployCount: 0 };
    const count = localStorage.getItem('proofforge_api_usage');
    if (!count) return { githubCount: 842, deployCount: 412 };
    try {
      return JSON.parse(count);
    } catch {
      return { githubCount: 842, deployCount: 412 };
    }
  },

  recordApiCall(type: 'github' | 'deploy') {
    if (!isClient()) return;
    const usage = this.getApiUsage();
    if (type === 'github') usage.githubCount += 1;
    if (type === 'deploy') usage.deployCount += 1;
    localStorage.setItem('proofforge_api_usage', JSON.stringify(usage));
  }
};
