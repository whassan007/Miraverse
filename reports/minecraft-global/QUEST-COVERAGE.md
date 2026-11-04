# MiraVerse Global v1.1 — 66-Chapter & 264-Age-Variant Coverage Report (`QUEST-COVERAGE.md`)

## 1. Executive Summary
- **Countries Covered:** **11 / 11** (`LB`, `IQ`, `EG`, `FR`, `KR`, `DE`, `CN`, `JP`, `RU`, `UA`, `MA`)
- **Chapters Implemented & Tested:** **66 / 66** (`LB01..MA06`, 6 sequential chapters per country; Chapter 1 of every country independently unlocked at start)
- **Age-Track Behavior Variants Tested:** **264 / 264** (`66 chapters × 4 age tracks: 5-7, 8-10, 11-13, 14-17`)
- **Automated Test Suite:** `apps/minecraft/tests/quests/global-264-variants.test.ts` (**PASSED**)
- **Finale Verification:** *The Circle of Stories* verified to unlock with **any 3+ completed country keepsakes** and grant `stamp_global_storykeeper`.

## 2. Complete 66-Chapter Verification Matrix
| Chapter ID | Country | Title | Mechanic | Source Label | Earned Artifact | 4 Age Variants (`5-7..14-17`) |
|---|---|---|---|---|---|---|
| `LB01` | `LB` | **The Harbor Wakes** | `navigation_and_restoration` | `contemporary_tradition` | `lb_harbor_compass` (Harbor Compass) | `VERIFIED (4/4)` |
| `LB02` | `LB` | **Letters in Stone** | `epigraphy_and_craft` | `historical_context` | `lb_alphabet_tile` (Alphabet Tile) | `VERIFIED (4/4)` |
| `LB03` | `LB` | **Teta’s Table** | `cooking_and_trade` | `contemporary_tradition` | `lb_family_recipe_card` (Family Recipe Card) | `VERIFIED (4/4)` |
| `LB04` | `LB` | **The Cedar Chest** | `myth_vs_history` | `folklore` | `lb_cedar_token` (Cedar Token) | `VERIFIED (4/4)` |
| `LB05` | `LB` | **Photographs Across the Sea** | `oral_history_archive` | `fictional_gameplay` | `lb_archive_album` (Archive Album) | `VERIFIED (4/4)` |
| `LB06` | `LB` | **Festival of Return** | `cooperative_restoration` | `contemporary_tradition` | `lb_harbor_home_stamp` (Harbor Home Stamp) | `VERIFIED (4/4)` |
| `IQ01` | `IQ` | **Street of Books** | `exploration_and_organization` | `contemporary_tradition` | `iq_bookseller_seal` (Bookseller Seal) | `VERIFIED (4/4)` |
| `IQ02` | `IQ` | **The House of Wisdom** | `restoration_and_discovery` | `historical_context` | `iq_scholars_astrolabe` (Scholar’s Astrolabe) | `VERIFIED (4/4)` |
| `IQ03` | `IQ` | **Words That Travel** | `source_comparison` | `historical_context` | `iq_translation_scroll` (Translation Scroll) | `VERIFIED (4/4)` |
| `IQ04` | `IQ` | **Dates and Kleicha** | `cooking_and_trade` | `contemporary_tradition` | `iq_kleicha_mold` (Kleicha Mold) | `VERIFIED (4/4)` |
| `IQ05` | `IQ` | **The Courtyard of Questions** | `architecture_restoration` | `contemporary_tradition` | `iq_courtyard_lattice` (Courtyard Lattice) | `VERIFIED (4/4)` |
| `IQ06` | `IQ` | **A Library Across Oceans** | `cooperative_exhibit` | `fictional_gameplay` | `iq_knowledge_keeper_stamp` (Knowledge Keeper Stamp) | `VERIFIED (4/4)` |
| `EG01` | `EG` | **A Darkened Courtyard** | `navigation_and_gathering` | `contemporary_tradition` | `eg_lantern_frame` (Lantern Frame) | `VERIFIED (4/4)` |
| `EG02` | `EG` | **The Fanous Workshop** | `craft_and_assembly` | `contemporary_tradition` | `eg_glass_star` (Glass Star) | `VERIFIED (4/4)` |
| `EG03` | `EG` | **The Market at Dusk** | `weighted_trade` | `contemporary_tradition` | `eg_market_scale` (Market Scale) | `VERIFIED (4/4)` |
| `EG04` | `EG` | **Koshari for Everyone** | `cooking_sequence` | `contemporary_tradition` | `eg_koshari_bowl` (Koshari Bowl) | `VERIFIED (4/4)` |
| `EG05` | `EG` | **Stories of the Lantern** | `folklore_comparison` | `folklore` | `eg_story_flame` (Story Flame) | `VERIFIED (4/4)` |
| `EG06` | `EG` | **The City of Light** | `accessible_route_design` | `contemporary_tradition` | `eg_cairo_light_stamp` (Cairo Light Stamp) | `VERIFIED (4/4)` |
| `FR01` | `FR` | **The Passage Map** | `navigation_and_mapping` | `historical_context` | `fr_traboule_key` (Traboule Key) | `VERIFIED (4/4)` |
| `FR02` | `FR` | **Threads of the City** | `pattern_craft` | `historical_context` | `fr_silk_ribbon` (Silk Ribbon) | `VERIFIED (4/4)` |
| `FR03` | `FR` | **At the Mères’ Table** | `cooking_sequence` | `historical_context` | `fr_chefs_notebook` (Chef’s Notebook) | `VERIFIED (4/4)` |
| `FR04` | `FR` | **A Market of Flavors** | `trade_and_provenance` | `contemporary_tradition` | `fr_market_basket` (Market Basket) | `VERIFIED (4/4)` |
| `FR05` | `FR` | **Stone by Stone** | `architecture_restoration` | `contemporary_tradition` | `fr_masons_crest` (Mason’s Crest) | `VERIFIED (4/4)` |
| `FR06` | `FR` | **A Recipe for Home** | `cooperative_feast` | `contemporary_tradition` | `fr_lyon_heritage_stamp` (Lyon Heritage Stamp) | `VERIFIED (4/4)` |
| `KR01` | `KR` | **The Hanok Gate** | `navigation_and_restoration` | `contemporary_tradition` | `kr_hanok_door_charm` (Hanok Door Charm) | `VERIFIED (4/4)` |
| `KR02` | `KR` | **Five Colors, Many Meanings** | `gathering_and_classification` | `historical_context` | `kr_five_color_palette` (Five-Color Palette) | `VERIFIED (4/4)` |
| `KR03` | `KR` | **The Market Morning** | `polite_trade` | `contemporary_tradition` | `kr_market_token` (Market Token) | `VERIFIED (4/4)` |
| `KR04` | `KR` | **Jeonju’s Shared Bowl** | `cooking_sequence` | `contemporary_tradition` | `kr_bibimbap_bowl` (Bibimbap Bowl) | `VERIFIED (4/4)` |
| `KR05` | `KR` | **Craft of the Courtyard** | `architecture_restoration` | `contemporary_tradition` | `kr_joinery_pattern` (Joinery Pattern) | `VERIFIED (4/4)` |
| `KR06` | `KR` | **Harmony Feast** | `cooperative_feast` | `contemporary_tradition` | `kr_jeonju_harmony_stamp` (Jeonju Harmony Stamp) | `VERIFIED (4/4)` |
| `DE01` | `DE` | **The River’s Bend** | `navigation_and_mapping` | `historical_context` | `de_rhine_route_map` (Rhine Route Map) | `VERIFIED (4/4)` |
| `DE02` | `DE` | **The Enchanted Song** | `literature_comparison` | `literature` | `de_lorelei_songstone` (Lorelei Songstone) | `VERIFIED (4/4)` |
| `DE03` | `DE` | **The Navigator’s Choice** | `signal_prioritization` | `fictional_gameplay` | `de_steady_helm` (Steady Helm) | `VERIFIED (4/4)` |
| `DE04` | `DE` | **The Quiet Grail Hall** | `observation_and_empathy` | `literature` | `de_hall_of_questions_token` (Hall of Questions Token) | `VERIFIED (4/4)` |
| `DE05` | `DE` | **What Ails You?** | `myth_interpretation` | `literature` | `de_healing_question_scroll` (Healing Question Scroll) | `VERIFIED (4/4)` |
| `DE06` | `DE` | **The Garden Returns** | `cooperative_restoration` | `contemporary_tradition` | `de_german_memory_stamp` (German Memory Stamp) | `VERIFIED (4/4)` |
| `CN01` | `CN` | **Where the River Turns** | `exploration_and_discovery` | `literature` | `cn_blossom_petal` (Blossom Petal) | `VERIFIED (4/4)` |
| `CN02` | `CN` | **The Hidden Valley** | `gathering_and_bridge_repair` | `literature` | `cn_valley_map` (Valley Map) | `VERIFIED (4/4)` |
| `CN03` | `CN` | **The Calendar of Change** | `seasonal_comparison` | `contemporary_tradition` | `cn_season_wheel` (Season Wheel) | `VERIFIED (4/4)` |
| `CN04` | `CN` | **A Path That Moves** | `map_revision_reasoning` | `literature` | `cn_changing_compass` (Changing Compass) | `VERIFIED (4/4)` |
| `CN05` | `CN` | **Moonlight Letters** | `folklore_and_cooking` | `folklore` | `cn_moon_letter` (Moon Letter) | `VERIFIED (4/4)` |
| `CN06` | `CN` | **Plant a New Garden** | `cooperative_restoration` | `contemporary_tradition` | `cn_peach_spring_stamp` (Peach Spring Stamp) | `VERIFIED (4/4)` |
| `JP01` | `JP` | **The First Step** | `preparation_and_wayfinding` | `literature` | `jp_travelers_sandal` (Traveler’s Sandal) | `VERIFIED (4/4)` |
| `JP02` | `JP` | **Crossing the River** | `bridge_restoration` | `contemporary_tradition` | `jp_river_bridge_token` (River Bridge Token) | `VERIFIED (4/4)` |
| `JP03` | `JP` | **Three Lines of Sky** | `poetic_composition` | `literature` | `jp_haiku_leaf` (Haiku Leaf) | `VERIFIED (4/4)` |
| `JP04` | `JP` | **The Traveler’s Shelter** | `trade_and_roof_repair` | `contemporary_tradition` | `jp_waystation_lantern` (Waystation Lantern) | `VERIFIED (4/4)` |
| `JP05` | `JP` | **The Changing Path** | `temporal_comparison` | `literature` | `jp_seasonal_scroll` (Seasonal Scroll) | `VERIFIED (4/4)` |
| `JP06` | `JP` | **The Road Is Home** | `cooperative_garden_build` | `contemporary_tradition` | `jp_narrow_road_stamp` (Narrow Road Stamp) | `VERIFIED (4/4)` |
| `RU01` | `RU` | **The Bell at Dawn** | `sound_navigation_and_repair` | `folklore` | `ru_lake_bell_fragment` (Lake Bell Fragment) | `VERIFIED (4/4)` |
| `RU02` | `RU` | **The City in Reflection** | `reflection_puzzle` | `folklore` | `ru_reflection_prism` (Reflection Prism) | `VERIFIED (4/4)` |
| `RU03` | `RU` | **Sadko’s Strings** | `musical_rhythm` | `folklore` | `ru_gusli_charm` (Gusli Charm) | `VERIFIED (4/4)` |
| `RU04` | `RU` | **The Water Garden** | `ecological_stewardship` | `contemporary_tradition` | `ru_reed_wreath` (Reed Wreath) | `VERIFIED (4/4)` |
| `RU05` | `RU` | **Keepers of Stories** | `source_comparison_archive` | `folklore` | `ru_legend_folio` (Legend Folio) | `VERIFIED (4/4)` |
| `RU06` | `RU` | **A Story Above Water** | `cooperative_pavilion_build` | `contemporary_tradition` | `ru_kitezh_memory_stamp` (Kitezh Memory Stamp) | `VERIFIED (4/4)` |
| `UA01` | `UA` | **The Four Founders** | `exploration_and_mapping` | `folklore` | `ua_founders_river_map` (Founders’ River Map) | `VERIFIED (4/4)` |
| `UA02` | `UA` | **The City by the Water** | `accessible_bridge_build` | `contemporary_tradition` | `ua_river_bridge_plaque` (River Bridge Plaque) | `VERIFIED (4/4)` |
| `UA03` | `UA` | **Listen to the Kobzar** | `call_and_response_music` | `contemporary_tradition` | `ua_bandura_string` (Bandura String) | `VERIFIED (4/4)` |
| `UA04` | `UA` | **The Dumy Notebook** | `oral_vs_documented_history` | `historical_context` | `ua_dumy_page` (Dumy Page) | `VERIFIED (4/4)` |
| `UA05` | `UA` | **The Living Music Hall** | `venue_restoration` | `contemporary_tradition` | `ua_carved_music_stand` (Carved Music Stand) | `VERIFIED (4/4)` |
| `UA06` | `UA` | **Songs That Travel** | `cooperative_composition` | `contemporary_tradition` | `ua_ukraine_song_stamp` (Ukraine Song Stamp) | `VERIFIED (4/4)` |
| `MA01` | `MA` | **Join the Circle** | `interactive_circle_onboarding` | `contemporary_tradition` | `ma_circle_invitation` (Circle Invitation) | `VERIFIED (4/4)` |
| `MA02` | `MA` | **A Tale With Many Voices** | `branching_oral_story` | `folklore` | `ma_hakawati_token` (Hakawati Token) | `VERIFIED (4/4)` |
| `MA03` | `MA` | **Tea and Craft** | `hospitality_and_trade` | `contemporary_tradition` | `ma_mint_tea_tray` (Mint Tea Tray) | `VERIFIED (4/4)` |
| `MA04` | `MA` | **The Story We Change** | `collaborative_attribution` | `fictional_gameplay` | `ma_story_thread` (Story Thread) | `VERIFIED (4/4)` |
| `MA05` | `MA` | **Paths of Wisdom** | `respectful_heritage_mapping` | `historical_context` | `ma_heritage_map` (Heritage Map) | `VERIFIED (4/4)` |
| `MA06` | `MA` | **The Circle Travels** | `cooperative_stage_performance` | `contemporary_tradition` | `ma_morocco_circle_stamp` (Morocco Circle Stamp) | `VERIFIED (4/4)` |
