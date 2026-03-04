const { readFileSync, writeFileSync, existsSync } = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(process.cwd(), "data", "config.json");

function getConfig() {
  const raw = readFileSync(CONFIG_PATH, "utf-8");
  return JSON.parse(raw);
}

function saveConfig(config) {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

function configExists() {
  return existsSync(CONFIG_PATH);
}

module.exports = { getConfig, saveConfig, configExists };
