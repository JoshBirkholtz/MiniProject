const admin = require('../config/firebase-config');
const db = admin.firestore();
const storage = admin.storage();
const RSVPModel = require('./rsvpModel');
const EmailService = require('../utils/emailService');
const UserModel = require('../models/userModel');

class EventModel {
    /**
     * Retrieves all active events from the database
     * Automatically updates event statuses before fetching
     */
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

    /**
     * Retrieves all events (including archived) for admin view
     * Automatically updates event statuses before fetching
     */
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

    /**
     * Creates a new event with provided data
     * Handles image upload and location data formatting
     */
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

    /**
     * Deletes an event and all associated data
     * Includes cleanup of RSVPs and event images
     */
    static async deleteEvent(eventId) {
        try {
            // Get event data and check if it exists
            const eventDoc = await db.collection('events').doc(eventId).get();
            if (!eventDoc.exists) {
                throw new Error('Event not found');
            }
            
            const eventData = eventDoc.data();

            // Start a batch write
            const batch = db.batch();

            // 1. Delete the event document
            const eventRef = db.collection('events').doc(eventId);
            batch.delete(eventRef);

            // 2. Get and delete all RSVPs for this event
            const rsvpsSnapshot = await db.collection('rsvps')
                .where('eventId', '==', eventId)
                .get();
            
            rsvpsSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            // 3. Execute the batch
            await batch.commit();

            // 4. Delete the image if it exists (outside batch as it's Storage operation)
            if (eventData.imageUrl) {
                try {
                    const fileRef = storage.bucket().file(`event-thumbnails/${eventId}`);
                    await fileRef.delete();
                } catch (storageError) {
                    console.error('Failed to delete thumbnail:', storageError);
                }
            }

            return true;
        } catch (error) {
            console.error('Delete Event Error:', error);
            throw error;
        }
    }

    /**
     * Processes user RSVP for an event
     * Handles attendance count, email confirmation, and capacity checks
     */
    static async rsvpToEvent(eventId, userId) {
        try {

            // Get user and event details
            const user = await UserModel.getUserById(userId);
            const event = await this.getEventById(eventId);

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

            // Send confirmation email to user
            await EmailService.sendRSVPConfirmation(
                user.email,
                event.name,
                {
                    date: new Date(event.startDate._seconds * 1000).toLocaleDateString(),
                    time: new Date(event.startDate._seconds * 1000).toLocaleTimeString(),
                    location: event.location.placeName
                }
            );

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Updates status of events based on end dates
     * Marks events as completed if end date has passed
     */
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

    /**
     * Retrieves all events a user has RSVP'd to
     * Filters out archived events and updates statuses
     */
    static async getEventsByUserId(userId) {
        try {
            // Get all RSVPs for this user
            const userRSVPs = await RSVPModel.getRSVPsByUserId(userId);

            // Update any events that should be marked as completed
            await this.updateEventStatuses();
            
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

    /**
     * Retrieves detailed information for a specific event
     * Returns null if event doesn't exist
     */
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

    /**
     * Updates event details including location and dates
     * Handles timestamp conversions and data formatting
     */
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

    /**
     * Updates event status (active/archived/completed)
     * Records update timestamp
     */
    static async updateEventStatus(eventId, status) {
        try {
            await db.collection('events').doc(eventId).update({
                status: status,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = EventModel;