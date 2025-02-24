"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { IconLogout, IconUser, IconCircleFilled } from '@tabler/icons-react'
import { Menu } from '@mantine/core';

import { API_URL } from "../../config/api";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentUser, checkSession } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  // Check if user is admin when component mounts
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) return;
      const token = await currentUser.getIdTokenResult();
      setIsAdmin(!!token.claims.admin);
    };

    checkAdminStatus();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        className={`py-4 px-2 font-semibold flex items-center gap-2 transition duration-300 ${
          isActive 
            ? 'text-[var(--mantine-color-blue-6)]' 
            : 'text-gray-500 hover:text-[var(--mantine-color-blue-6)]'
        }`}
      >
        {children}
        {isActive && <IconCircleFilled size={8} className="text-[var(--mantine-color-blue-6)]" />}
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="/CapeTownLogo.svg" 
                  width={40} 
                  height={40} 
                  alt="Cape Town Logo"
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              {isAdmin ? (
                <>
                  <NavLink to="/my-events">All Events</NavLink>
                  <NavLink to="/admin/dashboard">Dashboard</NavLink>
                </>
              ) : (
                currentUser ? (
                  <>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/my-events">My Events</NavLink>
                  </>
                ) : (
                  <NavLink to="/">Home</NavLink>
                )
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center">
            {currentUser ? (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <button className="flex items-center justify-center h-10 w-10 rounded-full bg-[var(--mantine-color-blue-1)] hover:bg-[var(--mantine-color-blue-2)] transition-colors duration-200">
                    <span className="text-[var(--mantine-color-blue-7)] font-medium">
                      {currentUser.displayName?.[0].toUpperCase() || <IconUser size={20} />}
                    </span>
                  </button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>{currentUser.email}</Menu.Label>
                  <Menu.Item
                    leftSection={<IconLogout size={16} />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Link
                to="/login"
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-[var(--mantine-color-blue-6)] rounded-md hover:bg-[var(--mantine-color-blue-7)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--mantine-color-blue-6)] transition duration-200"
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {/* User Menu for Mobile */}
            {currentUser && (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <button className="flex items-center justify-center h-10 w-10 rounded-full bg-[var(--mantine-color-blue-1)] hover:bg-[var(--mantine-color-blue-2)] transition-colors duration-200">
                    <span className="text-[var(--mantine-color-blue-7)] font-medium">
                      {currentUser.displayName?.[0].toUpperCase() || <IconUser size={20} />}
                    </span>
                  </button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>{currentUser.email}</Menu.Label>
                  <Menu.Item
                    leftSection={<IconLogout size={16} />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}

            {/* Existing Burger Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden border-t border-gray-100`}>
        <div className="pt-2 pb-3 space-y-1">
          {isAdmin ? (
            <>
              <MobileNavLink to="/my-events">All Events</MobileNavLink>
              <MobileNavLink to="/admin/dashboard">Dashboard</MobileNavLink>
            </>
          ) : (
            currentUser ? (
              <>
                <MobileNavLink to="/">Home</MobileNavLink>
                <MobileNavLink to="/my-events">My Events</MobileNavLink>
              </>
            ) : (
              <>
                <MobileNavLink to="/">Home</MobileNavLink>
                <MobileNavLink to="/login">Log In</MobileNavLink>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

// Mobile navigation link component
const MobileNavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 text-base font-medium transition duration-200 ${
        isActive
          ? 'text-[var(--mantine-color-blue-6)] bg-[var(--mantine-color-blue-0)]'
          : 'text-gray-600 hover:text-[var(--mantine-color-blue-6)] hover:bg-gray-50'
      }`}
    >
      {children}
      {isActive && <IconCircleFilled size={8} className="ml-2 text-[var(--mantine-color-blue-6)]" />}
    </Link>
  );
};

export default Navbar;

