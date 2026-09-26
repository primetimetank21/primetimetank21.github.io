import { describe, it, expect } from 'vitest';
import { PROJECTS } from '../../lib/content';

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
