// require("dotenv").config();
// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const mqttClient = require("./config/mqtt");

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });

// mqttClient.on("message", (topic, message) => {
//   const data = message.toString();
//   console.log("Received from MQTT:", data);

//   io.emit("droneData", data);
// });

// io.on("connection", (socket) => {
//   console.log("🔌 Client connected:", socket.id);
// });

// const PORT = 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

// // TESTING ONLY — remove in production
// setInterval(() => {
//   const mock = {
//     altitude: 60 + Math.round(Math.random() * 40),
//     speed:    30 + Math.round(Math.random() * 30),
//     heading:  ["N","NE","E","SE","S","SW","W","NW"][Math.floor(Math.random()*8)],
//     temp:     44 + Math.round(Math.random() * 10),
//     battery:  Math.max(10, 78 - Math.floor(Date.now()/60000) % 30),
//     signal:   "Strong",
//     status:   "En Route",
//     lat:      19.1075 + (Math.random() - 0.5) * 0.01,
//     lng:      72.8263 + (Math.random() - 0.5) * 0.01,
//   };
//   io.emit("droneData", mock);
// }, 1000);

// mqttClient.on("connect", () => {
//   console.log("✅ Connected to MQTT broker");

//   mqttClient.subscribe("drone/data", (err) => {
//     if (!err) {
//       console.log("📡 Subscribed to drone/data");
//     }
//   });
// });

// require("dotenv").config();
// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const mqttClient = require("./config/mqtt");
// const { SerialPort } = require('serialport');

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });

// // Add after your existing mqtt handler
// const port = new SerialPort({ 
//   path: process.env.SERIAL_PORT || 'COM3', // add SERIAL_PORT=COM3 to .env
//   baudRate: 115200,
//   autoOpen: false
// });

// port.open((err) => {
//   if (err) {
//     console.warn('⚠️ Serial port not available, using MQTT/mock only:', err.message);
//     return;
//   }
//   console.log('🔌 Serial port opened');
// });

// // MSP requests — battery (0x6B), GPS (0x69), status (0x65)
// const MSP_ANALOG = Buffer.from([0x24, 0x4D, 0x3C, 0x00, 0x6B, 0x6B]);
// const MSP_RAW_GPS = Buffer.from([0x24, 0x4D, 0x3C, 0x00, 0x69, 0x69]);

// setInterval(() => {
//   if (port.isOpen) {
//     port.write(MSP_ANALOG);
//     port.write(MSW_RAW_GPS);
//   }
// }, 200);

// port.on('data', (rawData) => {
//   const parsed = parseMSP(rawData);
//   if (parsed) io.emit('droneData', parsed);
// });

// // ✅ MQTT handler — parses JSON, emits object
// mqttClient.on("message", (topic, message) => {
//   try {
//     const data = JSON.parse(message.toString());
//     console.log("📡 Received from MQTT:", data);
//     io.emit("droneData", data);
//   } catch (e) {
//     console.error("❌ Invalid JSON:", message.toString());
//   }
// });

// io.on("connection", (socket) => {
//   console.log("🔌 Client connected:", socket.id);

//   socket.on("droneCommand", ({ droneId, command }) => {
//     mqttClient.publish(`drone/${droneId}/command`, JSON.stringify(command));
//     console.log("🚁 Command sent:", command);
//   });
// });

// const PORT = 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);





//   // ✅ Mock runs only after server is ready
//   setInterval(() => {
//     const mock = {
//       altitude: 60 + Math.round(Math.random() * 40),
//       speed:    30 + Math.round(Math.random() * 30),
//       heading:  ["N","NE","E","SE","S","SW","W","NW"][Math.floor(Math.random()*8)],
//       temp:     44 + Math.round(Math.random() * 10),
//       battery:  Math.max(10, 78 - Math.floor(Date.now()/60000) % 30),
//       signal:   "Strong",
//       status:   "En Route",
//       lat:      19.1075 + (Math.random() - 0.5) * 0.01,
//       lng:      72.8263 + (Math.random() - 0.5) * 0.01,
//     };
//     io.emit("droneData", mock);
//     console.log("🧪 Mock emitted:", mock.altitude + "m", mock.speed + "km/h", mock.lat , mock.lng, mock.heading);
//   }, 1000);
// });

