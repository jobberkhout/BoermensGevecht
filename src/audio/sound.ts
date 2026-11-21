/**
 * All sound in the game, made on the spot with the Web Audio API. There are no
 * audio files: every effect is a few oscillators and some noise, and the tune
 * is a list of notes played by a small sequencer.
 *
 * Browsers only allow sound after a key press or click, so nothing happens
 * until unlock() is called from one.
 */

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

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

const STORAGE_KEY = 'boermensgevecht.muted';

/** Overall volume. The levels are checked by a browser test: audible on average, never clipping. */
const MASTER = 0.9;

// ---- the tune ---------------------------------------------------------------
// Four bars of oom-pah in C: C, F, G, C. Sixteen steps to the bar.

export const NOTE: Record<string, number> = {
  C2: 65.41, F2: 87.31, G2: 98.0, C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77, C6: 1046.5, D6: 1174.66,
};

export interface Bar {
  bass: [root: string, fifth: string];
  chord: [string, string, string];
  /** Melody by step: note name, or null for a rest. Only even steps are used. */
  tune: (string | null)[];
}

export const BARS: Bar[] = [
  { bass: ['C2', 'G2'], chord: ['E4', 'G4', 'C5'], tune: ['E5', 'G5', 'E5', 'C5', 'D5', 'E5', 'G5', null] },
  { bass: ['F2', 'C3'], chord: ['F4', 'A4', 'C5'], tune: ['A5', 'G5', 'F5', 'A5', 'C6', 'A5', 'F5', null] },
  { bass: ['G2', 'D3'], chord: ['D4', 'G4', 'B4'], tune: ['B5', 'A5', 'G5', 'B5', 'D6', 'B5', 'G5', null] },
  { bass: ['C2', 'G2'], chord: ['E4', 'G4', 'C5'], tune: ['E5', 'G5', 'C6', 'G5', 'E5', 'D5', 'C5', null] },
];

const STEPS_PER_BAR = 16;
const BPM = 104;

export class Sound {
  muted: boolean;
  /** 1 is normal speed; overtime plays it faster. */
  tempo = 1;

  private ctx: BaseAudioContext | null = null;
  /** Added to every start time. Only used to lay effects out one after another when measuring levels. */
  private offset = 0;
  private master: GainNode | null = null;
  private sfx: GainNode | null = null;
  private music: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  /** When each effect last played, so twenty hits in one frame do not become a roar. */
  private lastPlayed = new Map<string, number>();
  private timer = 0;
  private step = 0;
  private nextStepAt = 0;
  private readonly enabled: boolean;

  constructor(enabled = true) {
    this.enabled = enabled;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      // Private windows may refuse storage; sound then simply starts on.
    }
    this.muted = stored === '1';
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
      this.master.gain.value = this.muted ? 0 : MASTER;
      this.master.connect(ctx.destination);
      this.sfx = ctx.createGain();
      this.sfx.gain.value = 0.6;
      this.sfx.connect(this.master);
      this.music = ctx.createGain();
      this.music.gain.value = 0.26;
      this.music.connect(this.master);

