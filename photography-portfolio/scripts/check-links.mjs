#!/usr/bin/env node
import { readFile } from 'fs/promises';
import { access } from 'fs/promises';
import { constants } from 'fs';
import { resolve, join } from 'path';

const repoRoot = resolve(process.cwd());
const filesToScan = [
    'index.html',
    'about.html',
    'blog.html',
    'blog-post.html',
    'contact.html',
    'shop.html',
];

/**
 * Determine if an href is a relative link that should be validated.
 */
function isRelativeHref(href) {
    if (!href) return false;
    const trimmed = href.trim();
    // Exclude protocols and special schemes
    if (/^(?:[a-zA-Z][a-zA-Z0-9+.-]*:)/.test(trimmed)) return false; // http:, https:, mailto:, tel:, etc
    if (trimmed.startsWith('#')) return false; // in-page anchors
    return true; // './path', '/path', 'path', '../path'
}

/**
 * Normalize a target path relative to repo root.
 */
function normalizeTargetPath(href) {
    let target = href.trim();
    // Strip query/hash
    const qIndex = target.indexOf('?');
    const hIndex = target.indexOf('#');
    const cutIndex = [qIndex, hIndex].filter(i => i !== -1).sort((a, b) => a - b)[0];
    if (typeof cutIndex === 'number') target = target.slice(0, cutIndex);
    // If it starts with '/', treat as absolute from repo root
    if (target.startsWith('/')) return resolve(repoRoot, '.' + target);
    return resolve(repoRoot, target);
}

async function fileExists(absPath) {
    try {
        await access(absPath, constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

async function extractRelativeLinks(htmlContent) {
    const links = [];
    // Simple, robust-ish regex for href capture. Not a full HTML parser but good enough for checks.
    const anchorRegex = /<a\b[^>]*href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi;
    let match;
    while ((match = anchorRegex.exec(htmlContent))) {
        const href = match[2] || match[3] || match[4] || '';
        if (isRelativeHref(href)) {
            links.push(href);
        }
    }
    return links;
}

async function main() {
    const missing = [];

    for (const relPath of filesToScan) {
        const absPath = resolve(repoRoot, relPath);
        let html;
        try {
            html = await readFile(absPath, 'utf8');
        } catch (err) {
            console.error(`[WARN] Could not read ${relPath}: ${err.message}`);
            continue;
        }
        const links = await extractRelativeLinks(html);
        for (const href of links) {
            const targetAbs = normalizeTargetPath(href);
            const exists = await fileExists(targetAbs);
            if (!exists) {
                // Store relative path for readability in report
                let displayPath = targetAbs.replace(repoRoot + '/', '');
                missing.push({ source: relPath, href, target: displayPath });
            }
        }
    }

    if (missing.length) {
        console.error('Broken relative links detected:');
        for (const item of missing) {
            console.error(`- ${item.source} -> href="${item.href}" (missing: ${item.target})`);
        }
        process.exit(1);
    } else {
        console.log('All relative links resolve to existing files.');
        process.exit(0);
    }
}

main().catch(err => {
    console.error('Unexpected error during link check:', err);
    process.exit(1);
});


