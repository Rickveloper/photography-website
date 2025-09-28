#!/bin/bash
set -euo pipefail

# Files that are currently failing in img:opt
FILES=(
  "photography-portfolio/public/images/featured/rf-fall-01.jpg"
  "photography-portfolio/public/images/featured/rf-ocean-01.jpg"
  "photography-portfolio/public/images/featured/rf-spring-01.jpg"
  "photography-portfolio/public/images/featured/rf-summer-01.jpg"
  "photography-portfolio/public/images/featured/rf-winter-01.jpg"
  "photography-portfolio/public/images/hero/hero-01.jpg"
)

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    echo "Re-encoding $f …"
    tmp="${f%.jpg}-fixed.jpg"
    # Try sips first (native on macOS)
    if sips -s format jpeg "$f" --out "$tmp" >/dev/null 2>&1; then
      mv "$tmp" "$f"
    # Fallback to ImageMagick if available
    elif command -v magick >/dev/null 2>&1; then
      if magick "$f" -auto-orient -strip -quality 92 "$tmp" >/dev/null 2>&1; then
        mv "$tmp" "$f"
      else
        echo "Failed to re-encode with ImageMagick (magick): $f"
        rm -f "$tmp"
      fi
    elif command -v convert >/dev/null 2>&1; then
      if convert "$f" -auto-orient -strip -quality 92 "$tmp" >/dev/null 2>&1; then
        mv "$tmp" "$f"
      else
        echo "Failed to re-encode with ImageMagick (convert): $f"
        rm -f "$tmp"
      fi
    else
      echo "No suitable tool found to re-encode: $f"
    fi
  else
    echo "Missing: $f"
  fi
done

echo "Done. All listed JPEGs were re-encoded as valid JPEG files."


