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
let calibrated = false;

// 📡 รับข้อมูลสีจาก ESP8266
app.post("/api/color", (req, res) => {
  latestColor = req.body;
  console.log("🎨 New color:", latestColor);

  // ส่งข้อมูลไปยังทุก client ที่เปิดเว็บอยู่
  clients.forEach((client) =>
    client.res.write(`data: ${JSON.stringify(latestColor)}\n\n`)
  );

  res.status(200).json({ success: true });
});

// 📡 คำสั่ง Calibrate จากเว็บ
app.post("/api/calibrate", (req, res) => {
  calibrated = true; // ตั้งเป็น true
  console.log("✅ Calibrate command received from webpage");
  res.json({ success: true, message: "Calibration started" });
});

// 📡 ESP จะเช็คว่ามี calibrate หรือยัง
app.get("/api/check-calibrate", (req, res) => {
  res.json({ calibrated }); // ส่ง true/false ไปให้ ESP
  // หลังจาก ESP เช็คแล้ว เราสามารถ reset เป็น false ได้ ถ้าอยากให้ calibrate เป็นครั้งเดียว
  // calibrated = false; 
});

// 📡 Server-Sent Events สำหรับหน้าเว็บ
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

// 🟢 เริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
