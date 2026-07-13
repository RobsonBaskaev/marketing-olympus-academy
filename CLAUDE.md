# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

"Маркетинг Олимп" (Marketing Olympus) is a Russian-language, client-only interactive marketing training
app: lessons, case simulators, a business diagnostic tool, and a portfolio/backup system. It is a static
export (no backend, no database) built with Next.js App Router and deployed to GitHub Pages. All learner
progress lives in the browser's `localStorage`; there is no server-side persistence.

## Commands

- `pnpm install` — install dependencies (Node 20+, pnpm; CI uses Node 24 / pnpm 10).
- `pnpm dev` — run the dev server at `http://localhost:3000`.
- `pnpm build` — static export via Next.js (`output: "export"`) into `dist/`.
- `pnpm start` — serve the production build (`next start`).
- `pnpm check` — the full gate: `build` → `verify` → all `test:*` scripts. Run this before considering
  work done; it's also what CI (`.github/workflows/pages.yml`) runs before deploying to Pages.
- `pnpm verify` — runs `scripts/verify-site.mjs` against the **built** `dist/` output (must `build` first).
  This is a static-analysis/content-guard script, not a browser test — see "Content-guard tests" below.
- Individual logic tests (each is a standalone Node script, no test runner/framework):
  - `pnpm test:rubric` → `scripts/test-case-rubric.mjs`
  - `pnpm test:progress` → `scripts/test-lesson-progress.mjs`
  - `pnpm test:analytics` → `scripts/test-analytics-validation.mjs`
  - `pnpm test:business` → `scripts/test-business-diagnostic.mjs`
  - Run one directly, e.g. `node scripts/test-lesson-progress.mjs`, when iterating on a single `app/lib/*.mjs`
    module — no filtering flags exist since these aren't a jest/vitest suite.
- `pnpm test:smoke` — browser smoke test (`scripts/test-smoke.mjs`): serves the built `dist/` and drives it
  in headless Chromium (analytics funnel clamp, case rubric, 404 links, Pro form, service-worker cache).
  Requires playwright (resolved from `NODE_PATH` or a global install); exits 0 with a SKIPPED message when
  playwright is unavailable, so it is intentionally not part of `pnpm check`/CI.

There is no lint script configured in `package.json`.

## Architecture

### Routing: one folder per module under `app/`

Every top-level directory in `app/` (`research/`, `strategy/`, `acquisition/`, `analytics/`, `olympus/`,
`learn/`, `diagnostic/`, `cases/`, `library/`, `business-diagnostic/`, `backup/`, `skills/`, `review/`,
`start/`, `curriculum/`, `teams/`, `sources/`, `glossary/`, `methodology/`, `faq/`, `pro/`) is a Next.js route
mapping 1:1 to a page on the site. `scripts/verify-site.mjs` hardcodes this route list (`requiredRoutes`)
and fails the build if a route's exported HTML goes missing — update that list when adding/removing a route.

### Server metadata / client interactivity split

Routes follow a consistent two-file pattern:
- `layout.js` or `page.js` (server component, no `"use client"`) exports `metadata` built via
  `routeMetadata(path, title, description)` from `app/lib/seo.mjs`, which sets canonical URL, Open Graph
  tags, etc. consistently for every page.
- The actual UI is a `"use client"` component (either `page.js` itself for small routes, or a sibling like
  `planner.js`, `case-lab.js`, `library-browser.js`, `skills-dashboard.js`, `review-dashboard.js`,
  `start-planner.js`, `diagnostic.js` for larger ones) holding all state, effects, and content.

### Content lives inline in JS, not in data files

There are no JSON/CMS content files. Lessons, case studies, diagnostic questions, method library entries,
etc. are plain JS arrays/objects defined directly at the top of the client component (e.g. the `lessons`,
`cases`, and `routeModules` arrays in `app/page.js`, or `app/library/methods.mjs` for the searchable method
library). Code in this repo is written densely/minified-by-hand (little whitespace, no comments) — match
that style when editing existing files rather than reformatting them.

### Progress persistence via localStorage

There is no backend. Each module reads/writes its own namespaced `localStorage` key on mount/change
(`olymp-progress`, `olymp-diagnostic`, `olymp-diagnostic-history`, `olymp-research`, `olymp-strategy`,
`olymp-acquisition`, `olymp-analytics`, `olymp-case-lab`, `olymp-business-diagnostic`, `olymp-profile`,
`olymp-mode`, `olymp-answers`, `olymp-coach-answer`, `olymp-capstone`, `olymp-pro-request`). The `backup/`
route aggregates all
of these keys for export/import so users can move progress between devices — when adding a new persisted
key, wire it into the backup page's include list too (verify-site checks for a few of these explicitly).

### Fonts are self-hosted

Manrope and Playfair Display woff2 subsets live in `app/fonts/` and are declared via `@font-face` at the
top of `app/globals.css` (relative `url("./fonts/...")` so Next bundles them with the correct asset
prefix). Do not reintroduce a CSS `@import` of Google Fonts — verify-site fails on any
`fonts.googleapis.com` reference in `globals.css`.

### Shared logic in `app/lib/*.mjs`

Pure, framework-free helper modules used by both the client components and the `scripts/test-*.mjs`
scripts (imported with relative `../app/lib/...` paths):
- `lesson-progress.mjs` — completion reconciliation (`reconcileCompletedLessons`, `nextIncompleteLesson`,
  `MIN_LESSON_ANSWER`) for the home-page lesson flow.
- `case-rubric.mjs`, `analytics-validation.mjs`, `business-diagnostic.mjs` — evaluation/validation logic
  for their respective modules (case answers, funnel/analytics math, business diagnostic scoring).
- `seo.mjs` — `SITE_URL`, `canonicalUrl`, `routeMetadata` shared by every route's metadata export.

Keep this logic here (not inline in components) precisely because the `test:*` scripts unit-test it in
isolation from React/Next.

### Content-guard tests (`scripts/verify-site.mjs`)

This script is unusual: instead of behavioral/DOM testing, it reads the **raw source files** of specific
pages (`app/page.js`, `app/cases/case-lab.js`, `app/diagnostic/diagnostic.js`, etc.) as strings and asserts
that specific literal markers are present (Russian UI copy, class names like `strong-answer`, function
names like `evaluateCaseAnswer`, localStorage key names, exact counts like "diagnostic must have exactly
three mini-cases"). It also validates the exported `dist/` HTML: required routes exist, every page has
`lang="ru"`, `<title>`, meta description, correct canonical/OG URLs matching `basePath`, no broken internal
links, PWA manifest/service worker sanity, and that `backup/` is excluded from `sitemap.xml`.

Implication for edits: renaming a copy string, CSS class, or exported function that appears in this script's
marker lists will fail `pnpm verify` even if the app still works correctly. When intentionally changing such
text/identifiers, update the corresponding marker in `scripts/verify-site.mjs` in the same change.

### Static export / GitHub Pages specifics

`next.config.mjs` sets `output: "export"`, `distDir: "dist"`, and a conditional `basePath`/`assetPrefix` of
`/marketing-olympus-academy` — active only when `GITHUB_ACTIONS === "true"` (set by CI), empty locally. This
means internal links use relative paths like `href="research/"` (not `next/link` with absolute paths), and
`trailingSlash: true` is required for the exported static routes to resolve correctly on Pages. The site is
fully static: no API routes, no server components with data fetching, no middleware.

Deployment is automatic: `.github/workflows/pages.yml` builds, runs `pnpm verify` against the export, and
deploys `dist/` to GitHub Pages on every push to `main`.
