// server.js
// Ishga tushirish:
// npm init -y
// npm install express cors
// node server.js

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // agar frontendni serverdan xizmat qilmoqchi bo'lsangiz

const DATA_FILE = path.join(__dirname, "results.json");

// Yordamchi: results.json ni o'qish (agar yo'q bo'lsa bo'sh massiv yaratadi)
function readResults() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

// Yordamchi: results.json ga yozish
function writeResults(results) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(results, null, 2));
}

// GET /leaderboard — barcha natijalarni qaytaradi (ball bo'yicha kamayish tartibida)
app.get("/leaderboard", (req, res) => {
  try {
    const results = readResults();
    // aggregate: bir xil ism bo'lsa umumiy ballni ko'rsatish
    const aggregated = {};
    results.forEach(r => {
      const name = r.name || "Noma'lum";
      const score = Number(r.score) || 0;
      if (!aggregated[name]) aggregated[name] = 0;
      aggregated[name] += score;
    });
    // convert to array va sort
    const arr = Object.entries(aggregated).map(([name, score]) => ({ name, score }));
    arr.sort((a, b) => b.score - a.score);
    res.json(arr);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server xatosi" });
  }
});

// POST /submit — { name: "Ali", score: 25 } shu shaklda yuboriladi
// server results.json ga yozadi (append)
app.post("/submit", (req, res) => {
  try {
    let { name, score } = req.body;
    if (!name) name = "Noma'lum";
    score = Number(score) || 0;

    const results = readResults();
    results.push({ name, score, time: new Date().toISOString() });
    writeResults(results);

    res.json({ success: true, message: "Natija saqlandi" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Saqlashda xato" });
  }
});

// (ixtiyoriy) endpoint barcha xom yozuvlarni olish uchun (odatda kerak emas)
app.get("/raw", (req, res) => {
  const results = readResults();
  res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server ishga tushdi: http://localhost:${PORT}`));