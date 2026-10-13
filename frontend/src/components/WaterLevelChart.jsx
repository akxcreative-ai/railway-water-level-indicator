import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { formatDateTime } from '../utils/helpers';

const WaterLevelChart = ({ data, onRangeChange, activeRange }) => {
  const chartData = data?.map(d => {
    const dt = new Date(d.timestamp);
    const isValid = !isNaN(dt.getTime());
    return {
      ...d,
      timeLabel: isValid ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
      fullTime: formatDateTime(d.timestamp),
      level: Math.max(0, Math.min(100, d.water_level || 0))
    };
  }) || [];

  const minLevel = chartData.length ? Math.min(...chartData.map(d => d.level)) : 0;
  const maxLevel = chartData.length ? Math.max(...chartData.map(d => d.level)) : 0;
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="card" style={{ padding: '12px', border: '1px solid var(--border-color)', minWidth: '150px' }}>
          <p className="text-sm text-muted">{payload[0].payload.fullTime}</p>
          <p style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>
            Water Level: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header" style={{ marginBottom: '24px' }}>
        <h3 className="card-title">Water Level History</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['1h', '6h', '24h', '7d'].map(range => (
            <button
              key={range}
              className={`btn btn-sm ${activeRange === range ? 'btn-primary' : ''}`}
              onClick={() => onRangeChange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ width: '100%', height: '300px' }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="timeLabel" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={40} stroke="var(--accent-amber)" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="level" 
                stroke="var(--accent-blue)" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: 'var(--accent-blue)' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            No data available for this range
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="text-sm text-muted">Minimum</div>
          <div style={{ fontWeight: 600 }}>{minLevel}%</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="text-sm text-muted">Maximum</div>
          <div style={{ fontWeight: 600 }}>{maxLevel}%</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="text-sm text-muted">Data Points</div>
          <div style={{ fontWeight: 600 }}>{chartData.length}</div>
        </div>
      </div>
    </div>
  );
};

export default WaterLevelChart;
