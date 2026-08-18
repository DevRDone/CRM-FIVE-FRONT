import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Inbox, Archive } from 'lucide-react';
import { submissionsApi } from '../../services/api';
import './Dashboard.css';

import DashboardHome from './DashboardHome';
import SubmissionsList from './SubmissionsList';
import FormsManager from './FormsManager';
import FormBuilder from './FormBuilder';

export default function Dashboard() {
  const [newCount, setNewCount] = useState(0);

  const fetchCount = async () => {
    try {
      const data = await submissionsApi.getSubmissions('', 'new');
      setNewCount(data.length);
    } catch (error) {
      console.error('Error fetching count:', error);
    }
  };

  useEffect(() => {
    fetchCount();
    window.addEventListener('submissionsUpdated', fetchCount);
    return () => window.removeEventListener('submissionsUpdated', fetchCount);
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <h1 className="logo-text">FIVE<span className="neon-dot">.</span>FORMS</h1>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/crm" end className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/crm/recents" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Inbox size={20} />
            <span>Recentes</span>
            {newCount > 0 && <span className="badge">{newCount}</span>}
          </NavLink>
          
          <NavLink to="/crm/all" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Todos Candidatos</span>
          </NavLink>
          
          <NavLink to="/crm/archived" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Archive size={20} />
            <span>Arquivados</span>
          </NavLink>
          
          <div className="nav-divider"></div>
          
          <NavLink to="/crm/forms" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={20} />
            <span>Meus Formulários</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <h2>Painel CRM</h2>
          <div className="user-profile">
            <span>Admin</span>
            <button 
              className="btn-text-small text-danger" 
              onClick={() => {
                localStorage.removeItem('fiveforms_token');
                window.location.href = '/login';
              }}
              style={{marginLeft: '16px'}}
            >
              Sair
            </button>
          </div>
        </header>
        
        <div className="content-area">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/recents" element={<SubmissionsList viewType="recents" />} />
            <Route path="/all" element={<SubmissionsList viewType="all" />} />
            <Route path="/archived" element={<SubmissionsList viewType="archived" />} />
            <Route path="/forms" element={<FormsManager />} />
            <Route path="/forms/new" element={<FormBuilder />} />
            <Route path="/forms/edit/:id" element={<FormBuilder />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
