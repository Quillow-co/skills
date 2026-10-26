# Repository instructions

## Commit messages

Use Conventional Commits for every commit title:

```text
<type>[optional scope]: <description>
```

- Write titles in English.
- Use a concise, imperative description without a trailing period.
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Add a scope when useful, such as `packaging`, `validation`, or `skills`.
- Mark breaking changes with `!` before the colon and explain them in a `BREAKING CHANGE:` footer.

Examples:

- `feat(packaging): skip .DS_Store files`
- `fix(validation): reject duplicate archive paths`
- `style: improve code spacing and block formatting`
- `docs: clarify skill installation`
- `build: add Prettier configuration`
