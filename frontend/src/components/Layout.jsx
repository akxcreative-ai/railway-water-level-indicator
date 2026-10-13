import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { fetchFleetOverview } from '../services/api';
import { connectSocket } from '../services/socket';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState('OFFLINE');
  const [lastSeen, setLastSeen] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const fleet = await fetchFleetOverview();
        const on = fleet.overview?.online || 0;
        const total = fleet.overview?.total || 0;
        setDeviceStatus(on > 0 ? `ONLINE ${on}/${total}` : 'OFFLINE');
      } catch (err) {
        console.error("Error fetching status:", err);
      }
    };

    init();

    const socket = connectSocket();
    
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    socket.on('device:status', (data) => {
      if (data.status === 'online') setDeviceStatus('ONLINE');
    });

    socket.on('reading:new', (data) => {
      setDeviceStatus('ONLINE');
      if (data.timestamp) setLastSeen(data.timestamp);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('device:status');
      socket.off('reading:new');
    };
  }, []);

  return (
    <div className="app-container">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="main-wrapper">
        <Header 
          deviceStatus={deviceStatus} 
          lastSeen={lastSeen} 
          isConnected={isConnected}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
