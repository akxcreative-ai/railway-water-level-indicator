/* Public tunnel: localhost:4000 -> https://<subdomain>.loca.lt
 * node lt_tunnel.js  (background me chalao; crash ho to dobara chalao)
 * URL tunnel-url.txt me likha jayega.
 */
import fs from 'fs';
import localtunnel from 'localtunnel';

const SUBDOMAIN = process.argv[2] || 'wli-dash-88k2m9';

const tunnel = await localtunnel({ port: 4000, subdomain: SUBDOMAIN });
fs.writeFileSync(new URL('./tunnel-url.txt', import.meta.url), tunnel.url);
console.log('TUNNEL_URL:', tunnel.url);
tunnel.on('close', () => {
  console.log('tunnel closed');
  process.exit(1);
});
tunnel.on('error', (e) => console.log('tunnel error:', e.message));
setInterval(() => {}, 1 << 30);
