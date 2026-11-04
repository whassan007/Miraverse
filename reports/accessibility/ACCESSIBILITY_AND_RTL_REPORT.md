# Accessibility, RTL Arabic, Korean Typography & Reduced-Motion Review (`reports/accessibility/ACCESSIBILITY_AND_RTL_REPORT.md`)

**Owner:** `AG27`

## 1. Verified Accessibility Controls
- **Skip Link & Landmark Navigation:** Keyboard-focusable skip link, semantic `<header>`, `<main>`, `<nav>`, `<section>`, and `<footer>` landmarks across `/`, `/play`, `/story/:lang`, `/passport`, and `/parents`.
- **Reduced Motion (`prefers-reduced-motion`):** Supported on both the `/` Cinematic Homepage (`toggle-reduced-motion` + automatic media query check) and in-game Settings (`reducedMotion` disables camera sway and instant-completes typewriter dialogue).
- **Arabic RTL (`ar-LB`, `ar-EG`, `ar-IQ`) & Korean (`ko`):** Native dialogue and story text set `dir="rtl"` and `lang` attributes explicitly with generous line-height (`1.5`) so Arabic diacritics and Korean Hangul jamo never clip at `360×800`.
