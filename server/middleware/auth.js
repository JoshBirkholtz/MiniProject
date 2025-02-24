const admin = require('../config/firebase-config');

/**
 * Authentication Middleware
 * Verifies Firebase ID token in request header
 * Attaches decoded user data to request object
 * Required for protected routes
 */
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Admin Authorization Middleware
 * Verifies user has admin privileges via Firebase custom claims
 * Must be used after authenticateUser middleware
 * Required for admin-only routes
 */
const isAdmin = async (req, res, next) => {
  try {
      const { user } = req;
      const userRecord = await admin.auth().getUser(user.uid);
      
      if (!!userRecord.customClaims.admin) {
          next();
      } else {
          res.status(403).json({ error: 'Not authorized as admin' });
      }
  } catch (error) {
      console.error('Admin Check Error:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { authenticateUser, isAdmin };