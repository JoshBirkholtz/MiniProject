// models/eventModel.js
const admin = require('../config/firebase-config');
const db = admin.firestore();
const RSVPModel = require('./rsvpModel');

class EventModel {
    static async getAllEvents() {
        try {
            // Update any events that should be marked as completed
            await this.updateEventStatuses();

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

    static async getAllEventsAdmin() {
        try {
            // Update any events that should be marked as completed
            await this.updateEventStatuses();

            const snapshot = await db.collection('events')
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
                location: {
                    placeName: eventData.location.placeName,
                    address: eventData.location.address,
                    latitude: eventData.location.latitude,
                    longitude: eventData.location.longitude,
                    placeId: eventData.location.placeId // Google Places ID
                },
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

    static async updateEventStatuses() {
        try {
            const now = admin.firestore.Timestamp.now();
            
            // Get all active events
            const snapshot = await db.collection('events')
                .where('status', '==', 'active')
                .get();

            const batch = db.batch();
            
            snapshot.forEach(doc => {
                const event = doc.data();
                // Check if end date is in the past
                if (event.endDate && event.endDate._seconds < now._seconds) {
                    // Update status to completed
                    batch.update(doc.ref, { status: 'completed' });
                }
            });

            await batch.commit();
        } catch (error) {
            console.error('Error updating event statuses:', error);
            throw error;
        }
    }

    static async getEventsByUserId(userId) {
        try {
            // Get all RSVPs for this user
            const userRSVPs = await RSVPModel.getRSVPsByUserId(userId);
            
            // Get all events for these RSVPs
            const eventPromises = userRSVPs.map(async rsvp => {
                const eventDoc = await db.collection('events').doc(rsvp.eventId).get();
                return { id: eventDoc.id, ...eventDoc.data() };
            });
            
            return Promise.all(eventPromises);
        } catch (error) {
            throw error;
        }
    }

    static async getEventById(eventId) {
        try {
            const eventDoc = await db.collection('events').doc(eventId).get();
            if (!eventDoc.exists) {
                return null;
            }
            return { id: eventDoc.id, ...eventDoc.data() };
        } catch (error) {
            throw error;
        }
    }

    static async updateEvent(eventId, eventData) {
        try {
            const eventRef = db.collection('events').doc(eventId);
            const eventDoc = await eventRef.get();

            if (!eventDoc.exists) {
                throw new Error('Event not found');
            }

            // Convert dates to Firestore timestamps
            const updatedData = {
                ...eventData,
                startDate: admin.firestore.Timestamp.fromDate(new Date(eventData.startDate)),
                endDate: admin.firestore.Timestamp.fromDate(new Date(eventData.endDate)),
                location: {
                    placeName: eventData.location.placeName,
                    address: eventData.location.address,
                    latitude: eventData.location.latitude,
                    longitude: eventData.location.longitude,
                    placeId: eventData.location.placeId
                },
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            await eventRef.update(updatedData);
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = EventModel;