import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clampMenuPosition, formatActionLabel } from '../src/logic/actionLabel';

test('labels show time and energy cost', () => {
  assert.equal(formatActionLabel({ name: '玩耍', timeCost: 60, energyCost: 1 }), '玩耍（1小时 精力-1）');
  assert.equal(formatActionLabel({ name: '压扁', timeCost: 120 }), '压扁（2小时）');
  assert.equal(formatActionLabel({ name: '叼走' }), '叼走');
});

test('labels show energy gained', () => {
  const sleep = { name: '睡', timeCost: 60, effects: [{ type: 'energy', value: 2, operation: 'add' }] };
  assert.equal(formatActionLabel(sleep), '睡（1小时 精力+2）');
});

test('centred menus are kept on screen', () => {
  assert.deepEqual(clampMenuPosition(20, 300, 280, 80), { x: 150, y: 300 });
  assert.deepEqual(clampMenuPosition(1270, 300, 280, 80), { x: 1130, y: 300 });
  const low = clampMenuPosition(640, 715, 280, 120);
  assert.ok(low.y - 18 + 120 <= 720 - 10 + 1);
  assert.equal(clampMenuPosition(640, 0, 280, 40).y, 28);
});
