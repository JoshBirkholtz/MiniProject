const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const EventModel = require('../models/eventModel');

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

module.exports = router;