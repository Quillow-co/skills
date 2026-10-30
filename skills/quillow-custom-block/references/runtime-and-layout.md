# Runtime and layout

Quillow serves static package files in an iframe. JavaScript executes in the
visitor's browser, not in Go or the hosting Worker. There is no server build step.

## Supported behavior

- Local DOM interaction, calculations, tabs, counters, and in-memory state.
- Relative scripts, ES modules, styles, images, and fonts from the package.
- Static data embedded in HTML or JavaScript.

Use `./style.css`, `./app.mjs`, and `./assets/image.webp`, not `/assets/...`.
References in CSS and module imports are relative to their containing file.
If using a build tool, build locally and package only compatible output using
relative URLs, with no source maps or dependency manifests.

## Unavailable capabilities

- External scripts, arbitrary external fonts, APIs, fetch/XHR/WebSocket connections, workers,
  `eval`/`new Function`, nested frames, form submission, and privileged APIs.
- Cookies, localStorage, IndexedDB, or other persistent storage.
- Quillow account/page data, automatic iframe resizing, or a manifest height property.

Use ordinary inputs/buttons and event listeners for local interaction, not a
submitted form. State resets on reload. Do not use network requests even to load
local JSON: `connect-src 'none'` blocks them. Use a JS module instead.

## SDK bridge

The starter includes a pinned `@quillow/custom-block-sdk` standalone runtime as
`./runtime.js`, loaded before author scripts. It auto-starts inside an iframe and
exposes `window.Quillow`. Do not also bundle the ESM SDK into that document.
The host supplies live context without reloading the block:

- `theme`: mode, corner style, resolved CSS variables, and font stylesheet.
- `layout`: size (`1:1`, `2:1`, `2:2`), width/height in CSS pixels, and page
  viewport mode (`mobile` or `desktop`).
- `environment`: `editor` or `published`.

The SDK applies `data-quillow-theme`, `data-quillow-size`,
`data-quillow-viewport`, `data-quillow-corner-style`, and
`data-quillow-environment` to `<html>`. Use these and theme tokens in CSS; ordinary
DOM widgets need no subscription. For canvas/charts use
`Quillow.subscribe(render)`, which replays available context and receives full
snapshots. Call the returned unsubscribe function when disposing the component.

Do not block interaction on `Quillow.ready()`. Handle its timeout rejection if
using it. It does not wait for fonts; use the Font Loading API before
font-dependent measurements. Explicit startup/subscription requires an embedded
browser window; standalone previews should use CSS fallbacks. Use the SDK rather
than implementing a separate message protocol.

The SDK manages the host-provided font stylesheet, replacing/removing it on theme
changes. Google Fonts requires CSP allowances for its stylesheet and font origins.
This does not enable arbitrary network requests.

## Layout

The block fills its assigned grid cell, not the browser's page. One package must
support all three baseline CSS-pixel viewports: small at 156 × 156, medium at
336 × 156, and large at 336 × 336. Medium and large have the same width, so use
the SDK size attribute when changing composition. Fit content to actual iframe
dimensions; keep height-aware media queries as a fallback without host context.
A narrow desktop block still has viewport mode `desktop`.

Use responsive widths, `box-sizing: border-box`, `min-width: 0`, and deliberate
overflow handling. Prefer intentional single-screen compositions for small and
medium; do not assume the parent will resize. Read
[the design guide](design-guide.md) for content-priority and review requirements.

Use labels, visible focus indicators, semantic controls, sufficient contrast,
and readable result/error states. Respect reduced motion if adding animation.
Avoid expensive continuous animation and unbounded work in event handlers.

## Browser verification

Serve through local HTTP. The wrapper should use:

```html
<iframe
  src="http://127.0.0.1:PORT/package/index.html"
  sandbox="allow-scripts"
  referrerpolicy="no-referrer"
  title="Custom widget"
  style="width:100%;height:100%;border:0"
></iframe>
```

Do not add `allow-same-origin`. On package responses, use the host's CSP with
`PREFIX` replaced by the complete local package URL ending in `/`:

```text
sandbox allow-scripts;
default-src 'none';
script-src 'unsafe-inline' PREFIX;
style-src 'unsafe-inline' PREFIX https://fonts.googleapis.com;
img-src data: PREFIX;
font-src PREFIX https://fonts.gstatic.com;
connect-src 'none';
worker-src 'none';
frame-src 'none';
object-src 'none';
base-uri 'none';
form-action 'none';
frame-ancestors https: http://localhost:* http://127.0.0.1:*
```

Serve correct MIME types and `Access-Control-Allow-Origin: *` for module/font
requests from the sandbox's opaque origin. Include `X-Content-Type-Options:
nosniff` and `Referrer-Policy: no-referrer`.

Exercise the main interaction, invalid/empty values, keyboard focus, and exactly
156 × 156, 336 × 156, and 336 × 336. Check console errors, missing assets, CSP
violations, clipping, accidental scrolling, and undersized controls. A plain
unsandboxed page does not reproduce this runtime.
