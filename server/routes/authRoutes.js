const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const admin = require('../config/firebase-config');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

/**
 * GET /auth/check-session
 * Validates user's session cookie
 * Returns session validity status and user claims
 */
router.get('/check-session', async (req, res) => {
    try {
        const sessionCookie = req.cookies.session || '';
        if (!sessionCookie) {
            return res.json({ valid: false });
        }

        const decodedClaims = await admin.auth().verifySessionCookie(
            sessionCookie, 
            true // Force refresh
        );
        res.json({ 
            valid: true,
            user: decodedClaims
        });
    } catch (error) {
        console.error('Session Check Error:', error);
        res.json({ valid: false });
    }
});

module.exports = router;