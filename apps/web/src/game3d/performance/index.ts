/**
 * Web 3D Performance Profiler, Quality Tiers & Frame-Time Sampler
 * (`apps/web/src/game3d/performance/index.ts`)
 * Owner: CX07
 */
export type GraphicsQualityTier = 'low' | 'medium' | 'high';

export interface PerformanceSample {
  fps: number;
  p95FrameTimeMs: number;
  avgFrameTimeMs: number;
  qualityTier: GraphicsQualityTier;
  sampleCount: number;
}

export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private maxSamples = 120;
  public currentTier: GraphicsQualityTier = 'high';

  recordFrame(dtMs: number, requestedTier: 'auto' | GraphicsQualityTier = 'auto') {
    if (dtMs > 0 && dtMs < 500) {
      this.frameTimes.push(dtMs);
      if (this.frameTimes.length > this.maxSamples) {
        this.frameTimes.shift();
      }
    }
    if (requestedTier !== 'auto') {
      this.currentTier = requestedTier;
    } else if (this.frameTimes.length >= 30) {
      const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
      if (avg > 38) this.currentTier = 'low';
      else if (avg > 24) this.currentTier = 'medium';
      else this.currentTier = 'high';
    }
  }

  getSummary(): PerformanceSample {
    if (this.frameTimes.length === 0) {
      return { fps: 60, p95FrameTimeMs: 16.6, avgFrameTimeMs: 16.6, qualityTier: this.currentTier, sampleCount: 0 };
    }
    const sorted = [...this.frameTimes].sort((a, b) => a - b);
    const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    const p95Idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
    const p95 = sorted[p95Idx];
    return {
      fps: Math.round(1000 / Math.max(1, avg)),
      p95FrameTimeMs: Number(p95.toFixed(2)),
      avgFrameTimeMs: Number(avg.toFixed(2)),
      qualityTier: this.currentTier,
      sampleCount: sorted.length,
    };
  }
}
