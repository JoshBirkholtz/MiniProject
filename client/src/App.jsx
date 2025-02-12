import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import HomePage from "./pages/HomePage"
import NavBar from "./components/navbar/nav-bar"
import AuthenticationPage from "./pages/AuthenticationPage"
import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import { AuthProvider } from "./contexts/AuthContext"
import MyEventsPage from "./pages/MyEventsPage"
import CRUDEventsPage from "./pages/CRUDEventsPage"
import DashboardPage from "./pages/DashboardPage"

// Create a wrapper component to use useLocation
const AppContent = () => {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  return (
    <div className="App">
      {!isAuthPage && <NavBar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthenticationPage type="login" />} />
        <Route path="/my-events" element={<MyEventsPage />} />
        <Route path="/events/new" element={<CRUDEventsPage />} />
        <Route path="/events/edit/:eventId" element={<CRUDEventsPage />} />
        <Route path="/admin/dashboard" element={<DashboardPage />} />
      </Routes>
    </div>
  )
}

function App() {

  return (
    <AuthProvider>
      <MantineProvider>
        <Router>
          <AppContent />
        </Router>
      </MantineProvider>
    </AuthProvider>
    
  )
}

export default App

