import { useState, useEffect } from 'react';
import { Card, Text, Group, Stack, Title, Rating, Table, Select, Container } from '@mantine/core';
import { BarChart, DonutChart } from '@mantine/charts';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

function EventDashboard({ events }) {
    const { currentUser } = useAuth();
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [eventStats, setEventStats] = useState({
        ratings: {
            numRatings: 0,
            average: 0,
            recommendation: 0,
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
        // Set initial selected event
        if (events?.length > 0) {
            setSelectedEventId(events[0].id);
        }
    }, [events]);

    useEffect(() => {
        const fetchEventStats = async () => {
            if (!currentUser || !selectedEventId) return;
            try {
                const idToken = await currentUser.getIdToken();
                const response = await axios.get(
                    `http://localhost:5500/api/admin/events/${selectedEventId}/stats`,
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
    }, [selectedEventId, currentUser]);

    const transformAgeData = (ageGroups) => {
        return Object.entries(ageGroups).map(([range, count]) => ({
            age: range,
            Visitors: count 
        }));
    };

    const ageData = transformAgeData(eventStats.demographics.ageGroups);

    const transformGenderData = (genderDistribution) => {        
        return Object.entries(genderDistribution).map(([gender, count]) => ({
            name: gender,
            value: count,
            color: gender === 'Male' ? 'blue.6' : 
                   gender === 'Female' ? 'pink.6' : 
                   'yellow.6' // for other/non-binary
        }));
    };

    const genderData = transformGenderData(eventStats.demographics.genderDistribution);

    const attendeeRows = eventStats.attendees.map((attendee) => (
        <Table.Tr key={attendee.id}>
          <Table.Td>{attendee.name}</Table.Td>
          <Table.Td>{attendee.age}</Table.Td>
          <Table.Td>{attendee.gender}</Table.Td>
          <Table.Td>{attendee.budgetPreference}</Table.Td>
        </Table.Tr>
      ));

    return (
        <div className="p-6">
            <Group justify="space-between" align='top'>
                <Title order={2} mb="xl">Event Dashboard</Title>
                <Select
                    placeholder="Pick event"
                    value={selectedEventId || ''}
                    onChange={setSelectedEventId}
                    data={events?.map(event => ({
                        value: event.id,
                        label: event.name
                    })) || []}
                />
            </Group>

            <Group mb="xl" grow position="apart">

                <Card shadow="sm" withBorder radius={12} padding={16}>
                    <Text size="sm" c="dimmed" mb={12}>Total Attendees</Text>
                    <Text size="xl" fw={700}>{eventStats.attendees.length}</Text>
                </Card>

                <Card shadow="sm" withBorder radius={12} padding={16}>
                    <Text size="sm" c="dimmed" mb={12}>Total Ratings</Text>
                    <Text size="xl" fw={700}>{eventStats.numRatings}</Text>
                </Card>

                <Card shadow="sm" withBorder radius={12} padding={16}>
                    <Text size="sm" c="dimmed" mb={12}>Average Rating</Text>
                    <Group>
                        <Text size="xl" fw={700}>{eventStats.ratings.average}</Text>
                        <Rating value={eventStats.ratings.average} readOnly fractions={2} size="sm" />
                    </Group>
                </Card>

                <Card shadow="sm" withBorder radius={12} padding={16}>
                    <Text size="sm" c="dimmed" mb={12}>Average Recommendation</Text>
                    <Group>
                        <Text size="xl" fw={700}>{eventStats.ratings.recommendation}</Text>
                        <Rating value={eventStats.ratings.recommendation} readOnly fractions={2} size="sm" />
                    </Group>
                </Card>

            </Group>
            
            <Stack spacing="xl">

                <Card shadow="sm" withBorder radius={12} padding={16}>
                    <Title order={3} mb="md">Attendee Comments</Title>
                    <Group>
                        {eventStats.ratings.comments.map((comment, index) => (
                            <Card shadow="sm" withBorder radius={12} padding={16} key={index}>
                                <Rating value={comment.rating} readOnly mb="xs" />
                                <Text>{comment.text}</Text>
                            </Card>
                        ))}
                    </Group>
                </Card>

                <Card shadow="sm" withBorder radius={12} padding={16} mb={16}>
                    <Title order={3} mb="md">Demographics</Title>
                    <Group grow>
                        <Card shadow="sm" withBorder radius={12} padding={16}> 
                            <Text fw={700} mb="xs">Age Distribution</Text>
                            <Container fluid>
                                <BarChart
                                    h={300}
                                    w={300}
                                    data={ageData}
                                    dataKey="age"
                                    series={[
                                        { name: 'Visitors', color: 'blue.6' }
                                    ]}
                                    tickLine="y"
                                    yAxisLabel="Number of Visitors"
                                    xAxisLabel="Age Groups"
                                    withTooltip
                                />
                            </Container>  
                        </Card>
                        <Card shadow="sm" withBorder radius={12} padding={16}>
                            <Text fw={700} mb="xs">Gender Distribution</Text>
                            <Container fluid={true}>
                                <DonutChart data={genderData} size={250}/>
                            </Container>
                        </Card>
                    </Group>
                </Card>

                <Card shadow="sm" withBorder radius={12} padding={16}>
                    <Title order={3} mb="md">Attendee List</Title>
                    <Table highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Age</Table.Th>
                            <Table.Th>Gender</Table.Th>
                            <Table.Th>Budget Preference</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{attendeeRows}</Table.Tbody>
                    </Table>
                </Card>
            </Stack>
        </div>
    );
}

export default EventDashboard;