// models/userModel.js
const admin = require('../config/firebase-config');
const db = admin.firestore();

class UserModel {
    /**
     * Creates a new user profile in Firestore
     * Stores user data and adds server timestamp
     * Returns true on successful creation
     */
    static async createUser(uid, userData) {
        try {
            await db.collection('users').doc(uid).set({
                ...userData,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves user profile by Firebase UID
     * Returns null if user doesn't exist
     */
    static async getUserById(uid) {
        try {
            const userDoc = await db.collection('users').doc(uid).get();
            return userDoc.exists ? userDoc.data() : null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves all non-admin users in the system
     * Returns array of user profiles with IDs
     */
    static async getAllUsers() {
        try {
            const userSnapshot = await db.collection('users')
                .where('role', '!=', 'admin') // Filter out admin user
                .get();

            const users = [];

            userSnapshot.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });

            return users;

        } catch (error) {
            throw error;
        }
    }
}

module.exports = UserModel;