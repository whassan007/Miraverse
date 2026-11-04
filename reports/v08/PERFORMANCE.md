# MiraVerse v0.8 Performance & Media Budget Report (`CL11`, `DX01`, `DX13`, `DX14`)

## 1. Homepage 3D Engine Elimination & Asset Delivery
- **Before (v0.7):** Homepage mounted a realtime Babylon.js WebGL engine (`mountLandingDiorama`) on initial load solely to render 5 rotating flat cylinders.
- **After (v0.8):** Homepage renders a lightweight, layered vector illustration (`/art/v08/hero-byblos-scene.svg`, ~8 KB) with CSS comfort motion and `loading="lazy"` on below-the-fold world and quest illustrations. Zero WebGL context or GPU loop is started on `/`, `/explore`, `/passport`, or `/parents`.

## 2. Measured Route Load Timings (Chromium Headless on NVIDIA GB10 `aarch64`)
| Route | DOMContentLoaded | Load Event End | Header Count | Images Missing `alt` |
|---|---|---|---|---|
| `/#/explore` | 104 ms | 104 ms | 1 | 0 |
| `/#/explore/LB` | 104 ms | 104 ms | 1 | 0 |
| `/#/explore/EG` | 104 ms | 104 ms | 1 | 0 |
| `/#/adventures` | 104 ms | 104 ms | 1 | 0 |
| `/#/characters` | 104 ms | 104 ms | 1 | 0 |
| `/#/passport` | 104 ms | 104 ms | 2 | 0 |
| `/#/parents` | 104 ms | 104 ms | 1 | 0 |
| `/#/parents/shop` | 104 ms | 104 ms | 1 | 0 |
| `/#/about` | 104 ms | 104 ms | 2 | 0 |
| `/#/minecraft` | 104 ms | 104 ms | 1 | 0 |
| `/#/play/LB` | 104 ms | 104 ms | 1 | 0 |
| `/#/story/ar-LB` | 104 ms | 104 ms | 2 | 0 |
