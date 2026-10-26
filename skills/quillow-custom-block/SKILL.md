---
name: quillow-custom-block
description: Create or edit a Quillow Custom Code block and deliver a validated, upload-ready ZIP with manifest.json. Use when a user requests a custom Quillow widget, local interactive block, calculator, or changes to an existing block package.
compatibility: Requires Node.js 22.20+ and an agent able to create files and run commands. Browser testing is optional and requires browser tools.
---

# Quillow Custom Block

Deliver a working static block and an actual ZIP the user can upload to Quillow.
Respond in the user's language. This skill works with any compatible coding agent;
do not assume a particular editor, terminal tool, installation path, or browser tool.

## Workflow

1. Read [the package contract](references/package-contract.md) and
   [the runtime and layout guide](references/runtime-and-layout.md).
2. Identify purpose, content, interaction, visual style, and expected cell size.
   Use information already supplied; ask only questions that materially affect
   implementation. For unspecified styling, choose a coherent responsive default.
   Resolve requests for live APIs, persistent state, or Quillow data with the user
   before coding: those capabilities are unavailable in v1. Do not invent them or
   silently substitute fake data.
3. Find the installed directory containing this `SKILL.md`; call its absolute
   path `SKILL_DIR`. Check `node --version` (22.20+). Scripts and references are
   relative to this directory, not to the user's working directory. No package
   installation, Python, or system ZIP tool is needed.
4. For a new block, copy the contents of `templates/starter/` to a new working
   directory such as `my-block/` and customize them. Never edit the installed
   template. Prefer plain HTML/CSS/JS. Keep source/build tooling outside the
   directory that will be packaged. Give the manifest a descriptive name.
5. For an existing block, inspect the files before editing and preserve unrelated
   behavior and user content. If only a ZIP was supplied, validate it first with
   `validate.mjs`, then use an available archive tool to extract into a fresh
   directory, preserving paths. If extraction is unavailable, ask for extracted
   files. Do not overwrite the original ZIP. Revisions use a new output filename.
6. Implement accessible controls, input validation, clear empty/error states, and
   responsive layout that works without external resources. Follow the runtime
   guide. Check every HTML/CSS/JS resource reference against the exact filename,
   including capitalization; the archive validator does not inspect references.
7. If browser tools are available, serve files through local HTTP and test in a
   sandboxed iframe with the documented CSP and CORS headers. Test a small cell,
   a wide cell, keyboard interaction, and the main user interaction. Plain
   `file://` or an unsandboxed tab is not a runtime compatibility check. If no
   browser is available, say that visual/runtime checks were not performed.
8. Run the bundled commands, quoting paths with spaces:

   ```sh
   node "$SKILL_DIR/scripts/package.mjs" ./my-block ./my-block.zip
   node "$SKILL_DIR/scripts/validate.mjs" ./my-block.zip
   ```

   Replace `SKILL_DIR` with the actual path using your environment's syntax.
   The output must be outside the input directory and must not already exist.
   Resolve errors and rerun the relevant checks. Do not report success before
   the commands succeed. Do not include the skill itself in the widget ZIP.

9. Provide the actual ZIP download/attachment when supported; otherwise provide
   its full local path. Summarize the block in one or two sentences, state which
   checks ran, and instruct the user to select the ZIP in their Quillow Custom
   Code block's upload control. Upload/application is handled by Quillow; there
   is no separate publish step in v1. Keep editable files for later revisions.

## Completion rules

- Never claim a ZIP exists if the environment only produced text/code snippets.
  If commands or file creation are unavailable, explain the limitation and provide
  the runnable steps instead of a fictitious download link.
- A valid ZIP does not prove JavaScript behavior or visual quality. Report archive
  validation separately from browser checks.
- Keep everything self-contained: no CDN scripts/fonts, analytics, remote APIs,
  secrets, server-side code, or installation steps inside the generated block.
- Do not add manifest properties for height, permissions, theme, or resizing.
