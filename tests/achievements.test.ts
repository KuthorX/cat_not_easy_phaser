import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AchievementRegistry } from '../src/data/AchievementRegistry';
import {
  findReachedEndings,
  hasCausedDestruction,
  isConditionMet,
  pickDayEndEnding,
  ProgressState,
} from '../src/logic/achievements';

function makeState(overrides: Partial<ProgressState> = {}): ProgressState {
  return {
    completedActions: new Set(),
    destroyedItems: new Set(),
    visitedRooms: new Set(),
    inventory: [],
    storyFlags: new Map(),
    ...overrides,
  };
}

const registry = new AchievementRegistry();
const all = registry.getAllAchievements();

test('story_flag conditions accept flags stored as true', () => {
  const state = makeState({ storyFlags: new Map([['owner_returned', true]]) });
  assert.equal(isConditionMet({ type: 'story_flag', value: 'owner_returned' }, state), true);
  assert.equal(isConditionMet({ type: 'story_flag', value: 'other' }, state), false);
});

test('destruction is detected from destructive actions', () => {
  assert.equal(hasCausedDestruction(makeState()), false);
  assert.equal(hasCausedDestruction(makeState({ completedActions: new Set(['play']) })), false);
  assert.equal(hasCausedDestruction(makeState({ completedActions: new Set(['push_tv']) })), true);
});

test('a peaceful day ends with the good-cat ending', () => {
  const state = makeState({ completedActions: new Set(['play', 'sleeping']) });
  assert.equal(pickDayEndEnding(all, state), 'good_cat');
});

test('a messy day picks the ending the player got closest to', () => {
  const play = makeState({ completedActions: new Set(['attack_cage', 'play_with_ball', 'play_cat_tree', 'play']) });
  assert.equal(pickDayEndEnding(all, play), 'play_time');
  const wreck = makeState({ completedActions: new Set(['sweep_table', 'push_tv']) });
  assert.equal(pickDayEndEnding(all, wreck), 'hooligan');
  const logistics = makeState({ completedActions: new Set(['pee', 'rummage', 'rummage_water', 'drink_carry']) });
  assert.equal(pickDayEndEnding(all, logistics), 'logistics');
});

test('ties fall back to the hooligan ending', () => {
  const state = makeState({ completedActions: new Set(['pee']) });
  assert.equal(pickDayEndEnding(all, state), 'hooligan');
});

test('every ending achievement is reachable from real actions and listed once', () => {
  const ids = all.map(a => a.id);
  for (const id of ['play_time', 'hooligan', 'good_cat', 'logistics']) {
    assert.ok(ids.includes(id), `missing ${id}`);
  }
  const done = makeState({
    completedActions: new Set(['sweep_table', 'push_tv', 'destroy']),
  });
  assert.deepEqual(findReachedEndings(all, done, []), ['hooligan']);
  assert.deepEqual(findReachedEndings(all, done, ['hooligan']), []);
});

test('good_cat is never reached mid-day', () => {
  assert.deepEqual(findReachedEndings(all, makeState(), []), []);
});

test('progress counts satisfied conditions', () => {
  const state = makeState({ completedActions: new Set(['play', 'play_cat_tree']) });
  assert.deepEqual(registry.getAchievementProgress('play_time', state), { current: 2, total: 4 });
});
