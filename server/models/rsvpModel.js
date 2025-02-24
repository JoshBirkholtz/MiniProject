// models/rsvpModel.js
const admin = require('../config/firebase-config');
const db = admin.firestore();

class RSVPModel {
    /**
     * Creates a new RSVP record for a user and event
     * Returns the new RSVP document ID
     */
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

    /**
     * Retrieves all RSVPs for a specific event
     * Returns array of RSVP objects
     */
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

    /**
     * Retrieves all RSVPs for a specific user
     * Returns array of RSVP objects
     */
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

    /**
     * Checks if a user has RSVP'd to a specific event
     * Returns boolean indicating RSVP status
     */
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

    /**
     * Retrieves specific RSVP details for a user and event
     * Returns null if no RSVP exists
     */
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

    /**
     * Deletes an RSVP record
     * Returns true on successful deletion
     */
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

    /**
     * Cancels an RSVP and updates event attendance count
     * Uses transaction to ensure data consistency
     */
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

    /**
     * Retrieves all RSVPs in the system
     * Returns array of all RSVP records
     */
    static async getAllRSVPs() {
        try {
            const rsvpSnapshot = await db.collection('rsvps').get();

            const rsvps = [];

            rsvpSnapshot.forEach(doc => {
                rsvps.push({ id: doc.id, ...doc.data() });
            });

            return rsvps;

        } catch (error) {
            throw error;
        }
    }

    /**
     * Gets RSVPs for an event with detailed user information
     * Returns array of RSVP records with user profiles
     */
    static async getRSVPsWithUserDataByEventId(eventId) {
        try {
            const rsvpsSnapshot = await db.collection('rsvps')
                .where('eventId', '==', eventId)
                .get();

            const attendeesWithData = [];
            
            for (const doc of rsvpsSnapshot.docs) {
                const rsvpData = doc.data();
                const userDoc = await db.collection('users')
                    .doc(rsvpData.userId)
                    .get();
                
                if (userDoc.exists) {
                    attendeesWithData.push({
                        rsvpId: doc.id,
                        ...userDoc.data()
                    });
                }
            }

            return attendeesWithData;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RSVPModel;