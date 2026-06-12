import JSZip from 'jszip';
import { GitHubProfileData } from '@/services/github';
import { PortfolioConfig } from '@/utils/storage';

// Trigger browser printing styled as the user-designed portfolio theme
export function printResumePdf(profile?: GitHubProfileData, config?: PortfolioConfig) {
  if (typeof window === 'undefined') return;

  const original = document.getElementById('proofforge-portfolio-preview-content');
  if (!original) {
    // If not found (e.g. layout rendering delay), trigger native fallback
    window.print();
    return;
  }

  // Map active theme ID to background and text colors to prevent high-contrast inversion by the browser
  const themeBgColors: Record<string, string> = {
    'cyberpunk': '#000000',
    'neon-blue': '#030712',
    'purple-glow': '#0f0a1c',
    'futuristic-ui': '#0d0e0f',
    'minimal': '#fafafa',
    'clean-white': '#f8fafc',
    'elegant-typography': '#faf7f2',
    'developer-dark': '#181818',
    'github-style': '#0d1117',
    'dark-code': '#272822',
    'ai-futurism': '#050b14',
    'animated-gradients': '#0f172a',
  };

  const themeTextColors: Record<string, string> = {
    'cyberpunk': '#ffea00',
    'neon-blue': '#f1f5f9',
    'purple-glow': '#e0e7ff',
    'futuristic-ui': '#e2e8f0',
    'minimal': '#292524',
    'clean-white': '#334155',
    'elegant-typography': '#2c221e',
    'developer-dark': '#d4d4d4',
    'github-style': '#c9d1d9',
    'dark-code': '#f8f8f2',
    'ai-futurism': '#f1f5f9',
    'animated-gradients': '#f1f5f9',
  };

  const activeTheme = config?.theme || 'futuristic-ui';
  const bgColor = themeBgColors[activeTheme] || '#0d0e0f';
  const textColor = themeTextColors[activeTheme] || '#e2e8f0';

  // Add printing state class to body to scope conflicting styles
  document.body.classList.add('printing-resume');

  // Deep clone the actual active visual theme preview
  const clone = original.cloneNode(true) as HTMLElement;
  clone.id = 'proofforge-print-resume';
  clone.className = clone.className + ' print-resume-only';

  // Remove select-none utility classes so text remains copyable on the PDF output
  clone.classList.remove('select-none');
  
  // Append direct to body to bypass dashboard flexbox constraints
  document.body.appendChild(clone);

  // Temporary style sheet to format the current view for printing
  const style = document.createElement('style');
  style.id = 'proofforge-print-styles';
  style.innerHTML = `
    @media print {
      /* Hide all standard elements in the DOM tree, only print the clone overlay */
      body > *:not(.print-resume-only) {
        display: none !important;
      }
      
      /* Reset layout wrappers to flow page sheets and paint theme colors */
      html, body {
        background-color: ${bgColor} !important;
        background: ${bgColor} !important;
        color: ${textColor} !important;
        height: 100% !important;
        max-height: 297mm !important;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .print-resume-only {
        display: block !important;
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        height: 100% !important;
        max-height: 297mm !important;
        overflow: hidden !important;
        padding: 24px !important;
        margin: 0 !important;
        background-color: ${bgColor} !important;
        background: ${bgColor} !important;
        color: ${textColor} !important;
        box-sizing: border-box !important;
      }

      /* Scale the main content wrapper slightly and center it to fit exactly on 1 page */
      .print-resume-only > div {
        transform: scale(0.9);
        transform-origin: top center;
      }

      /* Explicitly hide other elements just in case they escape body constraints */
      .no-print, [role="alert"], .toast, [class*="toast"] {
        display: none !important;
      }
      
      /* Force background printing for all elements */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      /* Prevent cards breaking across page sheets */
      section, .theme-card {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      section {
        margin-bottom: 10px !important;
      }

      /* Make print layout extremely compact to fit on exactly 1 page */
      .print-resume-only .space-y-12 > :not([hidden]) ~ :not([hidden]) {
        margin-top: 1rem !important;
      }
      .print-resume-only .space-y-4 > :not([hidden]) ~ :not([hidden]) {
        margin-top: 0.5rem !important;
      }
      .print-resume-only .space-y-3 > :not([hidden]) ~ :not([hidden]) {
        margin-top: 0.375rem !important;
      }
      .print-resume-only .py-6 {
        padding-top: 0.5rem !important;
        padding-bottom: 0.5rem !important;
      }
      .print-resume-only .theme-card {
        padding: 10px !important;
      }
      .print-resume-only .gap-4 {
        gap: 8px !important;
      }
      .print-resume-only .gap-3 {
        gap: 6px !important;
      }
      .print-resume-only img.w-24.h-24 {
        width: 64px !important;
        height: 64px !important;
      }
      .print-resume-only h1 {
        font-size: 1.5rem !important;
        line-height: 1.875rem !important;
      }
      .print-resume-only h2 {
        font-size: 0.75rem !important;
        margin-bottom: 4px !important;
      }
      .print-resume-only p,
      .print-resume-only span,
      .print-resume-only a,
      .print-resume-only div {
        font-size: 10px !important;
      }
      .print-resume-only .text-xs {
        font-size: 9px !important;
      }
      .print-resume-only .text-\\[11px\\] {
        font-size: 8.5px !important;
      }
      .print-resume-only .text-\\[10px\\] {
        font-size: 8px !important;
      }
      .print-resume-only .text-\\[9px\\] {
        font-size: 7px !important;
      }
      .print-resume-only .w-\\[8px\\] {
        width: 5px !important;
      }
      .print-resume-only .h-\\[8px\\] {
        height: 5px !important;
      }
      .print-resume-only .flex.gap-\\[3px\\] {
        gap: 2px !important;
      }
      .print-resume-only .flex.flex-col.gap-\\[3px\\] {
        gap: 2px !important;
      }

      /* Force desktop grid and flex layouts in print viewport */
      .print-resume-only .md\\:flex-row {
        flex-direction: row !important;
      }
      .print-resume-only .md\\:text-left {
        text-align: left !important;
      }
      .print-resume-only .md\\:text-3xl {
        font-size: 1.5rem !important;
        line-height: 1.875rem !important;
      }
      .print-resume-only .md\\:justify-start {
        justify-content: flex-start !important;
      }
      .print-resume-only .md\\:grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
      .print-resume-only .md\\:grid-cols-4 {
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      }
      .print-resume-only .md\\:grid-cols-6 {
        grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
      }
      
      @page {
        size: A4 portrait;
        margin: 0; /* Margin 0 lets the theme background colors span edge-to-edge! */
      }
    }
    @media screen {
      .print-resume-only {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  // Trigger print
  window.print();

  // Cleanup after printing
  setTimeout(() => {
    document.body.classList.remove('printing-resume');
    const elStyle = document.getElementById('proofforge-print-styles');
    if (elStyle) elStyle.remove();
    const elClone = document.getElementById('proofforge-print-resume');
    if (elClone) elClone.remove();
  }, 1000);
}

// Download profile + portfolio config as a structured JSON file
export function exportPortfolioJson(profile: GitHubProfileData, config: PortfolioConfig) {
  if (typeof window === 'undefined') return;

  const exportData = {
    platform: 'ProofForge',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    developer: profile.username,
    profile,
    portfolioConfig: config
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `proofforge_portfolio_${profile.username}.json`;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Compile a complete self-contained static site ZIP
export async function exportPortfolioZip(profile: GitHubProfileData, config: PortfolioConfig) {
  const zip = new JSZip();

  const activeBio = config.customBio || profile.bio;
  const activeRole = config.customRole || profile.roles[0] || 'Software Engineer';
  const displayProjects = profile.repositories.filter(repo => {
    if (config.featuredProjects && config.featuredProjects.length > 0) {
      return config.featuredProjects.includes(repo.name);
    }
    return true;
  }).slice(0, 6);

  // 1. Generate index.html containing a styled static page
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${profile.name} | Portfolio</title>
  <meta name="description" content="${activeBio.replace(/"/g, '&quot;')}">
  
  <!-- Tailwind CSS Play CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            forest: {
              primary: '#2d6a4f',
              dark: '#1b4332',
              light: '#52b788',
              accent: '#74c69d',
            }
          }
        }
      }
    }
  </script>
  
  <!-- Custom theme rules based on: ${config.theme} -->
  <style>
    /* Custom font bindings */
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@400;600;800&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
    
    ${config.theme === 'cyberpunk' ? `
      body { background-color: #000; color: #ffea00; font-family: 'Fira Code', monospace; }
      .theme-card { border: 2px solid #ff0055; background-color: #0a0a0a; padding: 20px; box-shadow: 4px 4px 0px #ff0055; }
      .theme-title { text-transform: uppercase; letter-spacing: 0.1em; color: #ffea00; font-weight: 800; }
      .theme-highlight { background-color: #ff0055; color: #fff; padding: 0 4px; }
      .theme-badge { border: 1px solid #ffea00; background-color: #000; color: #ffea00; font-size: 10px; }
      .theme-accent { color: #ff0055; }
    ` : config.theme === 'minimal' ? `
      body { background-color: #fafafa; color: #292524; font-family: 'Playfair Display', serif; }
      .theme-card { border: 1px solid #e7e5e4; background-color: #fff; padding: 24px; }
      .theme-title { font-family: 'Playfair Display', serif; font-weight: 400; color: #1c1917; }
      .theme-highlight { text-decoration: underline; color: #1c1917; }
      .theme-badge { background-color: #f5f5f4; color: #44403c; font-size: 10px; font-family: sans-serif; }
      .theme-accent { color: #1c1917; }
    ` : config.theme === 'clean-white' ? `
      body { background-color: #f8fafc; color: #334155; font-family: 'Inter', sans-serif; }
      .theme-card { border: 1px solid #e2e8f0; background-color: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
      .theme-title { color: #0f172a; font-weight: 700; }
      .theme-highlight { background-color: #0f172a; color: #fff; padding: 2px 8px; border-radius: 6px; }
      .theme-badge { background-color: #f1f5f9; color: #475569; font-size: 10px; }
      .theme-accent { color: #475569; }
    ` : `
      body { background-color: #0d0e0f; color: #e2e8f0; font-family: 'Fira Code', monospace; }
      .theme-card { border: 1px solid #232729; background-color: #131517; padding: 20px; border-radius: 8px; }
      .theme-title { color: #74c69d; font-weight: 700; }
      .theme-highlight { background-color: rgba(45, 106, 79, 0.2); border: 1px solid rgba(45, 106, 79, 0.3); color: #74c69d; padding: 2px 6px; border-radius: 4px; }
      .theme-badge { background-color: rgba(45, 106, 79, 0.1); border: 1px solid rgba(45, 106, 79, 0.2); color: #74c69d; font-size: 10px; }
      .theme-accent { color: #74c69d; }
    `}
  </style>
</head>
<body class="py-12 px-6">
  <div class="max-w-4xl mx-auto space-y-12">
    
    <!-- Hero header -->
    <header class="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-800 pb-8">
      <div class="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <img src="${profile.avatarUrl}" alt="${profile.name}" class="w-24 h-24 object-cover rounded-xl border border-gray-800">
        <div>
          <h1 class="text-3xl font-extrabold theme-title">${profile.name}</h1>
          <p class="text-sm theme-accent font-bold mt-1">${activeRole}</p>
          <div class="flex flex-wrap justify-center md:justify-start gap-1.5 pt-2">
            ${profile.roles.map(r => `<span class="px-2 py-0.5 rounded theme-badge">${r}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        ${config.socials.github ? `<a href="${config.socials.github}" target="_blank" class="p-2 theme-card text-xs">GitHub</a>` : ''}
        ${config.socials.twitter ? `<a href="${config.socials.twitter}" target="_blank" class="p-2 theme-card text-xs">Twitter</a>` : ''}
        ${config.socials.linkedin ? `<a href="${config.socials.linkedin}" target="_blank" class="p-2 theme-card text-xs">LinkedIn</a>` : ''}
      </div>
    </header>

    <!-- Bio summary -->
    <section class="space-y-3">
      <h2 class="text-xs uppercase tracking-wider theme-accent font-bold">About Me</h2>
      <div class="theme-card">
        <p class="text-xs leading-relaxed opacity-95">${activeBio}</p>
      </div>
    </section>

    <!-- Core Skills -->
    <section class="space-y-4">
      <h2 class="text-xs uppercase tracking-wider theme-accent font-bold">Skills Grid</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="theme-card"><h3 class="text-xs font-bold theme-accent mb-2">Frontend</h3><p class="text-[10px] opacity-75">React, Next.js, TS</p></div>
        <div class="theme-card"><h3 class="text-xs font-bold theme-accent mb-2">Backend</h3><p class="text-[10px] opacity-75">Go, Rust, Python</p></div>
        <div class="theme-card"><h3 class="text-xs font-bold theme-accent mb-2">Database</h3><p class="text-[10px] opacity-75">Postgres, MongoDB</p></div>
        <div class="theme-card"><h3 class="text-xs font-bold theme-accent mb-2">Cloud</h3><p class="text-[10px] opacity-75">Vercel, Railway, AWS</p></div>
      </div>
    </section>

    <!-- Projects List -->
    <section class="space-y-4">
      <h2 class="text-xs uppercase tracking-wider theme-accent font-bold">Featured Projects</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${displayProjects.map(repo => `
          <div class="theme-card flex flex-col justify-between gap-4">
            <div>
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-bold">${repo.name}</h3>
                <span class="text-[9px] opacity-70">★ ${repo.stars}</span>
              </div>
              <p class="text-[10px] opacity-75 mt-2 leading-relaxed">${repo.description}</p>
            </div>
            <div class="flex gap-1.5">
              ${repo.languages.slice(0, 3).map(l => `<span class="px-1.5 py-0.2 theme-badge">${l.name}</span>`).join('')}
            </div>
            <div class="flex justify-between items-center text-[10px] border-t border-gray-900 pt-2.5">
              <a href="${repo.url}" target="_blank" class="theme-highlight">Source Code</a>
              ${repo.homepageUrl ? `<a href="${repo.homepageUrl}" target="_blank" class="theme-accent">Live Demo</a>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Calendar heatmap -->
    <section class="space-y-4">
      <h2 class="text-xs uppercase tracking-wider theme-accent font-bold">GitHub Contributions Heatmap</h2>
      <div class="theme-card overflow-x-auto">
        <div class="flex gap-1 min-w-[500px] select-none">
          ${Array.from({ length: 40 }).map((_, wIdx) => {
            const weekDays = profile.contributions.calendar.slice(wIdx * 7, (wIdx + 1) * 7);
            return `
              <div class="flex flex-col gap-1">
                ${weekDays.map(day => {
                  const cellLevel = day.level;
                  let bg = 'bg-gray-800';
                  if (cellLevel > 0) bg = cellLevel === 4 ? 'bg-forest-light' : 'bg-forest-primary';
                  return `<div class="w-2 h-2 rounded-sm ${bg}" title="${day.count} commits on ${day.date}"></div>`;
                }).join('')}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>

  </div>
</body>
</html>`;

  zip.file('index.html', htmlContent);

  // 2. Add config JSON
  zip.file('config.json', JSON.stringify({ profile, config }, null, 2));

  // 3. Add README
  zip.file('README.md', `# Static Portfolio Package for ${profile.name}
Generated by ProofForge.

## Running Locally
Simply open the \`index.html\` file directly in any modern browser, or run a local static server:
\`\`\`bash
npx serve .
\`\`\`
`);

  // Generate ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);

  const a = document.createElement('a');
  a.href = url;
  a.download = `proofforge_${profile.username}_site.zip`;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
