/* Pinggy tunnel via Node (no signup, no browser warning page).
 * node pinggy_tunnel.mjs  -> pinggy-url.txt me public URL likhega.
 */
import { spawn } from 'child_process';
import fs from 'fs';

const outFile = new URL('./pinggy-url.txt', import.meta.url);
const logFile = new URL('./pinggy.log', import.meta.url);

const ssh = spawn(
  'ssh',
  ['-p', '443', '-R0:localhost:4000', '-o', 'StrictHostKeyChecking=no', '-o', 'ServerAliveInterval=30', 'a.pinggy.io'],
  { stdio: ['ignore', 'pipe', 'pipe'] }
);

let buf = '';
const saveUrl = () => {
  const m = buf.match(/https:\/\/[a-zA-Z0-9.-]+\.(pinggy\.io|pinggy\.link)/);
  if (m) {
    fs.writeFileSync(outFile, m[0]);
    console.log('PINGGY_URL:', m[0]);
  }
};

ssh.stdout.on('data', (d) => {
  buf += d.toString();
  fs.appendFileSync(logFile, d);
  saveUrl();
});
ssh.stderr.on('data', (d) => {
  buf += d.toString();
  fs.appendFileSync(logFile, d);
  saveUrl();
});
ssh.on('close', (code) => {
  console.log('ssh closed', code);
  process.exit(1);
});
ssh.on('error', (e) => {
  console.log('ssh error', e.message);
  process.exit(1);
});
setInterval(() => {}, 1 << 30);
