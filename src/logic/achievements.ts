import type { Achievement, AchievementCondition } from '../types/GameState';

/**
 * Pure achievement / ending rules. No Phaser imports so this can be unit-tested in Node.
 */

export interface ProgressState {
  completedActions: Set<string>;
  destroyedItems: Set<string>;
  visitedRooms: Set<string>;
  inventory: string[];
  storyFlags: Map<string, unknown>;
}

/** Achievements that have an ending illustration and finish the day. */
export const ENDING_ACHIEVEMENT_IDS = ['play_time', 'hooligan', 'good_cat', 'logistics'] as const;

/** Achievement awarded when the owner comes home and the cat broke nothing. */
export const GOOD_CAT_ENDING = 'good_cat';

/** Story flag set when the day runs out (the owner comes home). */
export const OWNER_RETURNED_FLAG = 'owner_returned';

/** Tie-break order when picking a day-end ending among the "naughty" endings. */
const DAY_END_PRIORITY = ['hooligan', 'play_time', 'logistics'];

/** Interactions that count as wrecking the house. */
export const DESTRUCTIVE_ACTIONS: readonly string[] = [
  'sweep_table',
  'push_tv',
  'destroy',
  'pee',
  'attack_cage',
  'sit_on_handset',
  'revenge_on_evil_robot',
];

export function hasCausedDestruction(state: ProgressState): boolean {
  return DESTRUCTIVE_ACTIONS.some(id => state.completedActions.has(id)) || state.destroyedItems.size > 0;
}

function isFlagSet(state: ProgressState, flag: string): boolean {
  const value = state.storyFlags.get(flag);
  return value === true || value === flag;
}

export function isConditionMet(condition: AchievementCondition, state: ProgressState): boolean {
  switch (condition.type) {
    case 'action_completed':
      return state.completedActions.has(condition.value);
    case 'item_destroyed':
      return state.destroyedItems.has(condition.value);
    case 'room_visited':
      return state.visitedRooms.has(condition.value);
    case 'inventory_has':
      return state.inventory.includes(condition.value);
    case 'story_flag':
      return isFlagSet(state, condition.value);
    case 'no_destruction':
      return !hasCausedDestruction(state);
    default:
      return false;
  }
}

export function getProgress(achievement: Achievement, state: ProgressState): { current: number; total: number } {
  const current = achievement.conditions.filter(c => isConditionMet(c, state)).length;
  return { current, total: achievement.conditions.length };
}

export function isAchievementMet(achievement: Achievement, state: ProgressState): boolean {
  return achievement.conditions.every(c => isConditionMet(c, state));
}

/** Ending achievements whose conditions are fully met right now and are not yet unlocked. */
export function findReachedEndings(
  achievements: Achievement[],
  state: ProgressState,
  unlocked: readonly string[],
): string[] {
  return achievements
    .filter(a => (ENDING_ACHIEVEMENT_IDS as readonly string[]).includes(a.id))
    .filter(a => !unlocked.includes(a.id) && isAchievementMet(a, state))
    .map(a => a.id);
}

/**
 * Decide which ending to show when the day runs out.
 * A cat that broke nothing is the owner's ally; otherwise the ending the player got closest to.
 */
export function pickDayEndEnding(achievements: Achievement[], state: ProgressState): string {
  if (!hasCausedDestruction(state)) {
    return GOOD_CAT_ENDING;
  }
  const byId = new Map(achievements.map(a => [a.id, a]));
  let best = DAY_END_PRIORITY[0];
  let bestRatio = -1;
  for (const id of DAY_END_PRIORITY) {
    const achievement = byId.get(id);
    if (!achievement || achievement.conditions.length === 0) continue;
    const { current, total } = getProgress(achievement, state);
    const ratio = current / total;
    if (ratio > bestRatio) {
      best = id;
      bestRatio = ratio;
    }
  }
  return best;
}
