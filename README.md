# OpenFairy Landing Page

Landing page built on a 1440px-wide design canvas that scales to the browser width (see `fit()` in `renderer.js`).

Sections so far:
1. **Hero** — interactive 3D glass wing (three.js)
2. **Metrics** — "Connections Grow. Intelligence Flows." glass metric cards (Figma frame `89:951`)

## Structure

```
index.html                  Markup only — links CSS, import map, and the JS entry point
assets/
  css/
    base.css                Design tokens (:root), reset, artboard stage, .mono / .g utilities
    nav.css                 Top navigation + buttons
    hero.css                Headline, CTA, provider card, callouts, hint, coord panel, reduced-motion
    cursor.css              Custom cursor (ring, hold progress, label)
    preloader.css           Loading screen
    metrics.css             Section 02 · Metrics (cards, progress, background layers)
  js/
    main.js                 Entry point — animation loop wiring all modules together
    config.js               Constants (W, H, REDUCE, RENDER), debug overrides (OVR), shared state
    renderer.js             WebGL renderer, artboard fit/scale, scene, camera, lights
    background.js           Frost background shader + ember glow
    wing-icon.js            Wing SVG path data
    wing.js                 Glass wing: fragment geometry, blast shader, materials
    shards.js               Floating glass shards + per-frame update
    streaks.js              Orange light streaks + per-frame update
    pointer.js              Pointer tracking, cursor & HUD element refs
    preloader.js            Preloader counter → intro reveal
    utils.js                Seeded random (shared by wing.js and shards.js — keep that import order)
    metrics.js              Section 02: active card (hover/click/autoplay), count-up, scroll reveal
  images/
    logo/                   OpenFairy logos (horizontal / icon, light / dark)
    providers/              LLM provider logos
    metrics/                Metric icons, live dot, brand glow, 3D wing render (exported from Figma)
  libs/
    three/                  three.js r165 (vendored, MIT) + addons used (RoomEnvironment, SVGLoader)
```

## Running locally

The page uses ES modules, which browsers block on `file://`. Serve the folder over HTTP:

```
python -m http.server 8000      # then open http://localhost:8000
```

or use VS Code's "Live Server" extension.

## Dev helpers

- `?render=1` — capture mode (skips preloader, hides UI overlays)
- `window.OVR.blast = 0..1`, `window.OVR.ry = radians` — override wing state from the console
- `window.SIM(n)` / `window.CAP(name)` — step frames / POST a PNG to a local `/save` endpoint
