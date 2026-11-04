/**
 * MiraVerse v0.7 (Option A) — Responsive Design System & Tokens (`AG15`)
 */
export const V06_DESIGN_TOKENS = {
  colors: {
    canvasDeep: '#0B1325',
    canvasWarm: '#FFF8EE',
    accentGold: '#F4A261',
    accentTeal: '#1D7874',
    robloxEmerald: '#00B06F',
    bedrockAmber: '#D97706',
    adultBorder: 'rgba(244, 162, 97, 0.45)',
  },
  viewports: [360, 390, 768, 1440, 1920] as const,
  rtlLocales: ['ar-LB', 'ar-EG', 'ar-IQ'] as const,
  ctas: {
    primaryRoblox: 'Play free on Roblox',
    returningRoblox: 'Open MiraVerse on Roblox',
    companionBedrock: 'Play in Minecraft Bedrock',
  },
} as const;
