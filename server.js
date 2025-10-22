import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

let colorData = { r: 0, g: 0, b: 0, hex: "#000000" };

// รับข้อมูลจาก NodeMCU
app.post("/upload", (req, res) => {
  colorData = req.body;
  console.log("✅ Data received:", colorData);
  res.json({ success: true });
});

// ให้หน้าเว็บดึงข้อมูลล่าสุด
app.get("/data", (req, res) => {
  res.json(colorData);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
