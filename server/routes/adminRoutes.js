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

/**
 * Admin Routes for Event Management System
 * All routes require authentication and admin privileges
 */

/**
 * POST /admin/events
 * Creates a new event with provided details
 * Requires admin authentication
 */
router.post('/events', authenticateUser, isAdmin, async (req, res) => {
    try {
        const eventId = await EventModel.createEvent(req.body);
        res.status(201).json({ id: eventId });
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

/**
 * GET /admin/events/:eventId
 * Retrieves detailed information for a specific event
 * Requires admin authentication
 */
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

/**
 * GET /admin/dashboard
 * Retrieves general admin dashboard data
 * Requires admin authentication
 */
router.get('/dashboard', authenticateUser, isAdmin, async (req, res) => {
    try {
        // Add your dashboard data retrieval logic here
        res.json({ message: 'Admin dashboard data' });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

/**
 * GET /admin/events
 * Lists all events with admin-specific details
 * Requires admin authentication
 */
router.get('/events', authenticateUser, isAdmin, async (req, res) => {
    try {
        const events = await EventModel.getAllEventsAdmin();
        res.json(events);
    } catch (error) {
        console.error('Get Admin Events Error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

/**
 * PUT /admin/events/:eventId
 * Updates an existing event's details
 * Requires admin authentication
 */
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

/**
 * DELETE /admin/events/:eventId
 * Removes an event from the system
 * Requires admin authentication
 */
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

/**
 * PATCH /admin/events/:eventId/status
 * Updates event status (archive/unarchive)
 * Requires admin authentication
 */
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

/**
 * GET /admin/dashboard/festival
 * Retrieves comprehensive festival statistics including:
 * - User demographics
 * - Event statistics
 * - Attendance data
 * Requires admin authentication
 */
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
                eventCategories: calculateEventCategories(users),
                attendees: users.map(user => ({
                    id: user.id,
                    name: user.name,
                    age: user.age,
                    gender: user.gender,
                    budgetPreference: user.budgetPreference
                }))
            },
            eventStats: {
                totalEvents: events.length,
                totalRSVPs: rsvps.length,
                attendanceByEvent: events.map(event => ({
                    name: event.name,
                    currentAttendees: event.currentAttendees || 0
                })),
                attendanceByCategory: events.reduce((acc, event) => {
                    acc[event.category] = (acc[event.category] || 0) + (event.currentAttendees || 0);
                    return acc;
                }, {})
            }
        };

        res.json(stats);
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

/**
 * GET /admin/events/:eventId/stats
 * Retrieves detailed statistics for a specific event:
 * - Ratings and reviews
 * - Attendee demographics
 * - User feedback
 * Requires admin authentication
 */
router.get('/events/:eventId/stats', authenticateUser, isAdmin, async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // Get event ratings
        const ratings = await RatingModel.getRatingsByEventId(eventId);

        // Get user data for each rating
        const ratingsWithUserNames = await Promise.all(
            ratings.map(async (rating) => {
                const userData = await UserModel.getUserById(rating.userId);
                return {
                    ...rating,
                    userName: userData?.name || 'Anonymous'
                };
            })
        );

        // Get event RSVPs with user data
        const attendees = await RSVPModel.getRSVPsWithUserDataByEventId(eventId);

        const stats = {
            numRatings: ratings.length,
            ratings: calculateRatingStats(ratingsWithUserNames),
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