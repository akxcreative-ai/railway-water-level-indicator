import React, { useState, useEffect } from 'react';
import { fetchLatestReading } from '../services/api';
import { MapPin, Navigation } from 'lucide-react';
import GpsLocationCard from '../components/GpsLocationCard';
import DeviceSelector from '../components/DeviceSelector';
import { useSelectedDevice } from '../hooks/useSelectedDevice';

const LocationPage = () => {
  const [selectedDevice] = useSelectedDevice();
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLocation = async () => {
      setLoading(true);
      try {
        const data = await fetchLatestReading(selectedDevice);
        setReading(data);
      } catch (err) {
        console.error("Error loading location:", err);
      } finally {
        setLoading(false);
      }
    };
    loadLocation();
  }, [selectedDevice]);

  const hasLocation = typeof reading?.latitude === 'number' && typeof reading?.longitude === 'number' && !isNaN(reading.latitude) && !isNaN(reading.longitude);

  return (
    <div className="animate-fade-in">
      <DeviceSelector />
      <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <MapPin size={28} color="var(--accent-blue)" />
        Device Location
      </h2>

      {loading ? (
        <div className="animate-pulse">Loading location data...</div>
      ) : (
        <div className="grid-2" style={{ gridTemplateColumns: '1fr 2fr' }}>
          <div>
            <GpsLocationCard 
              latitude={reading?.latitude} 
              longitude={reading?.longitude} 
              gpsStatus={reading?.gps_status} 
              lastUpdated={reading?.timestamp} 
            />
            
            <div className="card mt-4" style={{ marginTop: '24px' }}>
              <div className="card-header">
                <h3 className="card-title">Location Details</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-secondary">Network Status</span>
                  <span className="badge badge-info">{reading?.network || 'UNKNOWN'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-secondary">Signal Strength</span>
                  <span style={{ fontWeight: 500 }}>{reading?.signal_strength ? `${reading.signal_strength}%` : '--'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '0', overflow: 'hidden', height: '600px', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ padding: '24px', marginBottom: 0, borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="card-title">
                <Navigation size={20} className="text-muted" />
                Map View
              </h3>
            </div>
            
            <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', position: 'relative' }}>
              {hasLocation ? (
                <iframe
                  title="Device Location Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${reading.longitude-0.01},${reading.latitude-0.01},${reading.longitude+0.01},${reading.latitude+0.01}&layer=mapnik&marker=${reading.latitude},${reading.longitude}`}
                  style={{ border: 'none' }}
                ></iframe>
              ) : (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  No location data available to display on map.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPage;
