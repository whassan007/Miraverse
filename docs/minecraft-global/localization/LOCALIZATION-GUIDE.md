# MiraVerse Global v1.1 — 14-Locale Editorial & Cultural Accuracy Guide

## 1. Supported 14 Locale Profiles & Rendering Route Contract
Minecraft Bedrock natively supports a fixed list of pack language codes in `rp/texts/languages.json`. MiraVerse Global v1.1 separates **9 Native Bedrock Pack Locales** from **5 Application-Level Arabic Dialect Locales** so that `rp/texts/languages.json` never claims unsupported dialect codes as native Bedrock pack languages.

| Locale Code | Name | Direction | Native Bedrock `.lang` | Native Bedrock Flag | Fallback Chain |
|---|---|---|---|---|---|
| `en-US` | English | `ltr` | `en_US` | `true` | `en-US` |
| `fr-FR` | French (France) | `ltr` | `fr_FR` | `true` | `fr-FR → en-US` |
| `fr-CA` | French (Canada) | `ltr` | `fr_CA` | `true` | `fr-CA → fr-FR → en-US` |
| `de-DE` | German | `ltr` | `de_DE` | `true` | `de-DE → en-US` |
| `zh-Hans-CN` | Simplified Chinese | `ltr` | `zh_CN` | `true` | `zh-Hans-CN → en-US` |
| `ja-JP` | Japanese | `ltr` | `ja_JP` | `true` | `ja-JP → en-US` |
| `ru-RU` | Russian | `ltr` | `ru_RU` | `true` | `ru-RU → en-US` |
| `uk-UA` | Ukrainian | `ltr` | `uk_UA` | `true` | `uk-UA → en-US` |
| `ko-KR` | Korean | `ltr` | `ko_KR` | `true` | `ko-KR → en-US` |
| `ar` | Modern Standard Arabic | `rtl` | `NONE (Custom UI Adapter)` | `false` | `ar → en-US` |
| `ar-LB` | Lebanese Arabic | `rtl` | `NONE (Custom UI Adapter)` | `false` | `ar-LB → ar → en-US` |
| `ar-IQ` | Iraqi Arabic | `rtl` | `NONE (Custom UI Adapter)` | `false` | `ar-IQ → ar → en-US` |
| `ar-EG` | Egyptian Arabic | `rtl` | `NONE (Custom UI Adapter)` | `false` | `ar-EG → ar → en-US` |
| `ar-MA` | Moroccan Darija | `rtl` | `NONE (Custom UI Adapter)` | `false` | `ar-MA → ar → en-US` |

## 2. Arabic Dialect Differentiation Rules (`ar`, `ar-LB`, `ar-IQ`, `ar-EG`, `ar-MA`)
- **No Wholesale Copying:** Regional Arabic dialect packs (`ar-LB`, `ar-IQ`, `ar-EG`, `ar-MA`) must never be wholesale copies of Modern Standard Arabic (`ar`).
- **Authentic Regional Greetings & Warmth Markers:**
  - `ar` (MSA): «مرحباً بك يا حافظ القصص في مرصد الأطلس»
  - `ar-LB` (Lebanese): «أهلا وسهلا يا حافظ الحكايات بميناء جبيل وعند تيتا نهلة»
  - `ar-IQ` (Iraqi): «يا هلا بيك يا حافظ الحكايات بدرابين بغداد وشناشيل دجلة»
  - `ar-EG` (Egyptian): «أهلاً بيك يا حافظ الحكايات في حارة الفوانيس بالقاهرة»
  - `ar-MA` (Moroccan Darija): «مرحبا بيك أ حافظ الحكايات فالأطلس والمدينة القديمة بفاس»
- **BiDi & RTL Shaping:** All Arabic strings are stored in logical Unicode order for web/custom UI and accompanied by BiDi-safe punctuation and deterministic fallback (`ar-XX → ar → en-US`).
- **Human Review Flag:** All machine-assisted dialect strings carry `humanReviewRequired: true` in `global-locales-manifest.json` until native speaker sign-off.

## 3. Terminology & Transliteration Glossary
| Country | Local Locale | Terms Taught In-World |
|---|---|---|
| **Lebanon** (`LB`) | `ar-LB` | **صاج** (*ṣāj* — Domed griddle for baking flatbread); **زعتر** (*za'tar* — Fragrant wild thyme, sesame, and sumac blend); **مينا** (*mīnā* — Coastal harbor and stone dock) |
| **Iraq** (`IQ`) | `ar-IQ` | **شناشيل** (*shanāshīl* — Carved wooden lattice balcony overhanging the street); **كليجة** (*klīcha* — Cardamom-spiced date pastry shared at celebrations); **حكمة** (*ḥikma* — Wisdom and shared scholarly inquiry) |
| **Egypt** (`EG`) | `ar-EG` | **فانوس** (*fānūs* — Decorative brass and colored-glass lantern); **كشري** (*kusharī* — Layered rice, lentils, pasta, tomato sauce, and crispy onions); **مشربية** (*mashrabiyya* — Turned-wood geometric lattice screen) |
| **France** (`FR`) | `fr-FR` | **traboule** (*trah-bool* — Covered passageway connecting courtyards and streets in Lyon); **boulangerie** (*boo-lahn-zhuh-ree* — Neighborhood bread and pastry bakery); **canut** (*kah-noo* — Historic silk weaver of Lyon) |
| **South Korea** (`KR`) | `ko-KR` | **한옥** (*hanok* — Traditional Korean timber-framed house with curved giwa roof tiles); **오방색** (*obangsaek* — Traditional Korean five-color harmony palette); **비빔밥** (*bibimbap* — Warm rice mixed with seasoned vegetables and savory sauces) |
| **Germany** (`DE`) | `de-DE` | **Mitgefühl** (*mit-guh-fuel* — Compassion and active empathy for others); **Strom** (*shtrohm* — Wide navigable river current); **Frage** (*frah-guh* — A caring question that opens understanding) |
| **China** (`CN`) | `zh-Hans-CN` | **桃花** (*táohuā* — Peach blossom flower); **团圆** (*tuányuán* — Warm reunion and gathering together); **变化** (*biànhuà* — Natural change and renewal over time) |
| **Japan** (`JP`) | `ja-JP` | **旅** (*tabi* — Journey and mindful travel across seasons); **俳句** (*haiku* — Short three-line seasonal poem observing nature); **架け橋** (*kakehashi* — Connecting bridge between places and people) |
| **Russia** (`RU`) | `ru-RU` | **озеро** (*ózero* — Clear forest lake); **гусли** (*gúsli* — Traditional plucked multi-stringed folk instrument); **предание** (*predániye* — Oral legend passed across generations) |
| **Ukraine** (`UA`) | `uk-UA` | **бандура** (*bandúra* — Ukrainian plucked string instrument combining lute and harp elements); **думи** (*dúmy* — Sung epic poems preserving oral cultural memory); **толока** (*tolóka* — Community solidarity gathering to build or restore together) |
| **Morocco** (`MA`) | `ar-MA` | **حلقة** (*ḥalqa* — Interactive audience circle gathered around a storyteller); **أتاي** (*atāy* — Moroccan green tea infused with fresh spearmint); **زليج** (*zallīj* — Hand-cut geometric glazed tilework) |