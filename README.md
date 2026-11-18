# OpenFairy Landing Page

Landing page built on a 1440px-wide design canvas.

**Responsive**
- **≥ 1200px (desktop):** the 1440px canvas scales to the browser width — pixel-matched to Figma (`fit()` in `renderer.js`).
- **< 1200px (tablet / phone):** fluid stacked layout from `responsive.css`; `html.is-compact` is set. The hero's WebGL scene
  resizes to the hero and centres the wing on `.wing-slot`. Phone refinements below 760px.
- The 1200px breakpoint lives in two places: `BREAKPOINT` in `config.js` and the media queries in `responsive.css`.

Sections so far:
1. **Hero** — interactive 3D glass wing (three.js)
2. **Metrics** — "Connections Grow. Intelligence Flows." glass metric cards (Figma frame `89:951`)
3. **Brand & Product** — editorial statement (santalarch-inspired): column hairlines, words fill in on scroll, wing render, copy rows with provider logos.
   The earlier flow-diagram version is kept: open `index.html?s3=diagram` to see it.
4. **Core Capabilities** — "One Entry Point. More Possibilities." (Figma frame `84:2`)
5. **Use cases** — "From Your First AI Feature to Continuously Running Agents" (no Figma frame; built from the page's components)
6. **Footer** — layout adapted from hanusek.com (brand + tagline, Product / Community link columns, mono base row)

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
    usecases.css            Section 05 · Use cases (progress rail + 4 cards with mini previews)
    usecases-variants.css   Section 05 layout explorations (rows / bento / carousel)
    usecases-themes.css     Section 05 background band: ?s5bg=night (default) | orange | light
    join.css                Sections 06 · Membership (member pass, perk tags, marquee ribbons) and 07 · Get Started (CTA card + API console)
    interactions.css        Small interactions for sections 02–05 (spotlight, tilt, wing lean, scene peek)
    footer.css              Footer
    responsive.css          Tablet / phone layout (< 1200px, < 760px) and touch tweaks — loaded last
    capabilities-variants.css  Section 04 layout explorations (tabs / rows / scroll)
    capabilities.css        Section 04 · Core Capabilities (list + unified-access visual)
    statement.css           Section 03 · editorial statement (current)
    brand.css               Section 03 · Brand & Product (statement + model services → OpenFairy → your work diagram)
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
    capabilities-variants.js   Section 04 explorations (?s4=…): rows moves the visual inline, scroll pins the section
    explore.js              ?explore switcher for the section variants
    capabilities.js         Section 04: capability accordion (autoplay + click) driving 4 visual scenes,
                            each with a live loop (provider badge · SDK model cycle · router · request log)
    usecases.js             Section 05: scroll-linked progress rail, card hover → rail node, preview loops
    statement.js            Section 03: word fill on scroll, render parallax, ?s3=diagram switch
    brand.js                Section 03 (diagram version): draws the diagram wires from node positions, routes a live request
    usecases-variants.js    Section 05 explorations (?s5=…): carousel; pinned stack / split / hscroll
    pin.js                  Scroll pinning for the CSS-scaled desktop page (used instead of position:sticky)
    join.js                 S6: pass connects on view, perks follow the pointer, ribbons move with scroll · S7: console cycles model → key → request (hover holds a row)
    hero-hold.js            Hero → S2 transition (desktop): ?hero=sheet (default — hero pins, wing scatters while the scroll holds, S2 rises over it) | off
    smooth.js               Smooth, weighted wheel scrolling (Lenis); touch stays native, off with reduced motion
    nav.js                  Floating nav: shown once the page scrolls, links scroll to sections, active section highlighted
    interactions.js         Spotlight + tilt (S2, S5), wing leans to cursor (S3), hover previews scene (S4) — mouse only
    reveal.js               Generic scroll reveal — adds .in-view to [data-reveal] sections; footer year
  images/
    logo/                   OpenFairy logos (horizontal / icon, light / dark)
    providers/              LLM provider logos
    metrics/                Metric icons, live dot, brand glow (exported from Figma); wing-render.png is no longer used
    capabilities/           Route node, OpenFairy mark (on dark), panel glow + texture (exported from Figma)
    brand/                  Provider marks for the inline stack + wing tile image (exported from Figma)
  libs/
    lenis/                  Lenis 1.3.27 (vendored, MIT) — smooth scrolling
    three/                  three.js r165 (vendored, MIT) + addons used (RoomEnvironment, SVGLoader)
```

## Wide screens

On desktop the 1440px canvas scales with the window until `SMAX` (1.2, about 1728px of content, set in `assets/js/config.js`).
On wider windows it stops growing and the canvas gets wider instead: sections keep their 1440 layout and sit in the centre, while the
hero scene, the S5 panel rules, the S6 ribbons and the footer rule run edge to edge (`--bleed`). The hero also grows to fill the
window height, up to `HMAX` (1200 canvas px), with its content kept centred (`--vpad`).

## Sections 06 & 07

Layout references: agenciex.framer.website (centred tag + title, floating orange tags, tilted marquee ribbons, warm CTA card) and
artify.framer.wiki (icons floating around a centred headline; split CTA whose product visual bleeds off the card's bottom edge).
Both use the same tokens as the rest of the page. Button links (`Join OpenFairy`, `Get Started`, `View Developer Docs`) are still `#`.

## Type scale

Defined once in `base.css` (`--fs-*`, desktop) and `responsive.css` (`--t-*`, tablet/phone). All sections use these — don't hard-code sizes.

| Token | Desktop | Use | Font |
|---|---|---|---|
| `--fs-display` | 96px | S3 statement | Inter Tight 400 |
| `--fs-h2` | 64px | Section titles (S2, S4, S5, S3 diagram) | Inter Tight 400, ink + graphite + orange keyword |
| `--fs-feature` | 40px | Titles in full-width panels / large cards | Inter Tight 400, graphite lead-in + ink |
| `--fs-item` | 30px | List and row titles | Inter Tight 400 |
| `--fs-card` | 24px | Card titles | Inter Tight 400 |
| `--fs-lead` | 20px | Lead paragraphs | Inter 500 |
| `--fs-body` | 15px | Body copy | Inter 400, graphite |
| — | 11–12px | Labels, index pills, tags | Archivo 500/600 caps · JetBrains Mono for code |

## Design explorations

Add `?explore` to the URL to show a small switcher (bottom-left) for flipping between variants.

| Param | Values | Notes |
|---|---|---|
| `s3` | `statement` (default) · `diagram` | Section 03 |
| `s4` | `list` (default) · `tabs` · `rows` · `scroll` · `stage` · `slides` | Section 04 — desktop only; tablet/phone always use the stacked layout |
| `s5` | `panels` (default) · `rail` · `rows` · `bento` · `carousel` · `stack` · `split` · `hscroll` | Section 05 — desktop only. `stack`, `split`, `hscroll`, `panels` (agenciex-style sticky split panels) are pinned / scroll-driven (fall back to `rail` with reduced motion) |
| `s5bg` | `night` (default) · `orange` · `light` | Section 05 background band (full-bleed; product windows stay light) |
| `hero` | `sheet` (default) · `off` | Hero → Section 02 transition (desktop, not with reduced motion) |

Example: `index.html?explore&s4=rows#capabilities`

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
