// controllers/authController.js
const admin = require('../config/firebase-config');
const UserModel = require('../models/userModel');

class AuthController {
    static async register(req, res) {
        try {
            const idToken = req.headers.authorization?.split('Bearer ')[1];
            if (!idToken) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const uid = decodedToken.uid;

            const userData = {
                ...req.body,
                role: 'visitor'
            };

            await UserModel.createUser(uid, userData);
            await admin.auth().setCustomUserClaims(uid, { role: 'visitor' });

            const expiresIn = 60 * 60 * 24 * 5 * 1000;
            const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
            
            res.cookie('session', sessionCookie, {
                maxAge: expiresIn,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
            
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            console.error('Registration Error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    }

    static async login(req, res) {
        try {
            const idToken = req.headers.authorization?.split('Bearer ')[1];
            if (!idToken) {
                return res.status(401).json({ error: 'No token provided' });
            }

            try {
                // Add a 5 minute grace period for clock skew
                const decodedToken = await admin.auth().verifyIdToken(idToken, true, 5);
                const uid = decodedToken.uid;
                
                // Get user data from Firestore to check role
                const userData = await UserModel.getUserById(uid);
                if (!userData) {
                    throw new Error('User not found');
                }

                // Check if the user's email is admin@gmail.com and set role to admin
                if (userData.email === 'admin@gmail.com') {
                    userData.role = 'admin';
                    // Update the user's role in Firestore
                    await UserModel.createUser(uid, { ...userData });
                    await admin.auth().setCustomUserClaims(uid, { admin : true });
                }

                // Set custom claims based on user role
                
                
                // Force refresh the token to include new claims
                const freshIdToken = await admin.auth().createCustomToken(uid);
                
                // Create session cookie with new expiration
                const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
                const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
                
                res.cookie('session', sessionCookie, {
                    maxAge: expiresIn,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });
                
                res.json({ 
                    message: 'Login successful',
                    role: userData.role 
                });
            } catch (tokenError) {
                console.error('Token Error:', tokenError);
                if (tokenError.code === 'auth/id-token-expired') {
                    return res.status(401).json({ 
                        error: 'Token expired',
                        forceRefresh: true 
                    });
                }
                throw tokenError;
            }
        } catch (error) {
            console.error('Login Error:', error);
            res.status(401).json({ error: 'Authentication failed' });
        }
    }

    static async logout(req, res) {
        try {
            // Clear the session cookie
            res.clearCookie('session', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
            
            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            console.error('Logout Error:', error);
            res.status(500).json({ error: 'Logout failed' });
        }
    }
}

module.exports = AuthController;