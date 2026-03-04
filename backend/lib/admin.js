const { readFileSync, writeFileSync, existsSync, mkdirSync } = require("fs");
const path = require("path");

require("dotenv").config();
const ADMIN_FILE = path.join(process.cwd(), "data", "admin.json");
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || "adswadi2024";

function getAdminPassword() {
  if (!existsSync(ADMIN_FILE)) return DEFAULT_PASSWORD;
  try {
    const raw = readFileSync(ADMIN_FILE, "utf-8");
    const data = JSON.parse(raw);
    return typeof data.password === "string" && data.password.length > 0
      ? data.password
      : DEFAULT_PASSWORD;
  } catch {
    return DEFAULT_PASSWORD;
  }
}

function setAdminPassword(newPassword) {
  const dir = path.dirname(ADMIN_FILE);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(
    ADMIN_FILE,
    JSON.stringify({ password: newPassword }, null, 2),
    "utf-8"
  );
}

module.exports = { getAdminPassword, setAdminPassword };
