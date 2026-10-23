import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const config = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
const publicUrl = (process.env.SITE_URL || config.publicUrl || '').trim().replace(/\/$/, '');
if (publicUrl) {
  let parsed;
  try { parsed = new URL(publicUrl); } catch { throw new Error('SITE_URL must be a valid HTTPS public URL.'); }
  if (parsed.protocol !== 'https:' || parsed.search || parsed.hash || parsed.username || parsed.password) throw new Error('SITE_URL must be an HTTPS base URL without credentials, query or fragment.');
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'agricultural.js', 'calculator.js', 'favicon.svg', 'favicon.png']) await cp(path.join(root, file), path.join(out, file));
await cp(path.join(root, 'agricultural-land-converter'), path.join(out, 'agricultural-land-converter'), { recursive: true });
const htmlPath = path.join(out, 'index.html');
let html = await readFile(htmlPath, 'utf8');
html = html.replaceAll('{{SITE_NAME}}', escapeHtml(config.siteName));
if (publicUrl) html = html.replace('<!-- CANONICAL_URL -->', `<link rel="canonical" href="${publicUrl}/">`);
await writeFile(htmlPath, html);
const agriculturePath = path.join(out, 'agricultural-land-converter', 'index.html');
let agricultureHtml = await readFile(agriculturePath, 'utf8');
agricultureHtml = agricultureHtml.replaceAll('{{SITE_NAME}}', escapeHtml(config.siteName));
if (publicUrl) agricultureHtml = agricultureHtml.replace('<!-- CANONICAL_URL -->', `<link rel="canonical" href="${publicUrl}/agricultural-land-converter/">`);
await writeFile(agriculturePath, agricultureHtml);
const robots = publicUrl ? `User-agent: *\nAllow: /\n\nSitemap: ${publicUrl}/sitemap.xml\n` : 'User-agent: *\nAllow: /\n';
await writeFile(path.join(out, 'robots.txt'), robots);
if (publicUrl) {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${publicUrl}/</loc></url><url><loc>${publicUrl}/agricultural-land-converter/</loc></url></urlset>\n`;
  await writeFile(path.join(out, 'sitemap.xml'), sitemap);
}
await writeFile(path.join(out, '.nojekyll'), '');
console.log(`Built ${out}${publicUrl ? ` for ${publicUrl}` : ' (public URL not configured)'}`);

function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
