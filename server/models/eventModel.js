// models/eventModel.js
const admin = require('../config/firebase-config');
const db = admin.firestore();
const RSVPModel = require('./rsvpModel');

class EventModel {
    static async getAllEvents() {
        try {
            const snapshot = await db.collection('events')
                .where('status', '==', 'active')
                .get();
            
            const events = [];
            snapshot.forEach(doc => {
                events.push({ id: doc.id, ...doc.data() });
            });
            return events;
        } catch (error) {
            throw error;
        }
    }

    static async createEvent(eventData) {
        try {
            // Ensure both start and end dates are provided
            if (!eventData.startDate || !eventData.endDate) {
                throw new Error('Both start and end dates are required');
            }

            const eventRef = await db.collection('events').add({
                ...eventData,
                startDate: admin.firestore.Timestamp.fromDate(new Date(eventData.startDate)),
                endDate: admin.firestore.Timestamp.fromDate(new Date(eventData.endDate)),
                currentAttendees: 0,
                status: 'active',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return eventRef.id;
        } catch (error) {
            throw error;
        }
    }

    static async rsvpToEvent(eventId, userId) {
        try {
            // Check if user has already RSVP'd
            const hasRSVP = await RSVPModel.checkUserRSVP(userId, eventId);
            if (hasRSVP) {
                throw new Error('User has already RSVP\'d to this event');
            }

            await db.runTransaction(async (transaction) => {
                const eventRef = db.collection('events').doc(eventId);
                const eventDoc = await transaction.get(eventRef);

                if (!eventDoc.exists) {
                    throw new Error('Event not found');
                }

                const event = eventDoc.data();
                if (event.currentAttendees >= event.maxAttendees) {
                    throw new Error('Event is full');
                }

                transaction.update(eventRef, {
                    currentAttendees: admin.firestore.FieldValue.increment(1)
                });

                // Create RSVP using RSVPModel
                await RSVPModel.createRSVP(userId, eventId);
            });
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = EventModel;