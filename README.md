# Drone Telemetry System

Real-time telemetry dashboard for SpeedyBee F405 AIO flight controller.

## How it works
- Communicates with flight controller via **MSP (MultiWii Serial Protocol)** over USB serial
- Binary little-endian frame parsing at **10Hz polling rate**
- Concurrently polls attitude, altitude, GPS, analog, and status data
- Streams merged sensor state via **Socket.io** to a live React.js dashboard
- **MQTT broker** integration preserved for IoT compatibility
- Serial port reconnection logic for hardware fault tolerance
- Explored Raspberry Pi Zero 2W as wireless bridge (Wi-Fi telemetry architecture)

## Tech Stack
Node.js · Socket.io · MQTT · React.js · serialport · Vite · Tailwind CSS

## Setup
```bash
npm install
cd server && npm install
node server/server.js
```
