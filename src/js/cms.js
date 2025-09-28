(function () {
    const CMS_BASE = (window.CMS_BASE || "").replace(/\/+$/, "") || location.origin;
    console.debug("[cms] base:", CMS_BASE);

    function buildImgAttrs(image) {
        if (!image || !image.data) return {};
        const attr = image.data.attributes || {};
        const url = CMS_BASE + (attr.url || '');
        const width = attr.width;
        const height = attr.height;
        let srcset = '';
        if (attr.formats) {
            const f = attr.formats;
            const parts = [];
            ['thumbnail', 'small', 'medium', 'large'].forEach(k => {
                if (f[k] && f[k].url && f[k].width) {
                    parts.push(`${CMS_BASE + f[k].url} ${f[k].width}w`);
                }
            });
            if (parts.length) srcset = parts.join(', ');
        }
        return { url, width, height, srcset, alt: attr.alternativeText || attr.name || '' };
    }

    async function fetchJSON(path) {
        const res = await fetch(`${CMS_BASE}${path}`);
        if (!res.ok) throw new Error('CMS request failed');
        return res.json();
    }

    async function hydrateBlogList() {
        const grid = document.getElementById('blog-grid');
        if (!grid) return;
        try {
            const data = await fetchJSON('/api/posts?populate=cover&sort=publishedAt:desc&pagination[limit]=9');
            const posts = data.data || [];
            grid.innerHTML = posts.map(p => {
                const a = p.attributes || {};
                const cover = buildImgAttrs(a.cover);
                const date = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : '';
                const href = `blog-post.html?slug=${encodeURIComponent(a.slug)}`;
                const imgAttrs = cover.srcset ? `srcset="${cover.srcset}" sizes="(min-width: 768px) 33vw, 100vw"` : '';
                return `
          <a href="${href}" class="bg-dark-700 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg image-hover h-full flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500" rel="noopener noreferrer">
            <picture>
              <img src="${cover.url || ''}" ${imgAttrs} alt="${cover.alt}" class="w-full aspect-[4/3] object-cover fade-in" loading="lazy" decoding="async" ${cover.width ? `width="${cover.width}"` : ''} ${cover.height ? `height="${cover.height}"` : ''}>
            </picture>
            <div class="p-6 flex flex-col flex-1">
              <h3 class="text-xl font-bold mb-2 text-white">${a.title || ''}</h3>
              <p class="text-gray-300 mb-4">${date}</p>
              <p class="text-gray-300">${a.excerpt || ''}</p>
              <div class="mt-auto pt-4 text-ocean-300 flex items-center">Read More <i data-feather="arrow-right" class="ml-2 w-4 h-4"></i></div>
            </div>
          </a>`;
            }).join('');
            if (window.feather) feather.replace();
        } catch (e) {
            console.error('Failed to hydrate blog list', e);
        }
    }

    async function hydrateLatestOnIndex(limit) {
        const el = document.getElementById('latest-posts');
        if (!el) return;
        try {
            const data = await fetchJSON(`/api/posts?populate=cover&sort=publishedAt:desc&pagination[limit]=${limit || 3}`);
            const posts = data.data || [];
            el.innerHTML = posts.map(p => {
                const a = p.attributes || {};
                const cover = buildImgAttrs(a.cover);
                const href = `blog-post.html?slug=${encodeURIComponent(a.slug)}`;
                const imgAttrs = cover.srcset ? `srcset="${cover.srcset}" sizes="(min-width: 768px) 33vw, 100vw"` : '';
                return `
          <a href="${href}" class="bg-dark-700 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg image-hover h-full flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500" rel="noopener noreferrer">
            <picture>
              <img src="${cover.url || ''}" ${imgAttrs} alt="${cover.alt}" class="w-full aspect-[4/3] object-cover" loading="lazy" decoding="async" ${cover.width ? `width="${cover.width}"` : ''} ${cover.height ? `height="${cover.height}"` : ''}>
            </picture>
            <div class="p-6 flex flex-col flex-1">
              <h3 class="text-xl font-bold mb-2 text-white">${a.title || ''}</h3>
            </div>
          </a>`;
            }).join('');
            if (window.feather) feather.replace();
        } catch (e) {
            console.error('Failed to hydrate latest', e);
        }
    }

    async function hydratePostBySlug() {
        const container = document.getElementById('blog-post');
        if (!container) return;
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('slug');
        if (!slug) {
            container.innerHTML = '<p class="text-gray-400">Post not found.</p>';
            return;
        }
        try {
            const data = await fetchJSON(`/api/posts?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=cover`);
            const rows = data.data || [];
            if (!rows.length) {
                container.innerHTML = '<p class="text-gray-400">Post not found.</p>';
                return;
            }
            const p = rows[0];
            const a = p.attributes || {};
            const cover = buildImgAttrs(a.cover);
            const date = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : '';
            container.innerHTML = `
        <article class="prose prose-invert">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 text-white">${a.title || ''}</h1>
          <p class="text-gray-300 mb-6">${date}</p>
          ${cover.url ? `<img src="${cover.url}" alt="${cover.alt}" class="w-full h-auto object-cover mb-6" loading="lazy" decoding="async" ${cover.width ? `width=\"${cover.width}\"` : ''} ${cover.height ? `height=\"${cover.height}\"` : ''}>` : ''}
          <div>${a.body || ''}</div>
        </article>`;
            if (window.feather) feather.replace();
        } catch (e) {
            console.error('Failed to hydrate post', e);
            container.innerHTML = '<p class="text-gray-400">Error loading post.</p>';
        }
    }

    window.CMS = { hydrateBlogList, hydrateLatestOnIndex, hydratePostBySlug };
    document.addEventListener('DOMContentLoaded', hydrateBlogList);
})();

