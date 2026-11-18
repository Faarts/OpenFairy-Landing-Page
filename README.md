# OpenFairy Landing Page

Landing page built on a 1440px-wide design canvas that scales to the browser width (see `fit()` in `renderer.js`).

Sections so far:
1. **Hero** — interactive 3D glass wing (three.js)
2. **Metrics** — "Connections Grow. Intelligence Flows." glass metric cards (Figma frame `89:951`)
3. **Brand & Product** — "Turn Model Capabilities into Intelligence Within Reach." (Figma frame `82:2`)
4. **Core Capabilities** — "One Entry Point. More Possibilities." (Figma frame `84:2`)
5. **Footer** — layout adapted from hanusek.com (brand + tagline, Product / Community link columns, mono base row)

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
    footer.css              Footer
    capabilities.css        Section 04 · Core Capabilities (list + unified-access visual)
    brand.css               Section 03 · Brand & Product (headline with inline provider stack + wing tile)
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
    capabilities.js         Section 04: capability accordion (autoplay + click) driving 4 visual scenes,
                            each with a live loop (provider badge · SDK model cycle · router · request log)
    reveal.js               Generic scroll reveal — adds .in-view to [data-reveal] sections; footer year
  images/
    logo/                   OpenFairy logos (horizontal / icon, light / dark)
    providers/              LLM provider logos
    metrics/                Metric icons, live dot, brand glow, 3D wing render (exported from Figma)
    capabilities/           Route node, OpenFairy mark (on dark), panel glow + texture (exported from Figma)
    brand/                  Provider marks for the inline stack + wing tile image (exported from Figma)
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
