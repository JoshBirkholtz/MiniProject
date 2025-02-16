import { useState, useEffect } from 'react';
import { Tabs, Title, Select } from '@mantine/core';
import { IconChartBar, IconCalendar } from '@tabler/icons-react';
import FestivalDashboard from '../components/admindashboard/festival-dashboard';
import EventDashboard from '../components/admindashboard/event-dashboard';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function DashboardPage() {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!currentUser) return;

            try {
                const idToken = await currentUser.getIdToken();
                const response = await axios.get(
                    'http://localhost:5500/api/admin/events',
                    {
                        headers: {
                            'Authorization': `Bearer ${idToken}`
                        },
                        withCredentials: true
                    }
                );
                setEvents(response.data);
                if (response.data.length > 0) {
                    setSelectedEventId(response.data[0].id);
                }
            } catch (error) {
                console.error('Fetch Events Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [currentUser]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Title order={1} mb="xl">Admin Dashboard</Title>

            <Tabs defaultValue="festival" variant="pills">
                <Tabs.List justify="center" grow>
                    <Tabs.Tab 
                        value="festival" 
                        leftSection={<IconChartBar size={16} />}
                    >
                        Festival Overview
                    </Tabs.Tab>
                    <Tabs.Tab 
                        value="events" 
                        leftSection={<IconCalendar size={16} />}
                    >
                        Event Analytics
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="festival" pt="xl">
                    <FestivalDashboard />
                </Tabs.Panel>

                <Tabs.Panel value="events" pt="xl">
                    <EventDashboard events={events} />
                </Tabs.Panel>
            </Tabs>
        </div>
    );
}

export default DashboardPage;