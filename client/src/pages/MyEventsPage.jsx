import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import EventCard from '../components/eventcard/event-card';
import { Card, Image, Text, Badge, Button, Group, Divider } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { Link, useNavigate } from "react-router-dom"

const MyEventsPage = () => {
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // First useEffect to check admin status
    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!currentUser) {
                setIsAdmin(false);
                return;
            }
            try {
                const token = await currentUser.getIdTokenResult(true); // Force refresh
                setIsAdmin(!!token.claims.admin);
            } catch (error) {
                console.error('Admin Check Error:', error);
                setIsAdmin(false);
            }
        };

        checkAdminStatus();
    }, [currentUser]);

    // Second useEffect to fetch events
    useEffect(() => {
        const fetchEvents = async () => {
            if (!currentUser) {
                setMyEvents([]);
                setLoading(false);
                return;
            }
    
            try {
                const idToken = await currentUser.getIdToken(true); // Force refresh
                const endpoint = isAdmin ? 
                    'http://localhost:5500/api/admin/events' : 
                    'http://localhost:5500/api/events/my-events';
    
                const response = await axios.get(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    },
                    withCredentials: true
                });
                setMyEvents(response.data);
            } catch (error) {
                console.error('Fetch Events Error:', error);
                setError('Failed to fetch events');
            } finally {
                setLoading(false);
            }
        };
    
        fetchEvents();
    }, [isAdmin, currentUser]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    {isAdmin ? 'All Events' : 'My Events'}
                </h1>
                {isAdmin && (
                    <Button
                        onClick={() => navigate('/events/new')}
                        leftSection={<IconPlus size={16} />}
                    >
                        Create New Event
                    </Button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
};

export default MyEventsPage;