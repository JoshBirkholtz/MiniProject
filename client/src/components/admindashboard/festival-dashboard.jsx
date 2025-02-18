import { useState, useEffect } from 'react';
import { Card, Text, Group, Stack, Title, Badge, Table, Grid, Container } from '@mantine/core';
import { IconUser, IconStar, IconChartBar, IconUsers, IconCalendarEvent, IconThumbUp } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { BarChart, DonutChart, RadialBarChart } from '@mantine/charts';

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
            totalRSVPs: 0,
            attendanceByEvent: [], 
            attendanceByCategory: {} 
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

    const transformBudgetData = (budgetPreferences) => {
        return Object.entries(budgetPreferences)
            .sort((a, b) => {
                // Sort by budget range (assuming format like "R0-R100")
                const aValue = parseInt(a[0].split('-')[0].replace('R', ''));
                const bValue = parseInt(b[0].split('-')[0].replace('R', ''));
                return aValue - bValue;
            });
    };

    const transformCategoryData = (categoryPreferences) => {
        if (!categoryPreferences) return [];
        return Object.entries(categoryPreferences)
            .sort((a, b) => b[1] - a[1]) // Sort by count in descending order
            .map(([category, count]) => ({
                category,
                count
            }));
    };

    const transformEventAttendanceData = (events) => {
        if (!events) return [];
        return events
            .sort((a, b) => b.currentAttendees - a.currentAttendees)
            .map(event => ({
                name: event.name,
                Attendees: event.currentAttendees
            }));
    };
    
    const transformCategoryAttendanceData = (categories) => {
        if (!categories) return [];
        const colors = ['blue.7', 'orange.6', 'yellow.7', 'cyan.6', 'green', 'pink', 'gray'];
        
        // Get total for percentage calculation
        const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
        
        return Object.entries(categories)
            .map(([category, attendees], index) => ({
                name: category,
                value: (attendees / total) * 100, // Convert to percentage
                color: colors[index % colors.length]
            }));
    };

    const categoryAttendanceData = transformCategoryAttendanceData(stats.eventStats.attendanceByCategory);

    return (
        <div className="p-6">
            <Title order={2} mb="xl">Festival Dashboard</Title>
            
            <Group mb="xl" grow position="apart">
                <Card shadow="sm" withBorder radius={12} padding={16}>
                    <Text size="sm" c="dimmed" mb={12}>Total Visitors</Text>
                    <Text size="xl" fw={700}>{stats.totalVisitors}</Text>
                </Card>
                <Card shadow="sm" withBorder radius={12} padding={16}>
                    <Text size="sm" c="dimmed" mb={12}>Total Events</Text>
                    <Text size="xl" fw={700}>{stats.eventStats.totalEvents}</Text>
                </Card>
                <Card shadow="sm" withBorder radius={12} padding={16}>
                    <Text size="sm" c="dimmed" mb={12}>Total RSVPs</Text>
                    <Text size="xl" fw={700}>{stats.eventStats.totalRSVPs}</Text>
                </Card>
            </Group>

            <Stack spacing="xl">
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
                    <Title order={3} mb="md">Preferences</Title>
                    <Group grow>
                        <Card shadow="sm" withBorder radius={12} padding={16}> 
                            <Text fw={700} mb="md">Budget</Text>
                            <Table verticalSpacing="md" highlightOnHover>
                                <Table.Tbody>
                                    {transformBudgetData(stats.demographics.budgetPreferences)
                                        .map(([range, count]) => (
                                            <Table.Tr key={range}>
                                                <Table.Td style={{ 
                                                    fontSize: '1rem', 
                                                    color: 'var(--mantine-color-gray-7)'
                                                }}>
                                                    {range}
                                                </Table.Td>
                                                <Table.Td style={{ textAlign: 'right' }}>
                                                    <Badge 
                                                        size="lg" 
                                                        radius="sm"
                                                        variant="light"
                                                        color="blue"
                                                    >
                                                        {count}
                                                    </Badge>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                </Table.Tbody>
                            </Table>
                        </Card>

                        <Card shadow="sm" withBorder radius={12} padding={16}> 
                            <Text fw={700} mb="md">Category</Text>
                            <Table verticalSpacing="md" highlightOnHover>
                                <Table.Tbody>
                                    {transformCategoryData(stats.demographics.eventCategories)
                                        .map((item) => (
                                            <Table.Tr key={item.category}>
                                                <Table.Td style={{ 
                                                    fontSize: '1rem', 
                                                    color: 'var(--mantine-color-gray-7)'
                                                }}>
                                                    {item.category}
                                                </Table.Td>
                                                <Table.Td style={{ textAlign: 'right' }}>
                                                    <Badge 
                                                        size="lg" 
                                                        radius="sm"
                                                        variant="light"
                                                        color="blue"
                                                    >
                                                        {item.count}
                                                    </Badge>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                </Table.Tbody>
                            </Table>
                        </Card>
  
                    </Group>
                </Card>

                <Card shadow="sm" withBorder radius={12} padding={16} mb={16}>
                    <Title order={3} mb="md">Attendance Analytics</Title>
                    <Group grow>
                    <Card shadow="sm" withBorder radius={12} padding={16}> 
                            <Text fw={700} mb="md">Attendance by Event</Text>
                            <Table verticalSpacing="md" highlightOnHover>
                                <Table.Tbody>
                                    {transformEventAttendanceData(stats.eventStats.attendanceByEvent)
                                        .map((item) => (
                                            <Table.Tr key={item.name}>
                                                <Table.Td style={{ 
                                                    fontSize: '1rem', 
                                                    color: 'var(--mantine-color-gray-7)'
                                                }}>
                                                    {item.name}
                                                </Table.Td>
                                                <Table.Td style={{ textAlign: 'right' }}>
                                                    <Badge 
                                                        size="lg" 
                                                        radius="sm"
                                                        variant="light"
                                                        color="blue"
                                                    >
                                                        {item.Attendees}
                                                    </Badge>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                </Table.Tbody>
                            </Table>
                        </Card>

                        <Card shadow="sm" withBorder radius={12} padding={16}>
                            <Text fw={700} mb="xs">Attendance by Category</Text>
                            <Container>
                                <RadialBarChart 
                                    data={categoryAttendanceData} 
                                    dataKey="value" 
                                    h={250}
                                    w={250} 
                                    withLegend
                                />
                            </Container>
                        </Card>
                    </Group>
                </Card>

            </Stack>
        </div>
    );
}

export default FestivalDashboard;