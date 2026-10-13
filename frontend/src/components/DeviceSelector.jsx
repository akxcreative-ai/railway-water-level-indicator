import React, { useEffect, useState } from 'react';
import { fetchCoaches } from '../services/api';
import { useSelectedDevice } from '../hooks/useSelectedDevice';

const DeviceSelector = () => {
  const [deviceId, setDeviceId] = useSelectedDevice();
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    fetchCoaches()
      .then((list) => {
        setCoaches(list);
        // saved device delete ho gaya ho to pehle available coach par shift karo
        if (list.length && !list.find((c) => c.device_id === deviceId)) {
          localStorage.setItem('wli_selected_device', list[0].device_id);
          window.dispatchEvent(new CustomEvent('wli-device-change', { detail: list[0].device_id }));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="card mb-4" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ fontWeight: 600 }}>Coach / Device:</span>
      <select
        className="form-select"
        value={deviceId}
        onChange={(e) => setDeviceId(e.target.value)}
        style={{ maxWidth: 340 }}
      >
        {coaches.map((c) => (
          <option key={c.device_id} value={c.device_id}>
            {c.coach_number || c.device_id} — {c.device_id} — Train {c.train_number || '--'} ({c.latest?.water_level ?? '--'}%)
          </option>
        ))}
      </select>
      <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
        Neeche gauge, chart, alerts sab isi coach ke dikhenge
      </span>
    </div>
  );
};

export default DeviceSelector;
