/**
 * MiraVerse v0.7 (Option A) — Stable Bedrock API Bootstrap & World Dynamic Properties (`CL10`)
 * Uses stable @minecraft/server@1.17.0 and @minecraft/server-ui@1.3.0 with zero experimental flags.
 */
export const BEDROCK_V06_SCHEMA_KEY = 'mv:v06:schema_version';
export const BEDROCK_V06_SCHEMA_VALUE = '6.0.0';

export interface BedrockPlayerProgressV06 {
  countryId: 'LB' | 'EG' | 'IQ' | 'KR' | 'FR';
  completedSteps: string[];
  restoredBlockCount: number;
  bedrockMiraTokens: number;
  passportStampUnlocked: boolean;
}

export function createInitialBedrockProgress(countryId: 'LB' | 'EG' | 'IQ' | 'KR' | 'FR' = 'LB'): BedrockPlayerProgressV06 {
  return {
    countryId,
    completedSteps: [],
    restoredBlockCount: 0,
    bedrockMiraTokens: 0,
    passportStampUnlocked: false,
  };
}
