# Marla Measure

A fast, static land-area calculator for Pakistan. It converts square feet, marla, kanal, square yards, square metres and acres, and calculates rectangular area from dimensions. The marla size is selectable because the applicable value varies between property contexts.

## Project files

- `index.html` — marla calculator, crawlable guidance, FAQs and metadata.
- `agricultural-land-converter/index.html` — distinct agricultural land converter with Murabba, acre, kanal and marla guidance.
- `calculator.js` — conversion constants and tested calculation/formatting functions.
- `app.js`, `agricultural.js` / `styles.css` — browser interactions and responsive presentation.
- `site.config.json` — site name and public URL used for canonical and sitemap generation.
- `scripts/build.mjs` — dependency-free static build into `dist/`.
- `tests/calculator.test.mjs` — automated conversion tests using Node's built-in test runner.
- `.github/workflows/pages.yml` — deploys the `dist/` output to GitHub Pages on pushes to `main`.

## Local preview

Install Node.js 24 or newer. No npm packages are required.

```sh
npm test
npm run build
npm run preview
```

Open <http://localhost:4173>. `npm run preview` serves the built `dist/` folder, so run the build first after changes. To build with a one-off public URL, set `SITE_URL` in the environment; otherwise the build reads `publicUrl` from `site.config.json`.

## GitHub Pages deployment

1. Create or use a GitHub repository and push the project to its `main` branch.
2. For the standard GitHub Pages address, the workflow derives `https://OWNER.github.io/REPOSITORY` for project sites and `https://OWNER.github.io` for an `OWNER.github.io` user or organization site repository. To use a custom domain or override that address, set `publicUrl` in `site.config.json` to the exact HTTPS origin and path, without a trailing slash.
3. In the repository settings, choose **Pages → Build and deployment → GitHub Actions**.
4. Push to `main` or run the **Deploy static site to GitHub Pages** workflow manually. The workflow builds the site, including absolute canonical and sitemap URLs, and publishes `dist/`.
5. Check the deployed homepage, `/robots.txt` and `/sitemap.xml`. When the public URL changes, update the single `publicUrl` value and redeploy.

If `publicUrl` is blank, local builds deliberately omit the canonical link and sitemap rather than creating a fake production URL. The GitHub Pages workflow supplies the repository's Pages URL at build time; a configured `publicUrl` takes precedence for custom domains.

### Custom domain

Point the domain's DNS records at GitHub Pages, add the domain in the repository's Pages settings, then set `publicUrl` to the final HTTPS origin (for example `https://www.example.pk`) and redeploy. GitHub Pages manages the domain's `CNAME` configuration through its settings. Confirm the HTTPS site and canonical URL after DNS has propagated.

## Conversion assumptions

The calculator offers 225, 250 and 272.25 square feet per marla, plus a positive custom size. It uses 20 marla per kanal, 9 square feet per square yard and 43,560 square feet per acre. Square metres use 10.7639104167 square feet per square metre. Constants are centralized at the top of `calculator.js`. Confirm the relevant marla definition in the property's scheme documents or records; this tool does not determine official or legal area.

Calculations retain floating-point precision until formatting results to at most two decimal places. Zero is accepted for unit conversions; negative, non-finite and over-limit values are rejected. Rectangular dimension mode requires positive length and width.

## Search Console readiness

After deployment, add the deployed URL-prefix property (or verify the domain property) in Google Search Console and complete the verification method Google provides. Submit `https://YOUR_PUBLIC_URL/sitemap.xml` under **Sitemaps**. Use **URL inspection** for the homepage and request indexing if appropriate. Monitor indexing and search performance reports for impressions, clicks, queries, pages and countries. Sitemap submission and ownership verification must be completed by the site owner; this repository does not submit them.

The site has two indexable URLs: the primary marla and plot-size calculator, and the separate agricultural converter for Murabba and acre conversions. Both pages link to each other. The build generates `robots.txt` and an XML sitemap containing both pages. Canonical tags and sitemap locations are built from `publicUrl`; asset and link references are relative so the site also works beneath a GitHub Pages repository path. Structured data describes each calculator as a `WebApplication`; there are no fabricated organization, rating, review or pricing claims.

The agricultural converter explicitly uses 1 Murabba = 25 acres. Its Marla and Kanal equivalents respond to the selected marla size, while the Murabba-to-acre calculation stays fixed. This is a stated convention, not a claim that every record uses it.

## Privacy and contact

All calculations run in the visitor's browser. The site has no backend, analytics, cookies, or third-party scripts. Add the site's real contact details to the footer before launch; none were supplied with the project. The privacy note describes the current no-data-transfer behavior.
