import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { PROJECTS, CASE_STUDIES, CONTACT, LINKS_LINES, RESUME, EXPERIENCE } from '../../lib/content';

describe('public résumé', () => {
  it('shares the accepted same-origin asset URL and dated download filename', () => {
    expect(RESUME).toEqual({
      url: '/resume/earl_tankard_jr-swe_resume-2026-10-04.pdf',
      filename: 'earl_tankard_jr-swe_resume-2026-10-04.pdf',
      updated: 'Oct 4, 2026',
    });
    expect(RESUME.url).toBe(`/resume/${RESUME.filename}`);
  });

  it('ships the accepted PDF unchanged', () => {
    const pdf = readFileSync(new URL(`../../../public${RESUME.url}`, import.meta.url));
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(pdf.length).toBe(73992);
    expect(createHash('sha256').update(pdf).digest('hex'))
      .toBe('e83599523c5a8bd34fa2b6c2f26f6f1b6680b7271419d51f2ce7dc6c403cc4b9');
  });

  it('keeps contact data and terminal links unchanged', () => {
    expect(CONTACT).toEqual({
      summary: 'Find my public work on GitHub, or connect with me on LinkedIn.',
      links: [
        { label: 'GitHub', url: 'https://github.com/primetimetank21' },
        { label: 'LinkedIn', url: 'https://www.linkedin.com/in/earl-tankard-jr/' },
      ],
    });
    expect(LINKS_LINES).toEqual([
      'Links:',
      '',
      '  GitHub    https://github.com/primetimetank21',
      '  LinkedIn  https://www.linkedin.com/in/earl-tankard-jr/',
      '  Portfolio https://primetimetank21.github.io',
    ]);
  });
});

describe('experience content', () => {
  it('keeps four reverse-chronological groups with separate internship periods', () => {
    expect(EXPERIENCE.engagements.map(({ contributions, ...engagement }) => engagement)).toEqual([
      { id: 'microsoft-current', employer: 'Microsoft', role: 'Software Engineer 2', period: 'Jul 2025–Present', current: true },
      { id: 'us-ai', employer: 'US AI', role: 'Software Engineer, Contract', period: 'Feb–Apr 2025' },
      { id: 'microsoft-internships', employer: 'Microsoft', role: 'Software Engineer Intern', period: 'Two separate internships' },
      { id: 'icims-internships', employer: 'iCIMS', role: 'Software Engineer Intern', period: 'Two separate internships' },
    ]);
    expect(EXPERIENCE.engagements.map(engagement => engagement.contributions.length)).toEqual([1, 1, 2, 2]);
  });

  it('preserves all six approved Title Case headings, body facts, dates and supported technologies', () => {
    expect(EXPERIENCE.engagements.flatMap(engagement => engagement.contributions)).toEqual([
      {
        title: 'Prototype to Production',
        description: 'Drive software from prototype to production through rotational assignments in Microsoft’s AI Development Acceleration Program (MAIDAP). Partner with cross-functional teams to improve products and create new applications and workflows.',
      },
      {
        title: 'Application Stability and Maintainability',
        description: 'Resolved 60+ bugs in the Archangel application, addressing stability and performance issues. Refactored legacy components to improve maintainability.',
      },
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
    ]);
  });

  it('retains the accepted introduction and public-work references without new claims', () => {
    expect(EXPERIENCE.intro).toBe('Selected engineering work in AI-powered development, backend APIs, test automation, and developer tooling.');
    expect(EXPERIENCE.publicWork).toEqual({
      heading: 'Explore the public work',
      intro: 'For examples you can inspect, explore these public projects and the engineering decisions behind them.',
      links: [
        { label: 'dev-setup', url: '/projects/dev-setup/', description: 'Development environment automation' },
        { label: 'Phission', url: '/projects/phission/', description: 'A reproducible, synthetic-only email safety demo' },
      ],
    });
    expect(EXPERIENCE.publicWork.links.map(link => link.url)).toEqual(CASE_STUDIES.filter(project => project.featured).map(project => project.caseStudy.path));
    expect(JSON.stringify(EXPERIENCE)).not.toMatch(/—|112%|research|publications|freelance/i);
  });
});

