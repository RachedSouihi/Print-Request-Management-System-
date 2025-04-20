import React, { useState } from 'react'

import { Col, Nav } from 'react-bootstrap'
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router'
import Sidebar from '../../components/SideBar/SideBar'
import Overview from './Overview'
import Header from '../../layouts/Header'
import UserManagement from './UserManagement'
import PrintRequestsTable from './Overview'
import { FiHome, FiUsers, FiPrinter } from 'react-icons/fi'

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="d-flex gap-0">
      <Col md={3}>
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <h3 className="logo">Dashboard</h3>
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
              { path: 'overview', icon: <FiHome />, label: 'Overview' },
              { path: 'users', icon: <FiUsers />, label: 'Users' },
              { path: 'request-management', icon: <FiPrinter />, label: 'Request Management' },
            ].map((item) => (
              <Nav.Link
                key={item.path}
                as={Link as React.ElementType}
                to={`/dashboard/${item.path}`}
                className={window.location.pathname.includes(item.path) ? 'active' : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </Nav.Link>
            ))}
          </Nav>
        </div>
      </Col>

      <Col>

        <Routes>
          <Route path="overview" element={<Overview />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="request-management" element={<PrintRequestsTable />} />
        </Routes>
      </Col>
    </div>
  )
}
