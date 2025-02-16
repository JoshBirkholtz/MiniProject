import { notifications } from '@mantine/notifications';
import { IconX } from '@tabler/icons-react';

export function showErrorNotification(message) {
    notifications.show({
        title: 'Error',
        message: message || 'An error occurred',
        color: 'red',
        icon: <IconX />,
        autoClose: 5000,
        withCloseButton: true,
    });
}