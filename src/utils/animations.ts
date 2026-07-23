/**
 * animations.ts — GSAP animation primitives for the terminal.
 *
 * All animations are gated behind shouldAnimate() which respects both
 * prefers-reduced-motion and automated testing environments (navigator.webdriver).
 *
 * Architecture:
 *   - This is the ONLY module that imports gsap.
 *   - Called from TerminalShell.astro's client <script>.
 *   - terminal.ts (pure logic) never imports this.
 *   - motion.ts owns shouldAnimate / prefersReducedMotion helpers.
 *
 * Design constraints:
 *   - transform/opacity only — no layout-thrashing properties.
 *   - clearProps after each tween so inline styles don't linger.
 *   - Total boot-up sequence ≤ 500 ms — fast and tasteful, not gimmicky.
 */

import gsap from 'gsap';
import { shouldAnimate } from './motion.ts';

/**
 * Boot-up sequence for the terminal window.
 * Phase 1: terminal chrome fades + scales in from slightly below.
 * Phase 2: traffic-light dots pop in sequentially for a "power-on" feel.
 * Returns a Promise that resolves when the sequence completes.
 */
export function bootUpTerminal(windowEl: Element): Promise<void> {
  if (!shouldAnimate()) return Promise.resolve();

  return new Promise<void>(resolve => {
    const tl = gsap.timeline({ onComplete: resolve });

    tl.from(windowEl, {
      opacity: 0,
      scale: 0.97,
      y: 10,
      duration: 0.32,
      ease: 'power2.out',
      clearProps: 'opacity,scale,y,transform',
    });

    tl.from(
      windowEl.querySelectorAll('.dot'),
      {
        scale: 0,
        opacity: 0,
        duration: 0.12,
        stagger: 0.05,
        ease: 'back.out(2)',
        clearProps: 'opacity,scale,transform',
      },
      '-=0.15',
    );
  });
}

/**
 * Stagger-reveal welcome message lines after boot-up.
 * Fades each line in from slightly below, sequentially.
 * Called once on first load after bootUpTerminal resolves.
 */
export function revealWelcomeLines(lines: Element[]): Promise<void> {
  if (!shouldAnimate() || lines.length === 0) return Promise.resolve();

  return new Promise<void>(resolve => {
    gsap.from(lines, {
      opacity: 0,
      y: 5,
      duration: 0.22,
      ease: 'power1.out',
      stagger: 0.12,
      clearProps: 'opacity,y,transform',
      onComplete: resolve,
    });
  });
}

/**
 * Stagger-reveal the direct children of a newly-appended output entry.
 * Each child (command echo, output lines container) fades in with a slight
 * upward motion. Call immediately after appending the entry to the DOM.
 */
export function revealOutputEntry(entryEl: Element): void {
  if (!shouldAnimate()) return;

  const children = Array.from(entryEl.children);
  if (children.length === 0) return;

  gsap.from(children, {
    opacity: 0,
    y: 4,
    duration: 0.18,
    ease: 'power1.out',
    stagger: 0.03,
    clearProps: 'opacity,y,transform',
  });
}
