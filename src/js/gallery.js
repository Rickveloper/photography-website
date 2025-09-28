(function () {
  const CMS_BASE =
    (window.CMS_BASE || "").replace(/\/+$/, "") || location.origin;
  console.debug("[gallery] base:", CMS_BASE);

  function buildImgAttrs(image) {
    if (!image || !image.data) return {};
    const attr = image.data.attributes || {};
    const url = CMS_BASE + (attr.url || "");
    const width = attr.width;
    const height = attr.height;
    let srcset = "";
    if (attr.formats) {
      const f = attr.formats;
      const parts = [];
      ["thumbnail", "small", "medium", "large"].forEach((k) => {
        if (f[k] && f[k].url && f[k].width) {
          parts.push(`${CMS_BASE + f[k].url} ${f[k].width}w`);
        }
      });
      if (parts.length) srcset = parts.join(", ");
    }
    return {
      url,
      width,
      height,
      srcset,
      alt: attr.alternativeText || attr.name || "",
    };
  }

  async function fetchJSON(path) {
    const res = await fetch(`${CMS_BASE}${path}`);
    if (!res.ok) throw new Error("CMS request failed");
    return res.json();
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function createGalleryItem(photo, index) {
    const attr = photo.attributes || {};
    const image = buildImgAttrs(attr.image);
    const title = attr.title || 'Untitled';
    const description = attr.description || '';
    const date = formatDate(attr.date_taken);
    
    const imgAttrs = image.srcset
      ? `srcset="${image.srcset}" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"`
      : "";

    // Generate random heights for masonry effect (simulate different image aspect ratios)
    const heights = [200, 250, 300, 180, 220, 280, 320, 190, 260, 240];
    const randomHeight = heights[index % heights.length];

    return `
      <div class="gallery-item" data-aos="fade-up" data-aos-delay="${index * 100}" data-index="${index}">
        <div class="relative overflow-hidden">
          <picture>
            <img src="${image.url || ""}" ${imgAttrs} alt="${image.alt}" 
                 class="w-full h-auto object-cover" 
                 loading="lazy" decoding="async" 
                 ${image.width ? `width="${image.width}"` : ""} 
                 ${image.height ? `height="${image.height}"` : ""}
                 style="min-height: ${randomHeight}px;">
          </picture>
          
          <!-- Modern Hover Overlay -->
          <div class="gallery-overlay">
            <div class="gallery-content">
              <h3 class="gallery-title">${title}</h3>
              ${description ? `<p class="gallery-caption">${description}</p>` : ''}
              ${date ? `<div class="gallery-date">${date}</div>` : ''}
            </div>
          </div>
          
          <!-- Action Button -->
          <div class="gallery-actions">
            <button class="gallery-btn view-image"
                    data-image="${image.url || ""}" 
                    data-title="${title}"
                    data-description="${description}"
                    data-date="${date}"
                    data-index="${index}">
              <i data-feather="eye" class="w-4 h-4 mr-1"></i>
              View
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async function hydrateGallery() {
    const loadingEl = document.getElementById("gallery-loading");
    const gridEl = document.getElementById("gallery-grid");
    const errorEl = document.getElementById("gallery-error");
    
    if (!gridEl) return;

    try {
      // Show loading state
      loadingEl.classList.remove("hidden");
      gridEl.style.display = "none";
      errorEl.classList.add("hidden");

      // Fetch photos from Strapi
      const data = await fetchJSON("/api/photos?populate=*&sort=date_taken:desc");
      const photos = data.data || [];

      if (photos.length === 0) {
        // Show empty state
        gridEl.innerHTML = `
          <div class="col-span-full text-center py-12">
            <div class="text-gray-400 mb-4">
              <i data-feather="camera" class="w-16 h-16 mx-auto"></i>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">No photos yet</h3>
            <p class="text-gray-400">Check back soon for new coastal Maine photography.</p>
          </div>
        `;
        loadingEl.classList.add("hidden");
        gridEl.style.display = "grid";
        if (window.feather) feather.replace();
        return;
      }

      // Generate gallery items
      gridEl.innerHTML = photos
        .map((photo, index) => createGalleryItem(photo, index))
        .join("");

      // Hide loading, show gallery
      loadingEl.classList.add("hidden");
      gridEl.style.display = "block";

      // Initialize feather icons
      if (window.feather) feather.replace();

      // Store photos for navigation
      window.galleryPhotos = photos;

      // Add click handlers for lightbox
      const viewButtons = document.querySelectorAll('.view-image');
      viewButtons.forEach(button => {
        button.addEventListener('click', function () {
          const imageSrc = this.getAttribute('data-image');
          const title = this.getAttribute('data-title');
          const description = this.getAttribute('data-description');
          const date = this.getAttribute('data-date');
          const index = parseInt(this.getAttribute('data-index'));
          
          // Use the global openLightbox function from gallery.html
          if (window.openLightbox) {
            window.openLightbox(imageSrc, title, description, date, index);
          }
        });
      });

      // Animate gallery items in with staggered effect
      const galleryItems = document.querySelectorAll('.gallery-item');
      galleryItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('animate-in');
        }, index * 50); // Faster animation for better UX
      });

    } catch (e) {
      console.error("Failed to hydrate gallery", e);
      
      // Show error state
      loadingEl.classList.add("hidden");
      gridEl.style.display = "none";
      errorEl.classList.remove("hidden");
      
      if (window.feather) feather.replace();
    }
  }

  // Enhanced openLightbox function with navigation
  window.openLightbox = function(imageSrc, title, description, date, index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDescription = document.getElementById('lightbox-description');
    const lightboxDate = document.getElementById('lightbox-date');
    const lightboxIndex = document.getElementById('lightbox-index');
    const prevBtn = document.getElementById('prev-image');
    const nextBtn = document.getElementById('next-image');
    const loadingSpinner = document.getElementById('lightbox-loading');
    
    if (!lightbox || !lightboxImage || !lightboxTitle) return;
    
    // Set current photo index
    window.currentPhotoIndex = index || 0;
    const photos = window.galleryPhotos || [];
    
    // Show/hide navigation buttons
    if (photos.length > 1) {
      prevBtn.classList.remove('hidden');
      nextBtn.classList.remove('hidden');
    } else {
      prevBtn.classList.add('hidden');
      nextBtn.classList.add('hidden');
    }
    
    // Update content
    lightboxTitle.textContent = title;
    lightboxDescription.textContent = description || '';
    lightboxDate.textContent = date || '';
    lightboxIndex.textContent = `${index + 1} / ${photos.length}`;
    
    // Show loading spinner
    loadingSpinner.classList.remove('hidden');
    lightboxImage.style.opacity = '0';
    
    // Load image
    const img = new Image();
    img.onload = function() {
      lightboxImage.src = imageSrc;
      lightboxImage.style.opacity = '1';
      loadingSpinner.classList.add('hidden');
    };
    img.onerror = function() {
      loadingSpinner.classList.add('hidden');
      lightboxImage.style.opacity = '1';
    };
    img.src = imageSrc;
    
    // Show lightbox
    lightbox.classList.remove('hidden');
    lightbox.style.display = 'flex';
    lightbox.style.alignItems = 'center';
    lightbox.style.justifyContent = 'center';
    document.body.style.overflow = 'hidden';
    
    // Initialize feather icons
    if (window.feather) feather.replace();
  };

  // Navigation functions
  window.navigateToPhoto = function(direction) {
    const photos = window.galleryPhotos || [];
    if (photos.length === 0) return;
    
    let newIndex = window.currentPhotoIndex + direction;
    if (newIndex < 0) newIndex = photos.length - 1;
    if (newIndex >= photos.length) newIndex = 0;
    
    const photo = photos[newIndex];
    const attr = photo.attributes || {};
    const image = buildImgAttrs(attr.image);
    const title = attr.title || 'Untitled';
    const description = attr.description || '';
    const date = formatDate(attr.date_taken);
    
    window.openLightbox(image.url, title, description, date, newIndex);
  };

  // Initialize gallery when DOM is ready
  document.addEventListener("DOMContentLoaded", hydrateGallery);
})();