describe('project content', () => {
  it('keeps all seven projects in presentation order', () => {
    expect(PROJECTS.map(project => project.name)).toEqual([
      'dev-setup',
      'phission',
      'apple-music-playlist-converter',
      'PIT-UN-hackathon2023',
      'hackUMBC2022',
      'instagram-scanner',
      'primetimetank21.github.io',
    ]);
  });

  it('features only DevSetup and Phission', () => {
    const featured = PROJECTS.filter(project => project.featured);
    expect(featured.map(project => project.name)).toEqual(['dev-setup', 'phission']);
    expect(featured.every(project => project.caseStudy)).toBe(true);
    expect(PROJECTS.filter(project => !project.featured)).toHaveLength(5);
  });

  it('shares six unique static destinations independently of repository names and featuredness', () => {
    expect(CASE_STUDIES).toEqual(PROJECTS.filter(project => project.caseStudy));
    const paths = CASE_STUDIES.map(project => project.caseStudy.path);
    expect(paths).toEqual([
      '/projects/dev-setup/', '/projects/phission/', '/projects/finlitt/',
      '/projects/trustdefi/', '/projects/instagram-scanner/', '/projects/portfolio/',
    ]);
    expect(new Set(paths).size).toBe(6);
    for (const path of paths) expect(path).toMatch(/^\/projects\/[a-z0-9-]+\/$/);
    expect(CASE_STUDIES.filter(project => !project.featured)).toHaveLength(4);
    expect(PROJECTS.filter(project => !project.caseStudy)).toHaveLength(1);
  });

  it('pins every new study evidence link to the reviewed public source revision', () => {
    const revisions: Record<string, string> = {
      'PIT-UN-hackathon2023': 'bf5aaa7f1031478f16527bd23c5f71a16d856dbe',
      hackUMBC2022: '3fd8040b1f6caf6bce1c3dc59a3e9ba315d42fcb',
      'instagram-scanner': '6ce197e541d264f19a51eff4e3c91f3d8b3ec91c',
      'primetimetank21.github.io': '3273d8fa4d27842c915ac5e96614a34b00097cb9',
    };
    for (const project of CASE_STUDIES.filter(project => !project.featured)) {
      expect(project.caseStudy.links.length).toBeGreaterThanOrEqual(3);
      for (const link of project.caseStudy.links) {
        expect(link.url.startsWith(`${project.url}/blob/${revisions[project.name]}/`)).toBe(true);
      }
    }
  });

  it('keeps the new historical studies candid about implementation and validation limits', () => {
    const study = (name: string) => CASE_STUDIES.find(project => project.name === name)!.caseStudy;
    expect(study('PIT-UN-hackathon2023').tradeoff).toContain('without authenticating');
    expect(study('PIT-UN-hackathon2023').tradeoff).toContain('AI personalization was future scope');
    expect(study('hackUMBC2022').tradeoff).toContain('Missing labels and fetch failures must not be read as wallet safety');
    expect(study('hackUMBC2022').tradeoff).toContain('does not implement an ML fraud model');
    expect(study('instagram-scanner').tradeoff).toContain('sensitive account data');
    expect(study('instagram-scanner').tradeoff).toContain('Private web endpoints');
    expect(study('instagram-scanner').evidence).toContain('no Instagram automation was executed');
    for (const name of ['PIT-UN-hackathon2023', 'hackUMBC2022', 'instagram-scanner']) {
      expect(study(name).evidence).toContain('not been revalidated');
    }
  });

  it('retains the converter as a secondary project without a case study', () => {
    expect(PROJECTS.find(project => project.name === 'apple-music-playlist-converter')).toEqual({
      name: 'apple-music-playlist-converter',
      description: 'A Python CLI for recreating an Apple Music playlist in Spotify without searching for every track by hand.',
      url: 'https://github.com/primetimetank21/apple-music-playlist-converter',
      status: 'completed',
    });
  });

  it('presents Phission as a completed synthetic demo with explicit limits', () => {
    const phission = PROJECTS.find(project => project.name === 'phission');
    expect(phission).toMatchObject({
      status: 'completed',
      url: 'https://github.com/primetimetank21/phission',
      description: expect.stringContaining('synthetic-only'),
      caseStudy: {
        title: 'From HCI prototype to a reproducible demo',
        technologies: ['Python', 'Reflex', 'Pytest', 'Playwright'],
        flow: ['Synthetic inbox', 'MIME + link parsing', 'Simulated result + guidance'],
        tradeoff: expect.stringContaining('do not establish phishing-detection accuracy'),
        evidence: expect.stringContaining('not production mail security'),
      },
    });
  });

  it('links Phission evidence to the reviewed commit and post-merge CI, not a live demo', () => {
    const study = PROJECTS.find(project => project.name === 'phission')?.caseStudy;
    const revision = 'https://github.com/primetimetank21/phission/blob/5bca9247a0f09a754db3c89c317a5f27dd92eb52';
    expect(study?.links).toEqual([
      { label: 'Parser coverage', url: `${revision}/tests/test_html_boundaries.py` },
      { label: 'Session isolation', url: `${revision}/tests/test_state.py` },
      { label: 'Local-build preview', url: `${revision}/docs/demo-workspace.png` },
      { label: 'Post-merge CI', url: 'https://github.com/primetimetank21/phission/actions/runs/36249730404' },
    ]);
  });
});
