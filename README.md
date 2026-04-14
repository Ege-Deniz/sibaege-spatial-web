# Siba E-Motion

Interactive enhancement layer for the Siba E-Motion EV dealership site, built on top of a hardened static export.

## Structure

```
media/          Remote assets (fonts, video, product images)
site/           Site pages
  index.html    English homepage
  tr/           Turkish locale
  assets/       Enhancement scripts and styles
```

## What Was Built

Custom behavior is mounted as an isolated layer alongside the exported site — no generated bundles were modified. All injected nodes use `data-siba-*` attributes and degrade gracefully without JavaScript.

**Model Switcher** — manifest-driven brand/model switcher replacing the compiled tab component. Liquid-glass tab rail, magnetic hover response, depth-based card transitions, pointer parallax on media, mobile scroll-snap carousel.

**Hero Reactive Overlay** — Canvas 2D layer over the hero video. Pointer-tracking spotlight with eased interpolation, ripple bursts on click, `mix-blend-mode: screen`, reduced-motion safe.

## Stack

Vanilla JS and CSS — no framework, no build step, no dependencies.
