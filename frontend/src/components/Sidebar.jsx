import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Cpu, BarChart3, Bell,
  MapPin, ScrollText, FlaskConical, Settings, TrainFront,
  TrainTrack, Users, HeartPulse, ClipboardList, Layers
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <TrainFront size={24} color="var(--accent-blue)" />
        <span>WLI Monitor</span>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`} end onClick={onClose}>
          <LayoutDashboard size={20} />
          <span>Fleet Dashboard</span>
        </NavLink>

        <NavLink to="/rakes" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <TrainTrack size={20} />
          <span>Rakes / Trains</span>
        </NavLink>

        <NavLink to="/coaches" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Layers size={20} />
          <span>Coaches</span>
        </NavLink>

        <NavLink to="/supervisors" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Users size={20} />
          <span>Supervisors</span>
        </NavLink>

        <NavLink to="/health" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <HeartPulse size={20} />
          <span>Device Health</span>
        </NavLink>

        <NavLink to="/reports" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <ClipboardList size={20} />
          <span>Reports</span>
        </NavLink>

        <NavLink to="/single" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <LayoutDashboard size={20} />
          <span>Single Device</span>
        </NavLink>
        
        <NavLink to="/device" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Cpu size={20} />
          <span>Device</span>
        </NavLink>
        
        <NavLink to="/history" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <BarChart3 size={20} />
          <span>History</span>
        </NavLink>
        
        <NavLink to="/alerts" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Bell size={20} />
          <span>Alerts</span>
        </NavLink>
        
        <NavLink to="/location" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <MapPin size={20} />
          <span>Location</span>
        </NavLink>
        
        <NavLink to="/logs" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <ScrollText size={20} />
          <span>System Logs</span>
        </NavLink>
        
        <NavLink to="/demo" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <FlaskConical size={20} />
          <span>Demo / Test</span>
        </NavLink>
        
        <NavLink to="/settings" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
