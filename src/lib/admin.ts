import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const ADMIN_FILE = path.join(process.cwd(), "data", "admin.json");
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || "adswadi2024";

export function getAdminPassword(): string {
  if (!existsSync(ADMIN_FILE)) return DEFAULT_PASSWORD;
  try {
    const raw = readFileSync(ADMIN_FILE, "utf-8");
    const data = JSON.parse(raw) as { password?: string };
    return typeof data.password === "string" && data.password.length > 0
      ? data.password
      : DEFAULT_PASSWORD;
  } catch {
    return DEFAULT_PASSWORD;
  }
}

export function setAdminPassword(newPassword: string): void {
  const dir = path.dirname(ADMIN_FILE);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(
    ADMIN_FILE,
    JSON.stringify({ password: newPassword }, null, 2),
    "utf-8"
  );
}
