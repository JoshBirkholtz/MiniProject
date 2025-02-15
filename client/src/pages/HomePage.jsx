import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, Image, Text, Badge, Button, Group, Select } from '@mantine/core';
import { IconMap, IconCalendarEvent, IconArrowRight } from '@tabler/icons-react';
import axios from "axios"
import EventCard from "../components/eventcard/event-card"
import MapModal from "../components/mapmodal/map-modal"


const HomePage = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5500/api/events")
        setEvents(response.data)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch events")
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Filter displayed events by category
  const filteredEvents = selectedCategory ? 
    events.filter(event => event.category === selectedCategory) : 
    events;

  return (
    <div className="home-page min-h-screen" style={{ 
      backgroundImage: 'url(/CapeTownHomePageBackground.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
        <Badge size="xl" radius="sm" className="mb-6" color="blue">
          Explore Cape Town's Cultural Scene
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight max-w-4xl text-white drop-shadow-lg">
          Discover Cape Town's<br />
          Vibrant Festival Culture
        </h1>
        <p className="text-xl mb-8 max-w-2xl text-white drop-shadow-md backdrop-blur-sm bg-black/10 p-4 rounded-lg">
          From cultural celebrations to music festivals, food markets to art exhibitions - 
          experience the Mother City's most exciting events all in one place.
        </p>
        <div className="flex gap-4">
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700 text-white"
            leftSection={<IconCalendarEvent size={20} />}
            onClick={() => document.getElementById('events-section').scrollIntoView({ behavior: 'smooth' })}
          >
            Browse Events
          </Button>
          <Button
            size="lg"
            variant="white"
            className="hover:bg-gray-100"
            leftSection={<IconMap size={20} />}
            onClick={() => setIsMapOpen(true)}
          >
            View Map
          </Button>
        </div>
      </section>

      {/* Events Section */}
      <section id="events-section" className="container mx-auto px-12 py-12 bg-white rounded-t-3xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <div className="flex gap-4">
            <Button
              variant="light"
              onClick={() => setIsMapOpen(true)}
              leftSection={<IconMap size={16} />}
            >
              View Map
            </Button>
            <Select
              placeholder="Category"
              value={selectedCategory}
              onChange={setSelectedCategory}
              data={[
                { value: '', label: 'All Categories' }, 
                { value: 'Art', label: 'Art' },
                { value: 'Fashion', label: 'Fashion' },
                { value: 'Beer', label: 'Beer' },
                { value: 'Food', label: 'Food' },
                { value: 'Music', label: 'Music' }
              ]}
              clearable  // Add this to allow clearing the selection
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading events...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        <MapModal
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          events={events}
        />
      </section>
    </div>
  )
}

export default HomePage

