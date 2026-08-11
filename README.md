# Aura Router hosted demo

Static multi-page demo that adds client-side navigation after
`AuraRouter.install()`.

The demo keeps a complete HTML page at every public URL:

- every public URL has a real `index.html`;
- page content exists before JavaScript runs;
- internal links work with JavaScript disabled;
- Aura Router reuses the initial page content and handles later client transitions;
- the nested workspace includes the parent and child outlet structure required
  to reuse the initial nested page.

## Public routes

| URL | Purpose |
| --- | --- |
| `/` | Overview, live navigation proof and quick start |
| `/about/` | How the initial page becomes client navigation |
| `/migration/` | Three-step static-site migration |
| `/workspace/` | Nested layout overview |
| `/workspace/settings/` | Child route proving layout persistence |

## Local development

Install dependencies:

```bash
npm ci
```

Start the demo:

```bash
npm run dev
```

The demo consumes the published `@auraui/router@0.1.0` package from npm. Open
the URL printed by Vite.

## Production build

```bash
npm run build
```

The command bundles the installed router package and emits the static site to
`dist/`.

Preview the result:

```bash
npm run preview
```

## Browser tests

Install Chromium once:

```bash
npx playwright install chromium
```

Build and run the desktop/mobile tests:

```bash
npm run build
npm run typecheck
npm run test:e2e
```

The suite verifies:

- one meaningful HTML document per public URL;
- client transitions without a document reload;
- browser back/forward;
- nested layout persistence;
- full-document navigation with JavaScript disabled;
- a real `404` for unknown direct URLs.

## Deployment

Publish the contents of `dist/` to a static host at the **domain root**.

Suitable targets include Netlify, Cloudflare Pages, Vercel static output,
GitHub Pages with a custom root domain, nginx and S3/CloudFront configured for
directory indexes.

Recommended build settings:

```text
Build command: npm ci && npm run build
Publish directory: dist
```

Do not configure a catch-all rewrite to `/index.html`. Each route should resolve
to its own `*/index.html`, and an unknown direct URL should remain a static
`404`.

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
3. Re-enable JavaScript and confirm the Load ID does not change.
4. Navigate between Workspace Overview and Settings and confirm the layout ID
   stays the same.
5. Check keyboard focus, mobile navigation and the browser console.

The live navigation proof strip is part of the explanation: a full page load changes
the full-page counter, Load ID, and start time. An Aura transition increments
only the client-transition count.
