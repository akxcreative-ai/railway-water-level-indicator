import React, { useState, useEffect } from 'react';
import { FlaskConical, Send, AlertTriangle } from 'lucide-react';
import { sendDeviceData, fetchCoaches } from '../services/api';
import DeviceSelector from '../components/DeviceSelector';
import { useSelectedDevice } from '../hooks/useSelectedDevice';

const DemoTest = () => {
  const [selectedDevice] = useSelectedDevice();
  const [coaches, setCoaches] = useState([]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCoaches().then(setCoaches).catch(console.error);
  }, []);

  const [customData, setCustomData] = useState({
    waterLevel: '50',
    battery: '85',
    sensorStatus: 'OK'
  });

  const getBasePayload = () => {
    const coach = coaches.find((c) => c.device_id === selectedDevice) || {};
    return {
      deviceId: selectedDevice,
      mpuId: coach.mpu_id || 'MPU-001',
      macId: coach.mac_id || 'AA:BB:CC:DD:EE:FF',
      latitude: 28.6139,
      longitude: 77.2090,
      network: '4G',
      signalStrength: 82,
      gpsStatus: 'FIXED',
      timestamp: new Date().toISOString()
    };
  };

  const handleSend = async (payloadOverride) => {
    setLoading(true);
    setResponse(null);
    try {
      const payload = { ...getBasePayload(), ...payloadOverride };
      const res = await sendDeviceData(payload, true);
      setResponse({ success: true, data: res });
    } catch (err) {
      setResponse({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSend = (e) => {
    e.preventDefault();
    handleSend({
      waterLevel: parseInt(customData.waterLevel),
      batteryPercentage: parseInt(customData.battery),
      sensorStatus: customData.sensorStatus
    });
  };

  return (
    <div className="animate-fade-in">
      <DeviceSelector />
      <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <FlaskConical size={28} color="var(--accent-purple)" />
        Demo & Testing Tools
      </h2>

      <div className="demo-banner">
        <AlertTriangle size={24} />
        <div>
          <strong>DEMO MODE ACTIVE</strong><br/>
          Data sent from this page is marked as DEMO and will not be mixed with production statistics.
        </div>
      </div>

      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Scenarios</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="btn btn-success" 
                style={{ justifyContent: 'flex-start' }}
                onClick={() => handleSend({ waterLevel: 75, batteryPercentage: 92, sensorStatus: 'OK' })}
                disabled={loading}
              >
                <Send size={16} /> Send Normal Data (75%)
              </button>
              
              <button 
                className="btn btn-warning" 
                style={{ justifyContent: 'flex-start' }}
                onClick={() => handleSend({ waterLevel: 25, batteryPercentage: 85, sensorStatus: 'OK' })}
                disabled={loading}
              >
                <Send size={16} /> Send Low Water Data (25%)
              </button>
              
              <button 
                className="btn btn-danger" 
                style={{ justifyContent: 'flex-start' }}
                onClick={() => handleSend({ waterLevel: 0, batteryPercentage: 80, sensorStatus: 'OK' })}
                disabled={loading}
              >
                <Send size={16} /> Send Empty Tank Data (0%)
              </button>
              
              <button 
                className="btn" 
                style={{ justifyContent: 'flex-start' }}
                onClick={() => handleSend({ waterLevel: -1, batteryPercentage: 70, sensorStatus: 'ERROR' })}
                disabled={loading}
              >
                <Send size={16} /> Send Sensor Error
              </button>
              
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.875rem', marginTop: '12px' }}>
                <strong>Offline Simulation:</strong> To simulate offline behavior, simply stop sending data. The server will automatically mark the device offline after the configured timeout (default 5 mins).
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Custom Payload</h3>
            </div>
            <form onSubmit={handleCustomSend}>
              <div className="form-group">
                <label className="form-label">Water Level (%)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={customData.waterLevel} 
                  onChange={e => setCustomData({...customData, waterLevel: e.target.value})}
                  min="-1" max="100"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Battery (%)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={customData.battery} 
                  onChange={e => setCustomData({...customData, battery: e.target.value})}
                  min="0" max="100"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sensor Status</label>
                <select 
                  className="form-select"
                  value={customData.sensorStatus}
                  onChange={e => setCustomData({...customData, sensorStatus: e.target.value})}
                >
                  <option value="OK">OK</option>
                  <option value="ERROR">ERROR</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                <Send size={16} /> Send Custom Data
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">API Response Viewer</h3>
          </div>
          
          <div style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            padding: '16px', 
            borderRadius: '8px', 
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            height: 'calc(100% - 60px)',
            overflowY: 'auto'
          }}>
            {loading ? (
              <span className="animate-pulse">Sending request...</span>
            ) : response ? (
              <span style={{ color: response.success ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {JSON.stringify(response, null, 2)}
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>
                No requests sent yet. Click a button to send demo data.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoTest;
