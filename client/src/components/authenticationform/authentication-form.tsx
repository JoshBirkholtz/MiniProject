"use client"

import {
    Anchor,
    Button,
    Checkbox,
    Divider,
    Group,
    Paper,
    PaperProps,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    NumberInput,
    Input,
    InputBase,
    Combobox,
    useCombobox,
    MultiSelect,
    SegmentedControl,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { upperFirst, useToggle } from '@mantine/hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Replace useRouter from Next.js
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import { showSuccessNotification } from '../notifications/success-notification';
import { showErrorNotification } from '../notifications/error-notification';

const genders = ['Male', 'Female', 'Prefer not to say'];

function AuthenticationForm(props: PaperProps) {
    const [type, toggle] = useToggle(['login', 'register']);
    const navigate = useNavigate(); // Replace router with navigate
    const [error, setError] = useState('');
    const [value, setValue] = useState<string | null>('');
    const [loading, setLoading] = useState(false);

    const options = genders.map((item) => (
        <Combobox.Option value={item} key={item}>
          {item}
        </Combobox.Option>
    ));

    interface FormValues {
        email: string;
        password: string;
        name: string;
        age: number;
        budgetPreference: string;
        gender: string;
        eventCategories: string[];  // Add this
        terms: boolean;
    }

    const form = useForm<FormValues>({
        initialValues: {
            email: '',
            password: '',
            name: '',
            age: 18,
            budgetPreference: 'R0-R500',
            gender: '',
            eventCategories: [],
            terms: true
        },
        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
            password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
        },
    });

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const handleSubmit = async (values: typeof form.values) => {
        setError('');
        setLoading(true);
        try {
            if (type === 'register') {
                // Registration flow
                const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
                const idToken = await userCredential.user.getIdToken(true); // Force refresh token
                const response = await fetch('http://localhost:5500/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        email: values.email,
                        name: values.name,
                        age: values.age,
                        gender: values.gender,
                        budgetPreference: values.budgetPreference,
                        eventCategories: values.eventCategories
                    })
                });

                if (response.ok) {
                    showSuccessNotification('Registration successful!');
                } else {
                    throw new Error('Registration failed');
                }
            } else {
                // Login flow
                try {
                    // Get user credentials
                    const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
                    
                    // Force refresh the token immediately
                    const idToken = await userCredential.user.getIdToken(true);

                    const response = await fetch('http://localhost:5500/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${idToken}`
                        },
                        credentials: 'include'
                    });

                    if (response.ok) {
                        const data = await response.json();
                        showSuccessNotification('Login successful!');
                        navigate('/');
                    } else {
                        const errorData = await response.json();
                        showErrorNotification(errorData.message || 'Login failed. Please try again.');
                    }
                } catch (error) {
                    let errorMessage = 'Invalid email or password';
                    if (error instanceof Error) {
                        if (error.message.includes('auth/invalid-credential')) {
                            errorMessage = 'Invalid email or password';
                        } else if (error.message.includes('auth/user-not-found')) {
                            errorMessage = 'No account exists with this email';
                        } else if (error.message.includes('auth/wrong-password')) {
                            errorMessage = 'Incorrect password';
                        }
                    }
                    showErrorNotification(errorMessage);
                    setError(errorMessage);
                }
            }
        } catch (error) {
            let errorMessage = 'Invalid email or password';
            if (error instanceof Error) {
                if (error.message.includes('auth/invalid-credential')) {
                    errorMessage = 'Invalid email or password';
                } else if (error.message.includes('auth/user-not-found')) {
                    errorMessage = 'No account exists with this email';
                } else if (error.message.includes('auth/wrong-password')) {
                    errorMessage = 'Incorrect password';
                }
            }
            showErrorNotification(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper radius="md" p="xl" withBorder {...props}>
            <Text size="lg" fw={500}>
                Welcome, {type} with
            </Text>

            <Divider labelPosition="center" my="lg" />

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    {type === 'register' && (
                        <TextInput
                            required
                            label="Name"
                            placeholder="Your name"
                            value={form.values.name}
                            onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
                            radius="md"
                        />
                    )}

                    <TextInput
                        required
                        label="Email"
                        placeholder="hello@mantine.dev"
                        value={form.values.email}
                        onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                        error={form.errors.email && 'Invalid email'}
                        radius="md"
                    />

                    <PasswordInput
                        required
                        label="Password"
                        placeholder="Your password"
                        value={form.values.password}
                        onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
                        error={form.errors.password && 'Password should include at least 6 characters'}
                        radius="md"
                    />

                    {type === 'register' && (
                        <>
                            <NumberInput
                                required
                                label="Age"
                                placeholder="Your age"
                            />
                            <Combobox
                                store={combobox}
                                onOptionSubmit={(val) => {
                                    form.setFieldValue('gender', val)
                                    setValue(val);
                                    combobox.closeDropdown();
                                }}
                                >
                                <Combobox.Target>
                                    <InputBase
                                        label="Gender"
                                        required
                                        component="button"
                                        type="button"
                                        pointer
                                        rightSection={<Combobox.Chevron />}
                                        rightSectionPointerEvents="none"
                                        onClick={() => combobox.toggleDropdown()}
                                        >
                                        {value || <Input.Placeholder>Pick value</Input.Placeholder>}
                                    </InputBase>
                                </Combobox.Target>

                                <Combobox.Dropdown>
                                    <Combobox.Options>{options}</Combobox.Options>
                                </Combobox.Dropdown>
                            </Combobox>
                            <Text size="sm" fw={500} mb={0}>
                                Budget Preference
                            </Text>
                            <SegmentedControl
                                data={[
                                    { label: 'R0-R500', value: 'R0-R500' },
                                    { label: 'R501-R1000', value: 'R501-R1000' },
                                    { label: 'R1001-R2000', value: 'R1001-R2000' },
                                    { label: 'R2000+', value: 'R2000+' },
                                ]}
                                {...form.getInputProps('budgetPreference')}
                                fullWidth
                                mt="0"
                            />
                            <MultiSelect
                                label="Your favorite event categories"
                                placeholder="Pick value"
                                data={['Art', 'Fashion', 'Beer', 'Food', 'Music']}
                                {...form.getInputProps('eventCategories')}
                            />
                            <Checkbox
                                label="I accept terms and conditions"
                                checked={form.values.terms}
                                onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
                            />
                        </>
                    )}
                </Stack>

                <Group justify="space-between" mt="xl">
                    <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
                        {type === 'register'
                            ? 'Already have an account? Login'
                            : "Don't have an account? Register"}
                    </Anchor>
                    <Button type="submit" radius="xl" loading={loading}>
                        {upperFirst(type)}
                    </Button>
                </Group>
            </form>
        </Paper>
    );
}
export default AuthenticationForm;