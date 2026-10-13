import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Key, Info } from 'lucide-react';

const Settings = () => {
  const [theme, setTheme] = useState('dark');
  const [authToken, setAuthToken] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('wli_theme') || 'dark';
    const savedToken = localStorage.getItem('wli_auth_token') || 'railway-wli-prototype-token-2026';
    
    setTheme(savedTheme);
    setAuthToken(savedToken);
  }, []);

  const handleSaveToken = (e) => {
    e.preventDefault();
    localStorage.setItem('wli_auth_token', authToken);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('wli_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <SettingsIcon size={28} color="var(--text-primary)" />
        System Settings
      </h2>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Appearance</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 500 }}>Dashboard Theme</div>
            <div className="text-sm text-muted">Switch between dark and light modes</div>
          </div>
          <button className="btn" onClick={toggleTheme}>
            {theme === 'dark' ? <><Sun size={18} /> Light Mode</> : <><Moon size={18} /> Dark Mode</>}
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">API Authentication</h3>
        </div>
        <form onSubmit={handleSaveToken}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={16} /> Device Authentication Token
            </label>
            <input 
              type="text" 
              className="form-input" 
              value={authToken} 
              onChange={e => setAuthToken(e.target.value)}
              placeholder="Enter bearer token..."
            />
            <div className="text-sm text-muted" style={{ marginTop: '8px' }}>
              This token is used by the frontend when sending demo data to the backend POST /api/device/data endpoint.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button type="submit" className="btn btn-primary">Save Token</button>
            {saved && <span className="text-success animate-fade-in">Token saved to local storage!</span>}
          </div>
        </form>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">System Configuration</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Offline Timeout</div>
              <div className="text-sm text-muted">Time before device is considered offline</div>
            </div>
            <div style={{ fontWeight: 500 }}>300 seconds (5 min)</div>
          </div>
          <div className="text-sm text-muted" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              System configurations like Offline Timeout and Alert Thresholds are currently managed via backend environment variables (.env).
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">About</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-secondary">Version</span>
            <span style={{ fontWeight: 500 }}>1.0.0</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-secondary">Project Name</span>
            <span style={{ fontWeight: 500 }}>Railway Water Level Monitoring System</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-secondary">Technology Stack</span>
            <span style={{ fontWeight: 500 }}>React, Vite, Socket.IO, Recharts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
