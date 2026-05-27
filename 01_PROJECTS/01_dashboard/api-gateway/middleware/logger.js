/**
 * ⚡ DKZ API — Request Logger Middleware
 * ════════════════════════════════════════
 * Logs all requests with timing
 */

// Request counter
if (!globalThis.__dkzRequestCount) {
    globalThis.__dkzRequestCount = { total: 0, errors: 0 };
}

export function requestLogger(req, res, next) {
    const start = Date.now();
    globalThis.__dkzRequestCount.total++;

    // Color codes for terminal
    const methodColors = {
        GET: '\x1b[32m',    // green
        POST: '\x1b[33m',   // yellow
        PUT: '\x1b[34m',    // blue
        DELETE: '\x1b[31m', // red
        PATCH: '\x1b[35m',  // magenta
    };

    const color = methodColors[req.method] || '\x1b[37m';
    const reset = '\x1b[0m';

    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';

        if (res.statusCode >= 400) {
            globalThis.__dkzRequestCount.errors++;
        }

        // Only log API requests (skip static files)
        if (req.path.startsWith('/api') || req.path === '/') {
            console.log(
                `${color}${req.method}${reset} ${req.path} → ${statusColor}${res.statusCode}${reset} (${duration}ms)`
            );
        }
    });

    next();
}
