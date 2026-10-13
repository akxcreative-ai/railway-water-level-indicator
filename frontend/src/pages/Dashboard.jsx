import React, { useState, useEffect } from 'react';
import WaterLevelGauge from '../components/WaterLevelGauge';
import DeviceInfoCard from '../components/DeviceInfoCard';
import BatteryCard from '../components/BatteryCard';
import NetworkCard from '../components/NetworkCard';
import GpsLocationCard from '../components/GpsLocationCard';
import SystemStatus from '../components/SystemStatus';
import WaterLevelChart from '../components/WaterLevelChart';
import RecentDataTable from '../components/RecentDataTable';
import AlertPanel from '../components/AlertPanel';

import { fetchDeviceStatus, fetchLatestReading, fetchHistory, fetchAlerts, acknowledgeAlert } from '../services/api';
import { getSocket } from '../services/socket';
import DeviceSelector from '../components/DeviceSelector';
import { useSelectedDevice } from '../hooks/useSelectedDevice';

const Dashboard = () => {
  const [selectedDevice] = useSelectedDevice();
  const [device, setDevice] = useState(null);
  const [latestReading, setLatestReading] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeRange, setActiveRange] = useState('1h');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statusRes, latestRes, historyRes, alertsRes] = await Promise.all([
          fetchDeviceStatus(selectedDevice),
          fetchLatestReading(selectedDevice),
          fetchHistory(activeRange, selectedDevice),
          fetchAlerts(10, selectedDevice)
        ]);

        setDevice(statusRes);
        if (latestRes && Object.keys(latestRes).length > 0) {
          setLatestReading(latestRes);
        }
        setHistory(Array.isArray(historyRes) ? historyRes : []);
        setAlerts(Array.isArray(alertsRes) ? alertsRes : []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };

    loadData();

    const socket = getSocket();
    setIsConnected(socket.connected);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('reading:new', (data) => {
      if (data.device_id && data.device_id !== selectedDevice) return;
      setLatestReading(data);
      setHistory(prev => [...prev, data].slice(-100));
    });

    socket.on('alert:new', (data) => {
      if (data.device_id && data.device_id !== selectedDevice) return;
      setAlerts(prev => [data, ...prev].slice(0, 20));
    });

    socket.on('device:status', (data) => {
      if (data.deviceId && data.deviceId !== selectedDevice) return;
      setDevice(prev => prev ? { ...prev, online: data.status === 'online' } : prev);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('reading:new');
      socket.off('alert:new');
      socket.off('device:status');
    };
  }, [selectedDevice]);

  const handleRangeChange = async (range) => {
    setActiveRange(range);
    try {
      const res = await fetchHistory(range, selectedDevice);
      setHistory(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const handleAcknowledgeAlert = async (id) => {
    try {
      await acknowledgeAlert(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: 1 } : a));
    } catch (err) {
      console.error("Error acknowledging alert:", err);
    }
  };

  return (
    <div className="animate-fade-in">
      <DeviceSelector />
      <div className="grid-3 mb-4">
        <WaterLevelGauge 
          waterLevel={latestReading?.water_level} 
          lastUpdated={latestReading?.timestamp} 
        />
        <DeviceInfoCard device={device} />
        <BatteryCard 
          batteryPercentage={latestReading?.battery_percentage} 
          batteryVoltage={latestReading?.battery_voltage}
          lastUpdated={latestReading?.timestamp} 
        />
      </div>

      <div className="grid-3 mb-4">
        <NetworkCard 
          network={latestReading?.network} 
          signalStrength={latestReading?.signal_strength} 
          lastUpdated={latestReading?.timestamp} 
        />
        <GpsLocationCard 
          latitude={latestReading?.latitude} 
          longitude={latestReading?.longitude} 
          gpsStatus={latestReading?.gps_status} 
          lastUpdated={latestReading?.timestamp} 
        />
        <SystemStatus 
          latestReading={latestReading} 
          deviceOnline={device?.online} 
          serverOnline={isConnected} 
        />
      </div>

      <div className="mb-4" style={{ height: '400px' }}>
        <WaterLevelChart 
          data={history} 
          onRangeChange={handleRangeChange} 
          activeRange={activeRange} 
        />
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <RecentDataTable readings={history.slice(-20).reverse()} />
        <AlertPanel alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />
      </div>
    </div>
  );
};

export default Dashboard;
