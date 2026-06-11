// src/socketService.js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on("connect", () => console.log("✅ Frontend socket connected:", socket.id));
socket.on("connect_error", (err) => console.error("❌ Connection failed:", err.message));
socket.on("disconnect", (reason) => console.log("🔌 Disconnected:", reason));

export default socket;
