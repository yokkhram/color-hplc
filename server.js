// server.js
import express from "express";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ให้บริการหน้าเว็บ index.html
app.use(express.static(__dirname));

// สร้าง HTTP server
const server = app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});

// สร้าง WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("✅ Client connected");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      // ส่งต่อข้อมูลให้ client อื่น ๆ (หน้าเว็บ)
      wss.clients.forEach(client => {
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (err) {
      console.error("❌ Invalid data received:", message);
    }
  });

  ws.on("close", () => console.log("❌ Client disconnected"));
});
