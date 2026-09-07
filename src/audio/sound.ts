import type { EngineEvent } from "@/engine/types";
import { clamp } from "@/engine/layout";

/**
 * Synthesised stone sounds. No samples, no oscillators: a brief noise impulse
 * rings a few damped band-pass filters, which reads as tapped granite rather
 * than a synth tone. The AudioContext is created lazily on first interaction
 * (browsers require a user gesture).
 */
export interface SoundOptions {
  muted: boolean;
  onMutedChange?: (muted: boolean) => void;
}

interface Grind {
  src: AudioBufferSourceNode;
  hi: BiquadFilterNode;
  hiBus: GainNode;
  loBus: GainNode;
  hiLevel: number;
  loLevel: number;
}

export class Sound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private grind: Grind | null = null;
  private muted: boolean;
  private readonly onMutedChange: (m: boolean) => void;

  constructor(opts: SoundOptions) {
    this.muted = opts.muted;
    this.onMutedChange = opts.onMutedChange ?? (() => {});
  }

  get isMuted(): boolean {
    return this.muted;
  }

  /** Create/resume the context. Call from any user gesture; cheap when already live. */
  ensure(): boolean {
    if (!this.ctx) {
      const AC =
        globalThis.AudioContext ??
        (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return false;
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = 0.85;
      const limiter = ctx.createDynamicsCompressor(); // safety ceiling for the louder clacks
      limiter.threshold.value = -2;
      limiter.knee.value = 0;
      limiter.ratio.value = 14;
      limiter.attack.value = 0.002;
      limiter.release.value = 0.12;
      master.connect(limiter);
      limiter.connect(ctx.destination);
      const len = Math.floor(ctx.sampleRate * 1.0); // long enough to loop without an obvious period
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.ctx = ctx;
      this.master = master;
      this.noiseBuf = buf;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return true;
  }

  private live(): { ctx: AudioContext; master: GainNode; noise: AudioBuffer } | null {
    if (this.muted || !this.ensure() || !this.ctx || !this.master || !this.noiseBuf) return null;
    return { ctx: this.ctx, master: this.master, noise: this.noiseBuf };
  }

  /** Modal "struck stone". */
  private stone(freqs: number[], decay: number, vol: number, exciteDecay = 0.006): void {
    const a = this.live();
    if (!a) return;
    const { ctx, master, noise } = a;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const exc = ctx.createGain(); // very short impulse that excites the modes
    exc.gain.setValueAtTime(1, t);
    exc.gain.exponentialRampToValueAtTime(0.001, t + exciteDecay);
    src.connect(exc);
    const bus = ctx.createGain();
    bus.gain.value = vol;
    freqs.forEach((f, i) => {
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = f * (0.96 + Math.random() * 0.08); // slight per-hit variation
      bp.Q.value = 9 + Math.random() * 7;
      const ring = ctx.createGain();
      ring.gain.value = 1 / (i + 1.25);
      exc.connect(bp).connect(ring).connect(bus);
    });
    const env = ctx.createGain(); // overall damping: granite is short
    env.gain.setValueAtTime(1, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + decay);
    bus.connect(env).connect(master);
    src.start(t);
    src.stop(t + decay + 0.03);
  }

  pick(): void {
    this.stone([320, 560], 0.08, 1.1, 0.02);
  }
  place(): void {
    this.stone([760, 1250, 2050], 0.055, 1.7);
  }
  snap(): void {
    this.stone([1050, 1750, 2700], 0.05, 1.9);
  }
  remove(): void {
    this.stone([210, 340, 480], 0.13, 1.45, 0.03);
  }
  /** Dull thud of a slab set down. */
  drop(): void {
    this.stone([230, 380, 560], 0.11, 1.35, 0.04);
  }
  bad(): void {
    this.stone([180, 300], 0.14, 1.05, 0.03);
    setTimeout(() => this.stone([150, 240], 0.13, 0.85, 0.03), 75);
  }
  solve(): void {
    if (this.muted) return;
    [0, 1, 2, 3].forEach((i) =>
      setTimeout(() => this.stone([720 + i * 230, 1300 + i * 280], 0.065, 1.5), i * 115),
    );
  }

  /** Drawer roll for the tile bank. */
  roll(open: boolean): void {
    const a = this.live();
    if (!a) return;
    const { ctx, master, noise } = a;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(open ? 240 : 620, t);
    lp.frequency.linearRampToValueAtTime(open ? 620 : 240, t + 0.26);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.2, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    src.connect(lp).connect(g).connect(master);
    src.start(t);
    src.stop(t + 0.3);
  }

  /**
   * Continuous grind while a tile is dragged: looped noise split into a sandy
   * high band (board) and a gritty mid band (contact with other tiles), level
   * driven by drag speed.
   */
  grindStart(): void {
    const a = this.live();
    if (!a || this.grind) return;
    const { ctx, master, noise } = a;
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    const hi = ctx.createBiquadFilter();
    hi.type = "bandpass";
    hi.frequency.value = 3400;
    hi.Q.value = 0.6;
    const hiBus = ctx.createGain();
    hiBus.gain.value = 0;
    const lo = ctx.createBiquadFilter();
    lo.type = "bandpass";
    lo.frequency.value = 700;
    lo.Q.value = 1.2;
    const loBus = ctx.createGain();
    loBus.gain.value = 0;
    src.connect(hi).connect(hiBus).connect(master);
    src.connect(lo).connect(loBus).connect(master);
    src.start();
    this.grind = { src, hi, hiBus, loBus, hiLevel: 0, loLevel: 0 };
  }

  grindUpdate(speed: number, contact: boolean): void {
    const g = this.grind;
    if (!g || !this.ctx) return;
    const t = this.ctx.currentTime;
    const hiTarget = clamp(speed * 0.0004, 0, 0.0035); // across the board: barely there
    const loTarget = contact ? clamp(speed * 0.009, 0, 0.12) : 0; // against tiles: present, under the clacks
    g.hiLevel += (hiTarget - g.hiLevel) * 0.35;
    g.loLevel += (loTarget - g.loLevel) * 0.35;
    g.hiBus.gain.setTargetAtTime(g.hiLevel, t, 0.02);
    g.loBus.gain.setTargetAtTime(g.loLevel, t, 0.03);
    g.hi.frequency.setTargetAtTime(3200 + speed * 40, t, 0.03);
  }

  grindStop(): void {
    const g = this.grind;
    if (!g || !this.ctx) return;
    this.grind = null;
    g.hiBus.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    g.loBus.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    setTimeout(() => {
      try {
        g.src.stop();
      } catch {
        /* already stopped */
      }
    }, 160);
  }

  setMuted(muted: boolean): void {
    if (muted === this.muted) return;
    this.muted = muted;
    if (muted) this.grindStop();
    else {
      this.ensure();
      this.snap();
    }
    this.onMutedChange(muted);
  }
  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /** Route engine events to sounds. */
  handle(e: EngineEvent): void {
    switch (e.type) {
      case "interaction":
        this.ensure();
        break;
      case "pick":
        this.pick();
        break;
      case "place":
        this.place();
        break;
      case "snap":
        this.snap();
        break;
      case "remove":
        this.remove();
        break;
      case "drop":
        this.drop();
        break;
      case "bad":
        this.bad();
        break;
      case "solve":
        this.solve();
        break;
      case "bank":
        this.roll(e.open);
        break;
      case "grindStart":
        this.grindStart();
        break;
      case "grind":
        this.grindUpdate(e.speed, e.contact);
        break;
      case "grindStop":
        this.grindStop();
        break;
      default:
        break;
    }
  }
}
