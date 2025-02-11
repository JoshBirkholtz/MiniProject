import { Modal } from '@mantine/core';
import { useEffect, useRef } from 'react';

function MapModal({ isOpen, onClose, events }) {
    const mapRef = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        if (!isOpen || !events.length) return;

        // Load Google Maps JavaScript API with marker library
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=marker`;
        script.async = true;
        script.onload = initializeMap;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
            markersRef.current = [];
        };
    }, [isOpen, events]);

    const initializeMap = async () => {
        // Import the Advanced Marker library
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

        // Center on Cape Town by default
        const map = new google.maps.Map(mapRef.current, {
            center: { lat: -33.9249, lng: 18.4241 },
            zoom: 12,
            mapId: "CPT_Festival_Map_ID", // Required for advanced markers
        });

        // Create markers for each event
        events.forEach(event => {
            if (event.location?.latitude && event.location?.longitude) {
                const marker = new AdvancedMarkerElement({
                    position: {
                        lat: event.location.latitude,
                        lng: event.location.longitude
                    },
                    map,
                    title: event.name
                });

                // Create an info window for each marker
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="padding: 10px;">
                            <h3 style="margin: 0 0 8px 0;">${event.name}</h3>
                            <p style="margin: 0 0 8px 0;">${event.description}</p>
                            <p style="margin: 0;">
                                <strong>Location:</strong> ${event.location.placeName}<br>
                                <strong>Attendees:</strong> ${event.currentAttendees}/${event.maxAttendees}
                            </p>
                        </div>
                    `
                });

                // Add click listener to marker
                marker.addListener('click', () => {
                    // Close any open info windows
                    markersRef.current.forEach(m => m.infoWindow?.close());
                    infoWindow.open(map, marker);
                });

                // Store both marker and its info window
                markersRef.current.push({ marker, infoWindow });
            }
        });

        // Adjust map bounds to show all markers
        if (markersRef.current.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            markersRef.current.forEach(({ marker }) => {
                bounds.extend(marker.position);
            });
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