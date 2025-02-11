import { useEffect, useRef } from 'react';
import { TextInput } from '@mantine/core';

function LocationPicker({ onLocationSelect, initialLocation }) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (initialLocation?.address) {
            inputRef.current.value = initialLocation.address;
        }
    }, [initialLocation]);

    useEffect(() => {
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
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            types: ['establishment', 'geocode']
        });

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
            ref={inputRef}
            label="Location"
            placeholder="Search for a location"
            required
        />
    );
}

export default LocationPicker;