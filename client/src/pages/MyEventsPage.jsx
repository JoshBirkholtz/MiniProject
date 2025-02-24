import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import EventCard from '../components/eventcard/event-card';
import { Card, Text, Button, Group, Modal, Table, Title } from '@mantine/core';
import { IconPlus, IconUsers, IconCalendarX } from '@tabler/icons-react';
import { Link, useNavigate } from "react-router-dom"

import { API_URL } from "../config/api";

const MyEventsPage = () => {
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminCheckComplete, setAdminCheckComplete] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
    const [attendeesList, setAttendeesList] = useState([]);
    const [loadingAttendees, setLoadingAttendees] = useState(false);

    // First useEffect to check admin status
    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!currentUser) {
                setIsAdmin(false);
                setAdminCheckComplete(true);
                return;
            }
            try {
                const token = await currentUser.getIdTokenResult(true); // Force refresh
                setIsAdmin(!!token.claims.admin);
            } catch (error) {
                console.error('Admin Check Error:', error);
                setIsAdmin(false);
            } finally {
                setAdminCheckComplete(true);
            }
        };

        checkAdminStatus();
    }, [currentUser]);

    // Second useEffect to fetch events
    useEffect(() => {
        const fetchEvents = async () => {
            if (!currentUser || !adminCheckComplete) {
                setMyEvents([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const idToken = await currentUser.getIdToken(true);
                const endpoint = isAdmin ? 
                    `${API_URL}/api/admin/events` : 
                    `${API_URL}/api/events/my-events`;

                const response = await axios.get(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    },
                    withCredentials: true
                });
                
                // Sort events by start date
                const sortedEvents = response.data.sort((a, b) => {
                    const dateA = a.startDate._seconds * 1000;
                    const dateB = b.startDate._seconds * 1000;
                    const now = Date.now();
                    
                    // Check if events are completed (end date has passed)
                    const isCompletedA = (a.endDate._seconds * 1000) < now;
                    const isCompletedB = (b.endDate._seconds * 1000) < now;
                    
                    // If one is completed and the other isn't, put completed at the end
                    if (isCompletedA && !isCompletedB) return 1;
                    if (!isCompletedA && isCompletedB) return -1;
                    
                    // If both are completed or both are upcoming, sort by closest to now
                    const diffA = Math.abs(dateA - now);
                    const diffB = Math.abs(dateB - now);
                    
                    return diffA - diffB;
                });

                setMyEvents(sortedEvents);
            } catch (error) {
                console.error('Fetch Events Error:', error);
                setError('Failed to fetch events');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [isAdmin, currentUser, adminCheckComplete]);

    const fetchAllAttendees = async () => {
        setLoadingAttendees(true);
        try {
            const idToken = await currentUser.getIdToken();
            const response = await axios.get(
                `${API_URL}/api/admin/dashboard/festival`,
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

    const NoEventsPlaceholder = ({ isAdmin }) => (
        <Card 
            shadow="sm" 
            padding="xl" 
            radius="md" 
            withBorder 
            className="flex flex-col items-center"
        >
            <IconCalendarX 
                size={48} 
                className="text-[var(--mantine-color-blue-6)] mb-4" 
            />
            <Title order={2} mb="xs">
                {isAdmin ? 'No Events Created Yet' : 'No Events Found'}
            </Title>
            <Text 
                c="dimmed" 
                size="sm" 
                ta="center" 
                maw={400} 
                mb="md"
            >
                {isAdmin 
                    ? 'Get started by creating your first event for the festival.'
                    : 'Browse available events and RSVP to see them here.'}
            </Text>
            <Button
                component={Link}
                to={isAdmin ? "/events/new" : "/"}
                variant="light"
                color="blue"
            >
                {isAdmin ? 'Create First Event' : 'Browse Events'}
            </Button>
        </Card>
    );

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    {isAdmin ? 'All Events' : 'My Events'}
                </h1>
                {isAdmin && (
                    <Group justify="flex-end">
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
                {myEvents.length > 0 ? (
                    myEvents.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))
                ) : (
                    <div className="col-span-full">
                        <NoEventsPlaceholder isAdmin={isAdmin} />
                    </div>
                )}
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