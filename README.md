# Railway Water Level Monitoring System

A full-stack IoT monitoring dashboard for Railway Water Level Indicator devices. Built as a prototype/demo with a single device (`WLI-001`) but designed for scalability.

## Tech Stack

| Layer      | Technology                     |
|------------|--------------------------------|
| Frontend   | React 18 + Vite 5             |
| Backend    | Node.js + Express 4           |
| Database   | SQLite (better-sqlite3)       |
| Real-time  | Socket.IO 4                   |
| Charts     | Recharts                      |
| Icons      | Lucide React                  |

## Project Structure

```
water level indicator/
├── server/                     # Backend
│   ├── server.js               # Entry point
│   ├── .env                    # Environment config
│   ├── routes/device.js        # API routes
│   ├── controllers/            # Request handlers
│   ├── services/               # Alert logic
│   ├── database/               # SQLite setup + helpers
│   └── websocket/              # Socket.IO setup
│
├── frontend/                   # React app
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── pages/              # Route pages
│   │   ├── services/           # API + Socket clients
│   │   └── utils/              # Helper functions
│   ├── vite.config.js
│   └── index.html
│
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### 1. Install & Start Backend

```bash
cd server
npm install
npm start
```

The server starts on **http://localhost:4000**.

### 2. Install & Start Frontend

```bash
cd frontend
npm install
npm run dev
```

The dashboard opens at **http://localhost:5173**.

### 3. Database

SQLite is set up automatically on first run. The database file is created at `server/database/wli.db`. No manual setup needed — tables and a default device (`WLI-001`) are created on startup.

## API Endpoints

| Method | Endpoint                              | Auth     | Description                    |
|--------|---------------------------------------|----------|--------------------------------|
| GET    | `/api/health`                         | None     | Server health status           |
| GET    | `/api/device/status`                  | None     | Device info + online/offline   |
| GET    | `/api/device/latest`                  | None     | Latest sensor reading          |
| GET    | `/api/device/history?range=1h`        | None     | Historical readings (1h/6h/24h/7d) |
| GET    | `/api/device/alerts?limit=50`         | None     | Alert list                     |
| PUT    | `/api/device/alerts/:id/acknowledge`  | None     | Acknowledge an alert           |
| POST   | `/api/device/data`                    | Bearer   | Submit device data             |
| GET    | `/api/device/logs?limit=100`          | None     | System event logs              |

## JSON Payload Format

Send data from your IoT device (or for testing) via:

```
POST /api/device/data
Authorization: Bearer railway-wli-prototype-token-2026
Content-Type: application/json
```

```json
{
  "deviceId": "WLI-001",
  "mpuId": "MPU-001",
  "macId": "AA:BB:CC:DD:EE:FF",
  "waterLevel": 78,
  "batteryPercentage": 92,
  "batteryVoltage": 13.2,
  "latitude": 28.6139,
  "longitude": 77.2090,
  "network": "4G",
  "signalStrength": 82,
  "sensorStatus": "OK",
  "gpsStatus": "FIXED",
  "timestamp": "2026-09-15T10:30:00Z"
}
```

### Water Level Status Logic

| Condition            | Status      |
|----------------------|-------------|
| `waterLevel > 40`   | NORMAL      |
| `1 <= waterLevel <= 40` | LOW WATER |
| `waterLevel == 0`   | EMPTY       |

### Alert Generation

Alerts are automatically generated when:
- Water level ≤ 40% → **LOW_WATER** (WARNING)
- Water level = 0% → **EMPTY_TANK** (CRITICAL)
- Sensor status ≠ OK → **SENSOR_ERROR** (HIGH)
- Battery ≤ 20% → **LOW_BATTERY** (WARNING)
- Device stops reporting → **DEVICE_OFFLINE** (HIGH)

## Testing with Demo Mode

### Using the Dashboard

Navigate to **Demo / Test** in the sidebar. Click the quick-action buttons:

- **Send Normal Data** — 75% water level
- **Send Low Water Data** — 25% water level
- **Send Empty Tank Data** — 0% water level
- **Send Sensor Error** — error status
- **Custom Payload** — enter any values manually

Demo data is tagged with `is_demo = 1` and marked with a "DEMO" badge in tables.

### Using cURL

```bash
# Normal reading
curl -X POST http://localhost:4000/api/device/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer railway-wli-prototype-token-2026" \
  -d '{
    "deviceId": "WLI-001",
    "waterLevel": 78,
    "batteryPercentage": 92,
    "batteryVoltage": 13.2,
    "latitude": 28.6139,
    "longitude": 77.2090,
    "network": "4G",
    "signalStrength": 82,
    "sensorStatus": "OK",
    "gpsStatus": "FIXED",
    "timestamp": "2026-09-15T10:30:00Z"
  }'

# Low water alert
curl -X POST http://localhost:4000/api/device/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer railway-wli-prototype-token-2026" \
  -d '{"deviceId":"WLI-001","waterLevel":20,"batteryPercentage":85,"sensorStatus":"OK","gpsStatus":"FIXED","timestamp":"2026-09-15T10:35:00Z"}'

# Empty tank (critical)
curl -X POST http://localhost:4000/api/device/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer railway-wli-prototype-token-2026" \
  -d '{"deviceId":"WLI-001","waterLevel":0,"batteryPercentage":80,"sensorStatus":"OK","gpsStatus":"FIXED","timestamp":"2026-09-15T10:40:00Z"}'

# Demo mode (tagged as demo data)
curl -X POST "http://localhost:4000/api/device/data?demo=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer railway-wli-prototype-token-2026" \
  -d '{"deviceId":"WLI-001","waterLevel":50,"batteryPercentage":90,"sensorStatus":"OK"}'
```

## Connecting a Real IoT Device

1. Configure your device firmware to POST JSON to `http://<server-ip>:4000/api/device/data`.
2. Set the `Authorization: Bearer <token>` header (token from `server/.env`).
3. Send readings at your desired interval (e.g., every 30 seconds).
4. The dashboard updates in real time via Socket.IO — no page refresh needed.

## Configuration

Edit `server/.env`:

```env
PORT=4000                                      # Server port
AUTH_TOKEN=railway-wli-prototype-token-2026     # API bearer token
OFFLINE_TIMEOUT_MS=120000                       # 2 min offline threshold
```

## Real-Time Behavior

When new data arrives:
- Water gauge updates instantly
- Battery, GPS, network cards refresh
- Chart gets a new data point
- Alerts appear in the alert panel
- "Last seen" time resets
- System log entry is created

All updates happen via WebSocket — no browser refresh required.

## Future Scalability

The database schema links every reading and alert to a `device_id`. To add more devices later:
1. Register new devices in the `devices` table.
2. POST data with the new `deviceId`.
3. Extend the frontend to show a device selector.

## Disclaimer

This is a **prototype monitoring application**. It does not claim Railway/RDSO certification or compliance.
