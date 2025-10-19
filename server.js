// ====== server.js ======
import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// เสิร์ฟหน้าเว็บ
app.use(express.static(path.join(__dirname, "public"))); // โฟลเดอร์เว็บ HTML

let latestData = null;

// เมื่อ NodeMCU เชื่อมต่อเข้ามา
wss.on("connection", (ws, req) => {
  console.log("🔌 WebSocket connected:", req.socket.remoteAddress);

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      latestData = data;
      // 🔁 กระจายข้อมูลให้ทุก client ที่เป็นหน้าเว็บ
      wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
      console.log("📦 Received:", data);
    } catch (err) {
      console.error("❌ Error parsing message:", err);
    }
  });

  ws.on("close", () => console.log("❎ Disconnected"));
});

// ถ้าเข้าหน้าเว็บหลัก
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
