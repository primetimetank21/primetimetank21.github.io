/**
 * Shared motion utility — one timing system for the whole site.
 *
 * M1: minimal (requestAnimationFrame-based typing + reduced-motion helper).
 * M3: GSAP added. shouldAnimate() gates all motion — check it before any animation.
 * Never create a parallel timing system — always extend this module.
 */

/** Returns true if the user has requested reduced motion. SSR-safe. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Returns true when animations should run.
 * False when: user prefers reduced motion, OR automated testing environment detected.
 *
 * Gating on navigator.webdriver keeps visual regression snapshots stable —
 * Playwright sets this flag, so GSAP tweens are skipped in test runs and all
 * elements render at their final (visible) state immediately.
 */
export function shouldAnimate(): boolean {
  if (prefersReducedMotion()) return false;
  if (typeof navigator !== 'undefined' && navigator.webdriver === true) return false;
  return true;
}

export interface TypeTextOptions {
  /** Milliseconds between characters (normal motion). Default: 35 */
  charDelay?: number;
  /** Called after each character is appended */
  onChar?: (el: Element) => void;
}

/**
 * Type text into an element char-by-char, respecting prefers-reduced-motion.
 * Reduced-motion: sets text instantly (no animation).
 * Returns a Promise that resolves when the text is fully rendered.
 */
export async function typeText(
  el: Element,
  text: string,
  options: TypeTextOptions = {},
): Promise<void> {
  const { charDelay = 35, onChar } = options;

  if (prefersReducedMotion()) {
    el.textContent = text;
    return;
  }

  el.textContent = '';
  for (const char of text) {
    el.textContent += char;
    onChar?.(el);
    await new Promise<void>(resolve => setTimeout(resolve, charDelay));
  }
}