// mqttClient.on("connect", () => {
//   console.log("✅ Connected to MQTT broker");
//   mqttClient.subscribe("drone/data", (err) => {
//     if (!err) console.log("📡 Subscribed to drone/data");
//   });
// });




// require("dotenv").config();
// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const mqttClient = require("./config/mqtt");
// const { SerialPort } = require("serialport");

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });

// // ─── Serial Port ───────────────────────────────────────────────
// const port = new SerialPort({
//   path: process.env.SERIAL_PORT || "COM3",
//   baudRate: 115200,
//   autoOpen: false,
// });

// port.open((err) => {
//   if (err) {
//     console.warn("⚠️ Serial port not available, using MQTT/mock only:", err.message);
//     return;
//   }
//   console.log("🔌 Serial port opened");
// });

// const MSP_ANALOG  = Buffer.from([0x24, 0x4D, 0x3C, 0x00, 0x6B, 0x6B]);
// const MSP_RAW_GPS = Buffer.from([0x24, 0x4D, 0x3C, 0x00, 0x69, 0x69]); // ✅ fixed name

// setInterval(() => {
//   if (port.isOpen) {
//     port.write(MSP_ANALOG);
//     port.write(MSP_RAW_GPS); // ✅ fixed typo
//   }
// }, 200);

// // ─── MSP Parser ────────────────────────────────────────────────
// let mspBuffer = Buffer.alloc(0);

// function parseMSP(raw) {
//   mspBuffer = Buffer.concat([mspBuffer, raw]);

//   const start = mspBuffer.indexOf(0x24);
//   if (start === -1) { mspBuffer = Buffer.alloc(0); return null; }
//   if (mspBuffer.length < start + 6) return null;

//   const size = mspBuffer[start + 3];
//   const cmd  = mspBuffer[start + 4];

//   if (mspBuffer.length < start + 6 + size) return null;

//   const payload = mspBuffer.slice(start + 5, start + 5 + size);
//   mspBuffer = mspBuffer.slice(start + 6 + size);

//   if (cmd === 0x6B) {
//     return { battery: payload.readUInt16LE(0) / 10 };
//   }
//   if (cmd === 0x69) {
//     return {
//       lat:      payload.readInt32LE(2)  / 1e7,
//       lng:      payload.readInt32LE(6)  / 1e7,
//       altitude: payload.readInt16LE(10),
//       speed:    payload.readUInt16LE(12) / 100,
//     };
//   }
//   return null;
// }

// port.on("data", (rawData) => {
//   const parsed = parseMSP(rawData);
//   if (parsed) io.emit("droneData", parsed);
// });

// // ─── MQTT Handler ──────────────────────────────────────────────
// mqttClient.on("message", (topic, message) => {
//   try {
//     const data = JSON.parse(message.toString());
//     console.log("📡 Received from MQTT:", data);
//     io.emit("droneData", data);
//   } catch (e) {
//     console.error("❌ Invalid JSON:", message.toString());
//   }
// });

// // ─── Socket.io ─────────────────────────────────────────────────
// io.on("connection", (socket) => {
//   console.log("🔌 Client connected:", socket.id);

//   socket.on("droneCommand", ({ droneId, command }) => {
//     mqttClient.publish(`drone/${droneId}/command`, JSON.stringify(command));
//     console.log("🚁 Command sent:", command);
//   });

//   socket.on("disconnect", () => console.log("🔌 Client disconnected"));
// });

// // ─── Server Start ──────────────────────────────────────────────
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);

//   // Mock data — remove once real drone is connected
//   setInterval(() => {
//     const mock = {
//       altitude: 60 + Math.round(Math.random() * 40),
//       speed:    30 + Math.round(Math.random() * 30),
//       heading:  ["N","NE","E","SE","S","SW","W","NW"][Math.floor(Math.random() * 8)],
//       temp:     44 + Math.round(Math.random() * 10),
//       battery:  Math.max(10, 78 - Math.floor(Date.now() / 60000) % 30),
//       signal:   "Strong",
//       status:   "En Route",
//       lat:      19.1075 + (Math.random() - 0.5) * 0.01,
//       lng:      72.8263 + (Math.random() - 0.5) * 0.01,
//     };
//     io.emit("droneData", mock);
//     console.log("🧪 Mock emitted:", mock.altitude + "m", mock.speed + "km/h");
//   }, 1000);
// });

