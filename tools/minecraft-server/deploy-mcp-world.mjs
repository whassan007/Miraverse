#!/usr/bin/env node
/**
 * MiraVerse Live Minecraft Server Deployer (`tools/minecraft-server/deploy-mcp-world.mjs`)
 *
 * Connects a Mineflayer bot (with OP / creative privileges) to a running Minecraft Java server
 * (default: localhost:25565, matching the configured `minecraft` MCP server) and builds:
 * - The Central Atlas Observatory / Travel Lobby at (0, 100, 0)
 * - All 11 countries and 21 real-world DEM topography destinations (Copernicus GLO-30)
 * - All 69 regional landmarks, spawn pads, and inter-city / return portals
 *
 * Usage:
 *   node tools/minecraft-server/deploy-mcp-world.mjs [--host localhost] [--port 25565] [--username MiraArchitect] [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const MCFUNCTION_PATH = path.join(ROOT, 'apps/minecraft/world/terrain/server-commands.mcfunction');
const MANIFEST_PATH = path.join(ROOT, 'apps/minecraft/world/terrain/minecraft-terrain-v17.json');

function parseArgs(argv) {
  const opts = {
    host: process.env.MC_HOST || 'localhost',
    port: Number(process.env.MC_PORT || 25565),
    username: process.env.MC_USERNAME || 'MiraArchitect',
    dryRun: false,
    countryFilter: null,
  };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--host' && argv[i + 1]) opts.host = argv[++i];
    else if (arg === '--port' && argv[i + 1]) opts.port = Number(argv[++i]);
    else if (arg === '--username' && argv[i + 1]) opts.username = argv[++i];
    else if (arg === '--country' && argv[i + 1]) opts.countryFilter = argv[++i].toUpperCase();
  }
  return opts;
}

export function loadServerCommands() {
  const raw = fs.readFileSync(MCFUNCTION_PATH, 'utf-8');
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));
}

export function checkTcpPort(host, port, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      sock.destroy();
      resolve(ok);
    };
    sock.setTimeout(timeoutMs);
    sock.once('connect', () => finish(true));
    sock.once('timeout', () => finish(false));
    sock.once('error', () => finish(false));
    sock.connect(port, host);
  });
}

async function main() {
  const opts = parseArgs(process.argv);
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const commands = loadServerCommands();

  if (opts.dryRun) {
    console.log(
      JSON.stringify({
        status: 'DRY_RUN_READY',
        host: opts.host,
        port: opts.port,
        countries: manifest.totalCountries,
        destinations: manifest.totalDestinations,
        totalCommands: commands.length,
        mcfunctionPath: 'apps/minecraft/world/terrain/server-commands.mcfunction',
        manifestPath: 'apps/minecraft/world/terrain/minecraft-terrain-v17.json',
      })
    );
    return;
  }

  const reachable = await checkTcpPort(opts.host, opts.port);
  if (!reachable) {
    console.error(
      `[BLOCKED] No Minecraft server is listening on ${opts.host}:${opts.port}.\n` +
        `Start your Minecraft server on ${opts.host}:${opts.port} (with OP enabled for ${opts.username} and MiraBot) and re-run.`
    );
    process.exitCode = 2;
    return;
  }

  // Dynamically load mineflayer from the installed minecraft-mcp-server share if not in local node_modules
  let mineflayer;
  try {
    mineflayer = (await import('mineflayer')).default;
  } catch {
    const fallbackPath = '/home/wael/.local/share/minecraft-mcp-server/node_modules/mineflayer/index.js';
    mineflayer = (await import(fallbackPath)).default;
  }

  console.log(`Connecting ${opts.username} to ${opts.host}:${opts.port}...`);
  const bot = mineflayer.createBot({
    host: opts.host,
    port: opts.port,
    username: opts.username,
  });

  await new Promise((resolve, reject) => {
    bot.once('spawn', resolve);
    bot.once('error', reject);
    bot.once('kicked', (reason) => reject(new Error(`Kicked: ${reason}`)));
  });

  console.log(`Spawned! Executing ${commands.length} terrain & landmark commands across 21 destinations...`);
  bot.chat('/gamemode creative');
  bot.chat('/gamerule sendCommandFeedback false');

  let sent = 0;
  for (const cmd of commands) {
    bot.chat(`/${cmd}`);
    sent += 1;
    if (sent % 25 === 0) {
      await new Promise((r) => setTimeout(r, 60));
    }
  }

  bot.chat('/gamerule sendCommandFeedback true');
  bot.chat('MiraVerse v1.7.0: All 11 countries and 21 real-world DEM destinations constructed!');
  await new Promise((r) => setTimeout(r, 500));
  bot.quit();
  console.log(`Completed! Sent ${sent} commands.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
