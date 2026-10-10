/**
 * Portfolio content data — edit this file to update copy.
 * All strings are plain text (no HTML). Shared by the build-time portfolio and the interactive terminal.
 */

export interface Project {
  name: string;
  description: string;
  url: string;
  status: 'active' | 'completed';
  /** Editorial homepage prominence, independent of having a detail page. */
  featured?: boolean;
  caseStudy?: {
    path: `/projects/${string}/`;
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
  'I use AI-assisted development alongside engineering fundamentals, code review, and deterministic checks. The featured public projects show my approach to developer tooling, human-centered interfaces, and automation.',
];

export const ABOUT_LINES: readonly string[] = ABOUT_PARAGRAPHS.flatMap((paragraph, i) =>
  i === 0 ? [paragraph] : ['', paragraph],
);

// ─── Experience ──────────────────────────────────────────────────────────────

export const EXPERIENCE = {
  intro: 'Selected engineering work in AI-powered development, backend APIs, test automation, and developer tooling.',
  engagements: [
    {
      id: 'microsoft-current',
      employer: 'Microsoft',
      role: 'Software Engineer 2',
      period: 'Jul 2025–Present',
      current: true,
      contributions: [
        {
          title: 'Prototype to Production',
          description: 'Drive software from prototype to production through rotational assignments in Microsoft’s AI Development Acceleration Program (MAIDAP). Partner with cross-functional teams to improve products and create new applications and workflows.',
        },
      ],
    },
    {
      id: 'us-ai',
      employer: 'US AI',
      role: 'Software Engineer, Contract',
      period: 'Feb–Apr 2025',
      contributions: [
        {
          title: 'Application Stability and Maintainability',
          description: 'Resolved 60+ bugs in the Archangel application, addressing stability and performance issues. Refactored legacy components to improve maintainability.',
        },
      ],
    },
    {
      id: 'microsoft-internships',
      employer: 'Microsoft',
      role: 'Software Engineer Intern',
      period: 'Two separate internships',
      contributions: [
        {
          title: 'Monitoring Integration and Release Testing',
          period: 'Jun–Sep 2024',
          description: 'Developed an internal C++ API to connect a monitoring tool to pods in a Kubernetes cluster. Refactored a Python automated test suite to support multiple software releases.',
          technologies: ['C++', 'Python', 'Kubernetes'],
        },
        {
          title: 'AI-Assisted Debugging',
          period: 'May–Aug 2023',
          description: 'Built a Python-based AI tool to assist debugging and improved its test suite. Defined project requirements and test plans, and documented test cases and debugging workflows.',
          technologies: ['Python'],
        },
      ],
    },
    {
      id: 'icims-internships',
      employer: 'iCIMS',
      role: 'Software Engineer Intern',
      period: 'Two separate internships',
      contributions: [
        {
          title: 'Component APIs and SDK Development',
          period: 'Jun–Aug 2022',
          description: 'Built a GraphQL backend API supporting custom queries over internally managed React components. Developed and debugged React components in JavaScript and added components to the internal SDK. Wrote documentation and initial test cases for the GraphQL API.',
          technologies: ['GraphQL', 'React', 'JavaScript'],
        },
        {
          title: 'Component Version Visibility',
          period: 'Jun–Aug 2021',
          description: 'Built a backend tool for tracking versions of 80+ internal React components. Used Bitbucket APIs to gather component-version data and Recharts to visualize versions by team.',
          technologies: ['Bitbucket APIs', 'Recharts'],
        },
      ],
    },
  ],
  publicWork: {
    heading: 'Explore the public work',
    intro: 'For examples you can inspect, explore these public projects and the engineering decisions behind them.',
    links: [
      { label: 'dev-setup', url: '/projects/dev-setup/', description: 'Development environment automation' },
      { label: 'Phission', url: '/projects/phission/', description: 'A reproducible, synthetic-only email safety demo' },
    ],
  },
};

// ─── Projects ────────────────────────────────────────────────────────────────

export const PROJECTS: readonly Project[] = [
  {
    name: 'dev-setup',
    description: 'A shell-based toolkit for bootstrapping familiar toolchains across Linux, macOS, WSL, and Windows.',
    url: 'https://github.com/primetimetank21/dev-setup',
    status: 'active',
    featured: true,
    caseStudy: {
      path: '/projects/dev-setup/',
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
    name: 'phission',
    description: 'A synthetic-only email safety demo for pausing, inspecting destinations, and understanding uncertain results.',
    url: 'https://github.com/primetimetank21/phission',
    status: 'completed',
    featured: true,
    caseStudy: {
      path: '/projects/phission/',
      title: 'From HCI prototype to a reproducible demo',
      technologies: ['Python', 'Reflex', 'Pytest', 'Playwright'],
      flow: ['Synthetic inbox', 'MIME + link parsing', 'Simulated result + guidance'],
      problem: 'Unexpected messages can pressure people into following links or sharing secrets. Phission began as a 2023 HCI/affective-computing prototype; the refresh makes its email-inspection workflow reproducible without connecting a real inbox.',
      approach: 'Bounded MIME parsing extracts readable text and HTTP(S) destinations without rendering email HTML. Typed validation distinguishes valid scores, including zero, from unknown and error states. Per-session state binds results to the selected message and link; keyboard-friendly controls and text explanations support inspection.',
      tradeoff: 'Authored emails and simulated reputation results avoid mailbox and provider dependencies but do not establish phishing-detection accuracy. Parsing is deliberately limited; read-aloud is not included. Original usability findings are unavailable; no historical metrics or measured benefits are claimed.',
      evidence: '115 Python tests on 3.13/3.14 cover parsing boundaries, score validation, and session isolation. Seventy browser checks include four automated accessibility scans. These validate the demo, not production mail security, full accessibility conformance, or physical-device support.',
      links: [
        { label: 'Parser coverage', url: 'https://github.com/primetimetank21/phission/blob/5bca9247a0f09a754db3c89c317a5f27dd92eb52/tests/test_html_boundaries.py' },
        { label: 'Session isolation', url: 'https://github.com/primetimetank21/phission/blob/5bca9247a0f09a754db3c89c317a5f27dd92eb52/tests/test_state.py' },
        { label: 'Local-build preview', url: 'https://github.com/primetimetank21/phission/blob/5bca9247a0f09a754db3c89c317a5f27dd92eb52/docs/demo-workspace.png' },
        { label: 'Post-merge CI', url: 'https://github.com/primetimetank21/phission/actions/runs/36249730404' },
      ],
    },
  },
  {
    name: 'apple-music-playlist-converter',
    description: 'A Python CLI for recreating an Apple Music playlist in Spotify without searching for every track by hand.',
    url: 'https://github.com/primetimetank21/apple-music-playlist-converter',
    status: 'completed',
  },
  {
    name: 'PIT-UN-hackathon2023',
    description: 'FinLITT — a financial-literacy hackathon prototype with linked learning and savings screens, built in Python and Pynecone.',
    url: 'https://github.com/primetimetank21/PIT-UN-hackathon2023',
    status: 'completed',
    caseStudy: {
      path: '/projects/finlitt/',
      title: 'FinLITT: exploring financial-literacy learning paths',
      technologies: ['Python', 'Pynecone'],
      flow: ['Topic selection', 'Knowledge question', 'Learning + savings screens'],
      problem: 'FinLITT is a 2023 team hackathon prototype motivated by gaps in financial-literacy education. It explores how a learner might move from a familiar topic to introductory material and a simple spending choice.',
      approach: 'Pynecone components define the screens and explicit links between them. The saving topic leads to a yes/no knowledge question, which branches to a questionnaire or a fixed video recommendation. The savings exercise links to separate burger and candy outcome screens.',
      tradeoff: 'Explicit routes make the intended journey inspectable, but this is not a personalized learning engine. The sign-in screen links onward without authenticating, and the learning material and savings outcomes are fixed. AI personalization was future scope, not an implemented feature.',
      evidence: 'The linked source shows route registration, branching, and fixed screens. This is a source review of the historical prototype; its current runtime and educational outcomes have not been revalidated. No individual team role or learning-impact measurement is claimed.',
      links: [
        { label: 'Prototype screens and routes', url: 'https://github.com/primetimetank21/PIT-UN-hackathon2023/blob/bf5aaa7f1031478f16527bd23c5f71a16d856dbe/frontend/frontend/frontend.py#L41-L78' },
        { label: 'Knowledge-question branches', url: 'https://github.com/primetimetank21/PIT-UN-hackathon2023/blob/bf5aaa7f1031478f16527bd23c5f71a16d856dbe/frontend/frontend/routes/initial_question.py' },
        { label: 'Savings exercise', url: 'https://github.com/primetimetank21/PIT-UN-hackathon2023/blob/bf5aaa7f1031478f16527bd23c5f71a16d856dbe/frontend/frontend/routes/saving_simulation.py' },
        { label: 'Team context and future scope', url: 'https://github.com/primetimetank21/PIT-UN-hackathon2023/blob/bf5aaa7f1031478f16527bd23c5f71a16d856dbe/README.md' },
      ],
    },
  },
  {
    name: 'hackUMBC2022',
    description: 'TrustDeFi — a hackathon prototype that brings Ethereum transaction history and public address labels into one view.',
    url: 'https://github.com/primetimetank21/hackUMBC2022',
    status: 'completed',
    caseStudy: {
      path: '/projects/trustdefi/',
      title: 'TrustDeFi: transaction context, not a trust prediction',
      technologies: ['Python', 'FastAPI', 'Requests', 'BeautifulSoup', 'Jinja2'],
      flow: ['Ethereum address', 'Covalent transactions + Etherscan labels', 'Template view'],
      problem: 'The 2022 TrustDeFi team hackathon project explored ways to inspect an Ethereum address before transacting. The implemented web view brings transaction records and existing public labels together rather than asking readers to inspect each source separately.',
      approach: 'A FastAPI address route requests transaction data from Covalent and calls a BeautifulSoup scraper for Etherscan label links. A Jinja2 template displays the returned labels, transaction hashes, quoted values, and dates.',
      tradeoff: 'Third-party data supplies context, not a safety verdict. The scraper returns an empty list for a non-200 response, and the view treats an empty label list as reassuring. Missing labels and fetch failures must not be read as wallet safety; the code does not implement an ML fraud model or validated trust prediction.',
      evidence: 'The route and two data adapters document the historical integration. Current API availability, scraping behavior, and runtime have not been revalidated. The README places machine-learning classification in future scope; no predictive accuracy or individual team contribution is claimed.',
      links: [
        { label: 'Address route and label fallback', url: 'https://github.com/primetimetank21/hackUMBC2022/blob/3fd8040b1f6caf6bce1c3dc59a3e9ba315d42fcb/main.py#L27-L48' },
        { label: 'Transaction adapter', url: 'https://github.com/primetimetank21/hackUMBC2022/blob/3fd8040b1f6caf6bce1c3dc59a3e9ba315d42fcb/covalent_api_lib/__init__.py' },
        { label: 'Label scraper and failure behavior', url: 'https://github.com/primetimetank21/hackUMBC2022/blob/3fd8040b1f6caf6bce1c3dc59a3e9ba315d42fcb/etherscan_lib/__init__.py' },
        { label: 'Team context and future scope', url: 'https://github.com/primetimetank21/hackUMBC2022/blob/3fd8040b1f6caf6bce1c3dc59a3e9ba315d42fcb/README.md' },
      ],
    },
  },
  {
    name: 'instagram-scanner',
    description: 'A Python automation project for comparing an Instagram account’s followers and following, with local data outputs.',
    url: 'https://github.com/primetimetank21/instagram-scanner',
    status: 'completed',
    caseStudy: {
      path: '/projects/instagram-scanner/',
      title: 'Instagram Scanner: from browser session to local comparison',
      technologies: ['Python', 'Playwright', 'Requests', 'JSON'],
      flow: ['Saved browser session', 'Paginated follower lists', 'Local comparison + files'],
      problem: 'Comparing followers and following manually is repetitive. This project explores a local workflow that retrieves both lists and identifies usernames present in one but not the other.',
      approach: 'Playwright starts a browser with saved session state. Helpers read displayed counts, extract cookies and a request header, then use Requests to paginate followers and following. The workflow writes JSON as it collects records, compares usernames in both directions, and saves profile links to local text files.',
      tradeoff: 'Reusing a browser session avoids embedding a password in the script, but saved state and outputs remain sensitive account data. Private web endpoints, page text, and embedded headers are fragile dependencies. Partial fetches or changing lists can distort the comparison; these files are not a complete account audit.',
      evidence: 'The driver and helpers show session bootstrap, pagination, local output, and comparison logic. Review was source-only: no Instagram automation was executed and no account data was collected. Present-day compatibility and completeness have not been revalidated; this is not an official Instagram integration.',
      links: [
        { label: 'Workflow driver', url: 'https://github.com/primetimetank21/instagram-scanner/blob/6ce197e541d264f19a51eff4e3c91f3d8b3ec91c/src/main.py#L16-L66' },
        { label: 'Browser session and request inputs', url: 'https://github.com/primetimetank21/instagram-scanner/blob/6ce197e541d264f19a51eff4e3c91f3d8b3ec91c/src/helpers/utils.py#L21-L103' },
        { label: 'Pagination and local comparison', url: 'https://github.com/primetimetank21/instagram-scanner/blob/6ce197e541d264f19a51eff4e3c91f3d8b3ec91c/src/helpers/utils.py#L136-L278' },
      ],
    },
  },
  {
    name: 'primetimetank21.github.io',
    description: 'A static-first engineering portfolio with native project navigation, an optional terminal, and tested delivery to GitHub Pages.',
    url: 'https://github.com/primetimetank21/primetimetank21.github.io',
    status: 'active',
    caseStudy: {
      path: '/projects/portfolio/',
      title: 'Portfolio: a browsable site with an optional terminal',
      technologies: ['Astro', 'TypeScript', 'GSAP', 'Vitest', 'Playwright', 'GitHub Actions'],
      flow: ['Shared typed content', 'Static pages + native links', 'Optional terminal + themes'],
      problem: 'A terminal is a playful way to explore engineering work, but it should not be a prerequisite for reading it. This portfolio pairs that interaction with a browsable site: identity, experience, project details, and contact links remain available without learning commands or enabling JavaScript.',
      approach: 'Astro renders typed content into static HTML for GitHub Pages. Homepage cards and standalone studies reuse one content source and the same study-body component. Native links provide ordinary navigation; independent details/summary disclosures keep the featured studies optional on the homepage. The terminal layers command history, completion, and structured output over that content. Its open command accepts only named local destinations, requests tabs synchronously with opener isolation, and always provides a native fallback link. Shared theme tokens and reduced-motion handling keep presentation separate from the reading path.',
      tradeoff: 'Static output keeps the content available without a client-side application, but edits still require a build and publication. The terminal deliberately cannot open arbitrary URLs or paths. A null window.open result is not treated as proof of a blocked tab, because opener isolation can also produce null on success. Motion and theme switching are enhancements, not requirements for accessing the pages.',
      evidence: 'Vitest covers shared content, command parsing, destination boundaries, history, and motion helpers. Playwright exercises native disclosures, no-JS navigation, keyboard behavior, theme persistence, real isolated tabs, fallback handling, and nested 404s against a production build. GitHub Actions separates build/check, unit, functional E2E, and blocking visual comparison; visual baselines use a pinned official Playwright container and a workflow with an optional artifact-only review mode. These checks provide regression evidence, not measured recruiting impact, full accessibility conformance, or physical-device validation. The linked files describe the reviewed engineering baseline, before this study was added.',
      links: [
        { label: 'Static homepage composition', url: 'https://github.com/primetimetank21/primetimetank21.github.io/blob/3273d8fa4d27842c915ac5e96614a34b00097cb9/src/pages/index.astro' },
        { label: 'Shared study body', url: 'https://github.com/primetimetank21/primetimetank21.github.io/blob/3273d8fa4d27842c915ac5e96614a34b00097cb9/src/components/CaseStudyBody.astro' },
        { label: 'Safe-open browser checks', url: 'https://github.com/primetimetank21/primetimetank21.github.io/blob/3273d8fa4d27842c915ac5e96614a34b00097cb9/tests/e2e/terminal-open.spec.ts' },
        { label: 'Build and test gates', url: 'https://github.com/primetimetank21/primetimetank21.github.io/blob/3273d8fa4d27842c915ac5e96614a34b00097cb9/.github/workflows/build-check.yml' },
        { label: 'Artifact-only visual review mode', url: 'https://github.com/primetimetank21/primetimetank21.github.io/blob/3273d8fa4d27842c915ac5e96614a34b00097cb9/.github/workflows/update-visual-baselines.yml' },
      ],
    },
  },
];

/** All study routes share this content; homepage prominence is an editorial choice. */
export type CaseStudyProject = Project & { caseStudy: NonNullable<Project['caseStudy']> };
export const CASE_STUDIES = PROJECTS.filter((project): project is CaseStudyProject => !!project.caseStudy);

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

// ─── Résumé ──────────────────────────────────────────────────────────────────

export const RESUME = {
  url: '/resume/earl_tankard_jr-swe_resume-2026-10-04.pdf',
  filename: 'earl_tankard_jr-swe_resume-2026-10-04.pdf',
  updated: 'Oct 4, 2026',
} as const;

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
