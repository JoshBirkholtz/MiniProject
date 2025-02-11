// client/src/components/mapmodal/map-modal.jsx
import { Modal, Button } from '@mantine/core';
import { useEffect, useRef } from 'react';

function MapModal({ isOpen, onClose, events }) {
    const mapRef = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        if (!isOpen || !events.length) return;

        // Load Google Maps JavaScript API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.onload = initializeMap;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
            markersRef.current = [];
        };
    }, [isOpen, events]);

    const initializeMap = () => {
        // Center on Cape Town by default
        const map = new google.maps.Map(mapRef.current, {
            center: { lat: -33.9249, lng: 18.4241 },
            zoom: 12
        });

        // Create markers for each event
        events.forEach(event => {
            if (event.location?.latitude && event.location?.longitude) {
                const marker = new google.maps.Marker({
                    position: {
                        lat: event.location.latitude,
                        lng: event.location.longitude
                    },
                    map,
                    title: event.name
                });

                // Add info window for each marker
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div>
                            <h3>${event.name}</h3>
                            <p>${event.description}</p>
                            <p>Attendees: ${event.currentAttendees}/${event.maxAttendees}</p>
                        </div>
                    `
                });

                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });

                markersRef.current.push(marker);
            }
        });

        // Adjust map bounds to show all markers
        if (markersRef.current.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            markersRef.current.forEach(marker => bounds.extend(marker.getPosition()));
            map.fitBounds(bounds);
        }
    };

    return (
        <Modal 
            opened={isOpen} 
            onClose={onClose}
            size="xl"
            title="Event Locations"
        >
            <div ref={mapRef} style={{ width: '100%', height: '500px' }} />
        </Modal>
    );
}

export default MapModal;