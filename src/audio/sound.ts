import type { Voice } from '../defs/types.ts';

/**
 * All sound in the game, made on the spot with the Web Audio API. There are no
 * audio files: every effect is a few oscillators and some noise, and the tune
 * is a list of chords and notes played by a small sequencer.
 *
 * Browsers only allow sound after a key press or click, so nothing happens
 * until unlock() is called from one.
 */

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

/** Everything, effects without the tune, or silence. The M key steps through them. */
export type SoundMode = 'all' | 'effects' | 'off';
export const SOUND_MODES: readonly SoundMode[] = ['all', 'effects', 'off'];

interface ToneOptions {
  type: OscillatorType;
  freq: number;
  /** Slide to this pitch by the end. */
  to?: number;
  dur: number;
  gain: number;
  /** Seconds from now. */
  at?: number;
  attack?: number;
  /**
   * With `sustain` the note holds at that share of its gain until it is
   * released, like a key held down. Without it the note simply dies away.
   */
  sustain?: number;
  /** Seconds to fall from the attack to the sustain level. */
  decay?: number;
  music?: boolean;
}

interface HissOptions {
  dur: number;
  gain: number;
  /** Filter frequency at the start and the end. */
  from: number;
  to?: number;
  q?: number;
  filter?: BiquadFilterType;
  at?: number;
  music?: boolean;
}

const STORAGE_KEY = 'boermensgevecht.sound';

/** Overall volume, and the tune's share of it. A browser test checks the result: audible, soft, never clipping. */
const MASTER = 0.9;
const EFFECTS = 0.6;
const MUSIC = 0.2;

// ---- the tune ---------------------------------------------------------------
// A slow, mellow loop of 32 bars: soft chords, a quiet bass, brushed drums and
// a melody that comes and goes. Sixteen steps to the bar.

export const NOTE: Record<string, number> = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77, C6: 1046.5,
};

export interface Chord {
  bass: string;
  fifth: string;
  /** Four notes, played softly together. */
  notes: [string, string, string, string];
}

export const CHORDS: Record<string, Chord> = {
  C: { bass: 'C2', fifth: 'G2', notes: ['E3', 'G3', 'B3', 'D4'] },
  Am: { bass: 'A2', fifth: 'E2', notes: ['G3', 'A3', 'C4', 'E4'] },
  Dm: { bass: 'D2', fifth: 'A2', notes: ['F3', 'A3', 'C4', 'E4'] },
  G: { bass: 'G2', fifth: 'D2', notes: ['F3', 'A3', 'B3', 'D4'] },
  F: { bass: 'F2', fifth: 'C3', notes: ['E3', 'G3', 'A3', 'C4'] },
  Em: { bass: 'E2', fifth: 'G2', notes: ['D3', 'G3', 'B3', 'E4'] },
};

const VERSE = ['C', 'Am', 'Dm', 'G', 'C', 'Am', 'Dm', 'G'];
const BRIDGE = ['F', 'Em', 'Dm', 'G', 'F', 'Em', 'Dm', 'G'];
/** Verse, verse, bridge, verse. */
export const SONG: readonly string[] = [...VERSE, ...VERSE, ...BRIDGE, ...VERSE];

/** The melody, by bar: [step, note, length in steps]. Most bars have none, so it never nags. */
export const MELODY: Record<number, readonly [number, string, number][]> = {
  8: [[0, 'E5', 3], [4, 'G5', 2], [6, 'A5', 6]],
  9: [[0, 'G5', 3], [4, 'E5', 8]],
  10: [[0, 'D5', 3], [4, 'F5', 2], [6, 'A5', 6]],
  11: [[0, 'G5', 10]],
  12: [[0, 'E5', 2], [2, 'G5', 2], [4, 'C6', 8]],
  13: [[0, 'A5', 3], [4, 'G5', 8]],
  14: [[0, 'F5', 3], [4, 'E5', 2], [6, 'D5', 6]],
  15: [[0, 'D5', 6], [8, 'B4', 6]],
  16: [[0, 'A5', 4], [4, 'C6', 8]],
  17: [[0, 'B5', 4], [4, 'G5', 8]],
  18: [[0, 'A5', 3], [4, 'F5', 8]],
  19: [[0, 'G5', 3], [4, 'D5', 8]],
  20: [[0, 'A5', 2], [2, 'C6', 2], [4, 'A5', 8]],
  21: [[0, 'G5', 4], [6, 'E5', 6]],
  22: [[0, 'F5', 4], [8, 'D5', 6]],
  23: [[0, 'B4', 4], [4, 'D5', 8]],
  28: [[0, 'E5', 3], [4, 'G5', 2], [6, 'A5', 6]],
  29: [[0, 'G5', 3], [4, 'E5', 8]],
  30: [[0, 'D5', 4], [8, 'E5', 4]],
  31: [[0, 'C5', 12]],
};

