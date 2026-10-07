# Cat Not Easy (两脚兽不在家!): gameplay audit

How I tested: production build served locally and played headlessly with Playwright Chromium
(`--mute-audio --use-angle=swiftshader`). I drove real clicks on menus, objects, action menus and exits,
read the state through `window.game`, and watched the console.

## Bugs

| # | Bug | Evidence | Impact |
|---|-----|----------|--------|
| B1 | Event listeners leak on every room change. `BaseScene.shutdown()` is never called by Phaser, and its `off(..., fn.bind(this))` could not remove anything anyway. `UIManager.initialize` re-adds the dialogue listeners twice per room. | After 6 room changes there were 7 `time_changed` listeners and 10 `dialogue_started` listeners. Dead scenes keep receiving events, so popups and scene jumps fire several times. | High |
| B2 | Clicking the cage throws `Cannot read properties of undefined (reading 'getDialogue')`. The dialogue registry is commented out, but `attack_cage` still routes through dialogue, so its time cost and effects are skipped. | pageerror in the console | High |
| B3 | The four ending achievements can never unlock. Nothing calls the achievement check. Conditions refer to removed actions and rooms (`chew_rope`, `attack_tv`, the doorway room). Story-flag checks compare against the flag name instead of `true`. | code plus play | High |
| B4 | The 21:00 ending is a random picture regardless of what the player did. | `GameEndScreen` / `EndingScene` | High |
| B5 | The player starts with debug items in the bag (key, milk, ball, ...). The code comment says "测试物品" (test items). | state dump | Medium |
| B6 | The dustbin and the cat nest point at actions that don't exist, so clicking them does nothing. | data test | Medium |
| B7 | Free energy loops: the litter box gives +1 energy for 0 time. Sleeping on the sofa needs energy ≥ 1, so at 0 energy the only recovery is in the hallway. | data | Medium |
| B8 | Actions with an energy cost run even at 0 energy (the cost is just clamped). Generic condition text ("需要先完成前置条件", "need to finish a prerequisite first") hides the authored hint in `specialCondition.failureMessage`. | play | Medium |
| B9 | Once the game ends, clicks still reach objects under the end screen. "重新开始" (restart) from the achievement scene goes back to the menu without clearing the dialogue lock. | code | Medium |
| B10 | Iframe layout: a 3 px border plus `min-height:100vh` overflows the page by 3 px (scrollbars or clipping in the itch iframe), and the game sits hidden behind a fixed 2 s fake loader. The itch embed is 1080x720 for a 16:9 game. | screenshots at 1080x720 and 800x600 | Medium |
| B11 | The "去阳台" (to the balcony) exit button covers the east room title. | screenshot | Low |
| B12 | 404s for `loading_bg.png` and `loading_bar.png`, which are never used. | network log | Low |
| B13 | Debug shortcut: pressing `1` on the balcony runs "全屋跑酷" (house parkour) for 3 energy and 2 h. | code | Low |
| B14 | The action menu is clamped as if anchored top-left, but its buttons are centred, so menus near the left edge are cut off. | code | Low |

## Mechanics problems

- No goal or tutorial. Nothing tells the player that the day ends at 21:00 or that the 📖 log lists the endings.
- Nothing shows what an action costs, so time and energy just vanish.
- Interactables only show on mouse hover, so touch players have nothing to go on.
- Endings cannot be steered (see B3/B4), so the achievement log is meaningless.

## Fixes, ranked by player impact

1. Make endings reachable and decided by play (B3, B4, B6). Pure logic goes in `src/logic/achievements.ts`, with unit tests.
2. Fix the listener leak and the dialogue crash (B1, B2), so every scene registers each handler once and cleans up on shutdown.
3. Energy and condition feedback (B7, B8): show cost hints in the action menu, block actions you can't afford with a clear message, and remove the free loops.
4. Ending flow (B9): one ending screen with the ending name and why you got it, input blocked, and restart resetting the state.
5. Iframe layout (B10, B11, B12) and debug leftovers (B5, B13, B14).
6. A start-of-day hint and an 18:00 "the owner is coming home soon" warning.

## Not changed

- The talking-furniture dialogue system: it was disabled on purpose upstream, and its content is placeholder.
- Exit requirements (the cage gating the high shelf) are declared but never enforced. Enforcing them would change the route through the game, so I left it as is.
- No new art or audio.
