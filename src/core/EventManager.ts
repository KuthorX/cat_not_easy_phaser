import { EventEmitter } from '../utils/EventEmitter';
import { GameEvents } from '../constants/GameEvents';
import { GameState } from '../types/GameState';

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  type: 'story' | 'achievement' | 'system' | 'random';
  trigger: {
    type: 'action' | 'room_visit' | 'time' | 'condition' | 'inventory';
    value: string;
    operator?: 'eq' | 'gte' | 'lte' | 'has' | 'not_has';
  };
  effects: Array<{
    type: 'story_flag' | 'achievement' | 'inventory' | 'energy' | 'hunger' | 'time';
    value: any;
    operation: 'set' | 'add' | 'remove';
  }>;
  conditions?: Array<{
    type: 'story_flag' | 'inventory' | 'achievement' | 'time' | 'energy' | 'hunger';
    value: any;
    operator: 'eq' | 'gte' | 'lte' | 'has' | 'not_has';
  }>;
  oneTime?: boolean;
  priority?: number;
}

export class EventManager {
  private events: Map<string, GameEvent> = new Map();
  private triggeredEvents: Set<string> = new Set();
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.initializeEvents();
  }

  private initializeEvents(): void {
    // 故事事件
    this.registerEvent({
      id: 'first_room_visit',
      name: '第一次探索',
      description: '你第一次探索了这个房间。',
      type: 'story',
      trigger: {
        type: 'room_visit',
        value: 'any'
      },
      effects: [
        { type: 'story_flag', value: 'exploration_started', operation: 'set' }
      ],
      oneTime: true
    });

    this.registerEvent({
      id: 'cage_destroyed',
      name: '笼子被破坏',
      description: '你成功破坏了那个可恶的笼子！',
      type: 'story',
      trigger: {
        type: 'action',
        value: 'attack_cage'
      },
      effects: [
        { type: 'story_flag', value: 'cage_destroyed', operation: 'set' },
        { type: 'achievement', value: 'cage_destroyer', operation: 'add' }
      ],
      oneTime: true
    });

    this.registerEvent({
      id: 'screen_destroyed',
      name: '显示屏被破坏',
      description: '主人的显示屏被你破坏了！',
      type: 'story',
      trigger: {
        type: 'action',
        value: 'destroy_screen'
      },
      effects: [
        { type: 'story_flag', value: 'screen_destroyed', operation: 'set' },
        { type: 'achievement', value: 'screen_destroyer', operation: 'add' }
      ],
      oneTime: true
    });

    this.registerEvent({
      id: 'mouse_carried',
      name: '玩具老鼠被叼走',
      description: '你把玩具老鼠叼走了！',
      type: 'story',
      trigger: {
        type: 'action',
        value: 'carry_mouse'
      },
      effects: [
        { type: 'story_flag', value: 'mouse_carried', operation: 'set' },
        { type: 'achievement', value: 'mouse_thief', operation: 'add' }
      ],
      oneTime: true
    });

    // 成就事件
    this.registerEvent({
      id: 'first_sleep',
      name: '第一次睡觉',
      description: '你第一次在游戏中睡觉了。',
      type: 'achievement',
      trigger: {
        type: 'action',
        value: 'sleep_on_sofa'
      },
      effects: [
        { type: 'achievement', value: 'first_sleep', operation: 'add' }
      ],
      oneTime: true
    });

    this.registerEvent({
      id: 'first_meal',
      name: '第一次进食',
      description: '你第一次在游戏中进食了。',
      type: 'achievement',
      trigger: {
        type: 'action',
        value: 'eat_fish_treat'
      },
      effects: [
        { type: 'achievement', value: 'first_meal', operation: 'add' }
      ],
      oneTime: true
    });

    this.registerEvent({
      id: 'explorer',
      name: '探索者',
      description: '你访问了所有房间。',
      type: 'achievement',
      trigger: {
        type: 'condition',
        value: 'all_rooms_visited'
      },
      effects: [
        { type: 'achievement', value: 'explorer', operation: 'add' }
      ],
      oneTime: true
    });

    // 随机事件
    this.registerEvent({
      id: 'random_play',
      name: '突然想玩',
      description: '你突然想玩耍了！',
      type: 'random',
      trigger: {
        type: 'time',
        value: 'random'
      },
      effects: [
        { type: 'energy', value: -1, operation: 'add' },
        { type: 'hunger', value: -1, operation: 'add' }
      ],
      conditions: [
        { type: 'energy', value: 3, operator: 'gte' }
      ]
    });

    this.registerEvent({
      id: 'sudden_hunger',
      name: '突然饿了',
      description: '你突然感到饿了。',
      type: 'random',
      trigger: {
        type: 'time',
        value: 'random'
      },
      effects: [
        { type: 'hunger', value: -1, operation: 'add' }
      ],
      conditions: [
        { type: 'hunger', value: 2, operator: 'gte' }
      ]
    });

    // 新增事件
    this.registerEvent({
      id: 'door_opened',
      name: '门开了',
      description: '你成功打开了门，看到了外面的世界。',
      type: 'story',
      trigger: {
        type: 'action',
        value: 'look_outside'
      },
      effects: [
        { type: 'story_flag', value: 'door_opened', operation: 'set' },
        { type: 'achievement', value: 'door_opener', operation: 'add' }
      ],
      oneTime: true
    });

    this.registerEvent({
      id: 'freedom_achieved',
      name: '获得自由',
      description: '你成功逃离了房子，获得了自由！',
      type: 'story',
      trigger: {
        type: 'action',
        value: 'escape'
      },
      effects: [
        { type: 'story_flag', value: 'escaped', operation: 'set' },
        { type: 'achievement', value: 'freedom_achieved', operation: 'add' }
      ],
      oneTime: true
    });

    this.registerEvent({
      id: 'wardrobe_explored',
      name: '探索衣柜',
      description: '你探索了衣柜，发现了有趣的东西。',
      type: 'story',
      trigger: {
        type: 'action',
        value: 'climb_wardrobe'
      },
      effects: [
        { type: 'story_flag', value: 'wardrobe_explored', operation: 'set' },
        { type: 'achievement', value: 'explorer', operation: 'add' }
      ],
      oneTime: true
    });
  }

  public registerEvent(event: GameEvent): void {
    this.events.set(event.id, event);
  }

  public checkEvents(gameState: GameState, triggerType: string, triggerValue: string): void {
    this.events.forEach((event, eventId) => {
      if (this.triggeredEvents.has(eventId) && event.oneTime) {
        return; // 一次性事件已触发
      }

      if (event.trigger.type === triggerType && 
          (event.trigger.value === triggerValue || event.trigger.value === 'any')) {
        
        if (this.checkEventConditions(event, gameState)) {
          this.triggerEvent(event, gameState);
        }
      }
    });
  }

  private checkEventConditions(event: GameEvent, gameState: GameState): boolean {
    if (!event.conditions) return true;

    return event.conditions.every(condition => {
      let actualValue: any;

      switch (condition.type) {
        case 'story_flag':
          actualValue = gameState.storyFlags.get(condition.value);
          break;
        case 'inventory':
          actualValue = gameState.inventory.includes(condition.value);
          break;
        case 'achievement':
          actualValue = gameState.achievements.includes(condition.value);
          break;
        case 'time':
          actualValue = gameState.currentTime;
          break;
        case 'energy':
          actualValue = gameState.energy;
          break;
        case 'hunger':
          actualValue = gameState.hunger;
          break;
        default:
          return true;
      }

      return this.checkCondition(actualValue, condition.operator, condition.value);
    });
  }

  private checkCondition(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'eq':
        return actual === expected;
      case 'gte':
        return actual >= expected;
      case 'lte':
        return actual <= expected;
      case 'has':
        return actual === true || actual === expected;
      case 'not_has':
        return actual !== true && actual !== expected;
      default:
        return true;
    }
  }

  private triggerEvent(event: GameEvent, gameState: GameState): void {
    // 应用事件效果
    event.effects.forEach(effect => {
      switch (effect.type) {
        case 'story_flag':
          if (effect.operation === 'set') {
            gameState.storyFlags.set(effect.value, true);
          }
          break;
        case 'achievement':
          if (effect.operation === 'add' && !gameState.achievements.includes(effect.value)) {
            gameState.achievements.push(effect.value);
          }
          break;
        case 'inventory':
          if (effect.operation === 'add' && !gameState.inventory.includes(effect.value)) {
            gameState.inventory.push(effect.value);
          } else if (effect.operation === 'remove') {
            const index = gameState.inventory.indexOf(effect.value);
            if (index > -1) {
              gameState.inventory.splice(index, 1);
            }
          }
          break;
        case 'energy':
          if (effect.operation === 'add') {
            gameState.energy = Math.max(0, Math.min(10, gameState.energy + effect.value));
          }
          break;
        case 'hunger':
          if (effect.operation === 'add') {
            gameState.hunger = Math.max(0, Math.min(10, gameState.hunger + effect.value));
          }
          break;
        case 'time':
          if (effect.operation === 'add') {
            gameState.currentTime += effect.value;
          }
          break;
      }
    });

    // 标记事件已触发
    if (event.oneTime) {
      this.triggeredEvents.add(event.id);
    }

    // 发出事件通知
    this.eventEmitter.emit(GameEvents.EVENT_TRIGGERED, {
      event,
      gameState
    });

    // 发出特定事件通知
    this.eventEmitter.emit(`event:${event.id}`, {
      event,
      gameState
    });
  }

  public onEvent(eventId: string, callback: (data: any) => void): void {
    this.eventEmitter.on(`event:${eventId}`, callback);
  }

  public onEventTriggered(callback: (data: any) => void): void {
    this.eventEmitter.on(GameEvents.EVENT_TRIGGERED, callback);
  }

  public getEvent(eventId: string): GameEvent | null {
    return this.events.get(eventId) || null;
  }

  public getAllEvents(): GameEvent[] {
    return Array.from(this.events.values());
  }

  public resetTriggeredEvents(): void {
    this.triggeredEvents.clear();
  }
} 