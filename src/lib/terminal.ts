/**
 * Pure terminal logic — no DOM dependencies.
 * Importable by both the Astro island script and Vitest unit tests.
 */

import { ABOUT_LINES, formatProjects, SKILLS_LINES, LINKS_LINES, CASE_STUDIES, type CaseStudyProject } from './content.ts';

/** Sorted list of all known commands */
export const COMMANDS = ['about', 'clear', 'contact', 'help', 'links', 'open', 'projects', 'skills', 'tech', 'theme'] as const;
export type CommandName = (typeof COMMANDS)[number];

// ─── Input normalisation ─────────────────────────────────────────────────────

/** Trim, lowercase, and collapse interior whitespace */
export function normalizeInput(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

// ─── Autocomplete ────────────────────────────────────────────────────────────

/** Longest common prefix of an array of strings */
export function longestCommonPrefix(words: string[]): string {
  if (words.length === 0) return '';
  let prefix = words[0];
  for (let i = 1; i < words.length; i++) {
    while (!words[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return '';
    }
  }
  return prefix;
}

/**
 * Return the best tab-completion for a partial input:
 * - empty → ''
 * - no match → ''
 * - one match → full command
 * - multiple matches → longest common prefix (extends as far as unambiguous)
 */
export function getCompletion(raw: string): string {
  if (!raw) return '';
  const normalized = normalizeInput(raw);
  if (!normalized) return '';
  const matches = (COMMANDS as readonly string[]).filter(cmd => cmd.startsWith(normalized));
  if (matches.length === 0) return '';
  return longestCommonPrefix(matches);
}

// ─── Command router ──────────────────────────────────────────────────────────

export type OutputType = 'output' | 'clear' | 'theme';

export interface CommandLink {
  label: string;
  href: CaseStudyProject['caseStudy']['path'];
}

export interface CommandResult {
  type: OutputType;
  lines: string[];
  links?: readonly CommandLink[];
  openPath?: CommandLink['href'];
}

const OPEN_DESTINATIONS = Object.fromEntries(CASE_STUDIES.map(project => [
  project.name, { label: project.name, href: project.caseStudy.path },
]));
const OPEN_USAGE = `Usage: open [${Object.keys(OPEN_DESTINATIONS).join(' | ')}]`;

/** Execute a command string and return a structured result */
export function executeCommand(raw: string): CommandResult {
  const cmd = normalizeInput(raw);
  const [name, ...args] = cmd.split(' ');

  if (name === 'open') {
    if (args.length === 0) {
      return {
        type: 'output',
        lines: ['Case studies (links open in a new tab):', OPEN_USAGE],
        links: Object.values(OPEN_DESTINATIONS),
      };
    }
    // Never look up inherited properties or treat input as a URL/path.
    if (args.length === 1 && Object.hasOwn(OPEN_DESTINATIONS, args[0])) {
      const link = OPEN_DESTINATIONS[args[0]];
      return {
        type: 'output',
        lines: ['New tab requested. If it did not appear, use the link below:'],
        links: [link],
        openPath: link.href,
      };
    }
    return { type: 'output', lines: [OPEN_USAGE, 'Type `help` to see available commands.'] };
  }

  switch (cmd) {
    case 'help':
      return {
        type: 'output',
        lines: [
          'Available commands:',
          "  help      \u2014 show this message",
          "  about     \u2014 who I am",
          "  projects  \u2014 things I've built",
          "  open      \u2014 list case studies; open <name> requests a new tab",
          "  skills    \u2014 tech stack  (alias: tech)",
          "  contact   \u2014 links & contact info  (alias: links)",
          "  theme     \u2014 toggle light / dark theme",
          "  clear     \u2014 clear the terminal",
        ],
      };

    case 'about':
      return { type: 'output', lines: [...ABOUT_LINES] };

    case 'projects':
      return { type: 'output', lines: formatProjects() };

    case 'skills':
    case 'tech':
      return { type: 'output', lines: [...SKILLS_LINES] };

    case 'contact':
    case 'links':
      return { type: 'output', lines: [...LINKS_LINES] };

    case 'clear':
      return { type: 'clear', lines: [] };

    case 'theme':
      return { type: 'theme', lines: [] };

    default: {
      const safe = cmd.slice(0, 64);
      return {
        type: 'output',
        lines: [
          `command not found: ${safe}`,
          'Type `help` to see available commands.',
        ],
      };
    }
  }
}

// ─── History ─────────────────────────────────────────────────────────────────

/**
 * Command history with up/down cursor-based recall.
 *
 * cursor = -1  => "current" (not in history)
 * cursor = 0   => entries[0] (most-recent history entry)
 * cursor = N   => entries[N] (older)
 */
export class TerminalHistory {
  private entries: string[] = [];
  private cursor = -1;

  /** Push a new entry; resets the cursor and deduplicates consecutive identical entries */
  push(raw: string): void {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (this.entries[0] === trimmed) {
      this.cursor = -1;
      return;
    }
    this.entries.unshift(trimmed);
    this.cursor = -1;
  }

  /**
   * Navigate to an older entry.
   * Returns the entry text, or null if already at the oldest entry (or empty history).
   */
  up(): string | null {
    if (this.entries.length === 0) return null;
    if (this.cursor < this.entries.length - 1) {
      this.cursor++;
      return this.entries[this.cursor];
    }
    return null;
  }

  /**
   * Navigate to a newer entry.
   * Returns entry text, '' when back at current (blank), or null if already at current.
   */
  down(): string | null {
    if (this.cursor === -1) return null;
    if (this.cursor === 0) {
      this.cursor = -1;
      return '';
    }
    this.cursor--;
    return this.entries[this.cursor];
  }

  /** Reset cursor to "current" (bottom) position */
  reset(): void {
    this.cursor = -1;
  }
}
