# MiraVerse v0.4 Art Direction & Visual Bible (`art/direction/STYLE_BIBLE.md`)

**Owner:** `AG01` (Art Director)  
**Aesthetic Pillar:** Handcrafted Painterly 3D Storybook World — Warm, Sculpted, Culturally Authentic, Child-Safe.

---

## 1. Proportions, Scale & World Units

- **1 Engine Unit = 1.0 Meter** across glTF 2.0 / Babylon.js, Roblox (converted at `1m = 3.57 studs`), and Minecraft Bedrock (`1 block = 1m³`).
- **Hero Avatar (Mira, age 10):** `1.45m` tall, stylized 5.5-head storybook proportion, expressive eyes, warm olive skin tone, teal explorer satchel, amber scarf.
- **Adult Elder Mentors:** `1.65m–1.72m` tall, warm posture, culturally specific handmade garments (zero caricatures or interchangeable generic costumes).
- **Architecture Scale:** Ground-floor doorways `2.6m` high × `1.5m` wide; street lanes `4.5m–6.5m` wide to prevent third-person camera claustrophobia; town plaza footprint `48m × 48m`.

---

## 2. Per-Country Color Scripts & Atmospheric Lighting

| World | Primary Palette (Hex) | Accent / Warmth (Hex) | Sky & Atmosphere | Key Architectural Silhouettes |
|---|---|---|---|---|
| **3D World Hub (`HUB`)** | `#1D3557`, `#F4F1DE`, `#457B9D` | `#F4A261`, `#E9C46A` | Golden morning dome, soft warm fog | Compass Rose fountain, 5 carved cultural portal arches, fluttering pennants |
| **France (`FR` — Vieux Lyon)** | `#D9A05B` (ochre stone), `#3B6EA5` (slate) | `#E8A838` (brioche gold), `#8C3B2B` | Crisp morning sun, soft warm bounce light | Mansard slate roofs, traboule arched passages, timber-framed boulangerie |
| **Lebanon (`LB` — Byblos)** | `#E6CCB2` (Byblos limestone), `#1E7A68` (sea) | `#D97B38` (terracotta), `#588157` (cedar) | Mediterranean coastal afternoon, sparkling water | Triple-arched stone windows, domed iron saj bakery, cedar market awnings, wooden boats |
| **Egypt (`EG` — Cairo)** | `#DDA15E` (warm sandstone), `#2B4C7E` (dusk) | `#F0B429` (fanous brass glow), `#BC4749` | Warm Ramadan twilight, glowing lantern point lights | Turned-wood mashrabiya lattices, pierced brass fanous archway, striped market canopies |
| **Iraq (`IQ` — Baghdad)** | `#C68B59` (Baghdadi brick), `#8C4A27` (teak) | `#3AA6B9` (turquoise tile), `#E9C46A` | Late-afternoon Tigris golden hour | Projecting shanasheel balconies with stained glass, brick courtyard arches, riverfront palms |
| **Korea (`KR` — Jeonju)** | `#3D405B` (giwa charcoal tile), `#E0C097` (pine) | `#D96B70` (hanbok rose), `#81B29A` (celadon) | Clear autumn Chuseok twilight with warm paper lanterns | Sweeping curved giwa roofs, raised wooden maru porch, onggi earthenware terrace, maple trees |

---

## 3. Asset & Animation Quality Rubric (50-Point Gate)

Every release candidate is graded independently by `AG30` across 10 categories (0–5 points each; minimum passing score **42/50**, no category below **3/5**):
1. Clearly a free-roaming 3D adventure (not a 2D grid mini-game)
2. Coherent original painterly storybook art direction
3. Cultural & architectural distinctiveness across all 5 countries
4. Expressive skeletal character & NPC animations (zero T-pose)
5. Fluid third-person movement & collision-aware orbit camera
6. Detailed environment landmarks, props, and before/after restoration
7. Satisfying diegetic quest interactions & feedback
8. Tasteful edge HUD & typography legibility (including Arabic RTL & Hangul)
9. Atmospheric lighting, sky presets, VFX, and spatial audio
10. Responsive mobile touch controls & reduced-motion accessibility
