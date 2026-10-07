// Scripted playthrough: earn the hooligan ending with real clicks, restart, then let the day run out peacefully.
import { launchGame, menuRow, assert } from './harness.mjs';

const g = await launchGame(process.argv[2] ?? 'dist');
const until = (fn, ms = 30000) => g.page.waitForFunction(fn, null, { timeout: ms });
const act = async (x, y, rows, index, check) => {
  await g.click(x, y); await g.wait(400);
  const [mx, my] = menuRow(x, y, rows, index);
  await g.click(mx, my);
  await until(check);
};
try {
  await g.click(320, 650);
  await until(() => window.game.scene.isActive('LivingRoomEastScene'));
  await g.wait(1600);
  let s = await g.state();
  assert(s.inventory.length === 0 && s.time === 9, 'fresh day');

  await act(150, 500, 3, 0, () => window.game.gameManager.getState().currentTime >= 10);
  await act(150, 500, 3, 0, () => window.game.gameManager.getState().currentTime >= 11);
  await act(450, 520, 2, 0, () => window.game.gameManager.getState().completedActions.has('sweep_table'));
  await act(1200, 300, 2, 0, () => window.game.gameManager.getState().completedActions.has('push_tv'));
  s = await g.state();
  assert(s.energy === 3, `energy after two naps should be 3, got ${s.energy}`);

  for (const [x, y, scene] of [[900, 705, 'LivingRoomWestLowScene'], [35, 360, 'HallwayScene'], [650, 100, 'RoomBScene']]) {
    await g.click(x, y);
    await until(new Function(`return window.game.scene.isActive('${scene}')`));
    await g.wait(1600);
  }
  await act(350, 450, 2, 0, () => window.game.gameManager.getState().gameEnded);
  s = await g.state();
  assert(s.ending === 'hooligan', `expected hooligan ending, got ${s.ending}`);
  await until(() => window.game.scene.isActive('AchievementEndingScene'), 10000);
  await g.page.screenshot({ path: '/tmp/cne/e2e_ending.png' });
  const counts = await g.listenerCounts();
  assert(Object.values(counts).every(n => n <= 2), `listener leak ${JSON.stringify(counts)}`);

  await g.click(640, 685);
  await until(() => window.game.scene.isActive('MenuScene'));
  await g.click(320, 650);
  await until(() => window.game.scene.isActive('LivingRoomEastScene'));
  s = await g.state();
  assert(!s.ended && s.time === 9 && s.actions.length === 0 && s.achievements.length === 0, 'restart resets state');

  await g.wait(1600);
  await g.page.evaluate(() => window.game.gameManager.advanceTime(12 * 60));
  await until(() => window.game.scene.isActive('AchievementEndingScene'), 10000);
  s = await g.state();
  assert(s.ending === 'good_cat', `peaceful day should end good_cat, got ${s.ending}`);
  assert(g.errors.length === 0, `console errors: ${g.errors.join(' | ')}`);
  console.log('PLAYTHROUGH OK');
} catch (e) {
  console.error(e.message, JSON.stringify(await g.state().catch(() => null)), g.errors);
  process.exitCode = 1;
} finally {
  await g.close();
}
