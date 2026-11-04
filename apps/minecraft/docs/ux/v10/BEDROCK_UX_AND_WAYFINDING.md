# MiraVerse v1.0 Minecraft Bedrock — UX, Tutorial & Wayfinding Specification
**Owner:** `AG19` (Wave W3)

## 1. Skippable 60-Second Gateway Hub Onboarding
- Players spawn safely at `(0, 101, 0)` in the **MiraVerse Gateway Hub & Astrolabe Rotunda**.
- Interacting with **Mira (World Guide)** at `(2, 101, -2)` or the **Passport Pedestal** at `(0, 101, 4)` opens `BedrockUiFormsV10.buildTutorialWelcomeForm(true)`.
- Players can either follow the 60-second guided tour or press **Skip Tutorial — Choose Destination Now** immediately.

## 2. Five Regional Portals & Clear Sightlines
- Each of the 5 portals (`LB`, `EG`, `IQ`, `KR`, `FR`) has a high-contrast archway, country banner, and return portal pad at `z = -24` in every district.
- Every district places the Mentor outside the primary kitchen house (`x = cx - 7, y = 65, z = 3`) with a warm lantern beacon and clear street sightlines to the Market Stall, Restoration Site, and Private Plot.

## 3. Native `@minecraft/server-ui` Readability & Controller/Touch Affordances
- All dialogue and quest prompts use native `ActionFormData` with concise 2-3 sentence paragraphs suitable for ages 8-12 across keyboard/mouse, gamepad, and touch screens.
- Cooking steps enforce Elder NPC supervision notes (*"Elder NPC handles stove/oven heat safely"*).
