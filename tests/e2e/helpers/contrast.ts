/** Runs in the browser. Composite foreground/background alpha and ancestor
 * opacity at the actual element, rather than comparing nominal theme tokens. */
export function textContrast() {
  type Color = [number, number, number, number];
  const parse = (css: string): Color => {
    const values = css.match(/[\d.]+/g)!.map(Number);
    return [values[0], values[1], values[2], values[3] ?? 1];
  };
  const over = (fg: Color, bg: Color): Color => {
    const alpha = fg[3] + bg[3] * (1 - fg[3]);
    return [0, 1, 2].map(i => (fg[i] * fg[3] + bg[i] * bg[3] * (1 - fg[3])) / (alpha || 1))
      .concat(alpha) as Color;
  };
  const luminance = (color: Color) => color.slice(0, 3).map(channel => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, channel, i) => sum + channel * [0.2126, 0.7152, 0.0722][i], 0);

  const samples: { selector: string; text: string; ratio: number }[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const el = node.parentElement!;
    if (!node.textContent?.trim() || el.closest('script, style, noscript, .sr-only, .input-typed')) continue;
    // Include visually rendered aria-hidden text too (titlebar, prompt, ghost).
    const chain: HTMLElement[] = [];
    for (let ancestor: HTMLElement | null = el; ancestor; ancestor = ancestor.parentElement) chain.push(ancestor);
    if (chain.some(ancestor => {
      const style = getComputedStyle(ancestor);
      return style.display === 'none' || style.visibility !== 'visible';
    })) continue;
    // Paint a text pixel and an adjacent background pixel through the same layers.
    let foreground = parse(getComputedStyle(el).color);
    let background: Color = [0, 0, 0, 0];
    for (const ancestor of chain) {
      const style = getComputedStyle(ancestor);
      const layer = parse(style.backgroundColor);
      foreground = over(foreground, layer);
      background = over(background, layer);
      const opacity = Number(style.opacity);
      foreground[3] *= opacity;
      background[3] *= opacity;
    }
    foreground = over(foreground, [255, 255, 255, 1]);
    background = over(background, [255, 255, 255, 1]);
    const light = luminance(foreground);
    const dark = luminance(background);
    samples.push({
      selector: el.id || el.className || el.tagName,
      text: node.textContent.trim().slice(0, 100),
      ratio: (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05),
    });
  }
  return samples;
}
