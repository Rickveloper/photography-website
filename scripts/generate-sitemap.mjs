// scripts/generate-sitemap.mjs
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const CANDIDATE_DIRS = [ROOT, path.join(ROOT, 'photography-portfolio')]
const SITE_DIR = await (async () => {
  for (const d of CANDIDATE_DIRS) {
    try { await fs.access(path.join(d, 'index.html')); return d } catch {}
  }
  return ROOT
})()

const PUBLIC_DIR = path.join(SITE_DIR, 'public')
const OUT = path.join(PUBLIC_DIR, 'sitemap.xml')
const CONFIG_PATH = path.join(ROOT, 'site.config.json')

const PAGES = ['index.html','about.html','blog.html','blog-post.html','contact.html','shop.html']

async function readConfig() {
  const raw = await fs.readFile(CONFIG_PATH, 'utf8')
  const json = JSON.parse(raw)
  if (!json.siteUrl) throw new Error('siteUrl missing in site.config.json')
  return json
}
function toUrl(base, file) {
  const clean = file === 'index.html' ? '' : `/${file}`
  return `${base.replace(/\/+$/, '')}${clean}`
}
async function lastMod(file) {
  const stat = await fs.stat(path.join(SITE_DIR, file))
  return stat.mtime.toISOString().slice(0, 10)
}

const exists = p => fs.access(p).then(() => true).catch(() => false)

async function main() {
  const { siteUrl } = await readConfig()
  await fs.mkdir(PUBLIC_DIR, { recursive: true })

  const items = []
  for (const f of PAGES) {
    const full = path.join(SITE_DIR, f)
    if (await exists(full)) {
      items.push({ url: toUrl(siteUrl, f), lm: await lastMod(f) })
    }
  }

  const body = items.map(i => `  <url>
    <loc>${i.url}</loc>
    <lastmod>${i.lm}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${i.url.endsWith('/') ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
  await fs.writeFile(OUT, xml, 'utf8')
  console.log(`Wrote ${path.relative(ROOT, OUT)} with ${items.length} URLs (site dir: ${path.relative(ROOT, SITE_DIR) || '.'})`)
}
main().catch(e => { console.error(e.message); process.exit(1) })
