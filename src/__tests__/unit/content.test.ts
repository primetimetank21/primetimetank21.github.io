import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { PROJECTS, CASE_STUDIES, CONTACT, LINKS_LINES, RESUME } from '../../lib/content';

describe('public résumé', () => {
  it('shares the accepted same-origin asset URL and dated download filename', () => {
    expect(RESUME).toEqual({
      url: '/resume/earl_tankard_jr-swe_resume-2026-10-04.pdf',
      filename: 'earl_tankard_jr-swe_resume-2026-10-04.pdf',
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
    expect(PROJECTS.filter(project => project.caseStudy).map(project => project.name))
      .toEqual(['dev-setup', 'phission']);
  });

  it('shares exactly the two static destinations with the featured projects', () => {
    expect(CASE_STUDIES).toEqual(PROJECTS.filter(project => project.caseStudy));
    expect(CASE_STUDIES.map(project => project.caseStudy.path)).toEqual([
      '/projects/dev-setup/', '/projects/phission/',
    ]);
    for (const project of CASE_STUDIES) {
      expect(project.caseStudy.path).toBe(`/projects/${project.name}/`);
    }
    expect(PROJECTS.filter(project => !project.caseStudy)).toHaveLength(5);
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
