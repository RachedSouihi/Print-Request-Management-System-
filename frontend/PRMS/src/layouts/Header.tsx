import React, { useState, useRef, useEffect } from 'react';
import { FiBell, FiUser, FiSun, FiMoon, FiCheckCircle } from 'react-icons/fi';
import './Header.scss';
import {Notifications} from './Notification';

import { Notification } from './Notification';


const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const notifications_l = [
    { id: "1", type: "assignment", title: 'New Assignment', message: 'Math homework due tomorrow', timestamp: new Date(), /*time: '2h ago',*/ read: false },
    { id: "2", type: "grade", title: 'Grade Updated', message: 'Science test results available', timestamp: new Date(), /*time: '5h ago',*/ read: true },
    { id: "3", type: "announcement", title: 'Announcement', message: 'School event on Friday', timestamp: new Date(), /*time: '1d ago',*/ read: true },
  ];

  const [notifications, setNotifications] = useState<Notification[]>(notifications_l)


  const handleMarkRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id == id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  const handleClickOutside = (event: any) => {
    if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
      setShowNotifications(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`site-header ${isDarkMode ? 'dark' : ''}`}>
      <div className="header-content">
        {/* Logo Section */}
        <div className="logo">
          <span className="logo-highlight">School</span>.edu
        </div>

        {/* Navigation Links */}
        <nav className="main-nav">
          {['Home', 'Documents', 'Exercises'].map((link) => (
            <a
              key={link}
              href="#"
              className={`nav-link ${activeLink === link ? 'active' : ''}`}
              onClick={() => setActiveLink(link)}
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Right Side Icons */}
        <div className="header-controls">
          <button className="icon-btn" aria-label="Toggle dark mode" onClick={handleDarkModeToggle}>
            {isDarkMode ? <FiSun /> : <FiMoon />}
          </button>
          
          <div className="notification-wrapper" ref={notificationsRef}>


          <Notifications
              notifications={notifications}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}

              isDarkMode={isDarkMode}
            />     
          </div>

          <button className="icon-btn" aria-label="User profile">
            <FiUser />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;



/*

 <button 
              className="icon-btn" 
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FiBell />
              {notifications.some(n => !n.read) && (
                <span className="notification-badge"></span>
              )}
            </button>*/