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

const PLACEHOLDER = { width: 8, height: 8, channels: 3, background: { r: 230, g: 230, b: 230 } }
const SIZES = [960, 1440, 1920]

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
const isRaster = p => /(\.(png|jpe?g))$/i.test(p)

async function tinyBlurDataURL(inputBuf) {
    const tiny = await sharp(inputBuf).resize({ width: 24 }).jpeg({ quality: 40 }).toBuffer()
    const base64 = tiny.toString('base64')
    return `data:image/jpeg;base64,${base64}`
}

async function createPlaceholderPair(dstBase) {
    const img = sharp({ create: PLACEHOLDER })
    const jpgBuf = await img.jpeg({ quality: 60 }).toBuffer()
    await fs.writeFile(dstBase + '.jpg', jpgBuf)
    const webpBuf = await sharp(jpgBuf).webp({ quality: 60 }).toBuffer()
    await fs.writeFile(dstBase + '.webp', webpBuf)
    const avifBuf = await sharp(jpgBuf).avif({ quality: 45 }).toBuffer()
    await fs.writeFile(dstBase + '.avif', avifBuf)
    console.log('⚠ placeholder ->', path.relative(SITE_DIR, dstBase) + '.{jpg,webp,avif}')
}

async function ensureOutputsFor(file, manifest) {
    const dir = path.dirname(file)
    const baseName = path.basename(file).replace(/\.(png|jpe?g)$/i, '')
    const dstBase = path.join(dir, baseName)

    try {
        const srcBuf = await fs.readFile(file)
        const meta = await sharp(srcBuf).metadata()

        const relBase = path.relative(SITE_DIR, path.join(dir, baseName)).replace(/^public[\\/]/, '')
        const entry = { width: meta.width, height: meta.height, base: relBase, webp: [], jpg: [], avif: [] }

        for (const w of SIZES) {
            const width = Math.min(w, meta.width || w)
            const pipe = sharp(srcBuf).resize({ width, withoutEnlargement: true })
            const [webpOut, jpgOut, avifOut] = await Promise.all([
                pipe.clone().webp({ quality: 78 }).toBuffer(),
                pipe.clone().jpeg({ quality: 82 }).toBuffer(),
                pipe.clone().avif({ quality: 50 }).toBuffer(),
            ])
            const webpPath = `${dstBase}-${width}.webp`
            const jpgPath = `${dstBase}-${width}.jpg`
            const avifPath = `${dstBase}-${width}.avif`
            await fs.writeFile(webpPath, webpOut)
            await fs.writeFile(jpgPath, jpgOut)
            await fs.writeFile(avifPath, avifOut)
            entry.webp.push({ width, path: path.relative(SITE_DIR, webpPath).replace(/^public[\\/]/, '') })
            entry.jpg.push({ width, path: path.relative(SITE_DIR, jpgPath).replace(/^public[\\/]/, '') })
            entry.avif.push({ width, path: path.relative(SITE_DIR, avifPath).replace(/^public[\\/]/, '') })
            console.log('✔ wrote', path.relative(SITE_DIR, avifPath))
        }

        const maxW = Math.min(1920, meta.width || 1920)
        const mainPipe = sharp(srcBuf).resize({ width: maxW, withoutEnlargement: true })
        const [webpMain, jpgMain, avifMain, lqip] = await Promise.all([
            mainPipe.clone().webp({ quality: 78 }).toBuffer(),
            mainPipe.clone().jpeg({ quality: 82 }).toBuffer(),
            mainPipe.clone().avif({ quality: 50 }).toBuffer(),
            tinyBlurDataURL(srcBuf),
        ])
        await fs.writeFile(`${dstBase}.webp`, webpMain)
        await fs.writeFile(`${dstBase}.jpg`, jpgMain)
        await fs.writeFile(`${dstBase}.avif`, avifMain)

        entry.blurDataURL = lqip
        manifest[entry.base] = entry
        return true
    } catch (e) {
        if (FIX_INVALID) {
            await createPlaceholderPair(path.join(dir, baseName))
            return true
        } else {
            console.error('✖ failed:', path.relative(SITE_DIR, file), '-', e.message)
            return false
        }
    }
}

async function verifyWebp(file) {
    const dir = path.dirname(file)
    const base = path.basename(file).replace(/\.(png|jpe?g)$/i, '')
    const webp = path.join(dir, `${base}.webp`)
    try { await fs.access(webp); return true }
    catch { console.log('WebP missing for:', path.relative(SITE_DIR, file)); return false }
}

async function main() {
    const files = (await walk(IMG_ROOT)).filter(isRaster)
    if (!files.length) {
        console.log('No images found under', path.relative(SITE_DIR, IMG_ROOT) || './public/images')
        return
    }
    if (VERIFY) {
        let ok = true
        for (const f of files) ok = (await verifyWebp(f)) && ok
        if (!ok) process.exit(1)
        return
    }
    const manifest = {}
    let wrote = 0
    for (const f of files) if (await ensureOutputsFor(f, manifest)) wrote++
    const manifestPath = path.join(IMG_ROOT, 'manifest.json')
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
    console.log(`Done. Processed ${files.length} files, wrote/updated ${wrote} sets. Manifest: ${path.relative(SITE_DIR, manifestPath)}`)
}

for (const [i, f] of files.entries()) {
    console.log(`[${i + 1}/${files.length}] Processing ${path.basename(f)}`)
    const did = await ensureOutputsFor(f, manifest)
    if (did) wrote++
}

main()

