import React, { useState, useEffect } from 'react';
import { fetchDeviceStatus } from '../services/api';
import { Cpu, Activity, Clock, Server, Hash, ShieldCheck } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import DeviceSelector from '../components/DeviceSelector';
import { useSelectedDevice } from '../hooks/useSelectedDevice';
import { formatDateTime, formatTimeAgo } from '../utils/helpers';

const DevicePage = () => {
  const [selectedDevice] = useSelectedDevice();
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDevice = async () => {
      setLoading(true);
      try {
        const data = await fetchDeviceStatus(selectedDevice);
        setDeviceData(data);
      } catch (err) {
        console.error("Error loading device:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDevice();
  }, [selectedDevice]);

  if (loading) return <div className="animate-pulse" style={{ padding: '24px' }}>Loading device info...</div>;
  if (!deviceData || !deviceData.device) return <div>Device not found</div>;

  const device = deviceData.device;
  const isOnline = deviceData.online;

  return (
    <div className="animate-fade-in">
      <DeviceSelector />
      <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Cpu size={28} color="var(--accent-blue)" />
        Device Details: {device.device_id}
      </h2>

      <div className="grid-3 mb-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Current Status</h3>
            <StatusBadge status={isOnline ? 'ONLINE' : 'OFFLINE'} variant={isOnline ? 'success' : 'danger'} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div className="text-sm text-muted">Last Communication</div>
              <div style={{ fontWeight: 500, fontSize: '1.1rem' }}>{formatTimeAgo(device.last_seen)}</div>
              <div className="text-sm text-muted">{formatDateTime(device.last_seen)}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Installation Date</div>
              <div style={{ fontWeight: 500 }}>{formatDateTime(device.created_at)}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Hardware Identity</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-secondary">Device Name</span>
              <span style={{ fontWeight: 500 }}>{device.device_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-secondary">MPU ID</span>
              <span style={{ fontWeight: 500 }}>{device.mpu_id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-secondary">MAC ID</span>
              <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{device.mac_id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-secondary">Sensor ID</span>
              <span style={{ fontWeight: 500 }}>{device.sensor_id}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Software & Configuration</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-secondary">Firmware Version</span>
              <span className="badge badge-info">{device.firmware_version}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-secondary">Installation Status</span>
              <span style={{ fontWeight: 500 }}>{device.installation_status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-secondary">Latest Water Level</span>
              <span style={{ fontWeight: 500 }}>{deviceData.latestWaterLevel != null ? `${deviceData.latestWaterLevel}%` : '--'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicePage;