// // ─── MQTT Connect ──────────────────────────────────────────────
// mqttClient.on("connect", () => {
//   console.log("✅ Connected to MQTT broker");
//   mqttClient.subscribe("drone/data", (err) => {
//     if (!err) console.log("📡 Subscribed to drone/data");
//   });
// });


require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mqttClient = require("./config/mqtt");
const { SerialPort } = require("serialport");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ─────────────────────────────────────────────────────────────────────────────
// MSP Command Codes
// ─────────────────────────────────────────────────────────────────────────────
const MSP_STATUS    = 101; // 0x65 — armed state, flight mode
const MSP_RAW_GPS   = 106; // 0x6A — lat, lon, speed, satellites
const MSP_ATTITUDE  = 108; // 0x6C — roll, pitch, yaw
const MSP_ALTITUDE  = 109; // 0x6D — altitude, vario
const MSP_ANALOG    = 110; // 0x6E — voltage, current, rssi

// ─────────────────────────────────────────────────────────────────────────────
// Build MSP Request Packet  →  $ M < [size=0] [code] [checksum]
// ─────────────────────────────────────────────────────────────────────────────
function buildMSP(code) {
  return Buffer.from([0x24, 0x4D, 0x3C, 0x00, code, code]);
  // checksum = 0x00 XOR code = code
}

// ─────────────────────────────────────────────────────────────────────────────
// Serial Port  —  path from .env (SERIAL_PORT=COM4  or  /dev/ttyUSB0)
// ─────────────────────────────────────────────────────────────────────────────
const serialPort = new SerialPort({
  path: process.env.SERIAL_PORT || "COM4",
  baudRate: 115200,
  autoOpen: false,
});

