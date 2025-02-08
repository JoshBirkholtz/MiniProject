"use client"

import React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { IconLogout, IconUser } from '@tabler/icons-react'

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentUser, checkSession } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call your logout endpoint
      await fetch('http://localhost:5500/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <Link to="/" className="flex items-center py-4 px-2">
                <span className="font-semibold text-gray-500 text-lg">Your Logo</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300"
              >
                About
              </Link>
              <Link
                to="/services"
                className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300"
              >
                Services
              </Link>
              <Link
                to="/contact"
                className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300"
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition duration-150"
                >
                  <span className="text-gray-600">
                    {currentUser.displayName?.[0].toUpperCase() || <IconUser size={20} />}
                  </span>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      {currentUser.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <IconLogout size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="py-2 px-2 font-medium text-gray-500 rounded hover:bg-green-500 hover:text-white transition duration-300"
              >
                Log In
              </Link>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button className="outline-none mobile-menu-button" onClick={() => setIsOpen(!isOpen)}>
              <svg
                className="w-6 h-6 text-gray-500 hover:text-green-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
        <Link to="/" className="block py-2 px-4 text-sm hover:bg-green-500 hover:text-white transition duration-300">
          Home
        </Link>
        <Link
          to="/about"
          className="block py-2 px-4 text-sm hover:bg-green-500 hover:text-white transition duration-300"
        >
          About
        </Link>
        <Link
          to="/services"
          className="block py-2 px-4 text-sm hover:bg-green-500 hover:text-white transition duration-300"
        >
          Services
        </Link>
        <Link
          to="/contact"
          className="block py-2 px-4 text-sm hover:bg-green-500 hover:text-white transition duration-300"
        >
          Contact
        </Link>
        <Link
          to="/login"
          className="block py-2 px-4 text-sm hover:bg-green-500 hover:text-white transition duration-300"
        >
          Log In
        </Link>
        <Link
          to="/signup"
          className="block py-2 px-4 text-sm hover:bg-green-500 hover:text-white transition duration-300"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  )
}

export default Navbar

