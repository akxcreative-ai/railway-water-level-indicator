import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { formatTimeAgo } from '../utils/helpers';
import StatusBadge from './StatusBadge';

const Header = ({ deviceStatus, lastSeen, isConnected, onMenuToggle }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuToggle}>
          <Menu size={24} />
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Railway Water Level Monitoring System</h1>
      </div>
      
      <div className="header-right">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="text-sm text-muted">Status:</span>
          <StatusBadge 
            status={deviceStatus} 
            variant={deviceStatus === 'ONLINE' ? 'success' : 'danger'} 
          />
        </div>
        
        {lastSeen && (
          <div className="text-sm text-muted" style={{ whiteSpace: 'nowrap' }}>
            Last: {formatTimeAgo(lastSeen)}
          </div>
        )}
        
        <div style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
          {time.toLocaleTimeString()}
        </div>
        
        <div 
          className={`status-dot ${isConnected ? 'green' : 'red'}`} 
          title={isConnected ? 'Server Connected' : 'Server Disconnected'}
        />
      </div>
    </header>
  );
};

export default Header;
