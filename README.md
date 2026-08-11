# Aura Router hosted demo

Publication-oriented static MPA that upgrades to SPA navigation after
`AuraRouter.install()`.

The demo is intentionally different from an SPA shell:

- every public URL has a real `index.html`;
- page content exists before JavaScript runs;
- internal links work with JavaScript disabled;
- Aura Router adopts the first paint and handles later transitions;
- the nested workspace ships the outlet-shaped server markup required for
  nested adoption.

## Public routes

| URL | Purpose |
| --- | --- |
| `/` | Positioning, live navigation proof and quick start |
| `/about/` | HTML-first request/adopt/upgrade flow |
| `/migration/` | Three-step static-site migration |
| `/workspace/` | Nested layout overview |
| `/workspace/settings/` | Child route proving layout persistence |

## Local development

Install the repository and demo dependencies:

```bash
npm ci
npm --prefix demo ci
```

Start the demo:

```bash
npm --prefix demo run dev
```

The `predev` script builds the root library first. Open the URL printed by Vite.

## Production build

```bash
npm --prefix demo run build
```

The command builds the actual package entry from the repository and then emits
the static site to `demo/dist/`.

Preview the result:

```bash
npm --prefix demo run preview
```

## Browser tests

Install Chromium once:

```bash
cd demo
npx playwright install chromium
cd ..
```

Build and run the desktop/mobile tests:

```bash
npm --prefix demo run build
npm --prefix demo run typecheck
npm --prefix demo run test:e2e
```

The suite verifies:

- one meaningful HTML document per public URL;
- SPA transitions without a document reload;
- browser back/forward;
- nested layout persistence;
- full-document navigation with JavaScript disabled;
- a real `404` for unknown direct URLs.

## Deployment

Publish the contents of `demo/dist/` to a static host at the **domain root**.

Suitable targets include Netlify, Cloudflare Pages, Vercel static output,
GitHub Pages with a custom root domain, nginx and S3/CloudFront configured for
directory indexes.

Recommended build settings:

```text
Build command: npm ci && npm --prefix demo ci && npm --prefix demo run build
Publish directory: demo/dist
```

Do not configure a catch-all rewrite to `/index.html`. This is a real MPA: each
route should resolve to its own `*/index.html`, and an unknown direct URL should
remain a static `404`.

### Subfolder hosting

The current router release does not provide `basename`. Root-absolute routes and
assets in this demo therefore assume deployment at `/`, for example:

```text
https://router-demo.example.com/
```

Do not deploy this build under a project subpath such as
`https://example.com/router/` until basename support is available.

## Manual publication check

Before linking the demo from an article:

1. Open each route directly in a new tab.
2. Disable JavaScript and navigate through the primary links.
3. Re-enable JavaScript and confirm the boot token does not change.
4. Navigate between Workspace Overview and Settings and confirm the layout
   instance stays the same.
5. Check keyboard focus, mobile navigation and the browser console.

The live status strip is part of the explanation: a full page load changes its
document counter, boot token and boot time; an Aura transition increments only
the SPA transition count.
