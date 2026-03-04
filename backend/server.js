require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const QRCode = require("qrcode");
const { getConfig, saveConfig } = require("./lib/config");
const { getAdminPassword, setAdminPassword } = require("./lib/admin");

const app = express();
const PORT = process.env.PORT || 3001;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploaded");

// CORS: allow all origins (Vercel, custom domains, localhost) so admin panel works from any frontend URL
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

function auth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  return authHeader.slice(7) === getAdminPassword();
}

// Public config (no auth)
app.get("/api/config", (req, res) => {
  try {
    const config = getConfig();
    return res.json(config);
  } catch (e) {
    return res.status(500).json({ error: "Failed to load config" });
  }
});

// UPI QR image
app.get("/api/upi-qr", (req, res) => {
  const pa = req.query.pa;
  const pn = (req.query.pn || "Merchant").slice(0, 50);
  const amParam = req.query.am;
  if (!pa || !pa.trim()) {
    return res.status(400).json({ error: "Missing UPI ID (pa)" });
  }
  const params = new URLSearchParams();
  params.set("pa", pa.trim());
  params.set("pn", pn);
  if (amParam != null && amParam !== "") {
    const amount = parseFloat(String(amParam).replace(/,/g, ""));
    if (!Number.isNaN(amount) && amount > 0) params.set("am", amount.toFixed(2));
  }
  params.set("cu", "INR");
  const upiString = `upi://pay?${params.toString()}`;
  QRCode.toBuffer(upiString, {
    type: "png",
    width: 280,
    margin: 2,
    errorCorrectionLevel: "M",
  })
    .then((pngBuffer) => {
      res.set({ "Content-Type": "image/png", "Cache-Control": "private, max-age=300" });
      res.send(pngBuffer);
    })
    .catch(() => res.status(500).json({ error: "Failed to generate QR code" }));
});

// Admin: get/patch config
app.get("/api/admin/config", (req, res) => {
  if (!auth(req)) return res.status(401).json({ error: "Unauthorized" });
  try {
    const config = getConfig();
    return res.json(config);
  } catch (e) {
    return res.status(500).json({ error: "Failed to load config" });
  }
});

app.patch("/api/admin/config", (req, res) => {
  if (!auth(req)) return res.status(401).json({ error: "Unauthorized" });
  try {
    const body = req.body;
    const config = getConfig();
    if (body.title !== undefined) config.title = body.title;
    if (body.subtitle !== undefined) config.subtitle = body.subtitle;
    if (body.services !== undefined) config.services = body.services;
    if (body.payment !== undefined) config.payment = body.payment;
    saveConfig(config);
    return res.json(config);
  } catch (e) {
    return res.status(500).json({ error: "Failed to save config" });
  }
});

// Admin: login
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body || {};
  const adminPassword = getAdminPassword();
  if (password === adminPassword) {
    return res.json({ token: adminPassword });
  }
  return res.status(401).json({ error: "Invalid password" });
});

// Admin: change password
app.post("/api/admin/change-password", (req, res) => {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  const currentPassword = getAdminPassword();
  if (!token || token !== currentPassword) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { currentPassword: submitted, newPassword } = req.body || {};
  if (submitted !== currentPassword) {
    return res.status(400).json({ error: "Current password is incorrect" });
  }
  if (typeof newPassword !== "string" || newPassword.length < 4) {
    return res.status(400).json({
      error: "New password must be at least 4 characters",
    });
  }
  try {
    setAdminPassword(newPassword);
    return res.json({
      success: true,
      message: "Password updated. Use the new password to log in next time.",
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to save password" });
  }
});

// Admin: upload (multer)
const { mkdirSync, existsSync } = require("fs");
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
const upload = multer({ dest: UPLOAD_DIR });
app.post("/api/admin/upload", (req, res, next) => {
  if (!auth(req)) return res.status(401).json({ error: "Unauthorized" });
  upload.single("file")(req, res, (err) => {
    if (err) return res.status(500).json({ error: "Upload failed" });
    const file = req.file;
    const name = (req.body && req.body.name) || "image";
    if (!file) return res.status(400).json({ error: "No file provided" });
    const ext = path.extname(file.originalname) || ".png";
    const newName = `${name}-${Date.now()}${ext}`;
    const newPath = path.join(UPLOAD_DIR, newName);
    require("fs").renameSync(file.path, newPath);
    const baseUrl = process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
    const url = `${baseUrl}/uploaded/${newName}`;
    return res.json({ url });
  });
});

// Static: uploaded files (so /uploaded/filename works)
app.use("/uploaded", express.static(UPLOAD_DIR));

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
