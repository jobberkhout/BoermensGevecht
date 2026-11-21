import { describe, expect, it } from 'vitest';
import { CHORDS, MELODY, NOTE, SONG } from '../src/audio/sound.ts';

describe('the tune', () => {
  it('only uses chords and notes that exist', () => {
    const missing: string[] = [];
    for (const name of SONG) if (!CHORDS[name]) missing.push(`chord ${name}`);
    for (const [name, chord] of Object.entries(CHORDS)) {
      for (const note of [chord.bass, chord.fifth, ...chord.notes]) {
        if (NOTE[note] === undefined) missing.push(`${name}: ${note}`);
      }
    }
    for (const [bar, notes] of Object.entries(MELODY)) {
      for (const [, note] of notes) if (NOTE[note] === undefined) missing.push(`melody bar ${bar}: ${note}`);
    }
    expect(missing).toEqual([]);
  });

  it('keeps every melody note inside its bar and inside the song', () => {
    for (const [bar, notes] of Object.entries(MELODY)) {
      expect(Number(bar)).toBeLessThan(SONG.length);
      for (const [step, , length] of notes) {
        expect(step).toBeGreaterThanOrEqual(0);
        expect(step + length).toBeLessThanOrEqual(16);
      }
    }
  });

  it('leaves the melody out of most bars, so it does not nag', () => {
    expect(Object.keys(MELODY).length).toBeLessThanOrEqual(SONG.length * 0.7);
  });
});
