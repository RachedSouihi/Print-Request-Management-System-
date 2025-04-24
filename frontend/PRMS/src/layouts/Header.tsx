import React, { useState, useRef, useEffect } from 'react';
import { FiBell, FiUser, FiSun, FiMoon } from 'react-icons/fi';
import './Header.scss';
import { Notifications } from './Notification';

import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications, selectNotifications, markAsRead, markAsRead as markAllAsRead } from '../store/notificationSlice';
import { RootState } from '../store/store';
import { AppDispatch } from '../store/store';

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const dispatch: AppDispatch = useDispatch();
  const notifications = useSelector((state: RootState) => selectNotifications(state));
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch notifications when the component mounts
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllRead = () => {
    notifications.forEach((notification) => {
      if (!notification.read) {
        dispatch(markAllAsRead(notification.notif_id));
      }
    });
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

  const handleClick = (link: string) => {
    setActiveLink(link);
    navigate(link === 'Home' ? '/' : link.toLowerCase());
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
              onClick={() => handleClick(link)}
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