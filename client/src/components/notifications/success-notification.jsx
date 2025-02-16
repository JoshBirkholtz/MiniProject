import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';

export function showSuccessNotification(message) {
    notifications.show({
        title: 'Success',
        message: message,
        color: 'green',
        icon: <IconCheck />,
        autoClose: 5000,
        withCloseButton: true,
    });
}