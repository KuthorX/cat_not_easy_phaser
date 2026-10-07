// Headless, muted Playwright harness for the built game (dist/). Never opens a window or plays sound.
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.css': 'text/css', '.mp3': 'audio/mpeg', '.json': 'application/json', '.jpg': 'image/jpeg' };

export async function launchGame(dir, { width = 1280, height = 720 } = {}) {
  const root = path.resolve(dir);
  const server = http.createServer((req, res) => {
    let file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    if (file.endsWith('/')) file += 'index.html';
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    });
  }).listen(0);
  const browser = await chromium.launch({
    headless: true,
    args: ['--mute-audio', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('dialog', d => d.dismiss());
  await page.goto(`http://localhost:${server.address().port}/index.html`);
  await page.waitForFunction(() => window.game?.scene?.isActive('MenuScene'), null, { timeout: 30000 });

  const click = async (x, y) => {
    const box = await page.evaluate(() => {
      const r = document.querySelector('canvas').getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });
    await page.mouse.click(box.x + (x * box.w) / 1280, box.y + (y * box.h) / 720);
  };
  const state = () => page.evaluate(() => {
    const g = window.game;
    const s = g.gameManager.getState();
    return { time: s.currentTime, energy: s.energy, inventory: s.inventory, achievements: s.achievements,
      actions: [...s.completedActions], room: s.currentRoom, ended: s.gameEnded, ending: s.endingType,
      scenes: g.scene.getScenes(true).map(x => x.scene.key) };
  });
  const listenerCounts = () => page.evaluate(() =>
    Object.fromEntries([...window.game.gameManager.eventEmitter.events].map(([k, v]) => [k, v.length])));
  const wait = ms => page.waitForTimeout(ms);
  const close = async () => { await browser.close(); server.close(); };
  return { page, click, state, listenerCounts, wait, errors, close };
}

// Same clamp the action menu uses: first row centre for a menu opened at (x, y).
export function menuRow(x, y, rows, index) {
  const width = 300; const height = rows * 40;
  const cx = Math.min(Math.max(x, 150 + 10), 1280 - 150 - 10);
  const top = Math.min(Math.max(y, 28), 720 - height - 10 + 18);
  return [cx, top + index * 40];
}

export function assert(cond, msg) { if (!cond) throw new Error(`ASSERT: ${msg}`); }
