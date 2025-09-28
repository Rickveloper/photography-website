#!/usr/bin/env node
// scripts/lighthouse.mjs
import http from 'node:http'
import path from 'node:path'
import { promises as fs } from 'node:fs'
import { spawn } from 'node:child_process'

const ROOT = process.cwd()
const CANDIDATE_DIRS = [ROOT, path.join(ROOT, 'photography-portfolio')]
const SITE_DIR = await (async () => {
  for (const d of CANDIDATE_DIRS) {
    try { await fs.access(path.join(d, 'index.html')); return d } catch {}
  }
  return ROOT
})()
const PORT = 8080

function contentType(p) {
  if (p.endsWith('.html')) return 'text/html; charset=utf-8'
  if (p.endsWith('.css')) return 'text/css; charset=utf-8'
  if (p.endsWith('.js')) return 'text/javascript; charset=utf-8'
  if (p.endsWith('.json')) return 'application/json; charset=utf-8'
  if (p.endsWith('.xml')) return 'application/xml; charset=utf-8'
  if (p.endsWith('.webp')) return 'image/webp'
  if (p.endsWith('.jpg') || p.endsWith('.jpeg')) return 'image/jpeg'
  if (p.endsWith('.png')) return 'image/png'
  return 'application/octet-stream'
}

const server = http.createServer(async (req, res) => {
  let reqPath = decodeURIComponent(new URL(req.url, `http://127.0.0.1:${PORT}`).pathname)
  if (reqPath === '/') reqPath = '/index.html'
  const full = path.join(SITE_DIR, reqPath)
  try {
    const data = await fs.readFile(full)
    res.writeHead(200, { 'Content-Type': contentType(full) })
    res.end(data)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found')
  }
})

function runLighthouse() {
  return new Promise((resolve, reject) => {
    const bin = path.join(ROOT, 'node_modules', '.bin', 'lighthouse')
    const args = [
      `http://127.0.0.1:${PORT}/index.html`,
      '--quiet',
      '--chrome-flags=--headless=new',
      '--only-categories=performance',
      '--output=json',
      '--output-path=stdout'
    ]
    const cp = spawn(bin, args, { stdio: ['ignore', 'pipe', 'inherit'] })
    let out = ''
    cp.stdout.on('data', d => (out += d.toString()))
    cp.on('close', code => {
      if (code !== 0) return reject(new Error(`lighthouse exited ${code}`))
      try {
        const report = JSON.parse(out)
        const perf = report.categories.performance.score
        console.log('Lighthouse Performance:', perf)
        if (perf < 0.9) return reject(new Error(`Performance below threshold: ${perf}`))
        resolve()
      } catch (e) { reject(e) }
    })
  })
}

server.listen(PORT, async () => {
  try { await runLighthouse(); process.exit(0) }
  catch (e) { console.error(e.message); process.exit(1) }
  finally { server.close() }
})
