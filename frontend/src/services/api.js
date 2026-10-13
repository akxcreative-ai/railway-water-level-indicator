// api.js
const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? '' 
  : 'https://railway-water-level-indicator.onrender.com';

const BASE_URL = `${BACKEND_URL}/api`;

const getAuthToken = () => {
  return localStorage.getItem('wli_auth_token') || 'railway-wli-prototype-token-2026';
};

const fetchJson = async (url, options = {}) => {
  try {
    const res = await fetch(`${BASE_URL}${url}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API Request failed');
    return data;
  } catch (err) {
    console.error(`API Error on ${url}:`, err);
    throw err;
  }
};

export const fetchHealth = () => fetchJson('/health');
const devQ = (deviceId) => (deviceId ? `deviceId=${encodeURIComponent(deviceId)}` : '');
export const fetchDeviceStatus = (deviceId) => fetchJson(`/device/status${deviceId ? `?${devQ(deviceId)}` : ''}`);
export const fetchLatestReading = (deviceId) => fetchJson(`/device/latest${deviceId ? `?${devQ(deviceId)}` : ''}`);
export const fetchHistory = (range = '1h', deviceId) => fetchJson(`/device/history?range=${range}${deviceId ? `&${devQ(deviceId)}` : ''}`);
export const fetchAlerts = (limit = 50, deviceId) => fetchJson(`/device/alerts?limit=${limit}${deviceId ? `&${devQ(deviceId)}` : ''}`);
export const fetchLogs = (limit = 100, deviceId) => fetchJson(`/device/logs?limit=${limit}${deviceId ? `&${devQ(deviceId)}` : ''}`);

export const acknowledgeAlert = (id) => {
  return fetchJson(`/device/alerts/${id}/acknowledge`, { method: 'PUT' });
};

export const sendDeviceData = (data, isDemo = false) => {
  const url = isDemo ? '/device/data?demo=true' : '/device/data';
  return fetchJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(data)
  });
};

// ---- RDSO Fleet APIs ----
export const fetchFleetOverview = () => fetchJson('/fleet/overview');
export const fetchCoaches = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return fetchJson(`/coaches${q ? `?${q}` : ''}`);
};
export const fetchRakes = () => fetchJson('/rakes');
export const fetchRakeDetail = (id) => fetchJson(`/rakes/${id}`);
export const createCoach = (data) => fetchJson('/coaches', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
});
export const updateCoach = (id, data) => fetchJson(`/coaches/${id}`, {
  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
});
export const deleteCoach = (id) => fetchJson(`/coaches/${id}`, { method: 'DELETE' });
export const createRake = (data) => fetchJson('/rakes', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
});
export const updateRake = (id, data) => fetchJson(`/rakes/${id}`, {
  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
});
export const deleteRake = (id) => fetchJson(`/rakes/${id}`, { method: 'DELETE' });
export const fetchSupervisors = () => fetchJson('/supervisors');
export const createSupervisor = (data) => fetchJson('/supervisors', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
});
export const updateSupervisor = (id, data) => fetchJson(`/supervisors/${id}`, {
  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
});
export const deleteSupervisor = (id) => fetchJson(`/supervisors/${id}`, { method: 'DELETE' });
export const fetchAllAlerts = (limit = 100) => fetchJson(`/alerts-all?limit=${limit}`);
export const fetchReportsSummary = () => fetchJson('/reports/summary');

export const waterStatusOf = (lvl) => {
  if (lvl === null || lvl === undefined) return 'OFFLINE';
  if (lvl === 0) return 'EMPTY';
  if (lvl <= 40) return 'LOW';
  return 'NORMAL';
};
