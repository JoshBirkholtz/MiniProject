import { useState, useEffect } from 'react';
import { Card, Text, Group, Stack, Title, Rating, Table } from '@mantine/core';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

function EventDashboard({ eventId }) {
    const { currentUser } = useAuth();
    const [eventStats, setEventStats] = useState({
        ratings: {
            average: 0,
            distribution: {},
            comments: []
        },
        demographics: {
            ageGroups: {},
            genderDistribution: {},
            budgetPreferences: {}
        },
        attendees: []
    });

    useEffect(() => {
        const fetchEventStats = async () => {
            if (!currentUser) return;
            try {
                const idToken = await currentUser.getIdToken();
                const response = await axios.get(
                    `http://localhost:5500/api/admin/events/${eventId}/stats`,
                    {
                        headers: {
                            'Authorization': `Bearer ${idToken}`
                        },
                        withCredentials: true
                    }
                );
                setEventStats(response.data);
            } catch (error) {
                console.error('Event Stats Error:', error);
            }
        };

        fetchEventStats();
    }, [eventId, currentUser]);

    return (
        <div className="p-6">
            <Title order={2} mb="xl">Event Dashboard</Title>

            <Stack spacing="xl">
                <Card shadow="sm">
                    <Title order={3} mb="md">Ratings</Title>
                    <Group position="apart" mb="md">
                        <Text>Average Rating:</Text>
                        <Rating value={eventStats.ratings.average} readOnly />
                    </Group>
                    <div>
                        {Object.entries(eventStats.ratings.distribution).map(([stars, count]) => (
                            <Group key={stars} position="apart">
                                <Rating value={parseInt(stars)} readOnly />
                                <Text>{count} reviews</Text>
                            </Group>
                        ))}
                    </div>
                </Card>

                <Card shadow="sm">
                    <Title order={3} mb="md">Visitor Comments</Title>
                    {eventStats.ratings.comments.map((comment, index) => (
                        <div key={index} className="mb-4 p-4 border-b">
                            <Rating value={comment.rating} readOnly mb="xs" />
                            <Text>{comment.text}</Text>
                        </div>
                    ))}
                </Card>

                <Card shadow="sm">
                    <Title order={3} mb="md">Attendee Demographics</Title>
                    <Group grow>
                        <div>
                            <Text weight={500} mb="xs">Age Groups</Text>
                            {Object.entries(eventStats.demographics.ageGroups).map(([range, count]) => (
                                <Group key={range} position="apart">
                                    <Text>{range}</Text>
                                    <Text>{count}</Text>
                                </Group>
                            ))}
                        </div>
                        <div>
                            <Text weight={500} mb="xs">Gender Distribution</Text>
                            {Object.entries(eventStats.demographics.genderDistribution).map(([gender, count]) => (
                                <Group key={gender} position="apart">
                                    <Text>{gender}</Text>
                                    <Text>{count}</Text>
                                </Group>
                            ))}
                        </div>
                    </Group>
                </Card>

                <Card shadow="sm">
                    <Title order={3} mb="md">Attendee List</Title>
                    <Table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Age</th>
                                <th>Gender</th>
                                <th>Budget Preference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventStats.attendees.map((attendee) => (
                                <tr key={attendee.id}>
                                    <td>{attendee.name}</td>
                                    <td>{attendee.age}</td>
                                    <td>{attendee.gender}</td>
                                    <td>{attendee.budgetPreference}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            </Stack>
        </div>
    );
}

export default EventDashboard;