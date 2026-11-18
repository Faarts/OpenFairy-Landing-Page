# OpenFairy Landing Page — Hero

Interactive hero section (1440×900 artboard) with a 3D glass wing built on three.js.

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
  images/
    logo/                   OpenFairy logos (horizontal / icon, light / dark)
    providers/              LLM provider logos
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
