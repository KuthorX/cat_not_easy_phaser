import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RoomRegistry } from '../src/data/RoomRegistry';
import { ActionRegistry } from '../src/data/ActionRegistry';
import { AchievementRegistry } from '../src/data/AchievementRegistry';

const rooms = new RoomRegistry().getAllRooms();
const actions = new ActionRegistry();
const roomActionIds = new Set(rooms.flatMap(r => r.interactiveObjects.flatMap(o => o.actions ?? [])));

test('every action referenced by a room object exists', () => {
  const missing = [...roomActionIds].filter(id => !actions.getAction(id));
  assert.deepEqual(missing, []);
});

test('every achievement action condition is available in some room', () => {
  const needed = new AchievementRegistry().getAllAchievements()
    .flatMap(a => a.conditions)
    .filter(c => c.type === 'action_completed')
    .map(c => c.value as string);
  const unreachable = needed.filter(id => !roomActionIds.has(id));
  assert.deepEqual(unreachable, []);
});

test('items required by room actions can be obtained in some room', () => {
  const obtainable = new Set(
    [...roomActionIds].flatMap(id => actions.getAction(id)!.effects)
      .filter(e => e.type === 'inventory' && e.operation === 'add')
      .map(e => e.value as string),
  );
  const required = [...roomActionIds].flatMap(id => actions.getAction(id)!.conditions)
    .filter(c => c.type === 'inventory')
    .map(c => c.value as string);
  assert.deepEqual(required.filter(item => !obtainable.has(item)), []);
});

test('actions that restore energy always cost time (no free energy loop)', () => {
  const exploits = [...roomActionIds].filter(id => {
    const action = actions.getAction(id)!;
    const restores = action.effects.some(e => e.type === 'energy' && e.operation === 'add' && e.value > 0);
    return restores && !(action.timeCost && action.timeCost > 0);
  });
  assert.deepEqual(exploits, []);
});

test('energy can always be recovered from zero', () => {
  const recovery = [...roomActionIds].filter(id => {
    const action = actions.getAction(id)!;
    const restores = action.effects.some(e => e.type === 'energy' && e.value > 0);
    const needsEnergy = action.conditions.some(c => c.type === 'energy') || (action.energyCost ?? 0) > 0;
    return restores && !needsEnergy;
  });
  assert.ok(recovery.length >= 3, `only ${recovery.join(',')}`);
});

test('no action relies on the disabled dialogue system', () => {
  const dialogueActions = [...roomActionIds].filter(id => actions.getAction(id)!.triggerDialogue);
  assert.deepEqual(dialogueActions, []);
});
