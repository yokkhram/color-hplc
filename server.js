import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let latestColor = { r: 0, g: 0, b: 0 };
let clients = [];

// 🟩 รับข้อมูลจาก ESP8266
app.post("/api/color", (req, res) => {
  latestColor = req.body;
  console.log("📡 New color:", latestColor);

  // ส่งให้ทุก client SSE
  clients.forEach((client) => client.res.write(`data: ${JSON.stringify(latestColor)}\n\n`));

  res.status(200).json({ success: true });
});

// 🟩 SSE สำหรับเว็บ
app.get("/events", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });
  res.flushHeaders();

  // ส่งค่าล่าสุดตอนเปิดเว็บ
  res.write(`data: ${JSON.stringify(latestColor)}\n\n`);

  const clientId = Date.now();
  clients.push({ id: clientId, res });

  req.on("close", () => {
    clients = clients.filter((client) => client.id !== clientId);
  });
});

// 🟩 เริ่ม server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