const STEPS_PER_BAR = 16;
const BPM = 92;
/** Off-beat notes arrive a little late, which makes the rhythm stroll instead of march. */
const SWING = 0.3;

function readMode(): SoundMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'all' || stored === 'effects' || stored === 'off') return stored;
  } catch {
    // Private windows may refuse storage; sound then simply starts on.
  }
  return 'all';
}

export class Sound {
  mode: SoundMode;
  /** 1 is normal speed; overtime plays it a little faster. */
  tempo = 1;

  private ctx: BaseAudioContext | null = null;
  private master: GainNode | null = null;
  private sfx: GainNode | null = null;
  private music: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  /** When each effect last played, so twenty hits in one frame do not become a roar. */
  private lastPlayed = new Map<string, number>();
  /** Added to every start time. Only used to lay effects out one after another when measuring levels. */
  private offset = 0;
  private timer = 0;
  private step = 0;
  private nextStepAt = 0;
  private readonly enabled: boolean;

  constructor(enabled = true) {
    this.enabled = enabled;
    this.mode = readMode();
  }

  /** 'off' when sound is unavailable or not yet unlocked, otherwise the audio context's state. */
  get state(): string {
    return this.ctx ? this.ctx.state : 'off';
  }

  /**
   * Call from a key press or a click. Safe to call again. Pass an offline
   * context to render into a buffer instead of the loudspeakers.
   */
  unlock(offline?: OfflineAudioContext): void {
    if (!this.enabled) return;
    if (this.ctx) {
      this.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
    if (!offline && !Ctor) return;
    try {
      const ctx: BaseAudioContext = offline ?? new Ctor!();
      this.master = ctx.createGain();
      this.master.connect(ctx.destination);
      this.sfx = ctx.createGain();
      this.sfx.gain.value = EFFECTS;
      this.sfx.connect(this.master);

      // The tune goes through a low-pass filter that takes the edge off, and a
      // faint echo that gives it some room.
      this.music = ctx.createGain();
      const soften = ctx.createBiquadFilter();
      soften.type = 'lowpass';
      soften.frequency.value = 1900;
      soften.Q.value = 0.4;
      const echo = ctx.createDelay(1);
      echo.delayTime.value = (60 / BPM) * 0.75;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.28;
      const wet = ctx.createGain();
      wet.gain.value = 0.22;
      this.music.connect(soften);
      this.music.connect(echo);
      echo.connect(feedback);
      feedback.connect(echo);
      echo.connect(wet);
      wet.connect(soften);
      soften.connect(this.master);

      const length = ctx.sampleRate;
      this.noise = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      let seed = 22222;
      for (let i = 0; i < length; i++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        data[i] = seed / 2147483648 - 1;
      }
      this.ctx = ctx;
      this.applyMode(0);
    } catch {
      this.ctx = null; // no sound, but the game goes on
    }
  }

  private resume(): void {
    if (this.ctx instanceof AudioContext) void this.ctx.resume().catch(() => undefined);
  }

  setMode(mode: SoundMode): void {
    this.mode = mode;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // see readMode
    }
    this.applyMode(0.03);
  }

  /** Steps to the next mode: everything, effects only, off. Returns the new mode. */
  nextMode(): SoundMode {
    this.setMode(SOUND_MODES[(SOUND_MODES.indexOf(this.mode) + 1) % SOUND_MODES.length]!);
    return this.mode;
  }

  private applyMode(glide: number): void {
    if (!this.ctx || !this.master || !this.music) return;
    const now = this.ctx.currentTime;
    const master = this.mode === 'off' ? 0 : MASTER;
    const music = this.mode === 'all' ? MUSIC : 0;
    if (glide > 0) {
      this.master.gain.setTargetAtTime(master, now, glide);
      this.music.gain.setTargetAtTime(music, now, glide);
    } else {
      this.master.gain.value = master;
      this.music.gain.value = music;
    }
  }

