import { describe, it, expect, beforeEach } from 'vitest';
import {
  normalizeInput,
  longestCommonPrefix,
  getCompletion,
  executeCommand,
  TerminalHistory,
  COMMANDS,
} from '../../lib/terminal';

// ─── normalizeInput ──────────────────────────────────────────────────────────

describe('normalizeInput', () => {
  it('trims leading/trailing whitespace', () => {
    expect(normalizeInput('  help  ')).toBe('help');
  });

  it('lowercases input', () => {
    expect(normalizeInput('HELP')).toBe('help');
    expect(normalizeInput('Projects')).toBe('projects');
  });

  it('collapses interior whitespace', () => {
    expect(normalizeInput('hello   world')).toBe('hello world');
  });

  it('returns empty string for blank input', () => {
    expect(normalizeInput('   ')).toBe('');
  });

  it('handles mixed case + whitespace', () => {
    expect(normalizeInput('  CLEAR  ')).toBe('clear');
  });
});

// ─── longestCommonPrefix ─────────────────────────────────────────────────────

describe('longestCommonPrefix', () => {
  it('returns empty string for empty array', () => {
    expect(longestCommonPrefix([])).toBe('');
  });

  it('returns the single word for a one-element array', () => {
    expect(longestCommonPrefix(['help'])).toBe('help');
  });

  it('finds the common prefix of two words', () => {
    expect(longestCommonPrefix(['contact', 'clear'])).toBe('c');
  });

  it('finds a longer common prefix', () => {
    expect(longestCommonPrefix(['project', 'projects'])).toBe('project');
  });

  it('returns empty string when there is no common prefix', () => {
    expect(longestCommonPrefix(['abc', 'xyz'])).toBe('');
  });

  it('returns the full word when all words are identical', () => {
    expect(longestCommonPrefix(['help', 'help'])).toBe('help');
  });
});

// ─── getCompletion ───────────────────────────────────────────────────────────

