// server/models/ratingModel.js
const admin = require('../config/firebase-config');
const db = admin.firestore();

class RatingModel {
    /**
     * Creates a new rating for an event
     * Stores rating score, recommendation, and user comment
     * Returns the new rating document ID
     */
    static async createRating(eventId, userId, rating, recommendation, comment) {
        try {
            const ratingRef = db.collection('ratings').doc();
            await ratingRef.set({
                eventId,
                userId,
                rating,
                recommendation,
                comment,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return ratingRef.id;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves all ratings for a specific event
     * Returns array of rating objects with user feedback
     */
    static async getRatingsByEventId(eventId) {
        try {
            const snapshot = await db.collection('ratings')
                .where('eventId', '==', eventId)
                .get();
            
            const ratings = [];
            snapshot.forEach(doc => {
                ratings.push({ id: doc.id, ...doc.data() });
            });
            return ratings;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves a user's rating for a specific event
     * Returns null if no rating exists
     */
    static async getUserRatingForEvent(userId, eventId) {
        try {
            const snapshot = await db.collection('ratings')
                .where('eventId', '==', eventId)
                .where('userId', '==', userId)
                .limit(1)
                .get();

            if (snapshot.empty) return null;
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RatingModel;