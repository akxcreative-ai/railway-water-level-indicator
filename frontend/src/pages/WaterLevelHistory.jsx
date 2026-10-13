import React, { useState, useEffect } from 'react';
import WaterLevelChart from '../components/WaterLevelChart';
import RecentDataTable from '../components/RecentDataTable';
import { fetchHistory } from '../services/api';
import { BarChart3 } from 'lucide-react';
import DeviceSelector from '../components/DeviceSelector';
import { useSelectedDevice } from '../hooks/useSelectedDevice';

const WaterLevelHistory = () => {
  const [selectedDevice] = useSelectedDevice();
  const [history, setHistory] = useState([]);
  const [activeRange, setActiveRange] = useState('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory(activeRange);
  }, [selectedDevice]);

  const loadHistory = async (range) => {
    setLoading(true);
    setActiveRange(range);
    try {
      const res = await fetchHistory(range, selectedDevice);
      setHistory(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <DeviceSelector />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChart3 size={28} color="var(--accent-blue)" />
          Water Level History
        </h2>
      </div>

      <div className="mb-4" style={{ height: '450px' }}>
        {loading ? (
          <div className="card animate-pulse" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Loading chart data...
          </div>
        ) : (
          <WaterLevelChart 
            data={history} 
            onRangeChange={loadHistory} 
            activeRange={activeRange} 
          />
        )}
      </div>

      <div>
        <RecentDataTable readings={[...history].reverse()} />
      </div>
    </div>
  );
};

export default WaterLevelHistory;
