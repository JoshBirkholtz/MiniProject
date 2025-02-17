import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import HomePage from "./pages/HomePage"
import NavBar from "./components/navbar/nav-bar"
import AuthenticationPage from "./pages/AuthenticationPage"
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications';
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import MyEventsPage from "./pages/MyEventsPage"
import CRUDEventsPage from "./pages/CRUDEventsPage"
import DashboardPage from "./pages/DashboardPage"

// Create a wrapper component to use useLocation
const AppContent = () => {
  const location = useLocation()
  const { currentUser } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  useEffect(() => {
    const checkAdminStatus = async () => {
        if (!currentUser) return;
        const token = await currentUser.getIdTokenResult();
        setIsAdmin(!!token.claims.admin);
    };

      checkAdminStatus();
  }, [currentUser]);

  return (
    <div className="App">
      {!isAuthPage && <NavBar />}
      <Routes>
        <Route path="/" element={
          isAdmin ? <Navigate to="/my-events" replace /> : <HomePage />
        } />
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
        <Notifications position="bottom-center" zIndex={2000} />
        <Router>
          <AppContent />
        </Router>
      </MantineProvider>
    </AuthProvider>
    
  )
}

export default App

