const { authenticate, requireRole } = require('./authenticate');

// Middleware that combines authentication and admin role check
const isAdmin = [authenticate, requireRole(1)];

module.exports = isAdmin;
