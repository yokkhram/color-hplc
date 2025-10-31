// server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let latestColor = { r: 0, g: 0, b: 0 };
let calibrateRequested = false;
let clients = [];

// 🟩 ESP ส่งค่าสีมา
app.post("/api/color", (req, res) => {
  latestColor = req.body;
  console.log("📡 Received color:", latestColor);

  clients.forEach((client) =>
    client.res.write(`data: ${JSON.stringify(latestColor)}\n\n`)
  );

  res.status(200).json({ success: true });
});

// 🟩 หน้าเว็บขอรับข้อมูลแบบเรียลไทม์
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

// 🟩 เมื่อกด Calibrate บนเว็บ
app.post("/api/calibrate", (req, res) => {
  calibrateRequested = true;
  console.log("⚙️ Calibrate requested from web");
  res.json({ success: true });
});

// 🟩 ESP จะถามว่าต้องเริ่มยังไหม
app.get("/api/check-calibrate", (req, res) => {
  res.json({ calibrate: calibrateRequested });
  if (calibrateRequested) calibrateRequested = false;
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
