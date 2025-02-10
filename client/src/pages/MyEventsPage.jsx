import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import EventCard from '../components/eventcard/event-card';

const MyEventsPage = () => {
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const { currentUser } = useAuth();

    // Check if user is admin when component mounts
    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!currentUser) return;
            const token = await currentUser.getIdTokenResult();
            setIsAdmin(token.claims?.role === 'admin');
        };

        checkAdminStatus();
    }, [currentUser]);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!currentUser) return;
    
            try {
                const idToken = await currentUser.getIdToken();
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
                setLoading(false);
            } catch (error) {
                console.error('Fetch Events Error:', error);
                setError('Failed to fetch events');
                setLoading(false);
            }
        };
    
        fetchEvents();
    }, [currentUser]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">
                {isAdmin ? 
                    'All Events' : 'My Events'}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
};

export default MyEventsPage;