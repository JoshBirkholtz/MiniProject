import { Group, Text, Tooltip } from '@mantine/core';
import { IconSun, IconCloud, IconCloudRain, IconCloudStorm } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

function WeatherWidget({ latitude, longitude, date }) {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Using OpenWeatherMap API
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric`
                );
                const data = await response.json();
                
                // Find forecast closest to event date
                const eventDate = new Date(date._seconds * 1000);
                const forecast = data.list.reduce((closest, current) => {
                    const currentDate = new Date(current.dt * 1000);
                    const currentDiff = Math.abs(currentDate - eventDate);
                    const closestDiff = Math.abs(new Date(closest.dt * 1000) - eventDate);
                    return currentDiff < closestDiff ? current : closest;
                });

                setWeather(forecast);
            } catch (error) {
                console.error('Weather Error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (latitude && longitude && date) {
            fetchWeather();
        }
    }, [latitude, longitude, date]);

    const getWeatherIcon = (weatherId) => {
        if (weatherId >= 200 && weatherId < 300) return <IconCloudStorm size={24} style={{ color: 'gray' }} />;
        if (weatherId >= 300 && weatherId < 600) return <IconCloudRain size={24} style={{ color: 'gray' }} />;
        if (weatherId >= 600 && weatherId < 700) return <IconCloud size={24} style={{ color: 'gray' }} />;
        if (weatherId === 800) return <IconSun size={24} style={{ color: 'gray' }} />;
        return <IconCloud size={24} style={{ color: 'gray' }} />;
    };

    if (loading || !weather) return null;

    return (
        <Tooltip
            label={`${weather.weather[0].description} - ${Math.round(weather.main.temp)}°C`}
        >
            <Group gap="xs" style={{ cursor: 'pointer' }}>
                {getWeatherIcon(weather.weather[0].id)}
                <Text size="sm">{Math.round(weather.main.temp)}°C</Text>
            </Group>
        </Tooltip>
    );
}

export default WeatherWidget;