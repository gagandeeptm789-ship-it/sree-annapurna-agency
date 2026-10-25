const { verifyToken } = require('../utils/security');

/**
 * Extract token from Authorization header (Bearer <token>) or x-auth-token
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  if (req.headers['x-auth-token']) {
    return req.headers['x-auth-token'].trim();
  }
  if (req.query && req.query.authToken) {
    return req.query.authToken.trim();
  }
  if (req.query && req.query.token) {
    const t = req.query.token.trim();
    if (t.split('.').length === 3) {
      return t;
    }
  }
  return null;
}

/**
 * Protect customer routes — requires valid customer or owner token
 */
function protectCustomer(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please provide a valid Bearer token.',
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please sign in again.',
    });
  }

  req.user = payload;
  next();
}

/**
 * Protect owner operations — strictly requires authenticated Owner role
 */
function protectOwner(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Owner authentication required. Please sign in to the operations portal.',
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired owner session. Please sign in again.',
    });
  }

  if (payload.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Owner privileges required for this operation.',
    });
  }

  req.user = payload;
  next();
}

/**
 * Optional authentication: attaches user if token is present, does not block if omitted
 */
function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}

module.exports = {
  protectCustomer,
  protectOwner,
  optionalAuth,
};

