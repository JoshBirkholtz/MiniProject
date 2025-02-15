const express = require('express');
const router = express.Router();
const { authenticateUser, isAdmin } = require('../middleware/auth');
const EventModel = require('../models/eventModel');
const UserModel = require('../models/userModel');
const RSVPModel = require('../models/rsvpModel');
const RatingModel = require('../models/ratingModel');

const { 
    calculateAgeGroups,
    calculateGenderDistribution,
    calculateBudgetPreferences,
    calculateEventCategories,
    calculateRatingStats,
    calculateAttendeeDemographics
} = require('../utils/statsCalculator');

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

// Get a single event
router.get('/events/:eventId', authenticateUser, isAdmin, async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await EventModel.getEventById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        console.error('Get Event Error:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
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

// Update an event
router.put('/events/:eventId', authenticateUser, isAdmin, async (req, res) => {
    try {
        const { eventId } = req.params;
        const eventData = req.body;
        await EventModel.updateEvent(eventId, eventData);
        res.json({ message: 'Event updated successfully' });
    } catch (error) {
        console.error('Update Event Error:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// Delete an event
router.delete('/events/:eventId', authenticateUser, isAdmin, async (req, res) => {
    try {
        const { eventId } = req.params;
        await EventModel.deleteEvent(eventId);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete Event Error:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// Archive/unarchive an event
router.patch('/events/:eventId/status', authenticateUser, isAdmin, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { status } = req.body;
        await EventModel.updateEventStatus(eventId, status);
        res.json({ message: 'Event status updated successfully' });
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ error: 'Failed to update event status' });
    }
});

// Get festival dashboard data
router.get('/dashboard/festival', authenticateUser, isAdmin, async (req, res) => {
    try {
        // Get all users
        const users = await UserModel.getAllUsers();

        // Get all events
        const events = await EventModel.getAllEventsAdmin();

        // Get all RSVPs
        const rsvps = await RSVPModel.getAllRSVPs();

        // Calculate statistics
        const stats = {
            totalVisitors: users.length,
            demographics: {
                ageGroups: calculateAgeGroups(users),
                genderDistribution: calculateGenderDistribution(users),
                budgetPreferences: calculateBudgetPreferences(users),
                eventCategories: calculateEventCategories(users)
            },
            eventStats: {
                totalEvents: events.length,
                totalRSVPs: rsvps.length
            }
        };

        res.json(stats);
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Get event-specific dashboard data
router.get('/events/:eventId/stats', authenticateUser, isAdmin, async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // Get event ratings
        const ratings = await RatingModel.getRatingsByEventId(eventId);

        // Get event RSVPs with user data
        const attendees = await RSVPModel.getRSVPsWithUserDataByEventId(eventId);

        const stats = {
            numRatings: ratings.length,
            ratings: calculateRatingStats(ratings),
            demographics: calculateAttendeeDemographics(attendees),
            attendees
        };

        res.json(stats);
    } catch (error) {
        console.error('Event Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch event statistics' });
    }
});

module.exports = router;