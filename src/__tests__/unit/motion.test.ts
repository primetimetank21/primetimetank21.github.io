import { afterEach, describe, it, expect, vi } from 'vitest';
import { prefersReducedMotion, shouldAnimate, typeText } from '../../utils/motion';

// Stub browser globals explicitly: newer Node versions may supply navigator.
// Restore every stub so environment-specific tests cannot affect one another.
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function stubMotionPreference(matches: boolean) {
  const matchMedia = vi.fn().mockReturnValue({ matches });
  vi.stubGlobal('window', { matchMedia });
  return matchMedia;
}

describe('SSR (no window or navigator)', () => {
  it('reports no reduced-motion preference and allows animation', () => {
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('navigator', undefined);

    expect(prefersReducedMotion()).toBe(false);
    expect(shouldAnimate()).toBe(true);
  });
});

describe('prefersReducedMotion', () => {
  it.each([true, false])('returns matchMedia.matches = %s for the reduced-motion query', (matches) => {
    const matchMedia = stubMotionPreference(matches);

    expect(prefersReducedMotion()).toBe(matches);
    expect(matchMedia).toHaveBeenCalledExactlyOnceWith('(prefers-reduced-motion: reduce)');
  });
});

describe('shouldAnimate', () => {
  it.each([
    { reducedMotion: true, webdriver: false, expected: false },
    { reducedMotion: true, webdriver: true, expected: false },
    { reducedMotion: false, webdriver: true, expected: false },
    { reducedMotion: false, webdriver: false, expected: true },
    { reducedMotion: false, webdriver: undefined, expected: true },
  ])('returns $expected with reducedMotion=$reducedMotion and webdriver=$webdriver', ({ reducedMotion, webdriver, expected }) => {
    const matchMedia = stubMotionPreference(reducedMotion);
    vi.stubGlobal('navigator', { webdriver });

    expect(shouldAnimate()).toBe(expected);
    expect(matchMedia).toHaveBeenCalledExactlyOnceWith('(prefers-reduced-motion: reduce)');
  });

  it('checks reduced motion before reading webdriver', () => {
    stubMotionPreference(true);
    const readWebdriver = vi.fn(() => false);
    vi.stubGlobal('navigator', { get webdriver() { return readWebdriver(); } });

    expect(shouldAnimate()).toBe(false);
    expect(readWebdriver).not.toHaveBeenCalled();
  });

  it('allows normal motion when navigator is unavailable', () => {
    stubMotionPreference(false);
    vi.stubGlobal('navigator', undefined);

    expect(shouldAnimate()).toBe(true);
  });
});

describe('typeText', () => {
  it('renders reduced-motion text immediately without callbacks or timers', async () => {
    stubMotionPreference(true);
    vi.useFakeTimers();
    const el = { textContent: 'old text' } as Element;
    const onChar = vi.fn();

    const typing = typeText(el, 'Hi', { charDelay: 20, onChar });

    expect(el.textContent).toBe('Hi');
    expect(onChar).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    await typing;
  });

  it('types one character per delay with normal motion and calls onChar', async () => {
    stubMotionPreference(false);
    vi.useFakeTimers();
    const el = { textContent: 'old text' } as Element;
    const frames: (string | null)[] = [];
    const onChar = vi.fn((element: Element) => frames.push(element.textContent));

    const typing = typeText(el, 'Hi', { charDelay: 20, onChar });

    expect(el.textContent).toBe('H');
    expect(onChar).toHaveBeenCalledExactlyOnceWith(el);
    await vi.advanceTimersByTimeAsync(19);
    expect(el.textContent).toBe('H');
    await vi.advanceTimersByTimeAsync(1);
    expect(el.textContent).toBe('Hi');
    expect(onChar).toHaveBeenNthCalledWith(2, el);
    expect(frames).toEqual(['H', 'Hi']);
    await vi.advanceTimersByTimeAsync(20);
    await typing;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('uses the default 35ms delay without an onChar callback', async () => {
    stubMotionPreference(false);
    vi.useFakeTimers();
    const el = { textContent: '' } as Element;

    const typing = typeText(el, 'Hi');

    expect(el.textContent).toBe('H');
    await vi.advanceTimersByTimeAsync(34);
    expect(el.textContent).toBe('H');
    await vi.advanceTimersByTimeAsync(1);
    expect(el.textContent).toBe('Hi');
    await vi.advanceTimersByTimeAsync(35);
    await typing;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('clears existing text without scheduling timers for empty input', async () => {
    stubMotionPreference(false);
    vi.useFakeTimers();
    const el = { textContent: 'old text' } as Element;
    const onChar = vi.fn();

    await typeText(el, '', { onChar });

    expect(el.textContent).toBe('');
    expect(onChar).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
