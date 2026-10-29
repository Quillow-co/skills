# Default Quillow visual style

Use this baseline when the user asks for something basic or simple, asks to match
a general Quillow page, says “default,” or provides no visual direction. A
specific style request or copied creative prompt takes precedence.

## Character

- Clean, friendly, and quiet rather than ornamental or content-themed.
- Strong hierarchy with minimal interface chrome.
- White and neutral surfaces; use purple only for a functional active or focus
  state.
- Subtle dividers, little or no inner shadow, useful whitespace, and concise copy.
- Motion that is brief and functional rather than decorative.

Do not invent an art direction from the subject. For example, an Australia FAQ
should not automatically become a yellow travel poster. Unless requested, omit:

- Eyebrow labels such as “GOOD TO KNOW.”
- Decorative badges, stars, stickers, illustrations, or oversized icons.
- Numbered rows when ordinary labels communicate the structure.
- Content-themed palettes, textures, gradients, and display typography.
- Uppercase decorative copy or editorial-poster treatments.

Start with the minimum useful interface: concise content and only the controls
needed to use it.

## Portable tokens

The iframe cannot inherit Quillow CSS, so define a small local token set. Use
these as defaults, not mandatory brand restrictions:

```css
:root {
  color-scheme: light;
  --qb-bg: #ffffff;
  --qb-surface: #f6f8fa;
  --qb-surface-accent: #f5f1fe;
  --qb-text: #0d0d12;
  --qb-text-muted: #36394a;
  --qb-text-subtle: #818898;
  --qb-border: #edeff3;
  --qb-border-strong: #e2e3e9;
  --qb-accent: #7f51f2;
  --qb-focus: rgba(127, 81, 242, 0.24);
  --qb-radius-sm: 8px;
  --qb-radius-md: 12px;
  --qb-space: 4px;
  --qb-font:
    system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

Do not add a full-size outer radius, border, or shadow: Quillow supplies and clips
the outer block chrome. Inner cards and controls may use their own radius when it
clarifies grouping.

## Component defaults

- Use 16 px content padding, reduced to 12 px for dense small compositions.
- Use 8 px gaps within a row and 12–16 px between sections.
- Use 16 px / 24 px medium-weight headings, 14 px / 20 px body text, and
  12 px / 16 px metadata.
- Use white for the block background. Use the neutral surface sparingly for
  grouping and the accent surface only for meaningful selection.
- Use 1 px neutral dividers or borders. Avoid inner shadows unless an element
  genuinely floats.
- Reserve the accent for focus, selection, state, or one primary action.
- Keep icons simple and visually consistent.

For an accordion, make the entire question row the button, separate rows with
neutral dividers, use an unadorned disclosure icon, and animate only a brief
height/opacity transition that disappears under reduced motion. Apply the
size-specific FAQ composition in the design guide rather than forcing the full
accordion into every viewport.

## Theme limitation

Do not invent or document a Quillow theme message format. Until the platform
publishes a theme-bridge contract, this portable style and system font stack are
the fallback.
