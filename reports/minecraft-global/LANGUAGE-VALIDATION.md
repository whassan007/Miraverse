# MiraVerse Global v1.1 — 14-Locale & RTL/BiDi Validation Report (`LANGUAGE-VALIDATION.md`)

## 1. Locale Architecture & Native vs. Custom Routing
- **Total Supported Locales:** **14**
- **Native Bedrock Pack Locales (`rp/texts/languages.json`):** **9** (`en_US`, `fr_FR`, `fr_CA`, `de_DE`, `zh_CN`, `ja_JP`, `ru_RU`, `uk_UA`, `ko_KR`)
- **Custom Application-Level Arabic Locales:** **5** (`ar`, `ar-LB`, `ar-IQ`, `ar-EG`, `ar-MA`) — never falsely claimed as native Bedrock pack language codes; rendered via custom RTL UI adapter with deterministic fallback (`ar-XX → ar → en-US`).
- **Dialect Differentiation Verified:** `apps/minecraft/tools/rtl/verify-rtl-locales.mjs` verifies that `ar-LB`, `ar-IQ`, `ar-EG`, and `ar-MA` are distinct from Modern Standard Arabic (`ar`) and carry `humanReviewRequired: true`.

## 2. Per-Locale Key Coverage Table
| Locale ID | Language Name | Script | Direction | Native Bedrock `.lang` | Key Count | Missing Keys | Reviewer Status |
|---|---|---|---|---|---|---|---|
| `en-US` | English | Latin | `ltr` | `en_US` | 604 | 0 | `APPROVED_BASELINE` |
| `fr-FR` | French (France) | Latin | `ltr` | `fr_FR` | 604 | 0 | `AI_AUTHORED_HUMAN_REVIEW_REQUIRED` |
| `fr-CA` | French (Canada) | Latin | `ltr` | `fr_CA` | 604 | 0 | `AI_AUTHORED_HUMAN_REVIEW_REQUIRED` |
| `de-DE` | German | Latin | `ltr` | `de_DE` | 604 | 0 | `AI_AUTHORED_HUMAN_REVIEW_REQUIRED` |
| `zh-Hans-CN` | Simplified Chinese | CJK | `ltr` | `zh_CN` | 604 | 0 | `AI_AUTHORED_HUMAN_REVIEW_REQUIRED` |
| `ja-JP` | Japanese | CJK | `ltr` | `ja_JP` | 604 | 0 | `AI_AUTHORED_HUMAN_REVIEW_REQUIRED` |
| `ru-RU` | Russian | Cyrillic | `ltr` | `ru_RU` | 604 | 0 | `AI_AUTHORED_HUMAN_REVIEW_REQUIRED` |
| `uk-UA` | Ukrainian | Cyrillic | `ltr` | `uk_UA` | 604 | 0 | `AI_AUTHORED_HUMAN_REVIEW_REQUIRED` |
| `ko-KR` | Korean | CJK | `ltr` | `ko_KR` | 604 | 0 | `AI_AUTHORED_HUMAN_REVIEW_REQUIRED` |
| `ar` | Modern Standard Arabic | Arabic | `rtl` | `Custom RTL Adapter` | 604 | 0 | `AI_AUTHORED_HUMAN_REVIEW_REQUIRED` |
| `ar-LB` | Lebanese Arabic | Arabic | `rtl` | `Custom RTL Adapter` | 604 | 0 | `AI_AUTHORED_HUMAN_REVIEW_REQUIRED` |
| `ar-IQ` | Iraqi Arabic | Arabic | `rtl` | `Custom RTL Adapter` | 604 | 0 | `AI_AUTHORED_HUMAN_REVIEW_REQUIRED` |
| `ar-EG` | Egyptian Arabic | Arabic | `rtl` | `Custom RTL Adapter` | 604 | 0 | `AI_AUTHORED_HUMAN_REVIEW_REQUIRED` |
| `ar-MA` | Moroccan Darija | Arabic | `rtl` | `Custom RTL Adapter` | 604 | 0 | `AI_AUTHORED_HUMAN_REVIEW_REQUIRED` |
