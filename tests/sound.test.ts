import { describe, expect, it } from 'vitest';
import { BARS, NOTE } from '../src/audio/sound.ts';

describe('the tune', () => {
  it('only uses notes that exist', () => {
    const missing: string[] = [];
    BARS.forEach((bar, i) => {
      for (const name of [...bar.bass, ...bar.chord, ...bar.tune]) {
        if (name !== null && NOTE[name] === undefined) missing.push(`bar ${i + 1}: ${name}`);
      }
    });
    expect(missing).toEqual([]);
  });

  it('has eight melody steps in every bar', () => {
    for (const bar of BARS) expect(bar.tune).toHaveLength(8);
  });
});