serialPort.open((err) => {
  if (err) {
    console.warn("⚠️  Serial port not available:", err.message);
    console.warn("    → Running without drone serial connection.");
    return;
  }
  console.log(`✅ Serial port opened on ${process.env.SERIAL_PORT || "COM4"}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// Poll MSP telemetry from Betaflight
//   • Attitude / Altitude / Analog / Status  →  10 Hz
//   • GPS                                    →   2 Hz  (heavier packet)
// ─────────────────────────────────────────────────────────────────────────────
setInterval(() => {
  if (serialPort.isOpen) {
    serialPort.write(buildMSP(MSP_ATTITUDE));
    serialPort.write(buildMSP(MSP_ALTITUDE));
    serialPort.write(buildMSP(MSP_ANALOG));
    serialPort.write(buildMSP(MSP_STATUS));
  }
}, 100);

setInterval(() => {
  if (serialPort.isOpen) {
    serialPort.write(buildMSP(MSP_RAW_GPS));
  }
}, 500);

// ─────────────────────────────────────────────────────────────────────────────
// MSP Response Parser
// ─────────────────────────────────────────────────────────────────────────────
let mspBuffer = Buffer.alloc(0);

// Holds merged telemetry from all MSP responses
let droneState = {};

function parseMSPBuffer() {
  while (true) {
    // Find the start of a packet
    const start = mspBuffer.indexOf(0x24); // '$'
    if (start === -1) { mspBuffer = Buffer.alloc(0); break; }

    // Discard bytes before '$'
    if (start > 0) mspBuffer = mspBuffer.slice(start);

    // Need at least 6 bytes for a header
    if (mspBuffer.length < 6) break;

    // Validate   $ M >
    if (mspBuffer[1] !== 0x4D || mspBuffer[2] !== 0x3E) {
      // Not a valid response header — skip one byte and retry
      mspBuffer = mspBuffer.slice(1);
      continue;
    }

    const dataSize   = mspBuffer[3];
    const code       = mspBuffer[4];
    const packetSize = 6 + dataSize; // header(5) + data + checksum(1)

    if (mspBuffer.length < packetSize) break; // wait for more data

    const payload = mspBuffer.slice(5, 5 + dataSize);
    mspBuffer     = mspBuffer.slice(packetSize);

    // ── Decode payload by MSP code ────────────────────────────
    switch (code) {

      case MSP_ATTITUDE:   // roll, pitch, yaw
        if (payload.length >= 6) {
          droneState.roll  = payload.readInt16LE(0) / 10;   // degrees
          droneState.pitch = payload.readInt16LE(2) / 10;   // degrees
          droneState.yaw   = payload.readInt16LE(4);         // 0–360°
        }
        break;

      case MSP_ALTITUDE:   // altitude (cm) + vertical speed (cm/s)
        if (payload.length >= 6) {
          droneState.altitude = payload.readInt32LE(0) / 100; // → metres
          droneState.vario    = payload.readInt16LE(4) / 100; // → m/s
        }
        break;

      case MSP_RAW_GPS:    // fix, sats, lat, lon, alt, speed, course
        if (payload.length >= 14) {
          droneState.gpsFix     = payload[0];                          // 0=no fix, 1=fix, 2=DGPS
          droneState.satellites = payload[1];
          droneState.lat        = payload.readInt32LE(2)  / 1e7;      // degrees
          droneState.lng        = payload.readInt32LE(6)  / 1e7;      // degrees
          droneState.gpsAlt     = payload.readInt16LE(10);             // metres
          droneState.speed      = (payload.readUInt16LE(12) / 100 * 3.6).toFixed(1); // cm/s → km/h
          droneState.heading    = payload.readUInt16LE(14) / 10;       // degrees
        }
        break;

      case MSP_ANALOG:     // vbat, power, rssi, current
        if (payload.length >= 7) {
          droneState.battery  = payload[0] / 10;              // volts
          droneState.power    = payload.readUInt16LE(1);       // mAh drawn
          droneState.rssi     = payload.readUInt16LE(3);       // 0–1023
          droneState.current  = payload.readUInt16LE(5) / 100; // amps
          // Map RSSI 0-1023 to signal label
          const rssi = droneState.rssi;
          droneState.signal =
            rssi > 800 ? "Excellent" :
            rssi > 600 ? "Strong"    :
            rssi > 400 ? "Good"      :
            rssi > 200 ? "Weak"      : "Poor";
        }
        break;

      case MSP_STATUS:     // cycle time, i2c errors, sensors, mode flags, profile
        if (payload.length >= 11) {
          droneState.cycleTime     = payload.readUInt16LE(0);
          droneState.i2cErrors     = payload.readUInt16LE(2);
          droneState.activeSensors = payload.readUInt16LE(4);
          const modeFlags          = payload.readUInt32LE(6);
          droneState.armed         = (modeFlags & 1) === 1;
          droneState.status        = droneState.armed ? "Armed" : "Disarmed";
        }
        break;

      default:
        // Unknown MSP code — ignore silently
        break;
    }
  }
}

// ─── Receive raw bytes, parse and emit ───────────────────────────────────────
serialPort.on("data", (rawData) => {
  mspBuffer = Buffer.concat([mspBuffer, rawData]);
  parseMSPBuffer();
});

// Emit merged drone state to all Socket.io clients at 10 Hz
setInterval(() => {
  if (Object.keys(droneState).length > 0 && serialPort.isOpen) {
    io.emit("droneData", droneState);
    console.log(
      `📡 Serial → alt:${droneState.altitude}m  spd:${droneState.speed}km/h` +
      `  bat:${droneState.battery}V  armed:${droneState.armed}  sats:${droneState.satellites}`
    );
  }
}, 100);

// ─────────────────────────────────────────────────────────────────────────────
// MQTT Handler  (keeps working alongside serial)
// ─────────────────────────────────────────────────────────────────────────────
mqttClient.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log("📡 Received from MQTT:", data);
    // Merge MQTT data into drone state (MQTT can override or extend serial data)
    Object.assign(droneState, data);
    io.emit("droneData", droneState);
  } catch (e) {
    console.error("❌ Invalid JSON from MQTT:", message.toString());
  }
});

mqttClient.on("connect", () => {
  console.log("✅ Connected to MQTT broker");
  mqttClient.subscribe("drone/data", (err) => {
    if (!err) console.log("📡 Subscribed to drone/data");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Socket.io — client connections and command handling
// ─────────────────────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // Send current state immediately on connect so UI doesn't wait for next poll
  if (Object.keys(droneState).length > 0) {
    socket.emit("droneData", droneState);
  }

  // Forward flight commands from frontend → MQTT → drone
  socket.on("droneCommand", ({ droneId, command }) => {
    mqttClient.publish(`drone/${droneId}/command`, JSON.stringify(command));
    console.log("🚁 Command sent:", command);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Drone serial port: ${process.env.SERIAL_PORT || "COM4"}`);
  console.log(`   → Change via SERIAL_PORT= in your .env file`);
});