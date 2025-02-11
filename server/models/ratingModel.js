// server/models/ratingModel.js
const admin = require('../config/firebase-config');
const db = admin.firestore();

class RatingModel {
    static async createRating(eventId, userId, rating, comment) {
        try {
            const ratingRef = db.collection('ratings').doc();
            await ratingRef.set({
                eventId,
                userId,
                rating,
                comment,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return ratingRef.id;
        } catch (error) {
            throw error;
        }
    }

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