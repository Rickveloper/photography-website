#!/usr/bin/env node
// scripts/check-links.mjs
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

const PAGES = ['index.html','about.html','blog.html','blog-post.html','contact.html','shop.html']

const isRelative = href =>
  href && !/^(https?:|mailto:|tel:|#|data:)/i.test(href)

async function fileExists(relPath) {
  try {
    await fs.access(path.join(SITE_DIR, relPath.replace(/^\.\//, '')))
    return true
  } catch { return false }
}

async function linksInFile(file) {
  const html = await fs.readFile(path.join(SITE_DIR, file), 'utf8')
  const out = []
  const re = /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi
  let m
  while ((m = re.exec(html))) {
    const href = m[1].trim()
    if (isRelative(href)) out.push(href)
  }
  return out
}

async function main() {
  let failures = 0
  for (const page of PAGES) {
    try { await fs.access(path.join(SITE_DIR, page)) } catch { continue }
    const hrefs = await linksInFile(page)
    for (const href of hrefs) {
      const ok = await fileExists(href)
      if (!ok) { console.log(`[missing] ${page} -> ${href}`); failures++ }
    }
  }
  if (failures) process.exit(1)
}
main()
