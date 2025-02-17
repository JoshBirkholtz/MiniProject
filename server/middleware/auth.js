// middleware/auth.js
const admin = require('../config/firebase-config');

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