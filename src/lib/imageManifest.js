// src/lib/imageManifest.js
export async function getImageMeta(basePath) {
  // basePath like "images/portraits/alex" (no leading slash)
  const res = await fetch(`/images/manifest.json`, { cache: "force-cache" })
  const manifest = await res.json()
  const entry = manifest[basePath] || null
  return entry
}


