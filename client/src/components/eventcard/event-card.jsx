import { Card, Image, Text, Badge, Button, Group, Menu, Modal, Table, ScrollArea } from '@mantine/core';
import { IconMapPin, IconCalendar, IconCalendarStats, IconCalendarX, IconEdit, IconSettings, IconArchive, IconTrash } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WeatherWidget from '../weather/weather-widget';
import RatingModal from '../ratingmodal/rating-modal';

import { showSuccessNotification } from '../notifications/success-notification';
import { showErrorNotification } from '../notifications/error-notification';

import { API_URL } from "../../config/api";

const formatFirebaseDateTime = (timestamp) => {
    if (!timestamp) return { date: 'TBA', time: 'TBA' };
    const date = new Date(timestamp._seconds * 1000);
    
    const formattedDate = date.toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const formattedTime = date.toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Johannesburg'
    });

    return { date: formattedDate, time: formattedTime };
};

function EventCard({ event }) {
    const navigate = useNavigate();
    const { currentUser, checkSession } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const { name, description, startDate, endDate, location, maxAttendees, currentAttendees, status } = event;
    const [isRsvping, setIsRsvping] = useState(false);
    const [hasRSVPd, setHasRSVPd] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [userRating, setUserRating] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
    const [attendeesList, setAttendeesList] = useState([]);
    const [loadingAttendees, setLoadingAttendees] = useState(false);

  // Check if user is admin when component mounts
  useEffect(() => {
    const checkAdminStatus = async () => {
        if (!currentUser) return;
        const token = await currentUser.getIdTokenResult();
        setIsAdmin(!!token.claims.admin);
    };

        checkAdminStatus();
    }, [currentUser]);

    // Check if user has RSVP'd when component mounts
    useEffect(() => {
        const checkRSVPStatus = async () => {
            if (!currentUser) return;

            try {
                const idToken = await currentUser.getIdToken();
                const response = await axios.get(
                    `${API_URL}/api/events/${event.id}/check-rsvp`,
                    {
                        headers: {
                            'Authorization': `Bearer ${idToken}`
                        },
                        withCredentials: true
                    }
                );
                setHasRSVPd(response.data.hasRSVP);
            } catch (error) {
                console.error('Check RSVP Error:', error);
            }
        };

        checkRSVPStatus();
    }, [currentUser, event.id, isAdmin]);

    // Check if user has rated an event already
    useEffect(() => {
        const checkUserRating = async () => {
            if (!currentUser || !status === 'completed' || !hasRSVPd) return;

            try {
                const idToken = await currentUser.getIdToken();
                const response = await axios.get(
                    `${API_URL}/api/events/${event.id}/ratings/${currentUser.uid}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${idToken}`
                        },
                        withCredentials: true
                    }
                );
                if (response.data) {
                    setUserRating(response.data);
                }
            } catch (error) {
                console.error('Check Rating Error:', error);
            }
        };

        checkUserRating();
    }, [currentUser, event.id, status, hasRSVPd]);

    const handleRSVP = async () => {
        if (!currentUser) {
            // Check session before redirecting
            const isValid = await checkSession();
            if (!isValid) {
                navigate('/login');
                return;
            }
        }

        setIsRsvping(true);
        try {
            const idToken = await currentUser.getIdToken();
            const response = await axios.post(
                `${API_URL}/api/events/${event.id}/rsvp`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    },
                    withCredentials: true
                }
            );

            if (response.data.message === 'RSVP successful') {
                showSuccessNotification('Successfully RSVP\'d to event!');
                setHasRSVPd(true);
                event.currentAttendees += 1;
            }
        } catch (error) {
            console.error('RSVP Error:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                showErrorNotification(error.response?.data?.error || 'Failed to RSVP for event');
            }
        } finally {
            setIsRsvping(false);
        }
    };

    const handleCancelRSVP = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
    
        setIsCanceling(true);
        try {
            const idToken = await currentUser.getIdToken();
            const response = await axios.delete(
                `${API_URL}/api/events/${event.id}/rsvp/cancel`,
                {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    },
                    withCredentials: true
                }
            );
    
            if (response.data.message === 'RSVP cancelled') {
                showSuccessNotification('Successfully cancelled RSVP to event!');
                setHasRSVPd(false);
                event.currentAttendees -= 1;
            }
        } catch (error) {
            showErrorNotification(error || 'Failed cancel RSVP for event');
        } finally {
            setIsCanceling(false);
        }
    };

    const handleEditEvent = () => {
        // Navigate to edit event page or open edit modal
        navigate(`/events/edit/${event.id}`);
    };

    const formatGoogleMapsUrl = (location) => {
        if (!location?.placeName) {
            return '#'; // Return a fallback URL if location or placeName is undefined
        }
        const query = location.placeName;
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    };

    const handleRateEvent = async (rating, recommendation, comment) => {
        try {
            const idToken = await currentUser.getIdToken();
            await axios.post(
                `${API_URL}/api/events/${event.id}/rate`,
                { rating, recommendation, comment },
                {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    },
                    withCredentials: true
                }
            );
            setUserRating({ rating, recommendation, comment });
            setIsRatingModalOpen(false);
            showSuccessNotification('Successfully rated event!');
        } catch (error) {
            console.error('Rating Error:', error);
            showErrorNotification(error || 'Failed to submit rating');
            throw new Error(error.response?.data?.error || 'Failed to submit rating');
        }
    };

    const handleArchive = async () => {
        try {
            const idToken = await currentUser.getIdToken();
            await axios.patch(
                `${API_URL}/api/admin/events/${event.id}/status`,
                { status: 'archived' },
                {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    },
                    withCredentials: true
                }
            );
            // Refresh the events list or update UI
            showSuccessNotification('Successfully archived event!');
            window.location.reload();
            
        } catch (error) {
            console.error('Archive Error:', error);
            showErrorNotification(error || 'Failed to archive event');
        }
    };
    
    const handleDelete = async () => {
        try {
            const idToken = await currentUser.getIdToken();
            await axios.delete(
                `${API_URL}/api/admin/events/${event.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    },
                    withCredentials: true
                }
            );
            // Refresh the events list or update UI
            showSuccessNotification('Successfully deleted event!');
            window.location.reload();
        } catch (error) {
            console.error('Delete Error:', error);
            showErrorNotification(error || 'Failed to delete event');
        }
    };

    const fetchAttendees = async () => {
        setLoadingAttendees(true);
        try {
            const idToken = await currentUser?.getIdToken();
            const response = await axios.get(
                `${API_URL}/api/admin/events/${event.id}/stats`,
                {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    },
                    withCredentials: true
                }
            );
            setAttendeesList(response.data.attendees || []);
        } catch (error) {
            console.error('Fetch Attendees Error:', error);
            showErrorNotification('Failed to fetch attendees');
        } finally {
            setLoadingAttendees(false);
        }
    };

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section style={{ position: 'relative' }}>
                <Image
                    src={event.imageUrl || "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"}
                    h={200}
                    alt={name}
                    fallbackSrc="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
                />
                {location?.latitude && location?.longitude && (
                    <div style={{ 
                        position: 'absolute', 
                        bottom: 10, 
                        left: 10, 
                        background: 'rgba(255, 255, 255, 1)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <WeatherWidget 
                            latitude={location.latitude}
                            longitude={location.longitude}
                            date={startDate}
                        />
                    </div>
                )}
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs">
                <Text fw={500}>{name}</Text>
                <Group gap="xs">
                    <Badge color="blue">
                        {event.category || 'Uncategorized'}
                    </Badge>
                    <Badge 
                        color={status === 'active' ? 'green' : 'gray'}
                        style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                        onClick={() => {
                            if (isAdmin) {
                                setAttendeesModalOpen(true);
                                fetchAttendees();
                            }
                        }}
                    >
                        {currentAttendees}/{maxAttendees} Attendees
                    </Badge>
                </Group>
            </Group>

            <ScrollArea h={40} scrollbarSize={6}>
                <Text size="sm" c="dimmed">
                    {description}
                </Text>
            </ScrollArea>

            <Group gap="xs" mt="md">
                <IconMapPin size={24} style={{ color: 'gray' }} />
                <Text 
                    size="sm" 
                    component="a" 
                    truncate="end"
                    href={formatGoogleMapsUrl(location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                        color: '#228be6', 
                        textDecoration: 'none',
                        maxWidth: '70%', 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        '&:hover': {
                            textDecoration: 'underline'
                        }
                        
                    }}
                >
                    {location?.placeName || 'Location not available'}
                </Text>
            </Group>

            
            <Group gap="xs" mt="xs">
                <IconCalendar size={24} style={{ color: 'gray' }} />
                <Text size="sm">
                    {formatFirebaseDateTime(startDate).date}
                </Text>
            </Group>
            <Group gap="xs" mt="xs" justify='space-between'>
                <Group gap="xs">
                    <IconCalendarStats size={24} style={{ color: 'gray' }}></IconCalendarStats>
                    <Text size="sm"> 
                        {formatFirebaseDateTime(startDate).time}
                    </Text>
                </Group>
                
                <Group gap="xs">
                    <IconCalendarX size={24} style={{ color: 'gray' }}></IconCalendarX>
                    <Text size="sm"> 
                        {formatFirebaseDateTime(endDate).time}
                    </Text>
                </Group>
                
            </Group>

            {isAdmin ? (
                // Admin sees Edit and settings button
                <Group grow>
                    <Button
                        color="yellow"
                        mt="md"
                        radius="md"
                        leftSection={<IconEdit size={16} />}
                        onClick={handleEditEvent}
                        disabled={status === 'completed' || status === 'archived'}
                        title={status === 'completed' ? 'Cannot edit completed events' : ''}
                    >
                        Edit Event
                    </Button>
                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <Button
                                color="gray"
                                mt="md"
                                radius="md"
                                leftSection={<IconSettings size={16} />}
                            >
                                Settings
                            </Button>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Label>Event Actions</Menu.Label>
                            <Menu.Item
                                color="yellow"
                                leftSection={<IconArchive size={16} />}
                                onClick={handleArchive}
                                disabled={status === 'archived'}
                            >
                                Archive Event
                            </Menu.Item>
                            <Menu.Item
                                color="red"
                                leftSection={<IconTrash size={16} />}
                                onClick={() => setDeleteModalOpen(true)}
                            >
                                Delete Event
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            ) : (
                status === 'completed' && hasRSVPd && !userRating ? (
                    <Button
                        color="gray"
                        fullWidth
                        mt="md"
                        onClick={() => setIsRatingModalOpen(true)}
                    >
                        Rate This Event
                    </Button>
                ) : (
                    userRating ? (
                        <Button
                            color="gray"
                            fullWidth
                            mt="md"
                            disabled
                        >
                            Event Completed
                        </Button>
                    ) : (
                        // Regular users see RSVP/rating button
                        <Button
                            color={hasRSVPd ? "red" : "blue"}
                            fullWidth
                            mt="md"
                            radius="md"
                            disabled={ (!hasRSVPd && currentAttendees >= maxAttendees) || isRsvping || isCanceling}
                            onClick={hasRSVPd ? handleCancelRSVP : handleRSVP}
                            loading={isRsvping || isCanceling}
                        >
                            {isRsvping ? 'Reserving...' : 
                            isCanceling ? 'Canceling...' :
                            hasRSVPd ? 'Cancel RSVP' :
                            currentAttendees >= maxAttendees ? 'Event Full' : 
                            'RSVP Now'}
                        </Button>
                    )
                )
            )}

            <Modal
                opened={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Event"
                centered
            >
                <Text size="sm" mb="lg">
                    Are you sure you want to delete this event? This action cannot be undone.
                </Text>
                <Group justify="flex-end">
                    <Button variant="light" onClick={() => setDeleteModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button color="red" onClick={handleDelete}>
                        Delete
                    </Button>
                </Group>
            </Modal>

            {/* Attendees Modal */}
            <Modal
                opened={attendeesModalOpen}
                onClose={() => setAttendeesModalOpen(false)}
                title="Event Attendees"
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

            <RatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                eventId={event.id}
                onSubmit={handleRateEvent}
                initialRating={userRating}
            /> 

        </Card>
    );
}

export default EventCard;