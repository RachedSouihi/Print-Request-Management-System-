import React, { useState, useRef, useEffect } from 'react';
import { FiBell, FiUser, FiSun, FiMoon, FiCheckCircle } from 'react-icons/fi';
import './Header.scss';

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeLink, setActiveLink] = useState('Home');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);

  const notifications = [
    { id: 1, title: 'New Assignment', message: 'Math homework due tomorrow', time: '2h ago', read: false },
    { id: 2, title: 'Grade Updated', message: 'Science test results available', time: '5h ago', read: true },
    { id: 3, title: 'Announcement', message: 'School event on Friday', time: '1d ago', read: true },
  ];

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
            <button 
              className="icon-btn" 
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FiBell />
              {notifications.some(n => !n.read) && (
                <span className="notification-badge"></span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-list">
                <div className="notification-header">
                  <h4>Notifications</h4>
                  <button className="mark-all-read">
                    <FiCheckCircle /> Mark all as read
                  </button>
                </div>
                
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  >
                    <div className="notification-indicator"></div>
                    <div className="notification-content">
                      <h5>{notification.title}</h5>
                      <p>{notification.message}</p>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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