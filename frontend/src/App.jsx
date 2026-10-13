import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FleetDashboard from './pages/FleetDashboard';
import RakesPage from './pages/RakesPage';
import CoachesPage from './pages/CoachesPage';
import SupervisorsPage from './pages/SupervisorsPage';
import HealthPage from './pages/HealthPage';
import ReportsPage from './pages/ReportsPage';
import DevicePage from './pages/DevicePage';
import WaterLevelHistory from './pages/WaterLevelHistory';
import AlertsPage from './pages/AlertsPage';
import LocationPage from './pages/LocationPage';
import SystemLogs from './pages/SystemLogs';
import DemoTest from './pages/DemoTest';
import Settings from './pages/Settings';

function App() {
  useEffect(() => {
    // Apply saved theme on load
    const savedTheme = localStorage.getItem('wli_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<FleetDashboard />} />
        <Route path="single" element={<Dashboard />} />
        <Route path="rakes" element={<RakesPage />} />
        <Route path="coaches" element={<CoachesPage />} />
        <Route path="supervisors" element={<SupervisorsPage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="device" element={<DevicePage />} />
        <Route path="history" element={<WaterLevelHistory />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="location" element={<LocationPage />} />
        <Route path="logs" element={<SystemLogs />} />
        <Route path="demo" element={<DemoTest />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
