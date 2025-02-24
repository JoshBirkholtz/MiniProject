const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const admin = require('../config/firebase-config');
const EventModel = require('../models/eventModel');
const RSVPModel = require('../models/rsvpModel');
const RatingModel = require('../models/ratingModel');

/**
 * Event Routes
 * Handles event management, RSVPs, and ratings
 */

/**
 * GET /events
 * Public route that retrieves all published events
 * Returns array of event objects with basic details
 */
router.get('/', async (req, res) => {
    try {
        const events = await EventModel.getAllEvents();
        res.json(events);
    } catch (error) {
        console.error('Get Events Error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

/**
 * POST /events/:eventId/rsvp
 * Allows authenticated users to RSVP for an event
 * Requires user authentication
 */
router.post('/:eventId/rsvp', authenticateUser, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.uid;
        
        await EventModel.rsvpToEvent(eventId, userId);
        res.json({ message: 'RSVP successful' });
    } catch (error) {
        console.error('RSVP Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /events/:eventId/rsvp/cancel
 * Allows users to cancel their event RSVP
 * Requires user authentication
 */
router.delete('/:eventId/rsvp/cancel', authenticateUser, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.uid;
        
        await RSVPModel.cancelRSVP(eventId, userId);
        res.json({ message: 'RSVP cancelled' });
    } catch (error) {
        console.error('Cancel RSVP Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /events/:eventId/check-rsvp
 * Checks if user has already RSVP'd to an event
 * Requires user authentication
 */
router.get('/:eventId/check-rsvp', authenticateUser, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.uid;
        
        const hasRSVP = await RSVPModel.checkUserRSVP(userId, eventId);
        res.json({ hasRSVP });
    } catch (error) {
        console.error('Check RSVP Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /events/my-events
 * Retrieves all events a user has RSVP'd to
 * Requires user authentication
 */
router.get('/my-events', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.uid;
        const events = await EventModel.getEventsByUserId(userId);
        res.json(events);
    } catch (error) {
        console.error('Get My Events Error:', error);
        res.status(500).json({ error: 'Failed to fetch your events' });
    }
});

/**
 * POST /events/:eventId/rate
 * Allows users to rate and review completed events
 * Requires user authentication and prior RSVP
 */
router.post('/:eventId/rate', authenticateUser, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.uid;
        const { rating, recommendation, comment } = req.body;

        // Check if user has already rated this event
        const existingRating = await RatingModel.getUserRatingForEvent(userId, eventId);
        if (existingRating) {
            return res.status(400).json({ error: 'You have already rated this event' });
        }
        
        // Check if user RSVP'd to this event
        const hasRSVP = await RSVPModel.checkUserRSVP(userId, eventId);
        if (!hasRSVP) {
            return res.status(403).json({ error: 'You must have RSVP\'d to rate this event' });
        }

        // Check if event has ended
        const event = await EventModel.getEventById(eventId);
        const now = admin.firestore.Timestamp.now();
        if (!event || event.endDate._seconds > now._seconds) {
            return res.status(403).json({ error: 'You can only rate events that have ended' });
        }

        await RatingModel.createRating(eventId, userId, rating, recommendation, comment);
        res.json({ message: 'Rating submitted successfully' });
    } catch (error) {
        console.error('Rate Event Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /events/:eventId/ratings
 * Retrieves all ratings for a specific event
 * Public route
 */
router.get('/:eventId/ratings', async (req, res) => {
    try {
        const { eventId } = req.params;
        const ratings = await RatingModel.getRatingsByEventId(eventId);
        res.json(ratings);
    } catch (error) {
        console.error('Get Ratings Error:', error);
        res.status(500).json({ error: 'Failed to fetch ratings' });
    }
});

/**
 * GET /events/:eventId/ratings/:userId
 * Retrieves a user's specific rating for an event
 * Requires user authentication and must be the rating owner
 */
router.get('/:eventId/ratings/:userId', authenticateUser, async (req, res) => {
    try {
        const { eventId, userId } = req.params;
        
        // Verify the requesting user is the same as userId
        if (req.user.uid !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const rating = await RatingModel.getUserRatingForEvent(userId, eventId);
        res.json(rating);
    } catch (error) {
        console.error('Get User Rating Error:', error);
        res.status(500).json({ error: 'Failed to fetch rating' });
    }
});

module.exports = router;