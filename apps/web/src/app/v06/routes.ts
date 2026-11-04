/**
 * MiraVerse v0.7 (Option A) — Route Table & Boundary Classification (`CX07`)
 */
export interface RouteDefinitionV06 {
  path: string;
  surface: 'public_discovery' | 'roblox_launch' | 'minecraft_companion' | 'adult_only' | 'legacy_preview';
  requiresAdultAuth: boolean;
  description: string;
}

export const V06_ROUTES: RouteDefinitionV06[] = [
  { path: '/', surface: 'public_discovery', requiresAdultAuth: false, description: 'Cinematic homepage with Play free on Roblox CTA' },
  { path: '/explore', surface: 'public_discovery', requiresAdultAuth: false, description: 'Five curated destinations & availability matrix' },
  { path: '/explore/:country', surface: 'public_discovery', requiresAdultAuth: false, description: 'Country story, mentor, quest highlights & Roblox/Bedrock launch' },
  { path: '/adventures', surface: 'public_discovery', requiresAdultAuth: false, description: 'Five challenge types & cultural adventure taxonomy' },
  { path: '/characters', surface: 'public_discovery', requiresAdultAuth: false, description: 'Mira, 5 country mentors & Avatar Studio cosmetics preview' },
  { path: '/play', surface: 'roblox_launch', requiresAdultAuth: false, description: 'Official Roblox launch page with account/app requirements & fallback' },
  { path: '/play/:country', surface: 'roblox_launch', requiresAdultAuth: false, description: 'Roblox share link with non-secret destination hint' },
  { path: '/minecraft', surface: 'minecraft_companion', requiresAdultAuth: false, description: 'Minecraft Bedrock overview, .mcaddon download & compatibility' },
  { path: '/passport', surface: 'public_discovery', requiresAdultAuth: false, description: 'Native passport explanation & cultural storybook reader' },
  { path: '/shop', surface: 'adult_only', requiresAdultAuth: false, description: 'Adult-only web-deliverable digital products in Stripe test mode' },
  { path: '/gifts', surface: 'adult_only', requiresAdultAuth: false, description: 'Adult gifting for web-deliverable products & printable e-cards' },
  { path: '/gifts/redeem', surface: 'adult_only', requiresAdultAuth: false, description: 'Rate-limited adult gift code redemption for web entitlements' },
  { path: '/parents', surface: 'public_discovery', requiresAdultAuth: false, description: 'Platform access guidance, privacy, safety & Roblox/Minecraft controls' },
  { path: '/parent/dashboard', surface: 'adult_only', requiresAdultAuth: true, description: 'Adult orders, gifts, consent controls & support' },
  { path: '/account', surface: 'adult_only', requiresAdultAuth: true, description: 'Adult account settings' },
  { path: '/help', surface: 'public_discovery', requiresAdultAuth: false, description: 'Family help & support' },
  { path: '/legal/privacy', surface: 'public_discovery', requiresAdultAuth: false, description: 'Verified child & parent privacy policy' },
  { path: '/legal/terms', surface: 'public_discovery', requiresAdultAuth: false, description: 'Terms of service & platform boundaries' },
  { path: '/legacy-game', surface: 'legacy_preview', requiresAdultAuth: false, description: 'Deferred browser 3D preview preserved behind explicit legacy route' },
];
