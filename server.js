// server.js
import express from "express";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ถ้า index.html อยู่ใน public/
app.use(express.static(path.join(__dirname, "public")));

// ถ้า index.html อยู่ข้างนอก (ไม่มีโฟลเดอร์ public) → ใช้บรรทัดนี้แทน
// app.use(express.static(__dirname));

const server = app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("✅ Client connected");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (err) {
      console.error("❌ Invalid data:", message);
    }
  });

  ws.on("close", () => console.log("❌ Client disconnected"));
});
