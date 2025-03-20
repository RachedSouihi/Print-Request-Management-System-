import React, { useEffect, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { 
  FiHome, FiMail, FiBookOpen, FiCheckSquare, 
  FiUsers, FiUserPlus, FiSettings, FiLogOut,
  FiBookmark
} from 'react-icons/fi';

import { VscHistory } from "react-icons/vsc";

import './SideBar.scss';
import { useNavigate } from 'react-router';

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();

  const mentors = [
    { id: 1, name: "Prof. Smith", avatar: "https://via.placeholder.com/40" },
    { id: 2, name: "Prof. Johnson", avatar: "https://via.placeholder.com/40" },
    { id: 3, name: "Prof. Williams", avatar: "https://via.placeholder.com/40" }
  ];


  useEffect(() => {


      activeTab === "home" && navigate('/')
      activeTab === 'saved' && navigate('/saved-docs')
      activeTab === 'printing history' && navigate('/requests')
  }, [activeTab])

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h3 className="logo">EduPlatform</h3>
        <button 
          className="toggle-btn" 
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <Nav className="sidebar-nav d-block">
        {[
          { id: 'home', icon: <FiHome />, label: 'Home' },
          { id: 'saved', icon: <FiBookmark />, label: 'Saved' },

          { id: 'printing history', icon: <VscHistory />, label: 'Printing history' },
          { id: 'tasks', icon: <FiCheckSquare />, label: 'Tasks' },
          { id: 'groups', icon: <FiUsers />, label: 'Groups' },
          { id: 'friends', icon: <FiUserPlus />, label: 'Friends' }
        ].map((item) => (
          <Nav.Link
            key={item.id}
            className={activeTab === item.id ? 'active' : ''}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </Nav.Link>
        ))}
      </Nav>

      <div className="mentors-section">
        <h4 className="section-title">Professors</h4>
        {mentors.map((mentor) => (
          <div key={mentor.id} className="mentor-item">
            <img src='boy.png' alt={mentor.name} className="mentor-avatar" />
            {!collapsed && (
              <>
                <span className="mentor-name">{mentor.name}</span>
                <button className="follow-btn">Follow</button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <Nav.Link className="settings-link" onClick={() => {
          setActiveTab("");
          
          navigate('account')}}>
          <FiSettings className="nav-icon" />
          {!collapsed && 'Settings'}
        </Nav.Link>
        <Nav.Link className="logout-link">
          <FiLogOut className="nav-icon" />
          {!collapsed && 'Logout'}
        </Nav.Link>
      </div>
    </div>
  );
};

export default Sidebar;