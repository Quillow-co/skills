# Quillow skills

Portable agent skills for building Quillow blocks. The first skill,
**quillow-custom-block**, creates and edits static Custom Code widgets and delivers
a validated ZIP containing `manifest.json`, HTML, CSS, JavaScript, and local assets.

## Install

Requires **Node.js 22.20+** and a coding agent with file and command access.

```sh
npx skills add Quillow-co/skills --skill quillow-custom-block
```

Choose your agents in the installer (for example Claude Code, Codex, or Cursor).
Add `-g` to install across projects. The skill's ZIP tools include their runtime
dependencies: no additional `npm install`, Python, or system ZIP command is needed.
Installation from GitHub works after this repository's contents are pushed.

## Use

Ask your agent:

> Create a Quillow custom block: a consultation calculator with a light theme,
> session duration and quantity controls. Give me a ZIP I can upload.

For revisions:

> Update my existing Quillow block: change the accent color and add a 90-minute
> option. Preserve the existing functionality and generate a new ZIP.

The agent keeps editable files, validates the resulting ZIP, and provides a file
path or downloadable artifact depending on its environment. Select that ZIP in
your Quillow Custom Code block's upload control. Quillow validates and applies
uploads automatically; no separate publish step is required. Your plan must
include Custom Code access.

The runtime supports local interactivity, not remote APIs, CDN resources,
persistent storage, or Quillow data access. See the skill's
[package contract](skills/quillow-custom-block/references/package-contract.md) and
[runtime guide](skills/quillow-custom-block/references/runtime-and-layout.md).

## Run the tools directly

From this repository (or adjust paths for the installed skill):

```sh
node skills/quillow-custom-block/scripts/package.mjs skills/quillow-custom-block/templates/starter ./custom-block-starter.zip
node skills/quillow-custom-block/scripts/validate.mjs ./custom-block-starter.zip
```

Package only a clean directory of widget files. The output must be outside it and
must not already exist. Use a new filename for each revision. Validation checks
the archive contract, not browser behavior or resource references.

## Development

```sh
npm ci
npm run format
npm run build
npm run check
```

Edit `src/` and rebuild; commit the generated `skills/quillow-custom-block/scripts/`
and `THIRD_PARTY_NOTICES` with source changes. `check:build` detects stale bundles.
Prettier formats source, documentation, and templates using `.prettierrc.json`,
including import sorting. Generated bundles are excluded. Run `npm run format`
before rebuilding; `npm run format:check` verifies formatting without modifying
files and runs as part of `npm run check` in CI.
`npm test` includes malformed ZIP fixtures and standalone-bundle execution outside
the repository. Browser tests run separately:

```sh
npx playwright install chromium
npm run test:browser
```

The browser test uses a local HTTP host with the sandbox/CSP/CORS contract from
Quillow. CI runs this test along with archive tests and bundle checks.

### Contract maintenance

The contract is based on `quillow-apis`'s
`apps/api/internal/services/widget_packages/archive.go` and
`apps/widget-host/src/index.js` as reviewed on 2026-10-26. Recheck those sources
whenever the backend contract changes. Keep limits, documentation, fixtures, and
starter synchronized. The local validator intentionally enforces canonical
manifest spelling and valid Unicode instead of relying on Go decoder quirks.

### Installation smoke test

Before publishing, install from this directory into a disposable project:

```sh
npx skills add /absolute/path/to/skills --skill quillow-custom-block -a claude-code -a codex --copy -y
```

Check both installed copies include scripts, references, and the starter. Run the
packaging command from an installed copy. Then exercise a creation/revision prompt
in each target agent; installation compatibility alone does not verify agent behavior.
