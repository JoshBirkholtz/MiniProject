import { useState, useEffect } from 'react';
import { Card, Text, Group, Stack, Title, Badge, Table } from '@mantine/core';
import { IconUser, IconStar, IconChartBar } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

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

    return (
        <div className="p-6">
            <Title order={2} mb="xl">Festival Dashboard</Title>
            
            <Group grow mb="xl">
                <Card shadow="sm">
                    <Text size="lg" weight={500}>Total Visitors</Text>
                    <Text size="xl">{stats.totalVisitors}</Text>
                </Card>
                <Card shadow="sm">
                    <Text size="lg" weight={500}>Total Events</Text>
                    <Text size="xl">{stats.eventStats.totalEvents}</Text>
                </Card>
                <Card shadow="sm">
                    <Text size="lg" weight={500}>Total RSVPs</Text>
                    <Text size="xl">{stats.eventStats.totalRSVPs}</Text>
                </Card>
            </Group>

            <Stack spacing="xl">
                <Card shadow="sm">
                    <Title order={3} mb="md">Demographics</Title>
                    <Group grow>
                        <div>
                            <Text weight={500} mb="xs">Age Distribution</Text>
                            {Object.entries(stats.demographics.ageGroups).map(([range, count]) => (
                                <Group key={range} position="apart">
                                    <Text>{range}</Text>
                                    <Badge>{count}</Badge>
                                </Group>
                            ))}
                        </div>
                        <div>
                            <Text weight={500} mb="xs">Gender Distribution</Text>
                            {Object.entries(stats.demographics.genderDistribution).map(([gender, count]) => (
                                <Group key={gender} position="apart">
                                    <Text>{gender}</Text>
                                    <Badge>{count}</Badge>
                                </Group>
                            ))}
                        </div>
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