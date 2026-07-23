/**
 * Portfolio content data — edit this file to update copy.
 * All strings are plain text (no HTML). Consumed by terminal.ts.
 */

export interface Project {
  name: string;
  description: string;
  url: string;
}

// ─── About ───────────────────────────────────────────────────────────────────

export const ABOUT_LINES: readonly string[] = [
  'Earl Tankard, Jr.  \u00b7  SWE @ Microsoft',
  '',
  "MAIDAP \u2014 Microsoft's AI Development Acceleration Program.",
  'Taking software from prototype to production,',
  'powered by AI + strong engineering fundamentals.',
  '',
  'AI is a powerful tool \u2014 but a dangerous crutch.',
  "I don't replace fundamentals; I amplify them.",
  '',
  '  AI Superpowers \u00d7 Tried-and-True Deterministic Mechanisms',
  '  (Git-Hooks, CI/CD, ...) \u2192 products that solve real problems.',
  '',
  'Ph.D.  \u00b7  github.com/primetimetank21',
];

// ─── Projects ────────────────────────────────────────────────────────────────

export const PROJECTS: readonly Project[] = [
  {
    name: 'primetimetank21.github.io',
    description: 'Terminal-style portfolio \u2014 Astro, TypeScript, GitHub Pages.',
    url: 'https://github.com/primetimetank21/primetimetank21.github.io',
  },
  {
    name: 'dev-setup',
    description: 'Cross-platform dev environment setup (macOS, Linux, Windows).',
    url: 'https://github.com/primetimetank21/dev-setup',
  },
  {
    name: 'farm-stack-todo-app',
    description: 'Full-stack todo app \u2014 FastAPI, React, MongoDB.',
    url: 'https://github.com/primetimetank21/farm-stack-todo-app',
  },
  {
    name: 'flask-sqlalchemy-react-movie-app',
    description: 'Full-stack movie app \u2014 Flask, SQLAlchemy, React.',
    url: 'https://github.com/primetimetank21/flask-sqlalchemy-react-movie-app',
  },
  {
    name: 'apple-music-playlist-converter',
    description: 'Python utility to convert Apple Music playlists.',
    url: 'https://github.com/primetimetank21/apple-music-playlist-converter',
  },
];

/** Render projects as terminal output lines. */
export function formatProjects(): string[] {
  const lines: string[] = ['Projects:'];
  for (const p of PROJECTS) {
    lines.push('');
    lines.push(`  ${p.name}`);
    lines.push(`  ${p.description}`);
    lines.push(`  ${p.url}`);
  }
  lines.push('');
  lines.push('  Run `links` to find more on GitHub.');
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
