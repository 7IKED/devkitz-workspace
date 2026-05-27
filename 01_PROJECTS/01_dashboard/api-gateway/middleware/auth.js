/**
 * ⚡ DKZ API — Auth Middleware
 * ═════════════════════════════
 * API Key und Bearer Token Validierung
 */

export function authMiddleware(req, res, next) {
    // Skip auth for health/docs/root
    const publicPaths = ['/', '/health', '/api/v1/health', '/api/v1/docs', '/api/v1/ecosystem', '/api/v1/mcp/info', '/api/v1/mcp/config'];
    if (publicPaths.includes(req.path)) return next();

    // Check for API key or Bearer token
    const apiKey = req.headers['x-api-key'];
    const authHeader = req.headers['authorization'];

    // In dev mode, allow all requests
    if (process.env.NODE_ENV !== 'production') return next();

    if (!apiKey && !authHeader) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'API Key (X-API-Key header) oder Bearer Token (Authorization header) erforderlich',
            docs: '/api/v1/docs'
        });
    }

    // Validate API key
    const validKeys = (process.env.DKZ_API_KEYS || '').split(',').filter(Boolean);
    if (apiKey && validKeys.includes(apiKey)) return next();

    // Validate Bearer token
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        if (validKeys.includes(token)) return next();
    }

    return res.status(403).json({ error: 'Forbidden', message: 'Ungültiger API Key oder Token' });
}
