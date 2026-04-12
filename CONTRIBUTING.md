# Contributing to FB Voice Downloader

Thanks for helping improve this extension.

## Ways to Contribute

- Report bugs and edge cases on Facebook or Messenger UI variants.
- Propose UX improvements for injected controls and popup behavior.
- Improve matching reliability between player elements and audio sources.
- Add tests, docs, and developer tooling improvements.

## Before You Start

- Search existing issues and pull requests to avoid duplicate work.
- For significant changes, open an issue first and describe the approach.
- Keep pull requests focused on one clear objective.

## Development Setup

1. Fork and clone the repository.
2. Install dependencies:

```bash
pnpm install
```

3. Start development build:

```bash
pnpm dev
```

4. Load the extension unpacked:
   Open `chrome://extensions` -> enable Developer mode -> Load unpacked -> select the generated extension output folder.

## Branch and Commit Guidelines

- Create feature branches from main.
- Use clear branch names such as `feat/popup-toggle`, `fix/blob-match`, or `docs/contributing`.
- Write concise commits in imperative mood, for example:
  - `feat: improve scanner cleanup when disabled`
  - `fix: handle missing audio metadata safely`
  - `docs: update architecture section`

## Code Style and Quality

- Use TypeScript and preserve existing project structure.
- Avoid unrelated refactors in the same PR.
- Keep changes minimal and focused.
- Update docs if behavior or developer workflow changes.

Run checks before opening a PR:

```bash
pnpm type-check
pnpm build
```

## Pull Request Checklist

- Explain what changed and why.
- Link related issue(s) where applicable.
- Include screenshots or a short GIF for UI changes.
- Confirm local checks pass (`type-check` and `build`).
- Call out any follow-up work that is intentionally out of scope.

## Bug Reports

When reporting bugs, include:

- Browser and version.
- Facebook or Messenger URL context where the issue appears.
- Steps to reproduce.
- Expected behavior and actual behavior.
- Console logs or screen recording if possible.

## Code of Conduct

Be respectful and constructive in all interactions.
