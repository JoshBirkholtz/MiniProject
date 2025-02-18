import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import EventCard from '../components/eventcard/event-card';
import { Card, Image, Text, Badge, Button, Group, Modal, Table, Divider } from '@mantine/core';
import { IconPlus, IconUsers } from '@tabler/icons-react';
import { Link, useNavigate } from "react-router-dom"

const MyEventsPage = () => {
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Add these new states at the top of your component
    const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
    const [attendeesList, setAttendeesList] = useState([]);
    const [loadingAttendees, setLoadingAttendees] = useState(false);

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

    const fetchAllAttendees = async () => {
        setLoadingAttendees(true);
        try {
            const idToken = await currentUser.getIdToken();
            const response = await axios.get(
                'http://localhost:5500/api/admin/dashboard/festival',
                {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    },
                    withCredentials: true
                }
            );
            setAttendeesList(response.data.demographics.attendees || []);
        } catch (error) {
            console.error('Fetch Attendees Error:', error);
            showErrorNotification('Failed to fetch attendees');
        } finally {
            setLoadingAttendees(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    {isAdmin ? 'All Events' : 'My Events'}
                </h1>
                {isAdmin && (
                    <Group>
                        <Button
                            onClick={() => {
                                setAttendeesModalOpen(true);
                                fetchAllAttendees();
                            }}
                            leftSection={<IconUsers size={16} />}
                            variant="light"
                        >
                            View All Attendees
                        </Button>
                        <Button
                            onClick={() => navigate('/events/new')}
                            leftSection={<IconPlus size={16} />}
                        >
                            Create New Event
                        </Button>
                    </Group>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>

            {/* Attendees Modal */}
            <Modal
                opened={attendeesModalOpen}
                onClose={() => setAttendeesModalOpen(false)}
                title="Festival Attendees"
                size="lg"
                centered
            >
                {loadingAttendees ? (
                    <Text>Loading attendees...</Text>
                ) : (
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Age</Table.Th>
                                <Table.Th>Gender</Table.Th>
                                <Table.Th>Budget Preference</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {attendeesList.map((attendee) => (
                                <Table.Tr key={attendee.id}>
                                    <Table.Td>{attendee.name}</Table.Td>
                                    <Table.Td>{attendee.age}</Table.Td>
                                    <Table.Td>{attendee.gender}</Table.Td>
                                    <Table.Td>{attendee.budgetPreference}</Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}
            </Modal>
        </div>
    );
};

export default MyEventsPage;