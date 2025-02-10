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

            const decodedToken = await admin.auth().verifyIdToken(idToken);
            
            if (new Date().getTime() / 1000 - decodedToken.auth_time < 5 * 60) {
                const expiresIn = 60 * 60 * 24 * 5 * 1000;
                const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
                
                res.cookie('session', sessionCookie, {
                    maxAge: expiresIn,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });
                
                res.json({ message: 'Login successful' });
            } else {
                res.status(401).json({ error: 'Recent sign in required!' });
            }
        } catch (error) {
            console.error('Login Error:', error);
            res.status(401).json({ error: 'Invalid token' });
        }
    }
}

module.exports = AuthController;