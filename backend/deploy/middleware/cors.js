// CORS middleware for backend
const corsMiddleware = (req, res, next) => {
    res.headers = {
        ...res.headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    if (req.method === 'OPTIONS') {
        res.status = 204;
        return res;
    }
    return next();
};
module.exports = corsMiddleware;
//# sourceMappingURL=cors.js.map