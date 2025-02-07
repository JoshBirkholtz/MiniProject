"use client"

import React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

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
            <Link
              to="/login"
              className="py-2 px-2 font-medium text-gray-500 rounded hover:bg-green-500 hover:text-white transition duration-300"
            >
              Log In
            </Link>
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

