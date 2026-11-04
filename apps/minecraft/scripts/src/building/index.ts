/**
 * MiraVerse Global v1.1 — 11-Country Block-Based Structure Restoration Controller
 * (`apps/minecraft/scripts/src/building/index.ts`)
 * Owner: CX03 (Wave W2)
 */
import type { GlobalCountryCode } from '../quests/index.js';

export interface RestorationSiteProgress {
  countryCode: GlobalCountryCode;
  stage: 0 | 1 | 2 | 3;
  placedBlocksCount: number;
  completed: boolean;
}

export class StructureRestore {
  private sites = new Map<GlobalCountryCode, RestorationSiteProgress>();

  getSite(countryCode: GlobalCountryCode): RestorationSiteProgress {
    let s = this.sites.get(countryCode);
    if (!s) {
      s = { countryCode, stage: 0, placedBlocksCount: 0, completed: false };
      this.sites.set(countryCode, s);
    }
    return s;
  }

  advanceStage(countryCode: GlobalCountryCode, blocksPlaced = 4): RestorationSiteProgress {
    const s = this.getSite(countryCode);
    s.placedBlocksCount += blocksPlaced;
    if (s.stage < 3) {
      s.stage = (s.stage + 1) as 0 | 1 | 2 | 3;
    }
    s.completed = s.stage === 3;
    return s;
  }
}
