import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let latestData = { r: 0, g: 0, b: 0 };

// Endpoint สำหรับ NodeMCU ส่งข้อมูลเข้ามา
app.post("/data", (req, res) => {
  latestData = req.body;
  console.log("✅ Data received:", latestData);
  res.sendStatus(200);
});

// Endpoint ให้หน้าเว็บดึงข้อมูลล่าสุด
app.get("/latest-data", (req, res) => {
  res.json(latestData);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
