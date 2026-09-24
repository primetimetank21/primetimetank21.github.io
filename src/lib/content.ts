/**
 * Portfolio content data — edit this file to update copy.
 * All strings are plain text (no HTML). Shared by the build-time portfolio and the interactive terminal.
 */

export interface Project {
  name: string;
  description: string;
  url: string;
  status: 'active' | 'completed';
  caseStudy?: {
    title: string;
    flow: readonly string[];
    technologies: readonly string[];
    problem: string;
    approach: string;
    tradeoff: string;
    evidence: string;
    links: readonly { label: string; url: string }[];
  };
}

// ─── About ───────────────────────────────────────────────────────────────────

export const PROFILE = {
  name: 'Earl Tankard Jr.',
  role: 'Software Engineer at Microsoft · MAIDAP',
  summary: 'I take software from prototype toward production, combining AI-assisted engineering with testing, automation, and reliable delivery.',
};

export const ABOUT_PARAGRAPHS: readonly string[] = [
  `I'm ${PROFILE.name}, a Software Engineer in Microsoft's AI Development Acceleration Program (MAIDAP).`,
  'My focus is the work between a promising prototype and dependable software: clear interfaces, repeatable workflows, and tests that make changes easier to trust.',
  'I use AI-assisted development alongside engineering fundamentals, code review, and deterministic checks. The featured public projects show my approach to developer tooling, API integration, and automation.',
];

export const ABOUT_LINES: readonly string[] = ABOUT_PARAGRAPHS.flatMap((paragraph, i) =>
  i === 0 ? [paragraph] : ['', paragraph],
);

// ─── Projects ────────────────────────────────────────────────────────────────

export const PROJECTS: readonly Project[] = [
  {
    name: 'dev-setup',
    description: 'A shell-based toolkit for bootstrapping familiar toolchains across Linux, macOS, WSL, and Windows.',
    url: 'https://github.com/primetimetank21/dev-setup',
    status: 'active',
    caseStudy: {
      title: 'Development environment automation',
      technologies: ['Bash', 'PowerShell', 'GitHub Actions'],
      flow: ['Entrypoint', 'Platform orchestrator', 'Ordered tool installers'],
      problem: 'Setting up a new machine means repeating tool installation and shell configuration. This project gives developers a shared starting point while keeping platform-specific setup explicit.',
      approach: 'Thin Bash and PowerShell entrypoints delegate to platform orchestrators and per-tool installers. An optional terminal picker and only/skip flags feed ordered selection. Shared version data, existing-install checks, and managed shell blocks support repeatable setup.',
      tradeoff: 'Native platform integrations offer direct control but require parity maintenance. Selection preserves a prescribed order; it does not resolve dependencies. Version pins and rerun checks do not make the environment hermetic.',
      evidence: 'This case study describes the public develop snapshot, not a main release. Fixture tests exercise selection and dispatch; platform CI checks add installation, repeat-run, and PowerShell compatibility evidence.',
      links: [
        { label: 'Selection design', url: 'https://github.com/primetimetank21/dev-setup/blob/595184e33f0e64e0ff53f5573f2e81628230b969/ARCHITECTURE.md#L178-L198' },
        { label: 'Fixture tests', url: 'https://github.com/primetimetank21/dev-setup/blob/595184e33f0e64e0ff53f5573f2e81628230b969/tests/test_setup_flags.sh' },
        { label: 'Platform CI', url: 'https://github.com/primetimetank21/dev-setup/actions/runs/35690995024' },
      ],
    },
  },
  {
    name: 'apple-music-playlist-converter',
    description: 'A Python CLI for recreating an Apple Music playlist in Spotify without searching for every track by hand.',
    url: 'https://github.com/primetimetank21/apple-music-playlist-converter',
    status: 'completed',
    caseStudy: {
      title: 'Best-effort playlist migration',
      technologies: ['Python', 'Playwright', 'HTTPX', 'Spotipy'],
      flow: ['Apple Music metadata', 'JSON', 'Spotify search + add'],
      problem: 'Moving a playlist between services means reconstructing it across catalogs with different identifiers. The CLI connects metadata retrieval to Spotify search and playlist creation.',
      approach: 'Playwright-driven Firefox retrieves the Apple Music web token. Paginated HTTP requests use bounded retries and write collected metadata to JSON. Spotipy handles Spotify OAuth, finds a playlist by name or creates a private one, then searches by title and artist and adds the first result.',
      tradeoff: 'First-result matching can choose another recording, and reruns can add duplicates. Retrieval also depends on Apple’s web-page token format. This is a scoped, best-effort CLI, not an exact catalog synchronizer.',
      evidence: 'The retrieval and matching source show the integration. Automated functional tests are absent and live-service reliability is unverified. Next validation steps: mocked pagination tests, matching fixtures, and an opt-in end-to-end conversion check.',
      links: [
        { label: 'Apple retrieval', url: 'https://github.com/primetimetank21/apple-music-playlist-converter/blob/8248770c4bdfa5ffeab9e2502ca6743359863ad3/src/apple_music_lib/get_apple_music.py' },
        { label: 'Spotify matching', url: 'https://github.com/primetimetank21/apple-music-playlist-converter/blob/8248770c4bdfa5ffeab9e2502ca6743359863ad3/src/helpers/helper_functions.py#L16-L196' },
        { label: 'Validation boundary', url: 'https://github.com/primetimetank21/apple-music-playlist-converter/blob/8248770c4bdfa5ffeab9e2502ca6743359863ad3/Makefile#L11-L24' },
      ],
    },
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
    description: 'Playwright-based Python tool that scans your Instagram account to generate stats based on your followers and following numbers.',
    url: 'https://github.com/primetimetank21/instagram-scanner',
    status: 'completed',
  },
  {
    name: 'primetimetank21.github.io',
    description: 'Terminal-style portfolio \u2014 Astro, TypeScript, GitHub Pages.',
    url: 'https://github.com/primetimetank21/primetimetank21.github.io',
    status: 'active',
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

export const SKILL_GROUPS = [
  { label: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'Java', 'C++', 'C'] },
  { label: 'Frameworks', items: ['FastAPI', 'Node.js', 'React'] },
  { label: 'Tooling', items: ['Git', 'GitHub Actions', 'Docker', 'VS Code'] },
  { label: 'Databases', items: ['PostgreSQL', 'MySQL'] },
] as const;

export const SKILLS_LINES: readonly string[] = [
  'Tech Stack:',
  '',
  ...SKILL_GROUPS.map(group => `  ${group.label.padEnd(12)}${group.items.join(' · ')}`),
];

// ─── Links ───────────────────────────────────────────────────────────────────

export const CONTACT = {
  summary: 'Find my public work on GitHub, or connect with me on LinkedIn.',
  links: [
    { label: 'GitHub', url: 'https://github.com/primetimetank21' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/earl-tankard-jr/' },
  ],
};

export const LINKS_LINES: readonly string[] = [
  'Links:',
  '',
  ...CONTACT.links.map(link => `  ${link.label.padEnd(10)}${link.url}`),
  '  Portfolio https://primetimetank21.github.io',
];
