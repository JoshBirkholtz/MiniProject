const express = require('express');
const router = express.Router();
const { authenticateUser, isAdmin } = require('../middleware/auth');
const EventModel = require('../models/eventModel');

// Create a new event (admin only)
router.post('/events', authenticateUser, isAdmin, async (req, res) => {
    try {
        const eventId = await EventModel.createEvent(req.body);
        res.status(201).json({ id: eventId });
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// Get admin dashboard data
router.get('/dashboard', authenticateUser, isAdmin, async (req, res) => {
    try {
        // Add your dashboard data retrieval logic here
        res.json({ message: 'Admin dashboard data' });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Display all events
router.get('/events', authenticateUser, isAdmin, async (req, res) => {
    try {
        const events = await EventModel.getAllEventsAdmin();
        res.json(events);
    } catch (error) {
        console.error('Get Admin Events Error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

module.exports = router;