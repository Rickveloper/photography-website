// src/components/Pic.jsx
import { useState } from "react";

/**
 * Props:
 *  - base: "/images/path/to/image" (without extension)
 *  - alt: string
 *  - w, h: intrinsic width/height (pass real values to eliminate CLS)
 *  - eager: boolean
 *  - sizes: sizes attribute
 *  - blur: optional data URL for blur-up (from manifest)
 */
export default function Pic({ base, alt, w = 1920, h = 1280, eager = false, sizes = "(min-width:1024px) 33vw, 100vw", blur }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <picture className="block overflow-hidden">
      <source
        type="image/avif"
        srcSet={`${base}-960.avif 960w, ${base}-1440.avif 1440w, ${base}-1920.avif 1920w`}
        sizes={sizes}
      />
      <source
        type="image/webp"
        srcSet={`${base}-960.webp 960w, ${base}-1440.webp 1440w, ${base}-1920.webp 1920w`}
        sizes={sizes}
      />
      <img
        src={`${base}.jpg`}
        srcSet={`${base}-960.jpg 960w, ${base}-1440.jpg 1440w, ${base}-1920.jpg 1920w`}
        sizes={sizes}
        alt={alt}
        width={w}
        height={h}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchpriority={eager ? "high" : "low"}
        onLoad={() => setLoaded(true)}
        className={`transition-[filter,opacity] duration-500 ${loaded ? "opacity-100 blur-0" : "opacity-70 blur-sm"}`}
        style={blur ? { backgroundImage: `url(${blur})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      />
    </picture>
  )
}


