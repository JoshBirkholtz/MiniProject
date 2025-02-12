import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TextInput, NumberInput, Textarea, Button, Stack, Paper, Title, Select } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import axios from 'axios';
import LocationPicker from '../components/locationpicker/location-picker';
import { useAuth } from '../contexts/AuthContext';
import { IconArchive, IconTrash, IconEdit } from '@tabler/icons-react';

const CRUDEventsPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const form = useForm({
        initialValues: {
            name: '',
            description: '',
            startDate: null,
            endDate: null,
            maxAttendees: 50,
            location: {
                placeName: '',
                address: '',
                latitude: null,
                longitude: null,
                placeId: ''
            },
            category: '',
            imageUrl: '',
            status: 'active'
        },
        validate: {
            name: (value) => !value ? 'Name is required' : null,
            description: (value) => !value ? 'Description is required' : null,
            startDate: (value) => !value ? 'Start date is required' : null,
            endDate: (value, values) => {
                if (!value) return 'End date is required';
                if (values.startDate && value < values.startDate) {
                    return 'End date must be after start date';
                }
                return null;
            },
            maxAttendees: (value) => value < 1 ? 'Must allow at least 1 attendee' : null,
            'location.address': (value) => !value ? 'Location is required' : null
        }
    });

    useEffect(() => {
        const fetchEvent = async () => {
            if (!eventId) return;

            try {
                const idToken = await currentUser.getIdToken();
                const response = await axios.get(`http://localhost:5500/api/admin/events/${eventId}`, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    },
                    withCredentials: true
                });

                // Convert Firestore timestamps to Date objects
                const eventData = response.data;
                const formattedData = {
                    ...eventData,
                    startDate: eventData.startDate?._seconds ? 
                        new Date(eventData.startDate._seconds * 1000) : null,
                    endDate: eventData.endDate?._seconds ? 
                        new Date(eventData.endDate._seconds * 1000) : null
                };

                form.setValues(formattedData);
            } catch (error) {
                console.error('Fetch Event Error:', error);
                setError('Failed to fetch event');
            }
        };

        fetchEvent();
    }, [eventId, currentUser]);

    const handleSubmit = async (values) => {
        setLoading(true);
        setError('');

        try {
            const idToken = await currentUser.getIdToken();
            const endpoint = eventId 
                ? `http://localhost:5500/api/admin/events/${eventId}`
                : 'http://localhost:5500/api/admin/events';
            
            const method = eventId ? 'PUT' : 'POST';
            
            await axios({
                method,
                url: endpoint,
                headers: {
                    'Authorization': `Bearer ${idToken}`
                },
                data: values,
                withCredentials: true
            });

            navigate('/my-events');
        } catch (error) {
            console.error('Submit Error:', error);
            setError(error.response?.data?.error || 'Failed to save event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Paper radius="md" p="xl" withBorder>
                <Title order={2} mb="xl">
                    {eventId ? 'Edit Event' : 'Create New Event'}
                </Title>

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <TextInput
                            required
                            label="Event Name"
                            placeholder="Enter event name"
                            {...form.getInputProps('name')}
                        />

                        <Textarea
                            required
                            label="Description"
                            placeholder="Enter event description"
                            minRows={3}
                            {...form.getInputProps('description')}
                        />

                        <DateTimePicker
                            required
                            label="Start Date & Time"
                            placeholder="Pick date and time"
                            {...form.getInputProps('startDate')}
                        />

                        <DateTimePicker
                            required
                            label="End Date & Time"
                            placeholder="Pick date and time"
                            {...form.getInputProps('endDate')}
                        />

                        <NumberInput
                            required
                            label="Maximum Attendees"
                            placeholder="Enter maximum number of attendees"
                            min={1}
                            {...form.getInputProps('maxAttendees')}
                        />

                        <LocationPicker
                            onLocationSelect={(location) => form.setFieldValue('location', location)}
                            initialLocation={form.values.location}
                        />

                        <Select
                            label="Category"
                            placeholder="Select event category"
                            data={['Art', 'Fashion', 'Beer', 'Food', 'Music']}
                            {...form.getInputProps('category')}
                        />

                        <TextInput
                            label="Image URL"
                            placeholder="Enter image URL"
                            {...form.getInputProps('imageUrl')}
                        />

                        {error && (
                            <Text color="red" size="sm">
                                {error}
                            </Text>
                        )}
                        <Button 
                            type="submit" 
                            loading={loading}
                            fullWidth
                        >
                            {eventId ? 'Update Event' : 'Create Event'}
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </div>
    );
};

export default CRUDEventsPage;