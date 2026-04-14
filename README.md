# Siba Spatial Web

Static export hardening for `sibaege.framer.website`, rebuilt as a public engineering artifact around a deterministic premium model switcher.

## Architecture

The repository preserves the mirrored site layout because the exported site depends on sibling asset paths:

```text
.
├── framerusercontent.com/              # Mirrored asset host
├── sibaege.framer.website/             # Mirrored site pages
│   ├── index.html                      # English homepage
│   ├── tr/index.html                   # Turkish homepage
│   ├── assets/
│   │   ├── model-switcher.css          # Premium interaction shell
│   │   ├── model-switcher.js           # Progressive enhancement mount
│   │   └── model-switcher-data.json    # Extracted manifest for switcher content
│   └── <brand>/<model>.html            # Detail pages per vehicle
```

## Switcher Design

The original models block is a compiled tabbed surface inside `section#pricing`. Rather than editing generated bundles, the enhancement mounts alongside the existing section and hides the original only after the new UI renders successfully.

Key decisions:

- `section#pricing` remains the single mount point.
- The original markup stays in the page as a no-enhancement fallback.
- The premium switcher is manifest-driven instead of bundle-driven because the compiled tab state is brittle to automate reliably in a mirrored export.
- All injected nodes use `data-siba-*` attributes to avoid coupling to hashed class names.

## Rendering + Motion

The upgraded switcher keeps the site's existing ivory-and-ink continuity while tightening the interaction feel:

- Centered liquid-glass tab rail with a geometry-accurate active indicator.
- Magnetic pointer response on inactive brand tabs.
- Depth-based card transitions between brands.
- Pointer parallax on card media for tactile motion without heavy 3D overhead.
- Mobile scroll-snap card carousel with reduced-motion fallbacks.
- Light frosted content stage instead of a standalone dark block, so the section stays visually continuous with the original homepage.

The motion system is implemented in plain CSS and DOM APIs to keep the export portable and dependency-free.

## Content Pipeline

`model-switcher-data.json` is the deterministic content source for the enhanced switcher.

- The manifest preserves the original homepage card imagery selected in the source experience, including assets that were not present in the initial mirror.
- Dongfeng, Ridarra, Geely EX5, and Forthing Friday summaries were extracted from the original homepage tab state rather than rewritten from detail pages.
- Relative paths are resolved at runtime so the same manifest works on both `/sibaege.framer.website/index.html` and `/sibaege.framer.website/tr/index.html`.

This avoids mutating the compiled page logic while still correcting the broken visible route pattern for detail links.

## Local Preview

Serve from the repository root so both `sibaege.framer.website/` and `framerusercontent.com/` resolve correctly:

```bash
python3 -m http.server 8124
```

Then open:

- `http://127.0.0.1:8124/sibaege.framer.website/index.html`
- `http://127.0.0.1:8124/sibaege.framer.website/tr/index.html`

## Known Constraints

- The Turkish homepage is only partially localized in the source export.
- Some mirrored detail pages contain inconsistent internal naming/spec copy. Example: Ridarra route naming and detail-page headings do not fully agree.
- Map embeds still need verification outside local static preview.
- The original compiled switcher still contains its own route/state inconsistencies if the enhancement is disabled.

## Why This Repo Exists

This repository is not an editable source project. It is a hardened static mirror with a purpose-built enhancement layer.

That distinction matters because the implementation strategy is architectural:

- preserve the export
- isolate custom behavior
- normalize preexisting route defects in the visible UI
- document the system clearly enough to review, extend, or rebuild later
