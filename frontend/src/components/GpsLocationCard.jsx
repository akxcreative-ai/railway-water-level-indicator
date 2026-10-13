import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { formatTimeAgo } from '../utils/helpers';
import StatusBadge from './StatusBadge';

const GpsLocationCard = ({ latitude, longitude, gpsStatus, lastUpdated }) => {
  const hasLocation = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude);

  const handleViewMap = () => {
    if (hasLocation) {
      window.open(`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`, '_blank');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <MapPin size={20} className="text-muted" />
          Location
        </h3>
        <StatusBadge 
          status={gpsStatus || 'UNKNOWN'} 
          variant={gpsStatus === 'FIXED' ? 'success' : 'warning'} 
        />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="text-secondary">Latitude</span>
          <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{hasLocation ? latitude.toFixed(6) : '--'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="text-secondary">Longitude</span>
          <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{hasLocation ? longitude.toFixed(6) : '--'}</span>
        </div>
      </div>
      
      <button 
        className="btn btn-primary" 
        style={{ width: '100%', marginBottom: '12px' }}
        disabled={!hasLocation}
        onClick={handleViewMap}
      >
        <Navigation size={16} /> View on Map
      </button>
      
      <div className="text-sm text-muted">
        Updated: {formatTimeAgo(lastUpdated)}
      </div>
    </div>
  );
};

export default GpsLocationCard;
