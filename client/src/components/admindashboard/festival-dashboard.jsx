import { useState, useEffect } from 'react';
import { Card, Text, Group, Stack, Title, Badge, Table, Grid, Container } from '@mantine/core';
import { IconUser, IconStar, IconChartBar, IconUsers, IconCalendarEvent, IconThumbUp } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { BarChart, DonutChart } from '@mantine/charts';

function FestivalDashboard() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        totalVisitors: 0,
        demographics: {
            ageGroups: {},
            genderDistribution: {},
            budgetPreferences: {},
            eventCategories: {}
        },
        eventStats: {
            totalEvents: 0,
            totalRSVPs: 0
        }
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUser) return;

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
                setStats(response.data);
            } catch (error) {
                console.error('Dashboard Error:', error);
            }
        };

        fetchDashboardData();
    }, [currentUser]);

    const transformAgeData = (ageGroups) => {
        return Object.entries(ageGroups).map(([range, count]) => ({
            age: range,
            Visitors: count 
        }));
    };

    const ageData = transformAgeData(stats.demographics.ageGroups);

    const transformGenderData = (genderDistribution) => {        
        return Object.entries(genderDistribution).map(([gender, count]) => ({
            name: gender,
            value: count,
            color: gender === 'Male' ? 'blue.6' : 
                   gender === 'Female' ? 'pink.6' : 
                   'yellow.6' // for other/non-binary
        }));
    };

    const genderData = transformGenderData(stats.demographics.genderDistribution);

    return (
        <div className="p-6">
            <Title order={2} mb="xl">Festival Dashboard</Title>
            
            <Group mb="xl" grow position="apart">
                <Card shadow="sm" withBorder radius={12} padding={16}>
                    <Text size="sm" c="dimmed">Total Visitors</Text>
                    <Text size="xl" fw={700}>{stats.totalVisitors}</Text>
                </Card>
                <Card shadow="sm" withBorder radius={12} padding={16}>
                    <Text size="sm" c="dimmed">Total Events</Text>
                    <Text size="xl" fw={700}>{stats.eventStats.totalEvents}</Text>
                </Card>
                <Card shadow="sm" withBorder radius={12} padding={16}>
                    <Text size="sm" c="dimmed">Total RSVPs</Text>
                    <Text size="xl" fw={700}>{stats.eventStats.totalRSVPs}</Text>
                </Card>
            </Group>

            <Stack spacing="xl">
                <Card shadow="sm" withBorder radius={12} padding={16}>
                    <Title order={3} mb="md">Demographics</Title>
                    <Group grow>
                        <Card shadow="sm" withBorder radius={12} padding={16}> 
                            <Text weight={500} mb="xs">Age Distribution</Text>
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
                                    withTooltip={false}
                                />
                            </Container>  
                        </Card>
                        <Card shadow="sm" withBorder radius={12} padding={16}>
                            <Text weight={500} mb="xs">Gender Distribution</Text>
                            <Container fluid>
                                <DonutChart data={genderData} />
                            </Container>
                        </Card>
                    </Group>
                </Card>

                <Card shadow="sm">
                    <Title order={3} mb="md">Budget Preferences</Title>
                    {Object.entries(stats.demographics.budgetPreferences).map(([range, count]) => (
                        <Group key={range} position="apart">
                            <Text>{range}</Text>
                            <Badge>{count}</Badge>
                        </Group>
                    ))}
                </Card>

                <Card shadow="sm">
                    <Title order={3} mb="md">Popular Categories</Title>
                    {Object.entries(stats.demographics.eventCategories).map(([category, count]) => (
                        <Group key={category} position="apart">
                            <Text>{category}</Text>
                            <Badge>{count}</Badge>
                        </Group>
                    ))}
                </Card>
            </Stack>
        </div>
    );
}

export default FestivalDashboard;