# Quillow custom block design guide

## Viewports and host chrome

One upload must work at all three baseline CSS-pixel viewports:

| Size   | Grid footprint | Viewport  | Shape  |
| ------ | -------------- | --------- | ------ |
| Small  | 1 × 1          | 156 × 156 | Square |
| Medium | 2 × 1          | 336 × 156 | Wide   |
| Large  | 2 × 2          | 336 × 336 | Square |

The 24 px gap between Quillow blocks is outside the iframe. The host clips the
iframe to the selected corner style and supplies the outer border and shadow. Fill
the viewport, but do not add a second full-size rounded card, border, or shadow
unless the requested concept specifically needs one.

Start with a full-viewport baseline:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
}
```

Use `html[data-quillow-size='1:1']`, `2:1`, and `2:2` for the three
compositions when SDK context is available. Fit content to actual dimensions.
`data-quillow-viewport` is the page's mobile/desktop mode, not block size.
Medium and large are both 336 px wide, so do not infer composition from width
alone. Retain these fallback queries, scoped to `:root:not([data-quillow-size])`
so they cannot override the host composition:

```css
@media (max-width: 220px) and (max-height: 220px) {
  /* Small */
}

@media (min-width: 280px) and (max-height: 220px) {
  /* Medium */
}

@media (min-width: 280px) and (min-height: 280px) {
  /* Large */
}
```

## Compose, do not scale

Build one semantic experience with three intentional compositions:

- **Small:** Show one content item, result, or state at a time. Keep one primary
  action at most. Remove the collection title, introduction, metadata, or
  decoration when the active content already explains the block. Do not preserve
  a header merely because the large composition has one.
- **Medium:** Use the extra width with a horizontal split, side-by-side control
  and result, compact timeline, or wider crop. Use at most two meaningful regions;
  three narrow columns are rarely readable at 336 × 156.
- **Large:** Add useful detail, controls, secondary content, or breathing room.
  Do not simply enlarge the small composition.

Treat responsive design as content editing, not only CSS rearrangement. Rank the
content for each size:

1. Active content or result.
2. The control needed to understand or change it.
3. Orientation such as a short count or state label.
4. Collection title and supporting description.
5. Decoration.

Items 4 and 5 are usually the first to disappear at small. Hiding content at one
size is appropriate when the remaining composition communicates the purpose more
clearly. Remove low-priority structure before shrinking type, clamping essential
copy, or adding scrolling.

For an FAQ, a strong default is:

- Small: omit the FAQ title and introduction; show one question and answer plus
  only the orientation/navigation needed to move through the set.
- Medium: use no more than two regions, such as active question/navigation on the
  left and its answer on the right. Do not add a separate title column.
- Large: show the collection title and the full accordion with one expanded item.

## Spacing and typography

Use a 4 px base spacing rhythm. Good starting points are:

- Outer content inset: 16 px.
- Dense small composition: 12 px when necessary.
- Related-item gaps: 4–8 px.
- Section gaps: 12–16 px.
- Floating-control edge clearance: at least 12 px.

Use `--quillow-typography` with a system font fallback by default. The SDK loads
the host-selected font; CSS inheritance itself does not cross an iframe. A custom
visual identity may instead use a packaged `.woff` or `.woff2` font. Recheck
layout after font loading and live font changes.

Useful type targets:

- Caption or metadata: 12 px / 16 px.
- Compact body: 14 px / 20 px.
- Comfortable body or small heading: 16 px / 24 px.
- Prominent heading: 18–24 px with an appropriate line height.

Essential rendered text must be at least 12 px. Prefer fewer words, progressive
disclosure, or fewer visible items over reducing text below that floor. Test with
realistic long strings rather than ideal demo copy.

## Interaction and scrolling

- Make the whole experience usable with keyboard, touch, and pointer input; do not
  require hover.
- Use semantic HTML and visible focus states. Give icon-only controls accessible
  names.
- Interactive targets must be at least 40 × 40 CSS px, or a smaller visible icon
  must sit inside a containing target of that size.
- Respect `prefers-reduced-motion: reduce` when motion is present.
- Preserve state during resize when practical.

Prefer a stable single-screen composition for small and medium. Do not use a thin
internal scrollbar to rescue a layout with too many regions. First remove
redundant framing, show fewer items, shorten supporting copy, or switch to a paged
single-item interaction. When scrolling is truly the reading experience, give it
a clear boundary and enough width and height to be usable.

## Visual review gates

At all three exact viewports, verify:

- The main idea is recognizable immediately.
- There is no accidental document scrollbar, clipping, overlap, or illegible type.
- Small spends most of its area on the active content rather than framing.
- Medium has no more than two competing regions.
- The host's outer card chrome is not duplicated.
- Spacing and type hierarchy are coherent.
- Controls meet the target-size floor and remain understandable.
- Keyboard focus is visible and ordered sensibly.
- Reduced-motion mode remains usable.
