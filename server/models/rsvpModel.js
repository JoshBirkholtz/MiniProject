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

    static async getRSVP(userId, eventId) {
        try {
            const snapshot = await db.collection('rsvps')
                .where('userId', '==', userId)
                .where('eventId', '==', eventId)
                .limit(1)
                .get();
            
            if (snapshot.empty) {
                return null;
            }
            
            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            throw error;
        }
    }

    static async deleteRSVP(userId, eventId) {
        try {
            const rsvp = await this.getRSVP(userId, eventId);
            if (!rsvp) {
                throw new Error('RSVP not found');
            }

            await db.collection('rsvps').doc(rsvp.id).delete();
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async cancelRSVP(eventId, userId) {
        try {
            const rsvp = await this.getRSVP(userId, eventId);
            if (!rsvp) {
                throw new Error('RSVP not found');
            }
    
            await db.runTransaction(async (transaction) => {
                // Get event reference
                const eventRef = db.collection('events').doc(eventId);
                const eventDoc = await transaction.get(eventRef);
                
                if (!eventDoc.exists) {
                    throw new Error('Event not found');
                }

                // Update event attendee count
                transaction.update(eventRef, {
                    currentAttendees: admin.firestore.FieldValue.increment(-1)
                });
    
                // Delete the RSVP document
                const rsvpRef = db.collection('rsvps').doc(rsvp.id);
                transaction.delete(rsvpRef);
            });
    
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RSVPModel;