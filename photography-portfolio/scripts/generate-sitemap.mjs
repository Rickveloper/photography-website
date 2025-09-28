import { promises as fs } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(process.cwd());

async function readSiteConfig() {
    const configPath = resolve(ROOT, 'site.config.json');
    const raw = await fs.readFile(configPath, 'utf8');
    const json = JSON.parse(raw);
    if (!json.siteUrl || typeof json.siteUrl !== 'string') {
        throw new Error('site.config.json must contain a string field "siteUrl"');
    }
    return json;
}

async function getLastModIso(date) {
    // yyyy-mm-dd format
    return date.toISOString().slice(0, 10);
}

async function buildUrlEntry(loc, lastmod) {
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
}

async function main() {
    const { siteUrl } = await readSiteConfig();

    const targetFiles = [
        'index.html',
        'about.html',
        'blog.html',
        'blog-post.html',
        'contact.html',
        'shop.html',
    ];

    const entries = [];
    for (const file of targetFiles) {
        const absPath = resolve(ROOT, file);
        let stat;
        try {
            stat = await fs.stat(absPath);
        } catch (err) {
            // Skip missing files
            continue;
        }
        if (!stat.isFile()) continue;

        const lastmod = await getLastModIso(stat.mtime);
        const loc = new URL(file === 'index.html' ? '/' : `/${file.replace(/\.html$/, '')}`, siteUrl).toString();
        entries.push(await buildUrlEntry(loc, lastmod));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        entries.join('\n') + (entries.length ? '\n' : '') +
        `</urlset>\n`;

    const outDir = resolve(ROOT, 'public');
    const outPath = join(outDir, 'sitemap.xml');
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(outPath, xml, 'utf8');
    // eslint-disable-next-line no-console
    console.log(`Sitemap written to ${outPath}`);
}

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});


