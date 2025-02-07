import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import HomePage from "./pages/HomePage"
import NavBar from "./components/navbar/nav-bar"
import AuthenticationPage from "./pages/AuthenticationPage"
import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'

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
      </Routes>
    </div>
  )
}

function App() {
  const fetchAPI = async () => {
    try {
      const response = await axios.get("http://localhost:5500/api")
      console.log(response.data)
    } catch (error) {
      console.error("Error fetching API:", error)
    }
  }

  useEffect(() => {
    fetchAPI()
  }, [])

  return (
    <MantineProvider>
      <Router>
        <AppContent />
      </Router>
    </MantineProvider>
  )
}

export default App

