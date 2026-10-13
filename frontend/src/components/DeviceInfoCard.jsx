import React from 'react';
import { Info, Hash, Fingerprint, Calendar, Tag, Activity, Cpu } from 'lucide-react';
import { formatTimeAgo } from '../utils/helpers';

const DeviceInfoCard = ({ device }) => {
  // device prop is the full status response: { device: {...}, online: bool, ... }
  const d = device?.device || device;

  if (!d) {
    return <div className="card animate-pulse"><div className="card-header"><h3 className="card-title">Device Info</h3></div><p>Loading...</p></div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Info size={20} className="text-muted" />
          Device Information
        </h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Hash size={16} /> Device ID
          </div>
          <div style={{ fontWeight: 500 }}>{d.device_id}</div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Cpu size={16} /> MPU ID
          </div>
          <div style={{ fontWeight: 500 }}>{d.mpu_id}</div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Fingerprint size={16} /> MAC ID
          </div>
          <div style={{ fontWeight: 500 }}>{d.mac_id}</div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Tag size={16} /> Name
          </div>
          <div style={{ fontWeight: 500 }}>{d.device_name}</div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Activity size={16} /> Firmware
          </div>
          <div style={{ fontWeight: 500 }}>{d.firmware_version}</div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Calendar size={16} /> Since
          </div>
          <div style={{ fontWeight: 500 }}>{formatTimeAgo(d.created_at)}</div>
        </div>
      </div>
    </div>
  );
};

export default DeviceInfoCard;
