import { useEffect, useRef } from 'react';
import { TextInput, Paper } from '@mantine/core';

function LocationPicker({ onLocationSelect }) {
    const autocompleteRef = useRef(null);

    useEffect(() => {
        // Load Google Maps JavaScript API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.onload = initializeAutocomplete;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const initializeAutocomplete = () => {
        const autocomplete = new google.maps.places.Autocomplete(
            autocompleteRef.current,
            { types: ['establishment', 'geocode'] }
        );

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                onLocationSelect({
                    placeName: place.name,
                    address: place.formatted_address,
                    latitude: place.geometry.location.lat(),
                    longitude: place.geometry.location.lng(),
                    placeId: place.place_id
                });
            }
        });
    };

    return (
        <TextInput
            ref={autocompleteRef}
            placeholder="Search for a location"
            label="Event Location"
            required
        />
    );
}

export default LocationPicker;