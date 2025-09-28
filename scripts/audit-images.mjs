// scripts/audit-images.mjs
import { promises as fs } from 'node:fs'
import path from 'node:path'

const files = [
  'photography-portfolio/public/images/featured/rf-fall-01.jpg',
  'photography-portfolio/public/images/featured/rf-ocean-01.jpg',
  'photography-portfolio/public/images/featured/rf-spring-01.jpg',
  'photography-portfolio/public/images/featured/rf-summer-01.jpg',
  'photography-portfolio/public/images/featured/rf-winter-01.jpg',
  'photography-portfolio/public/images/hero/hero-01.jpg'
]

const magic = {
  JPEG: [0xFF,0xD8,0xFF],
  PNG:  [0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A],
  WEBP: [0x52,0x49,0x46,0x46], // then "WEBP" at 8..11
  PDF:  [0x25,0x50,0x44,0x46],
  HTML: [0x3C,0x21,0x44,0x4F,0x43,0x54], // "<!DOCT"
  ZIP:  [0x50,0x4B,0x03,0x04] // just in case
}

function hex(bytes) { return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join(' ') }

function guess(buf) {
  const b = new Uint8Array(buf.slice(0,16))
  const starts = (sig) => sig.every((v,i)=>b[i]===v)
  if (starts(magic.JPEG)) return 'JPEG'
  if (starts(magic.PNG)) return 'PNG'
  if (starts(magic.PDF)) return 'PDF'
  if (starts(magic.HTML)) return 'HTML'
  if (starts(magic.ZIP)) return 'ZIP/ARCHIVE'
  if (starts(magic.WEBP) && String.fromCharCode(...b.slice(8,12))==='WEBP') return 'WEBP'
  return 'UNKNOWN'
}

for (const f of files) {
  try {
    const data = await fs.readFile(f)
    const kind = guess(data)
    console.log(`${f}`)
    console.log(`  size: ${data.length} bytes`)
    console.log(`  head: ${hex(data.slice(0,12))}`)
    console.log(`  type: ${kind}\n`)
  } catch (e) {
    console.log(`${f}\n  ERROR: ${e.message}\n`)
  }
}