describe('getCompletion', () => {
  it('returns empty string for empty input', () => {
    expect(getCompletion('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(getCompletion('   ')).toBe('');
  });

  it('returns full command for a unique prefix', () => {
    expect(getCompletion('pr')).toBe('projects');
  });

  it('returns full command for `ab` (unique prefix for about)', () => {
    expect(getCompletion('ab')).toBe('about');
  });

  it('returns the longest common prefix for multiple matches', () => {
    // 'co' matches 'contact' only (clear starts with 'cl', not 'co')
    expect(getCompletion('co')).toBe('contact');
    // 'c' matches 'clear' and 'contact'
    expect(getCompletion('c')).toBe('c');
  });

  it('returns empty string for no match', () => {
    expect(getCompletion('xyz')).toBe('');
    expect(getCompletion('zzz')).toBe('');
  });

  it('returns full command when input is already the complete command', () => {
    expect(getCompletion('help')).toBe('help');
    expect(getCompletion('clear')).toBe('clear');
  });

  it('is case-insensitive', () => {
    expect(getCompletion('PR')).toBe('projects');
    expect(getCompletion('HE')).toBe('help');
  });

  it('handles all known commands as unique completions from sufficient prefix', () => {
    for (const cmd of COMMANDS) {
      // A command should complete to itself when the full name is given
      expect(getCompletion(cmd)).toBe(cmd);
    }
  });
});

// ─── executeCommand ──────────────────────────────────────────────────────────

describe('executeCommand', () => {
  it('routes `help` to output type', () => {
    const r = executeCommand('help');
    expect(r.type).toBe('output');
    expect(r.lines.length).toBeGreaterThan(0);
    expect(r.lines.join('\n')).toContain('help');
  });

  it('help output mentions all major commands', () => {
    const text = executeCommand('help').lines.join('\n');
    expect(text).toContain('about');
    expect(text).toContain('projects');
    expect(text).toContain('skills');
    expect(text).toContain('contact');
    expect(text).toContain('theme');
    expect(text).toContain('clear');
  });

  it('about command returns real content (not placeholder)', () => {
    const r = executeCommand('about');
    expect(r.type).toBe('output');
    const text = r.lines.join('\n');
    expect(text).not.toContain('[M2]');
    expect(text).toContain('Microsoft');
    expect(text).toContain('MAIDAP');
  });

  it('projects command returns real content (not placeholder)', () => {
    const r = executeCommand('projects');
    expect(r.type).toBe('output');
    const text = r.lines.join('\n');
    expect(text).not.toContain('[M2]');
    expect(text).toContain('github.com');
  });

  it('skills command routes to output type with tech stack content', () => {
    const r = executeCommand('skills');
    expect(r.type).toBe('output');
    const text = r.lines.join('\n');
    expect(text).toContain('Python');
    expect(text).toContain('TypeScript');
  });

  it('tech command is an alias for skills', () => {
    const skills = executeCommand('skills');
    const tech = executeCommand('tech');
    expect(tech.type).toBe('output');
    expect(tech.lines).toEqual(skills.lines);
  });

  it('contact command returns real links', () => {
    const r = executeCommand('contact');
    expect(r.type).toBe('output');
    const text = r.lines.join('\n');
    expect(text).not.toContain('[M2]');
    expect(text).toContain('github.com/primetimetank21');
    expect(text).toContain('linkedin.com');
  });

  it('links command returns same output as contact', () => {
    const contact = executeCommand('contact');
    const links = executeCommand('links');
    expect(links.type).toBe('output');
    expect(links.lines).toEqual(contact.lines);
  });

  it('routes `about` to output type', () => {
    expect(executeCommand('about').type).toBe('output');
  });

  it('routes `projects` to output type', () => {
    expect(executeCommand('projects').type).toBe('output');
  });

  it('routes `contact` to output type', () => {
    expect(executeCommand('contact').type).toBe('output');
  });

  it('routes `links` as alias for contact', () => {
    expect(executeCommand('links').type).toBe('output');
  });

  it('routes `clear` to clear type with no lines', () => {
    const r = executeCommand('clear');
    expect(r.type).toBe('clear');
    expect(r.lines).toHaveLength(0);
  });

  it('routes `theme` to theme type with no lines', () => {
    const r = executeCommand('theme');
    expect(r.type).toBe('theme');
    expect(r.lines).toHaveLength(0);
  });

  it('handles unknown command gracefully with friendly message', () => {
    const r = executeCommand('bogus');
    expect(r.type).toBe('output');
    const text = r.lines.join('\n');
    expect(text).toContain('not found');
    expect(text).toContain('help');
  });

  it('normalises input before routing', () => {
    expect(executeCommand('  HELP  ').type).toBe('output');
    expect(executeCommand('  CLEAR  ').type).toBe('clear');
    expect(executeCommand('  THEME  ').type).toBe('theme');
  });

  it('caps unknown command at safe length (no crash on very long input)', () => {
    const r = executeCommand('a'.repeat(500));
    expect(r.type).toBe('output');
    expect(r.lines[0].length).toBeLessThan(200);
  });
});

// ─── TerminalHistory ─────────────────────────────────────────────────────────

describe('TerminalHistory', () => {
  let h: TerminalHistory;

  beforeEach(() => {
    h = new TerminalHistory();
  });

  it('returns null for up() on empty history', () => {
    expect(h.up()).toBeNull();
  });

  it('returns null for down() when at current position', () => {
    expect(h.down()).toBeNull();
  });

  it('recalls the most recent entry with up()', () => {
    h.push('help');
    expect(h.up()).toBe('help');
  });

  it('recalls multiple entries in order (newest first)', () => {
    h.push('help');
    h.push('about');
    expect(h.up()).toBe('about'); // most recent
    expect(h.up()).toBe('help');  // older
  });

  it('returns null when navigating up past the oldest entry', () => {
    h.push('help');
    h.up(); // to 'help'
    expect(h.up()).toBeNull(); // already at oldest
  });

  it('returns empty string when navigating down back to current', () => {
    h.push('help');
    h.up();
    expect(h.down()).toBe('');
  });

  it('navigates down through entries in reverse order', () => {
    h.push('help');
    h.push('about');
    h.push('projects');
    h.up();        // projects
    h.up();        // about
    expect(h.down()).toBe('projects'); // back to projects
    expect(h.down()).toBe('');         // back to current
  });

  it('does not duplicate consecutive identical entries', () => {
    h.push('help');
    h.push('help');
    h.up(); // 'help'
    expect(h.up()).toBeNull(); // no second 'help'
  });

  it('does not push empty / whitespace-only entries', () => {
    h.push('');
    h.push('   ');
    expect(h.up()).toBeNull();
  });

  it('reset() moves cursor back to current position', () => {
    h.push('help');
    h.up();
    h.reset();
    // After reset, down() should return null (already at current)
    expect(h.down()).toBeNull();
  });

  it('push() resets cursor so next up() starts from most recent', () => {
    h.push('help');
    h.up(); // cursor at 'help'
    h.push('about'); // should reset cursor
    expect(h.up()).toBe('about'); // back to most recent
  });
});
