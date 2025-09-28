#!/usr/bin/env node

import { readdir, stat, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, extname, basename } from 'node:path';

const IMAGE_ROOT = join(process.cwd(), 'public', 'images');

/**
 * Recursively walk a directory and collect file paths.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function collectFilesRecursively(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(entries.map(async (entry) => {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            return collectFilesRecursively(fullPath);
        }
        return [fullPath];
    }));
    return files.flat();
}

/**
 * Determine if a file has a sibling .webp with the same basename.
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
async function hasWebpSibling(filePath) {
    const directory = filePath.substring(0, filePath.lastIndexOf('/'));
    const base = basename(filePath, extname(filePath));
    const webpPath = join(directory, `${base}.webp`);
    try {
        await access(webpPath, constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

function isRasterImageNeedingWebp(filePath) {
    const ext = extname(filePath).toLowerCase();
    return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
}

(async () => {
    try {
        // Ensure the images directory exists
        await stat(IMAGE_ROOT);
    } catch (err) {
        console.warn(`Directory not found: ${IMAGE_ROOT}`);
        process.exit(0);
    }

    const allFiles = await collectFilesRecursively(IMAGE_ROOT);
    const candidateFiles = allFiles.filter(isRasterImageNeedingWebp);

    let failures = 0;
    for (const file of candidateFiles) {
        const exists = await hasWebpSibling(file);
        if (!exists) {
            console.warn(`WebP missing for: ${file}`);
            failures++;
        }
    }

    if (failures > 0) {
        process.exitCode = 1;
    } else {
        process.exitCode = 0;
    }
})();


