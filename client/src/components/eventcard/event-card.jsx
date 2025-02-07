import { Card, Image, Text, Badge, Button, Group } from '@mantine/core';
import { IconMapPin, IconCalendar } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { useState } from 'react';
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
    const { currentUser } = useAuth();
    const { name, description, date, location, maxAttendees, currentAttendees, status } = event;
    const [isRsvping, setIsRsvping] = useState(false);

    const handleRSVP = async () => {
        if (!currentUser) {
            // Redirect to login if user is not authenticated
            navigate('/login');
            return;
        }

        setIsRsvping(true);
        try {
            const idToken = await currentUser.getIdToken();
            const response = await axios.post(
                `http://localhost:5500/api/events/${id}/rsvp`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                }
            );

            if (response.data.message === 'RSVP successful') {
                // Optionally update the UI to show success
                alert('Successfully RSVP\'d to event!');
                // You might want to update the event's attendee count locally
                event.currentAttendees += 1;
            }
        } catch (error) {
            console.error('RSVP Error:', error);
            alert(error.response?.data?.error || 'Failed to RSVP for event');
        } finally {
            setIsRsvping(false);
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
                color="blue"
                fullWidth
                mt="md"
                radius="md"
                disabled={currentAttendees >= maxAttendees || isRsvping}
                onClick={handleRSVP}
                loading={isRsvping}
            >
                {isRsvping ? 'Reserving...' : 
                 currentAttendees >= maxAttendees ? 'Event Full' : 'RSVP Now'}
            </Button>
        </Card>
    );
}

export default EventCard;