  // ---- building blocks ------------------------------------------------------

  /** True if this effect may sound now; false if it only just did. */
  private due(name: string, gap = 0.06): boolean {
    if (!this.ctx) return false;
    const now = this.ctx.currentTime + this.offset;
    if (now - (this.lastPlayed.get(name) ?? -1) < gap) return false;
    this.lastPlayed.set(name, now);
    return true;
  }

  private tone(o: ToneOptions): void {
    const ctx = this.ctx;
    const bus = o.music ? this.music : this.sfx;
    if (!ctx || !bus) return;
    const t = ctx.currentTime + this.offset + (o.at ?? 0);
    const attack = o.attack ?? 0.005;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = o.type;
    osc.frequency.setValueAtTime(o.freq, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + o.dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(o.gain, t + attack);
    if (o.sustain !== undefined) {
      const level = Math.max(0.0001, o.gain * o.sustain);
      const release = Math.min(0.25, o.dur * 0.3);
      gain.gain.exponentialRampToValueAtTime(level, t + attack + (o.decay ?? 0.2));
      gain.gain.setValueAtTime(level, Math.max(t + attack + (o.decay ?? 0.2), t + o.dur - release));
    }
    gain.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    osc.connect(gain);
    gain.connect(bus);
    osc.start(t);
    osc.stop(t + o.dur + 0.02);
  }

  private hiss(o: HissOptions): void {
    const ctx = this.ctx;
    const bus = o.music ? this.music : this.sfx;
    if (!ctx || !bus || !this.noise) return;
    const t = ctx.currentTime + this.offset + (o.at ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = o.filter ?? 'bandpass';
    filter.Q.value = o.q ?? 1;
    filter.frequency.setValueAtTime(o.from, t);
    if (o.to) filter.frequency.exponentialRampToValueAtTime(Math.max(30, o.to), t + o.dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(o.gain, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(bus);
    src.start(t, (t * 7) % 0.9);
    src.stop(t + o.dur + 0.02);
  }

  // ---- effects --------------------------------------------------------------

  /** A button was pressed and accepted. */
  click(): void {
    if (!this.due('click', 0.03)) return;
    this.tone({ type: 'triangle', freq: 520, to: 780, dur: 0.07, gain: 0.3 });
  }

  /** A button was pressed and refused. */
  refuse(): void {
    if (!this.due('refuse', 0.1)) return;
    this.tone({ type: 'triangle', freq: 170, to: 110, dur: 0.16, gain: 0.4 });
  }

  /** A unit walks out: a bicycle bell in town, a clomp of klompen in the country, a desk phone at the office, a suitcase on the cobbles for the tourists. */
  spawn(voice: Voice): void {
    if (!this.due(`spawn.${voice}`, 0.1)) return;
    if (voice === 'town') {
      this.tone({ type: 'sine', freq: 1568, dur: 0.22, gain: 0.16 });
      this.tone({ type: 'sine', freq: 1976, dur: 0.3, gain: 0.12, at: 0.09 });
    } else if (voice === 'country') {
      this.hiss({ from: 420, to: 180, dur: 0.07, gain: 0.5, q: 2 });
      this.hiss({ from: 380, to: 160, dur: 0.07, gain: 0.4, q: 2, at: 0.11 });
    } else if (voice === 'tourist') {
      // Little wheels rattling over the stones, one after another.
      for (let i = 0; i < 5; i++) this.hiss({ from: 1100 - i * 60, to: 600, dur: 0.03, gain: 0.3, q: 3, at: i * 0.05 });
    } else {
      // Two short rings, each a quick trill between two tones.
      for (const at of [0, 0.16]) {
        for (let i = 0; i < 4; i++) this.tone({ type: 'triangle', freq: i % 2 === 0 ? 1320 : 1108, dur: 0.03, gain: 0.13, at: at + i * 0.03 });
      }
    }
  }

  /** A blow that lands. */
  hit(): void {
    if (!this.due('hit', 0.09)) return;
    this.hiss({ from: 1100, to: 300, dur: 0.08, gain: 0.4, q: 0.8 });
    this.tone({ type: 'sine', freq: 170, to: 70, dur: 0.1, gain: 0.4 });
  }

  /** A turret's shot bounces off a schild or a super unit: a short metallic tick. */
  clang(): void {
    if (!this.due('clang', 0.12)) return;
    this.tone({ type: 'triangle', freq: 2200, to: 1500, dur: 0.07, gain: 0.12 });
    this.tone({ type: 'sine', freq: 3300, dur: 0.05, gain: 0.06 });
  }

  /** Something is thrown. */
  whoosh(): void {
    if (!this.due('whoosh', 0.12)) return;
    this.hiss({ from: 500, to: 2000, dur: 0.16, gain: 0.18, q: 1.4 });
  }

  /** A turret speaks up: blah-blah from the studio, a gruff "nee" from the barn, glasses clinking at the office, an "ooh!" from the tourists. */
  turret(voice: Voice): void {
    if (!this.due(`turret.${voice}`, 0.2)) return;
    if (voice === 'town') {
      this.tone({ type: 'triangle', freq: 300, to: 380, dur: 0.07, gain: 0.22 });
      this.tone({ type: 'triangle', freq: 360, to: 270, dur: 0.09, gain: 0.22, at: 0.08 });
    } else if (voice === 'country') {
      this.tone({ type: 'sawtooth', freq: 180, to: 105, dur: 0.2, gain: 0.2, attack: 0.02 });
    } else if (voice === 'tourist') {
      this.tone({ type: 'triangle', freq: 330, to: 470, dur: 0.1, gain: 0.2, attack: 0.02 });
      this.tone({ type: 'triangle', freq: 470, to: 300, dur: 0.16, gain: 0.18, at: 0.1 });
    } else {
      this.tone({ type: 'sine', freq: 2093, dur: 0.18, gain: 0.12 });
      this.tone({ type: 'sine', freq: 2637, dur: 0.22, gain: 0.1, at: 0.05 });
    }
  }

  /** A unit is beaten and slinks off. */
  defeat(): void {
    if (!this.due('defeat', 0.15)) return;
    this.tone({ type: 'triangle', freq: 480, to: 170, dur: 0.3, gain: 0.26 });
  }

  /** Subsidie comes in. */
  coin(): void {
    if (!this.due('coin', 0.2)) return;
    this.tone({ type: 'sine', freq: 990, dur: 0.05, gain: 0.1 });
    this.tone({ type: 'sine', freq: 1320, dur: 0.1, gain: 0.1, at: 0.05 });
  }

  /** A base takes a blow. */
  baseHit(): void {
    if (!this.due('base', 0.16)) return;
    this.tone({ type: 'sine', freq: 110, to: 40, dur: 0.28, gain: 0.6 });
    this.hiss({ from: 300, to: 80, dur: 0.22, gain: 0.35, filter: 'lowpass' });
  }

  /** Something was built or bought for the base: a turret, an upgrade, a subsidy, a new era. */
  built(): void {
    this.tone({ type: 'triangle', freq: 392, dur: 0.09, gain: 0.26 });
    this.tone({ type: 'triangle', freq: 523, dur: 0.09, gain: 0.26, at: 0.08 });
    this.tone({ type: 'triangle', freq: 659, dur: 0.16, gain: 0.26, at: 0.16 });
  }

  /** A side modernizes: a rising run of notes. */
  eraUp(): void {
    [392, 494, 587, 784, 988].forEach((freq, i) => {
      this.tone({ type: 'triangle', freq, dur: i === 4 ? 0.5 : 0.14, gain: 0.3, at: i * 0.09 });
    });
    this.hiss({ from: 400, to: 3000, dur: 0.5, gain: 0.12, q: 1.2 });
  }

  /** A tractor horn over a rumbling engine. */
  horn(): void {
    for (const at of [0, 0.34]) {
      this.tone({ type: 'square', freq: 233, dur: 0.28, gain: 0.16, at, attack: 0.02 });
      this.tone({ type: 'square', freq: 294, dur: 0.28, gain: 0.14, at, attack: 0.02 });
    }
    this.hiss({ from: 90, to: 140, dur: 1.5, gain: 0.5, filter: 'lowpass' });
    this.tone({ type: 'sawtooth', freq: 55, to: 70, dur: 1.5, gain: 0.3, attack: 0.1 });
  }

  /** A cruise ship's horn: two long, low blasts. When it moors, and when its day trippers have to be back on board. */
  shipHorn(): void {
    for (const at of [0, 0.7]) {
      this.tone({ type: 'sawtooth', freq: 98, dur: 0.55, gain: 0.16, at, attack: 0.05 });
      this.tone({ type: 'square', freq: 147, dur: 0.55, gain: 0.07, at, attack: 0.05 });
    }
  }

  /** The rent goes up: a sign thuds down, then the price climbs. */
  hike(): void {
    this.hiss({ from: 260, to: 90, dur: 0.12, gain: 0.5, filter: 'lowpass' });
    [523, 659, 784, 1047].forEach((freq, i) => this.tone({ type: 'triangle', freq, dur: 0.1, gain: 0.18, at: 0.12 + i * 0.07 }));
    this.tone({ type: 'sine', freq: 1760, dur: 0.35, gain: 0.12, at: 0.42 });
  }

  /** An influencer films: the click of a phone camera. */
  shutter(): void {
    if (!this.due('shutter', 0.25)) return;
    this.hiss({ from: 3200, to: 1800, dur: 0.02, gain: 0.25, q: 2 });
    this.hiss({ from: 2600, to: 1400, dur: 0.025, gain: 0.2, q: 2, at: 0.06 });
  }

  /** A whistle, then voices chanting. */
  chant(): void {
    this.tone({ type: 'sine', freq: 2100, to: 2400, dur: 0.18, gain: 0.14 });
    this.tone({ type: 'sine', freq: 2400, to: 2000, dur: 0.22, gain: 0.14, at: 0.2 });
    for (const [i, at] of [0.5, 0.78, 1.06, 1.34].entries()) {
      const freq = i % 2 === 0 ? 220 : 196;
      this.tone({ type: 'triangle', freq, dur: 0.2, gain: 0.22, at, attack: 0.02 });
      this.tone({ type: 'triangle', freq: freq * 1.26, dur: 0.2, gain: 0.16, at, attack: 0.02 });
      this.tone({ type: 'triangle', freq: freq * 1.5, dur: 0.2, gain: 0.14, at, attack: 0.02 });
    }
  }

  /** A crunch of guitar chords. */
  riff(): void {
    for (const [i, root] of [110, 110, 146.83, 164.81].entries()) {
      const at = i * 0.16;
      this.tone({ type: 'sawtooth', freq: root, dur: 0.15, gain: 0.2, at });
      this.tone({ type: 'sawtooth', freq: root * 1.5, dur: 0.15, gain: 0.16, at });
      this.tone({ type: 'sawtooth', freq: root * 2, dur: 0.15, gain: 0.1, at });
    }
  }

  /** A soft rising shimmer: things mend. */
  mend(): void {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      this.tone({ type: 'sine', freq, dur: 0.5, gain: 0.16, at: i * 0.07, attack: 0.03 });
    });
  }

  /** A swarm of small rotors diving. */
  swarm(): void {
    this.tone({ type: 'sawtooth', freq: 420, to: 210, dur: 1.2, gain: 0.12, attack: 0.1 });
    this.tone({ type: 'sawtooth', freq: 433, to: 205, dur: 1.2, gain: 0.12, attack: 0.1 });
    this.hiss({ from: 2400, to: 900, dur: 1.2, gain: 0.12, q: 3 });
  }

  /** A super unit walks out: two footfalls that shake the ground, under a low swell. */
  giant(): void {
    for (const at of [0, 0.42]) {
      this.tone({ type: 'sine', freq: 90, to: 38, dur: 0.34, gain: 0.5, at });
      this.hiss({ from: 180, to: 60, dur: 0.3, gain: 0.3, filter: 'lowpass', at });
    }
    this.tone({ type: 'sawtooth', freq: 65.4, to: 98, dur: 1.0, gain: 0.16, attack: 0.2, at: 0.1 });
    this.tone({ type: 'triangle', freq: 130.8, to: 196, dur: 1.0, gain: 0.14, attack: 0.2, at: 0.1 });
  }

  /** A harsh buzzer: somebody is cancelled. */
  zap(): void {
    this.tone({ type: 'square', freq: 196, dur: 0.12, gain: 0.2 });
    this.tone({ type: 'square', freq: 139, dur: 0.34, gain: 0.22, at: 0.13 });
    this.hiss({ from: 3000, to: 400, dur: 0.3, gain: 0.2, q: 2, at: 0.13 });
  }

  /** A deal is closed: a stamp comes down, then the till rings. */
  deal(): void {
    this.hiss({ from: 300, to: 120, dur: 0.09, gain: 0.5, q: 1.5 });
    this.tone({ type: 'sine', freq: 1318, dur: 0.12, gain: 0.16, at: 0.14 });
    this.tone({ type: 'sine', freq: 1760, dur: 0.4, gain: 0.16, at: 0.22 });
    this.tone({ type: 'triangle', freq: 2637, dur: 0.3, gain: 0.07, at: 0.22 });
  }

  /** A wand twinkles and somebody else's money pours in: a quick run of coins. */
  drain(): void {
    this.tone({ type: 'sine', freq: 2093, to: 3136, dur: 0.1, gain: 0.07 });
    for (let i = 0; i < 6; i++) {
      this.tone({ type: 'sine', freq: 1175 + (i % 3) * 196 + i * 30, dur: 0.08, gain: 0.09, at: 0.1 + i * 0.07 });
    }
  }

  /** Overtime starts. */
  alarm(): void {
    for (const at of [0, 0.22, 0.44]) this.tone({ type: 'triangle', freq: 880, to: 660, dur: 0.18, gain: 0.3, at });
  }

  /** Overtime turns the screw: a quick step up. */
  surge(): void {
    this.tone({ type: 'triangle', freq: 660, dur: 0.08, gain: 0.22 });
    this.tone({ type: 'triangle', freq: 880, dur: 0.14, gain: 0.22, at: 0.08 });
  }

  /** Somebody won. */
  fanfare(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      this.tone({ type: 'triangle', freq, dur: i === 3 ? 0.7 : 0.16, gain: 0.34, at: i * 0.14 });
      this.tone({ type: 'sine', freq: freq / 2, dur: i === 3 ? 0.7 : 0.16, gain: 0.3, at: i * 0.14 });
    });
  }

