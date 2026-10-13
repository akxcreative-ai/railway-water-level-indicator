"""
USB Bridge — STM32 (USB serial par JSON print karta hai) -> Dashboard (localhost:4000)
Bench test ke liye: GSM/SIM/public-server ke bina aaj hi live data dekho.

Usage:
  pip install pyserial
  python usb_bridge.py --port COM5 --baud 115200 --token railway-wli-prototype-token-2026

STM32 firmware har cycle me Serial.println(payload) karta hai — ye script wahi line
padhkar POST /api/device/data par bhej deta hai. Dashboard turant update hoga.
"""
import argparse
import json
import time
import urllib.request

import serial


def post_reading(server, token, payload, demo=False):
    url = server.rstrip("/") + "/api/device/data" + ("?demo=true" if demo else "")
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as res:
        return res.status, res.read().decode()[:300]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", required=True, help="e.g. COM5 ya /dev/ttyUSB0")
    ap.add_argument("--baud", type=int, default=115200)
    ap.add_argument("--server", default="http://localhost:4000")
    ap.add_argument("--token", default="railway-wli-prototype-token-2026")
    ap.add_argument("--demo", action="store_true", help="demo tag ke saath bhejo")
    ap.add_argument("--device", default=None, help="deviceId override (optional)")
    args = ap.parse_args()

    ser = serial.Serial(args.port, args.baud, timeout=2)
    print(f"Listening on {args.port} -> {args.server} ...")
    buf = ""
    while True:
        chunk = ser.read(256).decode(errors="ignore")
        if chunk:
            buf += chunk
            while "\n" in buf:
                line, buf = buf.split("\n", 1)
                line = line.strip()
                if not line.startswith("{"):
                    print("SKIP:", line[:80])
                    continue
                try:
                    payload = json.loads(line)
                except json.JSONDecodeError as e:
                    print("BAD JSON:", e)
                    continue
                if args.device:
                    payload["deviceId"] = args.device
                if "timestamp" not in payload:
                    payload["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                try:
                    status, body = post_reading(args.server, args.token, payload, args.demo)
                    print(f"OK {status} dev={payload.get('deviceId')} lvl={payload.get('waterLevel')} :: {body}")
                except Exception as e:
                    print("POST FAIL:", e)


if __name__ == "__main__":
    main()
