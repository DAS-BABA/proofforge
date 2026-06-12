# 🛠️ ProofForge

> **Transform Code to Live Portfolios.**  
> ProofForge is a production-grade, privacy-first developer portfolio and resume engine. It automatically scans your real GitHub activity, commits history, and deployment platforms to generate stunning, interactive web portfolios and themed 1-page PDF resumes.

---

## ✨ Key Features

- **📊 Continuous Sync Integration**: Pulls live statistics, repositories, languages distribution, commit calendars, streaks, and achievements directly from the GitHub GraphQL API.
- **☁️ Multi-Platform Deployment Scanner**: Detects production URLs, status details, and project frameworks automatically from Vercel, Netlify, Railway, Render, and GitHub Pages.
- **🎨 12 Premium Designer Themes**: Switch your portfolio theme instantly (e.g., Cyberpunk grid, Neon Blue glow, Minimal editorial, Purple Glow gradient, AI Futurism matrix, Animated Gradients).
- **📄 One-Page Resume PDF Export**: Launches browser print dialogs styled to exactly match your custom theme, squeezed neatly onto a single A4 page with edge-to-edge color preservation and page-break calculations.
- **📦 Static Site ZIP Compilations**: Generates self-contained static site packages (complete with HTML, JS triggers, and cached data structures) using `JSZip` to run anywhere without servers.
- **🔒 Zero-Database Local Privacy**: Stored entirely in your browser's `LocalStorage` and `IndexedDB`. All API tokens remain local, private, and encrypted within your secure context.
- **🗺️ Base64 Config Hash Sharing**: Share your live portfolio configuration via compressed URL hashes (`/portfolio/username?config=<hash>`), offering database-free custom profiles.

---

## 🎨 Interface Aesthetic: "Silent Coder"

The core dashboard environment is styled with the **Silent Coder** aesthetic:
- **Primary Background**: Deep Charcoal (`#0c0d0e`)
- **Card Accents**: Tactical Dark Slate (`#131517`)
- **Highlights**: Subtle Forest Green (`#2d6a4f` / `#74c69d`)
- **Animations**: Soft breathing glow overlays and modern Bento-grid card translations.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router & Turbopack)](https://nextjs.org/)
- **UI Engine**: [React 19 (Client/Server Hydration Guarded)](https://react.dev/)
- **Styling**: [Tailwind CSS v4 (Custom @theme variables)](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Persistence**: Browser Native `IndexedDB` & `LocalStorage`
- **ZIP Bundler**: [JSZip](https://stuk.github.io/jszip/)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18.x or later) installed.

### Installation

1. Clone the project repository:
   ```bash
   git clone <repository-url>
   cd "Proof of work generator"
   ```

2. Install the node packages:
   ```bash
   npm install
   ```

3. Launch the local development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app!

---

## 🚀 Production Build & Deployment

To generate a fully optimized Next.js production bundle:

```bash
npm run build
```

The application is structured for instant serverless deployment (e.g. to Vercel, Netlify, or Amplify) with zero database configuration.
