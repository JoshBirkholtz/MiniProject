const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const EventModel = require('../models/eventModel');
const RSVPModel = require('../models/rsvpModel');

// Get all events (public route)
router.get('/', async (req, res) => {
    try {
        const events = await EventModel.getAllEvents();
        res.json(events);
    } catch (error) {
        console.error('Get Events Error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// RSVP to an event (protected route)
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

// Cancel RSVP
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

// Check if user has RSVP'd to an event
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

// Get user's RSVPed events
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

module.exports = router;