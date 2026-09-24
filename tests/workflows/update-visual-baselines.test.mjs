import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
// YAML is already present in the locked dependency tree; no extra install.
import { parse } from 'yaml';

const workflow = parse(readFileSync(
  new URL('../../.github/workflows/update-visual-baselines.yml', import.meta.url),
  'utf8',
));
const generate = workflow.jobs['generate-baselines'];
const commit = workflow.jobs['commit-baselines'];
const commitStep = commit.steps.find(step => step.name === 'Commit and push baselines');
const snapshots = 'tests/e2e/__snapshots__/';
const targetRef = '${{ github.event.inputs.branch }}';

// Execute only the commit shell logic, with git/gh replaced by Bash functions.
// Calls are NUL-delimited on fd 3 so quoting/argument boundaries can be checked.
// No inherited credentials; an empty PATH keeps real git/gh out of the harness.
function simulateCommit(targetBranch, changed = true) {
  const result = spawnSync('/bin/bash', ['--noprofile', '--norc', '-e', '-o', 'pipefail', '-s'], {
    input: `
      record() { printf '%s\\0' "$@" >&3; printf '\\0' >&3; }
      git() {
        record git "$@"
        if [ "$1" = "diff" ]; then return "$MOCK_DIFF_STATUS"; fi
      }
      gh() { record gh "$@"; }
      ${commitStep.run}
    `,
    env: {
      PATH: '',
      TARGET_BRANCH: targetBranch,
      GITHUB_RUN_ID: '12345',
      MOCK_DIFF_STATUS: changed ? '1' : '0',
    },
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe', 'pipe'],
    timeout: 5_000,
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  return result.output[3].split('\0\0').filter(Boolean).map(call => call.split('\0'));
}

function assertCommitMessage(calls, expected) {
  const messages = calls.filter(call => call[0] === 'git' && call[1] === 'commit');
  assert.deepEqual(messages, [['git', 'commit', '-m', expected]]);
  assert.doesNotMatch(expected, /\[skip ci\]|\[ci skip\]|co-authored-by|copilot/i);
}

test('dispatch uses a real boolean, defaults to committing, and gates the entire write job', () => {
  assert.deepEqual(Object.keys(workflow.on), ['workflow_dispatch']);
  const inputs = workflow.on.workflow_dispatch.inputs;
  assert.equal(inputs.branch.default, 'main');
  assert.equal(inputs.commit_baselines.type, 'boolean');
  assert.equal(inputs.commit_baselines.default, true);
  assert.equal(inputs.commit_baselines.required, false);
  assert.deepEqual(Object.keys(workflow.jobs), ['generate-baselines', 'commit-baselines']);
  assert.equal(commit.needs, 'generate-baselines');
  // The inputs context preserves false as a boolean, unlike github.event.inputs.
  assert.equal(commit.if, '${{ inputs.commit_baselines }}');
  assert.equal(generate.if, undefined);
});

test('artifact-only job always builds and uploads in the pinned official container without write steps', () => {
  assert.equal(generate.container.image, 'mcr.microsoft.com/playwright:v1.61.1-noble');
  assert.deepEqual(generate.permissions, { contents: 'read' });
  assert.deepEqual(generate.steps.map(step => step.uses ?? step.run), [
    'actions/checkout@v4',
    'actions/setup-node@v4',
    'npm ci',
    'npm run build',
    'npm run test:visual:update',
    'actions/upload-artifact@v4',
  ]);
  for (const step of generate.steps) assert.equal(step.if, undefined);
  const upload = generate.steps.find(step => step.uses === 'actions/upload-artifact@v4');
  const download = commit.steps.find(step => step.uses === 'actions/download-artifact@v4');
  assert.equal(upload.with.name, 'visual-snapshots');
  assert.equal(upload.with.path, snapshots);
  assert.equal(download.with.name, upload.with.name);
  assert.equal(download.with.path, snapshots);
  // Every possible write step remains inside the conditionally skipped job.
  assert.deepEqual(commit.steps.map(step => step.uses ?? step.name), [
    'actions/checkout@v4',
    'actions/download-artifact@v4',
    'Commit and push baselines',
  ]);
});

test('target branch stays in checkout refs and a quoted environment variable, not shell interpolation', () => {
  for (const job of [generate, commit]) {
    assert.equal(job.steps.find(step => step.uses === 'actions/checkout@v4').with.ref, targetRef);
    for (const step of job.steps.filter(step => step.run)) {
      assert.doesNotMatch(step.run, /\$\{\{/);
    }
  }
  assert.equal(commitStep.env.TARGET_BRANCH, targetRef);
  assert.equal(commitStep.env.GH_TOKEN, '${{ secrets.GITHUB_TOKEN }}');
  assert.ok(commitStep.run.includes('if [ "$TARGET_BRANCH" = "main" ]; then'));
  assert.ok(commitStep.run.includes('git push origin HEAD:"$TARGET_BRANCH"'));
});

test('baseline update refreshes every image, including changes inside comparison tolerance', () => {
  const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.scripts['test:visual:update'], 'playwright test tests/e2e/visual.spec.ts --update-snapshots=all');
});

test('PR checks execute this workflow regression suite', () => {
  const checks = parse(readFileSync(
    new URL('../../.github/workflows/build-check.yml', import.meta.url), 'utf8',
  ));
  assert.ok(checks.jobs['unit-tests'].steps.some(step =>
    step.run === 'node --test tests/workflows/update-visual-baselines.test.mjs',
  ));
});

test('all workflow shell blocks have valid Bash syntax', () => {
  for (const job of [generate, commit]) {
    for (const step of job.steps.filter(step => step.run)) {
      const result = spawnSync('/bin/bash', ['--noprofile', '--norc', '-n'], {
        input: step.run,
        encoding: 'utf8',
        timeout: 5_000,
      });
      assert.ifError(result.error);
      assert.equal(result.status, 0, `${step.name}: ${result.stderr}`);
    }
  }
});

test('main creates a baseline branch/PR and requests protected auto-merge without CI-skip or AI trailers', () => {
  const calls = simulateCommit('main');
  const baselineBranch = 'baselines/auto-12345';
  assertCommitMessage(calls, 'test(visual): regenerate Linux baselines');
  assert.deepEqual(calls.filter(call => call[0] === 'git' && call[1] === 'checkout'), [
    ['git', 'checkout', '-b', baselineBranch],
  ]);
  assert.deepEqual(calls.filter(call => call[0] === 'git' && call[1] === 'push'), [
    ['git', 'push', 'origin', baselineBranch],
  ]);
  const ghCalls = calls.filter(call => call[0] === 'gh');
  assert.equal(ghCalls.length, 2);
  const create = ghCalls[0];
  assert.deepEqual(create.slice(0, 3), ['gh', 'pr', 'create']);
  assert.equal(create[create.indexOf('--base') + 1], 'main');
  assert.equal(create[create.indexOf('--head') + 1], baselineBranch);
  const body = create[create.indexOf('--body') + 1];
  assert.match(body, /GITHUB_TOKEN/);
  assert.match(body, /all four required checks on the latest PR commit/);
  assert.deepEqual(ghCalls[1], ['gh', 'pr', 'merge', baselineBranch, '--auto', '--squash']);
  assert.ok(!calls.flat().includes('--admin'));
});

for (const branch of ['feat/portfolio-ui', 'topic/quotes"\'$(id);$HOME']) {
  test(`non-main target is passed literally to commit/push without opening or merging a PR: ${branch}`, () => {
    const calls = simulateCommit(branch);
    assertCommitMessage(calls, `test(visual): regenerate Linux baselines for ${branch}`);
    assert.deepEqual(calls.filter(call => call[0] === 'git' && call[1] === 'push'), [
      ['git', 'push', 'origin', `HEAD:${branch}`],
    ]);
    assert.ok(!calls.some(call => call[0] === 'gh' || call[1] === 'checkout'));
  });
}

for (const branch of ['main', 'feat/portfolio-ui']) {
  test(`unchanged snapshots do not commit, push, open a PR, or merge for ${branch}`, () => {
    assert.deepEqual(simulateCommit(branch, false), [
      ['git', 'config', 'user.name', 'github-actions[bot]'],
      ['git', 'config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'],
      ['git', 'add', snapshots],
      ['git', 'diff', '--staged', '--quiet'],
    ]);
  });
}
