/**
 * MiraVerse v0.7 (Option A) — Adult-Only Identity & Session Boundary (`CX09`)
 * Explicitly prohibits unverified automatic Roblox or Minecraft account linking.
 */
export interface AdultIdentitySessionV06 {
  adultAccountId: string;
  email: string;
  csrfToken: string;
  verifiedAdult: boolean;
  robloxAccountLinked: false;
  minecraftAccountLinked: false;
}

export function createAdultSessionBoundary(adultAccountId: string, email: string, csrfToken: string): AdultIdentitySessionV06 {
  if (!adultAccountId || !email || !csrfToken) {
    throw new Error('ADULT_AUTH_REQUIRED');
  }
  return {
    adultAccountId,
    email,
    csrfToken,
    verifiedAdult: true,
    robloxAccountLinked: false,
    minecraftAccountLinked: false,
  };
}
