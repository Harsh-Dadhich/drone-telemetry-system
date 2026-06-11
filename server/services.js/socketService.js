// module.exports = function setupSocket(io, mqttClient) {
//   io.on("connection", (socket) => {
//     console.log("Frontend connected:", socket.id);

//     // When frontend sends command
//     socket.on("droneCommand", (data) => {
//       const { droneId, command } = data;

//       mqttClient.publish(
//         `drone/${droneId}/command`,
//         JSON.stringify(command)
//       );

//       console.log("Command sent to drone:", command);
//     });

//     socket.on("disconnect", () => {
//       console.log("Frontend disconnected");
//     });
//   });

//   // When drone sends telemetry
//   mqttClient.on("message", (topic, message) => {
//     const data = JSON.parse(message.toString());

//     console.log("Telemetry received:", data);

//     io.emit("telemetry", data);
//   });
// };

require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mqttClient = require("./config/mqtt");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ✅ Single MQTT handler — parses JSON, emits object (not string)
mqttClient.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log("📡 Telemetry received:", data);
    io.emit("droneData", data);           // sends a JS object, not a string
  } catch (e) {
    console.error("❌ Invalid JSON from drone:", message.toString());
  }
});

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // Forward commands from frontend → drone via MQTT
  socket.on("droneCommand", ({ droneId, command }) => {
    mqttClient.publish(`drone/${droneId}/command`, JSON.stringify(command));
    console.log("🚁 Command sent:", command);
  });

  socket.on("disconnect", () => console.log("🔌 Client disconnected"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

mqttClient.on("connect", () => {
  console.log("✅ Connected to MQTT broker");
  mqttClient.subscribe("drone/data", (err) => {
    if (!err) console.log("📡 Subscribed to drone/data");
  });
});
