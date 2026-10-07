// 60 s headless, muted smoke test: random clicks across the whole game; fails on any console error.
import { launchGame, assert } from './harness.mjs';

const DURATION_MS = Number(process.env.SMOKE_MS ?? 60000);
const g = await launchGame(process.argv[2] ?? 'dist');
let seed = 12345;
const rand = n => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
const HOTSPOTS = [
  [640, 15], [900, 705], [850, 700], [300, 25], [35, 360], [650, 100], [200, 700], [1200, 300], [25, 600],
  [150, 500], [450, 520], [500, 650], [1050, 650], [1200, 300], [800, 400], [930, 550],
  [450, 680], [1100, 250], [1000, 650], [150, 200], [80, 550], [1100, 200],
  [100, 200], [400, 400], [1200, 400], [350, 450], [490, 550], [850, 400], [1100, 350], [150, 250],
  [200, 300], [500, 600], [1100, 30], [1150, 30], [1200, 30], [1250, 30],
];
const MENU_EXIT = [865, 1065, 625, 690]; // "退出游戏" button: skip it

try {
  const start = Date.now();
  let clicks = 0; let endings = 0;
  while (Date.now() - start < DURATION_MS) {
    const scenes = await g.page.evaluate(() => window.game.scene.getScenes(true).map(s => s.scene.key));
    if (scenes.includes('MenuScene')) {
      await g.click(320, 650);
    } else if (scenes.includes('AchievementEndingScene')) {
      endings++;
      await g.click(640, 685);
    } else {
      // 70%: a known hotspot (exits, furniture, HUD buttons) then the first menu row; 30%: anywhere
      const hot = rand(10) < 7;
      const [x, y] = hot ? HOTSPOTS[rand(HOTSPOTS.length)] : [rand(1280), rand(720)];
      const onExit = x > MENU_EXIT[0] && x < MENU_EXIT[1] && y > MENU_EXIT[2] && y < MENU_EXIT[3];
      if (!onExit) await g.click(x, y);
      if (hot) { await g.wait(250); await g.click(Math.min(Math.max(x, 160), 1120), Math.min(Math.max(y, 28), 600)); }
    }
    clicks++;
    await g.wait(150 + rand(250));
    assert(g.errors.length === 0, `console errors: ${g.errors.join(' | ')}`);
  }
  const counts = await g.listenerCounts();
  assert(Object.values(counts).every(n => n <= 2), `listener leak ${JSON.stringify(counts)}`);
  console.log(`SMOKE OK: ${clicks} clicks, ${endings} ending screens, state ${JSON.stringify(await g.state())}`);
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  await g.close();
}
