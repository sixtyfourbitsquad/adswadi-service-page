import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import type { Config } from "./types";

const CONFIG_PATH = path.join(process.cwd(), "data", "config.json");

export function getConfig(): Config {
  const raw = readFileSync(CONFIG_PATH, "utf-8");
  return JSON.parse(raw) as Config;
}

export function saveConfig(config: Config): void {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

export function configExists(): boolean {
  return existsSync(CONFIG_PATH);
}
