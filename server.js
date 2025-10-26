// server.js
const http = require("http");
const fs = require("fs");
const path = require("path");

let latestData = { r: 0, g: 0, b: 0 };
let calibrated = false;

const server = http.createServer((req, res) => {
  // ----- หน้าเว็บ -----
  if (req.url === "/" || req.url === "/index.html") {
    fs.readFile(path.join(__dirname, "public", "index.html"), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading page");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  }

  // ----- รับข้อมูลจาก ESP8266 -----
  else if (req.url === "/upload" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        const json = JSON.parse(body);
        latestData = json;
        console.log("📩 New data:", json);
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("OK");
      } catch (e) {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
  }

  // ----- เว็บเรียกขอข้อมูลล่าสุด -----
  else if (req.url === "/latest-data" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(latestData));
  }

  // ----- เมื่อกดปุ่ม Calibrate White -----
  else if (req.url === "/calibrate" && req.method === "POST") {
    calibrated = true;
    console.log("✅ Calibrate command received");
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Calibrated");
  }

  else {
    res.writeHead(404);
    res.end("Not found");
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
