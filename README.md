# MiraVerse

Website for Miraverse.studio: an e-commerce and storytelling site about Mira, a 9-year-old French-Lebanese girl.

**Live preview:** https://whassan007.github.io/Miraverse/

This is a static front-end preview for look and feel. It needs no API key and has no backend.

## Run locally

```
npm ci
npm run dev
```

Pushes to `main` deploy to GitHub Pages through `.github/workflows/deploy-pages.yml`.

## What is demo-only

| Area | Today | Where to connect the backend |
| --- | --- | --- |
| Mira chat | Canned replies to the suggested questions | `src/services/gemini.service.ts` |
| Lebanon map game | Short canned replies | `src/services/game.service.ts` |
| Login, profiles, PINs | Hardcoded fake accounts, not real security | `src/services/user.service.ts` |
| Shop, contact, newsletter | Front-end only | `src/components/` |

The original Mira character prompts are kept in `src/services/mira-prompts.ts`. Keep model calls and API keys on the server, never in this browser code.

## Media

- `public/assets/`: optimized images and videos used by the site. Shop and story pictures are stand-ins from the Mira art set.
- `assets-source/drive-originals/`: full-size original images from the MiraVerse Drive folder.
- Source app: Google AI Studio app `f0ed0de2-169a-47ea-859a-976ba71fddfb`.
