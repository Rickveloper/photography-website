#!/usr/bin/env node

import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const HOST = '127.0.0.1';
const PORT = 8080;
const TARGET_URL = `http://${HOST}:${PORT}/index.html`;

/**
 * Try to start http-server if available; otherwise, fall back to a tiny static server.
 * Returns an async function to stop the server.
 */
async function startServer() {
    // Prefer local http-server if installed
    const httpServerCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    let child = spawn(httpServerCmd, ['http-server', '.', '-a', HOST, '-p', String(PORT), '-c-1'], {
        stdio: 'ignore',
        cwd: process.cwd(),
        env: process.env,
    });

    let usedChild = true;

    // Wait briefly to see if it started; otherwise, fallback
    const started = await new Promise((resolve) => {
        let resolved = false;
        const timer = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                resolve(false);
            }
        }, 600);
        child.on('spawn', () => {
            // Give it a moment to bind
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    resolve(true);
                }
            }, 400);
        });
        child.on('error', () => {
            if (!resolved) {
                resolved = true;
                resolve(false);
            }
        });
        child.on('exit', () => {
            if (!resolved) {
                resolved = true;
                resolve(false);
            }
        });
    });

    if (started) {
        return async () => {
            try {
                if (child && !child.killed) {
                    child.kill('SIGTERM');
                }
            } catch { }
        };
    }

    // Fallback micro static server
    usedChild = false;
    try {
        if (child && !child.killed) child.kill('SIGTERM');
    } catch { }

    const rootDir = process.cwd();
    const server = http.createServer((req, res) => {
        try {
            const parsed = url.parse(req.url || '/');
            let safePath = path.normalize(decodeURIComponent(parsed.pathname || '/'));
            if (safePath.endsWith('/')) safePath += 'index.html';
            const filePath = path.join(rootDir, safePath);

            // Prevent directory traversal
            if (!filePath.startsWith(rootDir)) {
                res.statusCode = 403;
                res.end('Forbidden');
                return;
            }

            fs.stat(filePath, (err, stats) => {
                if (err || !stats.isFile()) {
                    res.statusCode = 404;
                    res.end('Not Found');
                    return;
                }
                const stream = fs.createReadStream(filePath);
                stream.on('error', () => {
                    res.statusCode = 500;
                    res.end('Server Error');
                });
                stream.pipe(res);
            });
        } catch (e) {
            res.statusCode = 500;
            res.end('Server Error');
        }
    });

    await new Promise((resolve) => server.listen(PORT, HOST, resolve));

    return async () => {
        await new Promise((resolve) => server.close(resolve));
    };
}

async function runLighthouse() {
    const { default: lighthouse } = await import('lighthouse');
    const { launch } = await import('chrome-launcher');

    const chrome = await launch({ chromeFlags: ['--headless=new', `--host-resolver-rules=MAP ${HOST} 127.0.0.1`], startingUrl: TARGET_URL });
    try {
        const result = await lighthouse(TARGET_URL, {
            port: chrome.port,
            output: 'json',
            logLevel: 'error',
            onlyCategories: ['performance'],
        });
        return result.lhr;
    } finally {
        await chrome.kill();
    }
}

let stopServer = null;
let exitCode = 1;
try {
    stopServer = await startServer();

    // Basic readiness check
    await new Promise((resolve) => setTimeout(resolve, 600));

    const lhr = await runLighthouse();
    const perfScore = lhr.categories?.performance?.score ?? 0;
    const formatted = typeof perfScore === 'number' ? perfScore.toFixed(2) : String(perfScore);
    console.log(`Lighthouse Performance: ${formatted}`);

    exitCode = perfScore >= 0.9 ? 0 : 1;
} catch (err) {
    console.error('Error running Lighthouse:', err && err.message ? err.message : err);
    exitCode = 1;
} finally {
    if (stopServer) {
        try { await stopServer(); } catch { }
    }
    process.exit(exitCode);
}


