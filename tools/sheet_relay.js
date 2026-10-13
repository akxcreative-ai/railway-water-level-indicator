/*
 * Sheet Relay — Google Sheet (device already sends here) -> Local Dashboard
 * Isse laptop par chalao. Koi port-forwarding / public-IP nahi chahiye,
 * kyunki laptop Sheet ko bahar se padhta hai (outbound, hamesha chalta hai).
 *
 * Setup:
 *   1. Apni Google Sheet kholo -> Share -> "Anyone with the link" (Viewer).
 *   2. URL se SHEET_ID nikalo:
 *        https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit...
 *      aur neeche SHEET_ID me dalo. GID (tab id) bhi check karo (default 0).
 *   3. DEVICE_ID wahi rakho jo dashboard me register hai (e.g. WLI-009).
 *   4. node sheet_relay.js  (server localhost:4000 par chalta hona chahiye)
 *
 * Kaam: har 60 sec me Sheet ki aakhri row padho -> localhost dashboard par POST.
 * Sheet columns (tumhare script ke hisab se): timestamp | status | lat | lon | percent
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ---------------- CONFIG ----------------
const SHEET_ID = 'PASTE-SHEET-ID-HERE';
const GID = '0';
const DEVICE_ID = 'WLI-009';
const SERVER = 'http://localhost:4000';
const TOKEN = process.env.AUTH_TOKEN || 'railway-wli-prototype-token-2026';
const POLL_MS = 60 * 1000;
const STATE_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '.relay-state.json');
// ----------------------------------------

const gvizUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}`;

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { lastKey: '' };
  }
}
function saveState(s) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(s));
}

function parseGviz(text) {
  // gviz returns: google.visualization.Query.setResponse({...});
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  return JSON.parse(text.slice(start, end + 1));
}

function cellVal(cell) {
  if (!cell) return null;
  return cell.v !== undefined && cell.v !== null ? cell.v : null;
}

async function pollOnce() {
  const state = loadState();
  const res = await fetch(gvizUrl);
  if (!res.ok) throw new Error('Sheet HTTP ' + res.status + ' (Share: Anyone with link kiya?)');
  const data = parseGviz(await res.text());
  const rows = (data.table && data.table.rows) || [];
  let sent = 0;
  for (const r of rows) {
    const c = r.c || [];
    // col0=timestamp, col1=status, col2=lat, col3=lon, col4=percent (adjust if different)
    const ts = cellVal(c[0]);
    const status = cellVal(c[1]);
    const lat = parseFloat(cellVal(c[2])) || 0;
    const lon = parseFloat(cellVal(c[3])) || 0;
    const percent = parseInt(cellVal(c[4]), 10);
    const key = String(ts) + '|' + String(percent);
    if (!ts || isNaN(percent)) continue;
    if (key === state.lastKey) continue;
    const payload = {
      deviceId: DEVICE_ID,
      waterLevel: Math.max(0, Math.min(100, percent)),
      batteryPercentage: 85,
      batteryVoltage: 13.1,
      latitude: lat,
      longitude: lon,
      network: '2G',
      signalStrength: 75,
      sensorStatus: 'OK',
      gpsStatus: lat || lon ? 'FIXED' : 'NO_FIX',
      timestamp: new Date(ts).toISOString(),
    };
    const post = await fetch(SERVER + '/api/device/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN },
      body: JSON.stringify(payload),
    });
    if (!post.ok) throw new Error('Dashboard POST ' + post.status);
    state.lastKey = key;
    sent++;
  }
  saveState(state);
  console.log(new Date().toLocaleTimeString(), sent > 0 ? `synced ${sent} row(s), last=${state.lastKey}` : 'no new rows');
}

async function main() {
  if (SHEET_ID === 'PASTE-SHEET-ID-HERE') {
    console.error('Pehle file me SHEET_ID dalo (upar CONFIG dekho).');
    process.exit(1);
  }
  console.log(`Relay ON: Sheet -> ${SERVER} as ${DEVICE_ID}, har ${POLL_MS / 1000}s`);
  for (;;) {
    try {
      await pollOnce();
    } catch (e) {
      console.error(new Date().toLocaleTimeString(), 'ERR:', e.message);
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

main();