      const length = ctx.sampleRate;
      this.noise = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      let seed = 22222;
      for (let i = 0; i < length; i++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        data[i] = seed / 2147483648 - 1;
      }
      this.ctx = ctx;
    } catch {
      this.ctx = null; // no sound, but the game goes on
    }
  }

  private resume(): void {
    if (this.ctx instanceof AudioContext) void this.ctx.resume().catch(() => undefined);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
    } catch {
      // see constructor
    }
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : MASTER, this.ctx.currentTime, 0.02);
  }

  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
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
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = o.type;
    osc.frequency.setValueAtTime(o.freq, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + o.dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(o.gain, t + (o.attack ?? 0.005));
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
    this.tone({ type: 'square', freq: 520, to: 780, dur: 0.07, gain: 0.25 });
  }

  /** A button was pressed and refused. */
  refuse(): void {
    if (!this.due('refuse', 0.1)) return;
    this.tone({ type: 'sawtooth', freq: 150, to: 95, dur: 0.16, gain: 0.3 });
  }

  /** A unit walks out: a bicycle bell in town, a clomp of klompen in the country. */
  spawn(side: number): void {
    if (!this.due(`spawn${side}`, 0.1)) return;
    if (side === 0) {
      this.tone({ type: 'sine', freq: 1760, dur: 0.22, gain: 0.2 });
      this.tone({ type: 'sine', freq: 2217, dur: 0.3, gain: 0.16, at: 0.09 });
    } else {
      this.hiss({ from: 420, to: 180, dur: 0.07, gain: 0.5, q: 2 });
      this.hiss({ from: 380, to: 160, dur: 0.07, gain: 0.4, q: 2, at: 0.11 });
    }
  }

  /** A blow that lands. */
  hit(): void {
    if (!this.due('hit', 0.07)) return;
    this.hiss({ from: 1400, to: 300, dur: 0.09, gain: 0.5, q: 0.8 });
    this.tone({ type: 'sine', freq: 170, to: 70, dur: 0.1, gain: 0.4 });
  }

  /** Something is thrown. */
  whoosh(): void {
    if (!this.due('whoosh', 0.09)) return;
    this.hiss({ from: 500, to: 2600, dur: 0.16, gain: 0.22, q: 1.4 });
  }

  /** A turret speaks up: blah-blah from the studio, a gruff "nee" from the barn. */
  turret(side: number): void {
    if (!this.due(`turret${side}`, 0.12)) return;
    if (side === 0) {
      this.tone({ type: 'sawtooth', freq: 300, to: 380, dur: 0.07, gain: 0.16 });
      this.tone({ type: 'sawtooth', freq: 360, to: 270, dur: 0.09, gain: 0.16, at: 0.08 });
    } else {
      this.tone({ type: 'sawtooth', freq: 190, to: 110, dur: 0.2, gain: 0.26, attack: 0.02 });
    }
  }

  /** A unit is beaten and slinks off. */
  defeat(): void {
    if (!this.due('defeat', 0.12)) return;
    this.tone({ type: 'triangle', freq: 520, to: 170, dur: 0.3, gain: 0.28 });
  }

  /** Subsidie comes in. */
  coin(): void {
    if (!this.due('coin', 0.12)) return;
    this.tone({ type: 'square', freq: 990, dur: 0.05, gain: 0.12 });
    this.tone({ type: 'square', freq: 1320, dur: 0.1, gain: 0.12, at: 0.05 });
  }

  /** A base takes a blow. */
  baseHit(): void {
    if (!this.due('base', 0.14)) return;
    this.tone({ type: 'sine', freq: 110, to: 40, dur: 0.28, gain: 0.6 });
    this.hiss({ from: 300, to: 80, dur: 0.22, gain: 0.35, filter: 'lowpass' });
  }

  /** A turret is built. */
  built(): void {
    this.tone({ type: 'square', freq: 392, dur: 0.08, gain: 0.2 });
    this.tone({ type: 'square', freq: 523, dur: 0.08, gain: 0.2, at: 0.08 });
    this.tone({ type: 'square', freq: 659, dur: 0.14, gain: 0.2, at: 0.16 });
  }

  /** The Trekkerkolonne: two blasts on the horn over a rumbling engine. */
  horn(): void {
    for (const at of [0, 0.34]) {
      this.tone({ type: 'square', freq: 233, dur: 0.28, gain: 0.22, at, attack: 0.02 });
      this.tone({ type: 'square', freq: 294, dur: 0.28, gain: 0.2, at, attack: 0.02 });
    }
    this.hiss({ from: 90, to: 140, dur: 1.5, gain: 0.5, filter: 'lowpass' });
    this.tone({ type: 'sawtooth', freq: 55, to: 70, dur: 1.5, gain: 0.3, attack: 0.1 });
  }

  /** The Wegblokkade: a whistle, then three voices chanting. */
  chant(): void {
    this.tone({ type: 'sine', freq: 2100, to: 2500, dur: 0.18, gain: 0.2 });
    this.tone({ type: 'sine', freq: 2500, to: 2000, dur: 0.22, gain: 0.2, at: 0.2 });
    for (const [i, at] of [0.5, 0.78, 1.06, 1.34].entries()) {
      const freq = i % 2 === 0 ? 220 : 196;
      this.tone({ type: 'sawtooth', freq, dur: 0.2, gain: 0.16, at, attack: 0.02 });
      this.tone({ type: 'sawtooth', freq: freq * 1.26, dur: 0.2, gain: 0.12, at, attack: 0.02 });
      this.tone({ type: 'sawtooth', freq: freq * 1.5, dur: 0.2, gain: 0.1, at, attack: 0.02 });
    }
  }

  /** Overtime starts. */
  alarm(): void {
    for (const at of [0, 0.22, 0.44]) this.tone({ type: 'square', freq: 880, to: 660, dur: 0.18, gain: 0.25, at });
  }

  /** Somebody won. */
  fanfare(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      this.tone({ type: 'square', freq, dur: i === 3 ? 0.6 : 0.16, gain: 0.26, at: i * 0.14 });
      this.tone({ type: 'triangle', freq: freq / 2, dur: i === 3 ? 0.6 : 0.16, gain: 0.3, at: i * 0.14 });
    });
  }

  // ---- music ----------------------------------------------------------------

  startMusic(): void {
    if (!this.ctx || this.timer) return;
    this.step = 0;
    this.nextStepAt = this.ctx.currentTime + 0.08;
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

  /**
   * Queues the whole tune once, with every effect laid over it one after
   * another. For measuring levels in an offline context; returns how many
   * seconds were queued.
   */
  demo(): number {
    const stepLength = 60 / BPM / 4;
    const steps = BARS.length * STEPS_PER_BAR;
    for (let step = 0; step < steps; step++) this.playStep(step, step * stepLength, stepLength);
    const effects: (() => void)[] = [
      () => this.click(), () => this.refuse(), () => this.spawn(0), () => this.spawn(1), () => this.hit(),
      () => this.whoosh(), () => this.turret(0), () => this.turret(1), () => this.defeat(), () => this.coin(),
      () => this.baseHit(), () => this.built(), () => this.horn(), () => this.chant(), () => this.alarm(),
      () => this.fanfare(),
    ];
    effects.forEach((play, i) => {
      this.offset = 0.3 + i * 0.5;
      play();
    });
    // The worst case in a match: several things landing on the same instant.
    this.offset = 0.3 + effects.length * 0.5;
    this.hit();
    this.baseHit();
    this.defeat();
    this.coin();
    this.turret(0);
    this.turret(1);
    this.offset = 0;
    return Math.max(steps * stepLength, 0.3 + effects.length * 0.5 + 2);
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
      this.step = (this.step + 1) % (BARS.length * STEPS_PER_BAR);
      this.nextStepAt += stepLength;
    }
  }

  private playStep(step: number, at: number, len: number): void {
    const bar = BARS[Math.floor(step / STEPS_PER_BAR)]!;
    const s = step % STEPS_PER_BAR;

    // Oom (bass and kick) on the beat, pah (chord and snare) off it.
    if (s % 8 === 0) {
      this.tone({ type: 'triangle', freq: NOTE[bar.bass[0]]!, dur: len * 3.2, gain: 0.9, at, music: true });
      this.tone({ type: 'sine', freq: 130, to: 45, dur: 0.12, gain: 0.9, at, music: true });
    }
    if (s % 8 === 4) {
      this.tone({ type: 'triangle', freq: NOTE[bar.bass[1]]!, dur: len * 3.2, gain: 0.8, at, music: true });
      this.hiss({ from: 1800, to: 900, dur: 0.09, gain: 0.5, q: 0.7, at, music: true });
    }
    if (s % 4 === 2) {
      for (const name of bar.chord) {
        this.tone({ type: 'square', freq: NOTE[name]!, dur: len * 1.4, gain: 0.16, at, music: true });
      }
    }
    if (s % 2 === 0) {
      this.hiss({ from: 7000, dur: 0.03, gain: 0.16, q: 0.5, filter: 'highpass', at, music: true });
      const name = bar.tune[s / 2];
      if (name) this.tone({ type: 'square', freq: NOTE[name]!, dur: len * 1.8, gain: 0.34, at, attack: 0.01, music: true });
    }
  }
}
