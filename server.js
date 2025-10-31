import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let latestColor = { r: 0, g: 0, b: 0, time: 0 };
let clients = [];

// 📡 รับข้อมูลจาก ESP8266 (HTTP POST)
app.post("/api/color", (req, res) => {
  latestColor = req.body;
  console.log("📩 New color:", latestColor);

  // ส่งข้อมูลให้ทุกเว็บที่เปิดอยู่ (ผ่าน SSE)
  clients.forEach((client) =>
    client.res.write(`data: ${JSON.stringify(latestColor)}\n\n`)
  );

  res.status(200).json({ success: true });
});

// 📡 EventSource (SSE) สำหรับเว็บ
app.get("/events", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  res.write(`data: ${JSON.stringify(latestColor)}\n\n`);

  const clientId = Date.now();
  clients.push({ id: clientId, res });

  req.on("close", () => {
    clients = clients.filter((c) => c.id !== clientId);
  });
});

// 🟢 Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
