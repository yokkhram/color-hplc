const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let colorData = { r: 0, g: 0, b: 0, y: 0 };

// รับข้อมูลจาก ESP8266 (ตัวอย่าง: /update?r=100&g=150&b=200&y=180)
app.get("/update", (req, res) => {
  const { r, g, b, y } = req.query;
  if (r && g && b && y) {
    colorData = {
      r: Number(r),
      g: Number(g),
      b: Number(b),
      y: Number(y)
    };
    io.emit("colorUpdate", colorData);
    console.log("Updated color:", colorData);
    res.send("OK");
  } else {
    res.send("Missing parameters");
  }
});

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.emit("colorUpdate", colorData);

  socket.on("resetData", () => {
    io.emit("resetGraph");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
