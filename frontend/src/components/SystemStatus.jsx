import React from 'react';
import { Cpu, Server, Wifi, MapPin, Target } from 'lucide-react';

const StatusItem = ({ icon: Icon, label, status, isOk }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Icon size={18} className="text-muted" />
      <span style={{ fontWeight: 500 }}>{label}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{status}</span>
      <div className={`status-dot ${isOk ? 'green' : 'red'}`} />
    </div>
  </div>
);

const SystemStatus = ({ latestReading, deviceOnline, serverOnline }) => {
  const sensorOk = latestReading?.sensor_status === 'OK';
  const gpsOk = latestReading?.gps_status === 'FIXED';
  const networkOk = latestReading?.network !== null && latestReading?.network !== undefined;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">System Status</h3>
      </div>
      
      <div style={{ display: 'grid', gap: '12px' }}>
        <StatusItem 
          icon={Target} 
          label="Sensor" 
          status={latestReading?.sensor_status || 'UNKNOWN'} 
          isOk={sensorOk} 
        />
        <StatusItem 
          icon={Cpu} 
          label="MPU" 
          status={deviceOnline ? 'ONLINE' : 'OFFLINE'} 
          isOk={deviceOnline} 
        />
        <StatusItem 
          icon={Wifi} 
          label="Network" 
          status={networkOk ? 'CONNECTED' : 'DISCONNECTED'} 
          isOk={networkOk} 
        />
        <StatusItem 
          icon={MapPin} 
          label="GPS" 
          status={latestReading?.gps_status || 'NO FIX'} 
          isOk={gpsOk} 
        />
        <StatusItem 
          icon={Server} 
          label="Server" 
          status={serverOnline ? 'ONLINE' : 'OFFLINE'} 
          isOk={serverOnline} 
        />
      </div>
    </div>
  );
};

export default SystemStatus;
