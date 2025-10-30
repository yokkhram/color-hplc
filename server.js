const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let latestData = { r: 0, g: 0, b: 0 };
let isCalibrated = false;

// ✅ เริ่มทำงานหลังจากกด Calibrate White
app.post("/calibrate", (req, res) => {
  isCalibrated = true;
  console.log("✅ Calibrate White activated!");
  res.json({ status: "ok" });
});

// ✅ รับข้อมูลจาก ESP8266 ผ่าน HTTP POST
app.post("/upload", (req, res) => {
  if (!isCalibrated) {
    return res.status(403).json({ error: "Not calibrated yet" });
  }
  latestData = req.body;
  console.log("📥 Received data:", latestData);
  res.json({ status: "ok" });
});

// ✅ ให้หน้าเว็บดึงข้อมูลล่าสุดแบบเรียลไทม์
app.get("/latest-data", (req, res) => {
  res.json(latestData);
});

// ✅ ปุ่ม Reset
app.post("/reset", (req, res) => {
  latestData = { r: 0, g: 0, b: 0 };
  isCalibrated = false;
  console.log("🔄 Reset data.");
  res.json({ status: "reset" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
