// models/rsvpModel.js
const admin = require('../config/firebase-config');
const db = admin.firestore();

class RSVPModel {
    static async createRSVP(userId, eventId) {
        try {
            const rsvpRef = db.collection('rsvps').doc();
            await rsvpRef.set({
                userId,
                eventId,
                status: 'confirmed',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return rsvpRef.id;
        } catch (error) {
            throw error;
        }
    }

    static async getRSVPsByEventId(eventId) {
        try {
            const snapshot = await db.collection('rsvps')
                .where('eventId', '==', eventId)
                .get();
            
            const rsvps = [];
            snapshot.forEach(doc => {
                rsvps.push({ id: doc.id, ...doc.data() });
            });
            return rsvps;
        } catch (error) {
            throw error;
        }
    }

    static async getRSVPsByUserId(userId) {
        try {
            const snapshot = await db.collection('rsvps')
                .where('userId', '==', userId)
                .get();
            
            const rsvps = [];
            snapshot.forEach(doc => {
                rsvps.push({ id: doc.id, ...doc.data() });
            });
            return rsvps;
        } catch (error) {
            throw error;
        }
    }

    static async checkUserRSVP(userId, eventId) {
        try {
            const snapshot = await db.collection('rsvps')
                .where('userId', '==', userId)
                .where('eventId', '==', eventId)
                .get();
            
            return !snapshot.empty;
        } catch (error) {
            throw error;
        }
    }

    static async cancelRSVP(rsvpId) {
        try {
            const rsvpRef = db.collection('rsvps').doc(rsvpId);
            const rsvp = await rsvpRef.get();

            if (!rsvp.exists) {
                throw new Error('RSVP not found');
            }

            await db.runTransaction(async (transaction) => {
                // Decrement the event's currentAttendees
                const eventRef = db.collection('events').doc(rsvp.data().eventId);
                transaction.update(eventRef, {
                    currentAttendees: admin.firestore.FieldValue.increment(-1)
                });

                // Delete the RSVP
                transaction.delete(rsvpRef);
            });

            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RSVPModel;