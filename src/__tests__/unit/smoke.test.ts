import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('arithmetic works', () => {
    expect(1 + 1).toBe(2);
  });

  it('string contains works', () => {
    expect('primetimetank21.github.io').toContain('github.io');
  });
});
