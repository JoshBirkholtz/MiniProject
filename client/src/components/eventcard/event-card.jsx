import { Card, Image, Text, Badge, Button, Group } from '@mantine/core';
import { IconMapPin, IconCalendar } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const formatFirebaseTimestamp = (timestamp) => {
    if (!timestamp) return 'Date TBA';
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleString('en-ZA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Johannesburg'
    });
};

function EventCard({ event }) {
    const navigate = useNavigate();
    const { currentUser, checkSession } = useAuth();
    const { name, description, date, location, maxAttendees, currentAttendees, status } = event;
    const [isRsvping, setIsRsvping] = useState(false);
    const [hasRSVPd, setHasRSVPd] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);

    // Check if user has RSVP'd when component mounts
    useEffect(() => {
        const checkRSVPStatus = async () => {
            if (!currentUser) return;

            try {
                const idToken = await currentUser.getIdToken();
                const response = await axios.get(
                    `http://localhost:5500/api/events/${event.id}/check-rsvp`,
                    {
                        headers: {
                            'Authorization': `Bearer ${idToken}`
                        },
                        withCredentials: true
                    }
                );
                setHasRSVPd(response.data.hasRSVP);
                console.log(response);
            } catch (error) {
                console.error('Check RSVP Error:', error);
            }
        };

        checkRSVPStatus();
    }, [currentUser, event.id]);

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
                `http://localhost:5500/api/events/${event.id}/rsvp`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    },
                    withCredentials: true // Important for cookies
                }
            );

            if (response.data.message === 'RSVP successful') {
                alert('Successfully RSVP\'d to event!');
                setHasRSVPd(true);
                // You might want to update the event's attendee count locally
                event.currentAttendees += 1;
            }
        } catch (error) {
            console.error('RSVP Error:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                alert(error.response?.data?.error || 'Failed to RSVP for event');
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
                `http://localhost:5500/api/events/${event.id}/rsvp/cancel`,
                {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    },
                    withCredentials: true
                }
            );
    
            if (response.data.message === 'RSVP cancelled') {
                setHasRSVPd(false);
                event.currentAttendees += 1;
            }
        } catch (error) {
            console.error('Cancel RSVP Error:', error);
        } finally {
            setIsCanceling(false);
        }
    };

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
                <Image
                    src={event.imageUrl || "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"}
                    height={160}
                    alt={name}
                />
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs">
                <Text fw={500}>{name}</Text>
                <Badge color={status === 'active' ? 'green' : 'gray'}>
                    {currentAttendees}/{maxAttendees} Attendees
                </Badge>
            </Group>

            <Text size="sm" c="dimmed">
                {description}
            </Text>

            <Group gap="xs" mt="md">
                <IconMapPin size={24} style={{ color: 'gray' }} />
                <Text size="sm">{location}</Text>
            </Group>
            <Group gap="xs" mt="xs">
                <IconCalendar size={24} style={{ color: 'gray' }} />
                <Text size="sm">{formatFirebaseTimestamp(date)}</Text>
            </Group>

            <Button
                color={hasRSVPd ? "red" : "blue"}
                fullWidth
                mt="md"
                radius="md"
                disabled={currentAttendees >= maxAttendees || isRsvping || isCanceling}
                onClick={hasRSVPd ? handleCancelRSVP : handleRSVP}
                loading={isRsvping || isCanceling}
            >
                {isRsvping ? 'Reserving...' : 
                isCanceling ? 'Canceling...' :
                hasRSVPd ? 'Cancel RSVP' :
                currentAttendees >= maxAttendees ? 'Event Full' : 
                'RSVP Now'}
            </Button> 

        </Card>
    );
}

export default EventCard;