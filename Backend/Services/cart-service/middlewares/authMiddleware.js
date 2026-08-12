import jwt from 'jsonwebtoken';

const getCookie = (req, name) => {
    if (!req.headers.cookie) return null;
    const match = req.headers.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
};

const authenticate = (req, res, next) => {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else {
        token = getCookie(req, 'token') || getCookie(req, 'accessToken');
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Token missing', errorCode: 'UNAUTHORIZED' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwt');
        req.user = {
            ...decoded,
            userId: decoded.userId || decoded.id || decoded.customerId || decoded._id
        };
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token', errorCode: 'UNAUTHORIZED' });
    }
};

export { authenticate };
