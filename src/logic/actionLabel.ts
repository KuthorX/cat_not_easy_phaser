export interface LabelledAction {
  name: string;
  timeCost?: number;
  energyCost?: number;
  effects?: Array<{ type: string; value: unknown; operation: string }>;
}

function formatDuration(minutes: number): string {
  if (minutes % 60 === 0) return `${minutes / 60}小时`;
  return `${minutes}分钟`;
}

/** Menu label that tells the player what an action costs and restores, e.g. "睡大觉（1小时 精力+1）". */
export function formatActionLabel(action: LabelledAction): string {
  const parts: string[] = [];
  if (action.timeCost && action.timeCost > 0) parts.push(formatDuration(action.timeCost));
  if (action.energyCost && action.energyCost > 0) parts.push(`精力-${action.energyCost}`);
  const energyGain = (action.effects ?? [])
    .filter(e => e.type === 'energy' && e.operation === 'add' && typeof e.value === 'number')
    .reduce((sum, e) => sum + (e.value as number), 0);
  if (energyGain > 0) parts.push(`精力+${energyGain}`);
  if (energyGain < 0) parts.push(`精力${energyGain}`);
  return parts.length > 0 ? `${action.name}（${parts.join(' ')}）` : action.name;
}

/** Clamp a menu whose items are centred on x so that it stays fully on screen. */
export function clampMenuPosition(
  x: number, y: number, width: number, height: number, screenW = 1280, screenH = 720, margin = 10,
): { x: number; y: number } {
  const half = width / 2;
  const cx = Math.min(Math.max(x, half + margin), screenW - half - margin);
  // 第一个按钮中心在 y，按钮高 35，向上半个按钮
  const top = Math.min(Math.max(y, margin + 18), screenH - height - margin + 18);
  return { x: cx, y: top };
}
