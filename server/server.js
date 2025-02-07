// server.js
const express = require('express');
const cors = require('cors');
const corsOptions = {
    origin: ["http://localhost:5173"]
};
const admin = require('./config/firebase-config');
const { authenticateUser, isAdmin } = require('./middleware/auth');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Register route
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, name, age, budgetPreference, gender, eventCategories } = req.body;
        const role = 'visitor'; // Default role for new registrations

        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
        });

        // Set custom claims for role-based auth
        await admin.auth().setCustomUserClaims(userRecord.uid, { role });

        await admin.firestore().collection('users').doc(userRecord.uid).set({
            name,
            email,
            age,
            gender,
            role,
            budgetPreference,
            eventCategories,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Sign in with Firebase Auth
        const userCredential = await admin.auth().getUserByEmail(email);

        res.json({
            user: {
                uid: userCredential.uid,
                email: userCredential.email,
                displayName: userCredential.displayName
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Public Routes -> Get all events
app.get('/api/events', async (req, res) => {
    try {
        const eventsRef = admin.firestore().collection('events');
        const snapshot = await eventsRef.where('status', '==', 'active').get();

        const events = [];
        snapshot.forEach(doc => {
            events.push({ id: doc.id, ...doc.data() });
        });

        res.json(events);
    } catch (error) {
        console.error('Get Events Error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Visitor Routes
app.post('/api/events/:eventId/rsvp', authenticateUser, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.uid;

        await admin.firestore().runTransaction(async (transaction) => {
            const eventRef = admin.firestore().collection('events').doc(eventId);
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

            const rsvpRef = admin.firestore().collection('rsvps').doc();
            transaction.set(rsvpRef, {
                userId,
                eventId,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        res.json({ message: 'RSVP successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Event Rating and Comments
app.post('/api/events/:eventId/rating', authenticateUser, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { rating, recommendRating, comment } = req.body;
        const userId = req.user.uid;

        await admin.firestore().collection('eventRatings').add({
            eventId,
            userId,
            rating,
            recommendRating,
            comment,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ message: 'Rating submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit rating' });
    }
});

// Admin Routes - Event Management
app.post('/api/admin/events', authenticateUser, isAdmin, async (req, res) => {
    try {
        const { name, description, date, location, maxAttendees } = req.body;
        const eventRef = await admin.firestore().collection('events').add({
            name,
            description,
            date,
            location,
            maxAttendees,
            currentAttendees: 0,
            status: 'active',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(201).json({ id: eventRef.id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// Admin Dashboard
app.get('/api/admin/dashboard', authenticateUser, isAdmin, async (req, res) => {
    try {
        // Get visitor demographics
        const usersSnapshot = await admin.firestore().collection('users').get();
        const users = [];
        usersSnapshot.forEach(doc => users.push(doc.data()));

        // Calculate demographics
        const demographics = {
            totalVisitors: users.length,
            genderDistribution: users.reduce((acc, user) => {
                acc[user.gender] = (acc[user.gender] || 0) + 1;
                return acc;
            }, {}),
            averageAge: users.reduce((sum, user) => sum + user.age, 0) / users.length,
            budgetPreferences: users.reduce((acc, user) => {
                acc[user.budgetPreference] = (acc[user.budgetPreference] || 0) + 1;
                return acc;
            }, {})
        };

        // Get event statistics
        const eventsSnapshot = await admin.firestore().collection('events').get();
        const events = [];
        eventsSnapshot.forEach(doc => {
            const event = doc.data();
            events.push({
                id: doc.id,
                ...event,
                attendanceRate: (event.currentAttendees / event.maxAttendees) * 100
            });
        });

        res.json({
            demographics,
            events
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

app.get('/api/admin/events/:eventId/dashboard', authenticateUser, isAdmin, async (req, res) => {
    try {
        const { eventId } = req.params;

        // Get event ratings and comments
        const ratingsSnapshot = await admin.firestore()
            .collection('eventRatings')
            .where('eventId', '==', eventId)
            .get();

        const ratings = [];
        ratingsSnapshot.forEach(doc => ratings.push(doc.data()));

        // Calculate statistics
        const statistics = {
            averageRating: ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length,
            averageRecommendRating: ratings.reduce((sum, r) => sum + r.recommendRating, 0) / ratings.length,
            comments: ratings.map(r => r.comment).filter(Boolean),
            totalAttendees: ratings.length
        };

        res.json(statistics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch event dashboard' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});