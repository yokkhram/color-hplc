import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let latestColor = { r: 0, g: 0, b: 0, hex: "#000000" };
let sendData = false;

const server = http.createServer((req, res) => {
  // Serve index.html
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    const filePath = path.join(__dirname, "public", "index.html");
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end("Error loading index.html");
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  }

  // Serve latest color JSON
  else if (req.method === "GET" && req.url === "/data") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(latestColor));
  }

  // Receive color data from ESP8266
  else if (req.method === "POST" && req.url === "/color") {
    let body = "";
    req.on("data", chunk => (body += chunk.toString()));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (sendData && data.r !== undefined) {
          latestColor = {
            r: data.r,
            g: data.g,
            b: data.b,
            hex: data.hex
          };
          console.log("📥 Received:", latestColor);
        }
        res.writeHead(200);
        res.end("OK");
      } catch (err) {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
  }

  // Toggle calibration mode
  else if (req.method === "POST" && req.url === "/calibrate") {
    sendData = true;
    console.log("✅ Calibration started — accepting ESP data");
    res.writeHead(200);
    res.end("Calibrated");
  }

  // 404
  else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
