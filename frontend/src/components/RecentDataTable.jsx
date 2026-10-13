import React from 'react';
import { formatDateTime, getWaterLevelStatus } from '../utils/helpers';

const RecentDataTable = ({ readings }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Recent Data Readings</h3>
      </div>
      
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Water Level</th>
              <th>Battery</th>
              <th>Location</th>
              <th>Network</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {!readings || readings.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No recent readings available
                </td>
              </tr>
            ) : (
              readings.map((reading, idx) => {
                const status = getWaterLevelStatus(reading.water_level);
                return (
                  <tr key={reading.id || idx}>
                    <td>
                      {formatDateTime(reading.timestamp)}
                      {reading.is_demo === 1 && (
                        <span className="badge badge-warning" style={{ marginLeft: '8px', fontSize: '10px' }}>DEMO</span>
                      )}
                    </td>
                    <td className={status.color} style={{ fontWeight: 600 }}>
                      {reading.water_level !== null ? `${reading.water_level}%` : '--'}
                    </td>
                    <td>{reading.battery_percentage !== null ? `${reading.battery_percentage}%` : '--'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {typeof reading.latitude === 'number' && typeof reading.longitude === 'number'
                        ? `${reading.latitude.toFixed(4)}, ${reading.longitude.toFixed(4)}`
                        : '--'}
                    </td>
                    <td>{reading.network || '--'}</td>
                    <td>
                      <span className={`badge ${reading.sensor_status === 'OK' ? 'badge-success' : 'badge-danger'}`}>
                        {reading.sensor_status || 'UNKNOWN'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentDataTable;
