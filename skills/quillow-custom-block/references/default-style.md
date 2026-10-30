# Default Quillow visual style

Use this baseline when the user asks for something basic or simple, asks to match
a general Quillow page, says “default,” or provides no visual direction. A
specific style request or copied creative prompt takes precedence.

## Character

- Clean, friendly, and quiet rather than ornamental or content-themed.
- Strong hierarchy with minimal interface chrome.
- Host theme surfaces and text; use the selected accent for functional active or
  focus states. White and purple are standalone fallbacks.
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

The iframe receives resolved theme tokens through the bundled SDK. Map local
tokens to them and provide fallbacks for previews and the first render:

```css
:root {
  color-scheme: light;
  --qb-bg: var(--quillow-surface-color, #ffffff);
  --qb-text: var(--quillow-text-color, #0d0d12);
  --qb-surface: color-mix(in srgb, var(--qb-text) 4%, var(--qb-bg));
  --qb-text-muted: color-mix(in srgb, var(--qb-text) 80%, var(--qb-bg));
  --qb-border: color-mix(in srgb, var(--qb-text) 15%, var(--qb-bg));
  --qb-accent: var(--quillow-accent-color, #7f51f2);
  --qb-accent-text: var(--quillow-accent-text-color, #ffffff);
  --qb-focus: var(--qb-accent);
  --qb-radius-sm: min(var(--quillow-radius, 8px), 12px);
  --qb-radius-md: 12px;
  --qb-space: 4px;
  --qb-font: var(--quillow-typography, system-ui, sans-serif);
}

:root[data-quillow-theme='dark'] {
  color-scheme: dark;
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
- Use the host surface for the block background. Use the neutral surface sparingly for
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

## Live theme

Let the SDK manage theme variables, attributes, and the font stylesheet. CSS
updates automatically; do not cache resolved colors or recreate the DOM on theme
changes. Use contrasting accent text for buttons and check focus and muted text
in both modes. A specific visual direction may override tokens deliberately.
