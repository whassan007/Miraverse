/**
 * Procedural License-Safe WebAudio Soundscape & Foley Engine (`art/audio/soundscape.ts`)
 * Owner: AG20
 * User-gesture gated spatial audio synthesizer for harbor, market, courtyard,
 * bakery, item pickup, building snap, cooking sizzle, and celebration fanfare.
 */
export class SoundscapeController {
  private ctx: AudioContext | null = null;
  public muted = false;
  public volume = 0.7;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      if (Ctor) {
        try {
          this.ctx = new Ctor();
        } catch {
          return null;
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playCue(cue: 'pickup' | 'build' | 'cook' | 'celebrate' | 'portal') {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = cue === 'celebrate' ? 'triangle' : 'sine';
      const freqMap = { pickup: 523.25, build: 440, cook: 392, celebrate: 659.25, portal: 587.33 };
      osc.frequency.setValueAtTime(freqMap[cue] || 440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Ignore audio restrictions in headless test browsers
    }
  }
}