  // ---- music ----------------------------------------------------------------

  startMusic(): void {
    if (!this.ctx || this.timer) return;
    this.step = 0;
    this.nextStepAt = this.ctx.currentTime + 0.1;
    this.timer = window.setInterval(() => this.schedule(), 60);
    this.schedule();
  }

  stopMusic(): void {
    window.clearInterval(this.timer);
    this.timer = 0;
  }

  /** Pausing the match freezes the audio clock too, so the tune picks up where it stopped. */
  pause(paused: boolean): void {
    if (!(this.ctx instanceof AudioContext)) return;
    if (paused) void this.ctx.suspend().catch(() => undefined);
    else this.resume();
  }

  /** Queues every step that starts within the next quarter second. */
  private schedule(): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const stepLength = 60 / BPM / 4 / this.tempo;
    // If the tab was asleep, do not try to catch up on everything that was missed.
    if (this.nextStepAt < ctx.currentTime) this.nextStepAt = ctx.currentTime + 0.05;
    while (this.nextStepAt < ctx.currentTime + 0.25) {
      this.playStep(this.step, this.nextStepAt - ctx.currentTime, stepLength);
      this.step = (this.step + 1) % (SONG.length * STEPS_PER_BAR);
      this.nextStepAt += stepLength;
    }
  }

  /** One sixteenth of the tune. `at` is seconds from now, `len` the length of a step. */
  private playStep(step: number, at: number, len: number): void {
    const barIndex = Math.floor(step / STEPS_PER_BAR);
    const chord = CHORDS[SONG[barIndex]!]!;
    const s = step % STEPS_PER_BAR;
    const bridge = barIndex >= 16 && barIndex < 24;
    // The drums sit out the first two bars and the last bar of every eight, to let it breathe.
    const drums = barIndex >= 2 && barIndex % 8 !== 7;
    const late = at + len * 2 * SWING;

    // Chords: soft and long, like an electric piano with the lid down.
    if (s === 0 || (bridge && s === 8)) {
      const dur = len * (bridge ? 7.5 : 15);
      for (const name of chord.notes) {
        const freq = NOTE[name]!;
        this.tone({ type: 'sine', freq, dur, gain: 0.2, at, attack: 0.03, sustain: 0.45, decay: 0.5, music: true });
        this.tone({ type: 'triangle', freq: freq * 2.003, dur: dur * 0.6, gain: 0.035, at, attack: 0.03, music: true });
      }
    }

    // Bass: root, then fifth, with a sine an octave up so small speakers can hear it.
    const bass = s === 0 ? chord.bass : s === 8 ? chord.fifth : s === 14 && barIndex % 2 === 1 ? chord.bass : null;
    if (bass) {
      const freq = NOTE[bass]!;
      const dur = len * (s === 14 ? 1.6 : 5);
      this.tone({ type: 'triangle', freq, dur, gain: 0.5, at: s === 14 ? late : at, attack: 0.02, sustain: 0.6, decay: 0.15, music: true });
      this.tone({ type: 'sine', freq: freq * 2, dur, gain: 0.18, at: s === 14 ? late : at, attack: 0.02, sustain: 0.5, decay: 0.15, music: true });
    }

    if (drums) {
      if (s === 0 || s === 10) this.tone({ type: 'sine', freq: 105, to: 48, dur: 0.16, gain: s === 0 ? 0.7 : 0.45, at: s === 10 ? late : at, music: true });
      if (s === 4 || s === 12) this.hiss({ from: 1500, to: 900, dur: 0.11, gain: 0.3, q: 0.6, at, music: true });
      if (s % 4 === 2) this.hiss({ from: 5200, dur: 0.035, gain: 0.1, q: 0.6, filter: 'highpass', at: late, music: true });
    }

    for (const [start, name, length] of MELODY[barIndex] ?? []) {
      if (start !== s) continue;
      const freq = NOTE[name]!;
      const when = s % 4 === 2 ? late : at;
      this.tone({ type: 'triangle', freq, dur: len * length, gain: 0.26, at: when, attack: 0.025, sustain: 0.55, decay: 0.18, music: true });
      this.tone({ type: 'sine', freq: freq / 2, dur: len * length, gain: 0.1, at: when, attack: 0.03, sustain: 0.6, decay: 0.2, music: true });
    }
  }

  // ---- measuring ------------------------------------------------------------

  /** Queues the first `bars` bars of the tune and nothing else. Returns the seconds queued. */
  demoMusic(bars: number): number {
    const stepLength = 60 / BPM / 4;
    const steps = bars * STEPS_PER_BAR;
    for (let step = 0; step < steps; step++) {
      this.playStep(step % (SONG.length * STEPS_PER_BAR), step * stepLength, stepLength);
    }
    return steps * stepLength;
  }

  /**
   * Queues a stretch of the tune with every effect laid over it one after
   * another, and at the end several at once. Returns the seconds queued.
   */
  demo(): number {
    const effects: (() => void)[] = [
      () => this.click(), () => this.refuse(), () => this.spawn('town'), () => this.spawn('country'), () => this.spawn('office'), () => this.spawn('tourist'),
      () => this.hit(), () => this.clang(), () => this.whoosh(), () => this.turret('town'), () => this.turret('country'), () => this.turret('office'), () => this.turret('tourist'),
      () => this.shipHorn(), () => this.hike(), () => this.shutter(),
      () => this.defeat(), () => this.coin(), () => this.baseHit(), () => this.built(), () => this.eraUp(), () => this.horn(),
      () => this.chant(), () => this.riff(), () => this.mend(), () => this.swarm(), () => this.zap(), () => this.deal(), () => this.drain(),
      () => this.giant(), () => this.alarm(), () => this.surge(), () => this.fanfare(),
    ];
    const gap = 0.6;
    // Start in the busiest part of the tune: melody, drums and all.
    const stepLength = 60 / BPM / 4;
    const steps = Math.ceil((0.3 + effects.length * gap + 2.5) / stepLength);
    for (let i = 0; i < steps; i++) this.playStep(8 * STEPS_PER_BAR + i, i * stepLength, stepLength);
    effects.forEach((play, i) => {
      this.offset = 0.3 + i * gap;
      play();
    });
    // The worst case in a match: several things landing on the same instant.
    this.offset = 0.3 + effects.length * gap;
    this.hit();
    this.baseHit();
    this.defeat();
    this.coin();
    this.turret('town');
    this.turret('country');
    this.offset = 0;
    return steps * stepLength;
  }
}
