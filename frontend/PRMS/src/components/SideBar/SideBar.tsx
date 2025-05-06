


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

// Import follow/unfollow services
import { followUser, unfollowUser } from './followService';


interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}
const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  // Sample mentors data
  const mentors = [
    { id: "prof1", name: "Prof. Smith", avatar: "https://via.placeholder.com/40" },
    { id: "user2", name: "Prof. Johnson", avatar: "https://via.placeholder.com/40" },
    { id: "user3", name: "Prof. Williams", avatar: "https://via.placeholder.com/40" }
  ];

  // State to track follow status of each mentor
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeTab === "home") navigate('/');
    else if (activeTab === 'saved') navigate('/saved-docs');
    else if (activeTab === 'printing history') navigate('/requests');
  }, [activeTab, navigate]);

  // Handle follow/unfollow toggle
  const handleFollowToggle = async (mentorId: string) => {
    const followerId = '67890';
  
    try {
      if (followStates[mentorId]) {
        await unfollowUser(followerId, mentorId);
        setFollowStates(prev => ({ ...prev, [mentorId]: false }));
      } else {
        await followUser(followerId, mentorId);
        setFollowStates(prev => ({ ...prev, [mentorId]: true }));
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };
  

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
        {mentors.map((mentor) => {
          const isFollowing = followStates[mentor.id] || false;
          return (
            <div key={mentor.id} className="mentor-item">
              <img src={mentor.avatar} alt={mentor.name} className="mentor-avatar" />
              {!collapsed && (
                <>
                  <span className="mentor-name">{mentor.name}</span>
                  <button 
                    className={`follow-btn ${isFollowing ? 'following' : ''}`} 
                    onClick={() => handleFollowToggle(mentor.id)}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <Nav.Link className="settings-link" onClick={() => {
          setActiveTab("");
          navigate('account');
        }}>
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