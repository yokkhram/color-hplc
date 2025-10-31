import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let latestColor = { r: 0, g: 0, b: 0 };
let calibrated = false;

// รับข้อมูลสีจาก ESP
app.post("/api/color", (req, res) => {
  try {
    const body = req.body;
    if (typeof body.r === "number" && typeof body.g === "number" && typeof body.b === "number") {
      latestColor = { r: body.r, g: body.g, b: body.b };
      console.log("🎨 New color:", latestColor);
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "Invalid payload" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ปุ่ม calibrate บนเว็บจะเรียก endpoint นี้
app.post("/api/calibrate", (req, res) => {
  calibrated = true;
  console.log("✅ Calibrate command received (from web).");
  res.json({ success: true, message: "Calibration started" });
});

// ESP จะ poll endpoint นี้ เพื่อตรวจสอบสถานะ calibrate
app.get("/api/check-calibrate", (req, res) => {
  res.json({ calibrated });
  // ถ้าต้องการให้ calibrate เป็นครั้งเดียวให้ uncomment บรรทัดถัดไป:
  // calibrated = false;
});

// SSE: ส่ง color ให้หน้าเว็บแบบ realtime
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.flushHeaders();

  // ส่งค่าเริ่มต้นทันที
  res.write(`data: ${JSON.stringify(latestColor)}\n\n`);

  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify(latestColor)}\n\n`);
  }, 500); // ส่งทุก 0.5s

  req.on("close", () => {
    clearInterval(interval);
  });
});

// (Optional) reset endpoint
app.post("/api/reset-calibrate", (req, res) => {
  calibrated = false;
  console.log("🔁 Calibrate reset by API");
  res.json({ success: true });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
