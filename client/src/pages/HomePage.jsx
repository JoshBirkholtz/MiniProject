import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, Image, Text, Badge, Button, Group, Select } from '@mantine/core';
import axios from "axios"
import EventCard from "../components/eventcard/event-card"


const HomePage = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  return (
    <div className="home-page min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-purple-700">
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="relative h-[400px]">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%201-6F76FVwLXGesDJyim8IrsgKxd1ldta.png"
            alt="K-pop group"
            className="object-contain w-full h-full"
          />
        </div>
        <div className="text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">SBS MTV The Kpop Show Ticket Package</h1>
          <p className="text-lg mb-8 text-white/90">
            Look no further! Our SBS The Show tickets are the simplest way for you to experience a live Kpop recording.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-pink-500 hover:bg-pink-600">
              Get Ticket
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-purple-600"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="container mx-auto px-12 py-12 bg-white rounded-t-3xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <div className="flex gap-4">
            <Select
              placeholder="Weekend"
              data={['Weekdays', 'Weekend']}
            />
            <Select
              placeholder="Category"
              data={['Art', 'Fashion', 'Beer', 'Food', 'Music']}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading events...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default HomePage

