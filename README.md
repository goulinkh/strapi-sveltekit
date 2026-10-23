# Ubuntu, reimagined

A small **Strapi + SvelteKit + Pragma** demo: CMS content becomes static HTML, while an Ubuntu Pro dashboard and sign-in status stay dynamic.

## Run locally

Use **Node.js 24 LTS** and npm (Node 26 also works). No Docker, external database, or real Ubuntu account is needed.

```sh
npm install
npm run setup
npm run dev
```

- **Website:** http://localhost:5173
- **Strapi admin:** http://localhost:1337/admin

Wait for Strapi to start before opening the website. The local CMS admin opens automatically as a demo administrator: no registration or login form. This is separate from the website's demo account.

`setup` generates local environment files with random secrets and keeps existing files. The repository includes [seed data](cms/src/seed/content.json) for pages, posts and categories. Strapi loads it into SQLite on startup without overwriting existing entries. Local databases, uploads and secrets are Git-ignored.

## How it works

- **Public pages:** SvelteKit reads published Strapi content during the build and produces static HTML. `/catalogue` shows the built pages as a file tree, grouped into CMS-defined categories such as Case studies and Comparisons. Categories have no fixed page count; new pages are included on the next build.
- **Private account:** `/pro` is rendered on the server after checking the session. The header checks sign-in status in the browser, so the same public HTML can serve signed-in and anonymous visitors.
- **Design:** Pragma supplies the UI components. Ordinary HTML and global CSS provide the green static / purple dynamic highlights; these labels do not control rendering.

Open `/pro`, sign in as **Alex**, then return to a public page to see the shared login status.

## Try the built site

With Strapi running, use another terminal:

```sh
npm run build
npm run start:web
```

Open http://localhost:3000. Static files are in `web/build/prerendered/`. Stop Strapi and reload: public pages, sign-in and the dashboard still work. The website's Node server must stay running for the account routes.

After publishing CMS changes, stop the website server, run `npm run build:web`, then `npm run start:web`. Restarting is required because a rebuild replaces the server's generated files.

## Checks

```sh
npm run check
npm test
npm run format:check
npm run test:cms              # Requires running Strapi
npx playwright install chromium
npm run test:e2e              # Build the website first
npm run test:admin            # Requires running Strapi
```

## Demo limits

Sign-in is intentionally password-free, not Ubuntu SSO. Accounts, machines and case studies are fictional. Product copy is adapted from [Ubuntu.com sources](cms/src/seed/SOURCES.md).

**The CMS admin is open to anyone who can reach the local demo.** `DEMO_ADMIN_OPEN_ACCESS=true` is localhost-only and refused in production. Set it to `false` to require normal Strapi login; create a regular administrator first. Do not expose or proxy this demo publicly. Replace demo authentication and review dependency advisories before any deployment.
