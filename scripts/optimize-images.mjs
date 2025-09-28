// scripts/optimize-images.mjs
import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const CANDIDATE_DIRS = [ROOT, path.join(ROOT, 'photography-portfolio')]
const SITE_DIR = await (async () => {
  for (const d of CANDIDATE_DIRS) {
    try { await fs.access(path.join(d, 'public', 'images')); return d } catch { }
  }
  return ROOT
})()

const IMG_ROOT = path.join(SITE_DIR, 'public', 'images')
const VERIFY = process.argv.includes('--verify')
const FIX_INVALID = process.argv.includes('--fix-invalid') || process.argv.includes('--placeholders')

// tiny neutral placeholder color
const PLACEHOLDER = { width: 8, height: 8, channels: 3, background: { r: 230, g: 230, b: 230 } }

async function walk(dir, out = []) {
  let ents
  try { ents = await fs.readdir(dir, { withFileTypes: true }) } catch { return out }
  for (const ent of ents) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) await walk(p, out)
    else out.push(p)
  }
  return out
}
const isRaster = p => /\.(png|jpe?g)$/i.test(p)

async function createPlaceholderPair(dstBase) {
  const jpgPath = dstBase + '.jpg'
  const webpPath = dstBase + '.webp'
  const img = sharp({ create: PLACEHOLDER })
  const jpgBuf = await img.jpeg({ quality: 60 }).toBuffer()
  await fs.writeFile(jpgPath, jpgBuf)
  const webpBuf = await sharp(jpgBuf).webp({ quality: 60 }).toBuffer()
  await fs.writeFile(webpPath, webpBuf)
  console.log('⚠ replaced with placeholder:', path.relative(ROOT, jpgPath), 'and', path.relative(ROOT, webpPath))
}

async function ensureWebpFor(file) {
  const dir = path.dirname(file)
  const base = path.basename(file).replace(/\.(png|jpe?g)$/i, '')
  const jpgPath = path.join(dir, `${base}.jpg`)        // we'll normalize invalids to a small jpg
  const webpPath = path.join(dir, `${base}.webp`)

  try {
    const srcStat = await fs.stat(file)
    const dstStat = await fs.stat(webpPath).catch(() => null)
    // If webp is up-to-date, skip
    if (dstStat && dstStat.mtimeMs >= srcStat.mtimeMs) return false

    const buf = await fs.readFile(file)
    // Verify it's an actual image; throws if corrupted/unsupported
    await sharp(buf).metadata()

    // Create webp
    const out = await sharp(buf)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer()

    await fs.writeFile(webpPath, out)
    console.log('✔ wrote', path.relative(ROOT, webpPath))
    return true
  } catch (e) {
    // Invalid/corrupted file
    if (FIX_INVALID) {
      // Create fresh placeholder JPEG + WebP pair at the same basename
      await createPlaceholderPair(path.join(dir, base))
      return true
    } else {
      console.error('✖ failed:', path.relative(ROOT, file), '-', e.message)
      return false
    }
  }
}

async function verifyWebp(file) {
  const dir = path.dirname(file)
  const base = path.basename(file).replace(/\.(png|jpe?g)$/i, '')
  const webp = path.join(dir, `${base}.webp`)
  try { await fs.access(webp); return true }
  catch { console.log('WebP missing for:', path.relative(ROOT, file)); return false }
}

async function main() {
  const files = (await walk(IMG_ROOT)).filter(isRaster)
  if (!files.length) {
    console.log('No images found under', path.relative(ROOT, IMG_ROOT) || './public/images')
    return
  }

  if (VERIFY) {
    let ok = true
    for (const f of files) ok = (await verifyWebp(f)) && ok
    if (!ok) process.exit(1)
    return
  }

  let wrote = 0
  for (const f of files) {
    const did = await ensureWebpFor(f)
    if (did) wrote++
  }
  console.log(`Done. Processed ${files.length} files, wrote/updated ${wrote} outputs.`)
}

main()
