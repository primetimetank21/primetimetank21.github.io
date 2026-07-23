/**
 * Portfolio content data — edit this file to update copy.
 * All strings are plain text (no HTML). Consumed by terminal.ts.
 */

export interface Project {
  name: string;
  description: string;
  url: string;
  status: 'active' | 'completed';
}

// ─── About ───────────────────────────────────────────────────────────────────

export const ABOUT_LINES: readonly string[] = [
  "I'm a Software Engineer in Microsoft's AI Development Acceleration Program (MAIDAP), where I take software from prototype to production with an AI-powered approach to development.",
  '',
  'AI is a very powerful and useful tool, but a dangerous crutch. As such, I use modern AI tools to amplify my strong engineering fundamentals and skills.',
  '',
  "My aim is to find a good 'mix' of 'AI Superpowers' + 'Tried-and-True Deterministic Mechanisms' (i.e., Git-Hooks, CI/CD, etc.) to build products that solve real problems.",
];

// ─── Projects ────────────────────────────────────────────────────────────────

export const PROJECTS: readonly Project[] = [
  {
    name: 'primetimetank21.github.io',
    description: 'Terminal-style portfolio \u2014 Astro, TypeScript, GitHub Pages.',
    url: 'https://github.com/primetimetank21/primetimetank21.github.io',
    status: 'active',
  },
  {
    name: 'dev-setup',
    description: 'Cross-platform dev environment setup (macOS, Linux, Windows).',
    url: 'https://github.com/primetimetank21/dev-setup',
    status: 'active',
  },
  {
    name: 'apple-music-playlist-converter',
    description: 'Python CLI to migrate Apple Music playlists to Spotify via the Spotify API.',
    url: 'https://github.com/primetimetank21/apple-music-playlist-converter',
    status: 'completed',
  },
  {
    name: 'PIT-UN-hackathon2023',
    description: 'FinLITT \u2014 a personalized financial literacy web app built with Python and Pynecone.',
    url: 'https://github.com/primetimetank21/PIT-UN-hackathon2023',
    status: 'completed',
  },
  {
    name: 'hackUMBC2022',
    description: 'TrustDeFi \u2014 Python tool to assess Ethereum wallet trustworthiness via on-chain transaction history.',
    url: 'https://github.com/primetimetank21/hackUMBC2022',
    status: 'completed',
  },
  {
    name: 'instagram-scanner',
    description: 'Playwright-based Python tool that scans your Instagram account to generate stats based on your followers and following.',
    url: 'https://github.com/primetimetank21/instagram-scanner',
    status: 'completed',
  },
];

/** Render projects as terminal output lines. */
export function formatProjects(): string[] {
  const lines: string[] = [];
  for (let i = 0; i < PROJECTS.length; i++) {
    const p = PROJECTS[i];
    lines.push(`${p.name}  \u2014  ${p.description}  [${p.status}]`);
    lines.push(`  ${p.url}`);
    if (i < PROJECTS.length - 1) lines.push('');
  }
  return lines;
}

// ─── Skills ──────────────────────────────────────────────────────────────────

export const SKILLS_LINES: readonly string[] = [
  'Tech Stack:',
  '',
  '  Languages   Python \u00b7 TypeScript \u00b7 JavaScript \u00b7 Java \u00b7 C++ \u00b7 C',
  '  Frameworks  FastAPI \u00b7 Node.js \u00b7 React',
  '  Tooling     Git \u00b7 GitHub Actions \u00b7 Docker \u00b7 VS Code',
  '  Databases   PostgreSQL \u00b7 MySQL',
];

// ─── Links ───────────────────────────────────────────────────────────────────

export const LINKS_LINES: readonly string[] = [
  'Links:',
  '',
  '  GitHub    https://github.com/primetimetank21',
  '  LinkedIn  https://www.linkedin.com/in/earl-tankard-jr/',
  '  Portfolio https://primetimetank21.github.io',
];
