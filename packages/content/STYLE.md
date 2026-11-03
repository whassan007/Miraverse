# MiraVerse Story & Editorial Contract (`STYLE.md`)

1. **Target Audience & Length:**
   - Ages 8–12; warm, contemporary, funny everyday family life.
   - Exactly **15 contiguous scenes** (`id: 1..15`), targeting **120–180 words per scene** in the source language (`ar-LB`, `ar-EG`, `ar-IQ`, `ko`, `fr`). Keep the narrative natural and engaging without artificial padding.
2. **Dual Narrative Arc:**
   - Every story weaves together a **cooking arc** and a **social/identity arc** that resolve together by scene 15.
   - Use culturally and geographically specific details (real towns, neighborhoods, dishes, family occasions); avoid stereotypes or generic regional tropes.
   - Keep canonical character names, ages, roles (`Archetype`), and visual descriptions consistent across all scenes, packs, and image prompts.
3. **Linguistic Authenticity:**
   - Arabic stories (`ar-LB`, `ar-EG`, `ar-IQ`) must be written genuinely in the named dialect (**Lebanese Arabic**, **Cairene Egyptian Arabic**, **Baghdadi Iraqi Arabic**) in Arabic script—not Modern Standard Arabic (MSA) with isolated dialect words.
   - Preserve natural script, spelling, punctuation, and idiomatic expressions. Wave B editorial passes must document dialect choices or controversial variants in `swarm/notes/<ID>.md`.
4. **Child Safety & Guardrails:**
   - No political or war content, border disputes, religious argument, romance, frightening peril, or dangerous instructions.
   - Ramadan, Eid, Chuseok, and Epiphany/galette traditions are presented as warm, everyday family and cultural contexts.
   - **Adults always operate heat, knives, stoves, saj, and ovens.** Children assist with safe preparation, shaping, mixing, and serving.
5. **Visual Art Prompts:**
   - Every scene requires an English, one-sentence `image_prompt` in a consistent **watercolor-and-gouache children's book illustration** aesthetic, repeating the canonical character appearance so each scene's prompt stands alone. No licensed characters, trademarks, or brand names.
6. **Vocabulary & English Glosses:**
   - Exactly **10 `vocab` entries** per story (`{ word, translit, en }`) drawn from the story's family, food, and everyday expressions.
   - After Wave B, all 15 scenes must include a complete, natural English `gloss_en` that faithfully conveys the meaning and warmth of the dialect text without flattening cultural specifics.
7. **Editorial Review Status:**
   - Programmatic validation verifies structure only. All AI-authored and AI-edited stories carry status `AI_REVIEWED_PENDING_HUMAN` until certified by native-speaker human cultural review.
