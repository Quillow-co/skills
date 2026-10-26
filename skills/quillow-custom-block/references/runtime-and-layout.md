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

- External scripts, fonts, APIs, fetch/XHR/WebSocket connections, workers,
  `eval`/`new Function`, nested frames, form submission, and privileged APIs.
- Cookies, localStorage, IndexedDB, or other persistent storage.
- Quillow account/page data, theme bridge, supported `postMessage` API,
  automatic iframe resizing, or a manifest height property.

Use ordinary inputs/buttons and event listeners for local interaction, not a
submitted form. State resets on reload. Do not use network requests even to load
local JSON: `connect-src 'none'` blocks them. Use a JS module instead.

## Layout

The block fills its assigned grid cell, not the browser's page. Use responsive
widths, `box-sizing: border-box`, `min-width: 0`, and deliberate overflow handling.
Support narrow cells without horizontal clipping. Allow vertical scrolling when
content needs more height; do not assume the parent will resize.

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
style-src 'unsafe-inline' PREFIX;
img-src data: PREFIX;
font-src PREFIX;
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

Exercise the main interaction, invalid/empty values, keyboard focus, and multiple
cell sizes (for example 280×280 and 640×360). Check console errors, missing assets,
and CSP violations. A plain unsandboxed page does not reproduce this runtime.
