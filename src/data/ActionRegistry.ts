import { Action } from '../types/GameState';
import { GameConstants } from '../config/GameConfig';

export class ActionRegistry {
  private actions: Map<string, Action> = new Map();

  constructor() {
    this.initializeActions();
  }

  private initializeActions(): void {
    // 基础交互动作
    this.registerAction({
      id: 'eat_food_water',
      name: '吃粮喝水',
      description: '吃猫粮和喝水，恢复饥饿值。',
      effects: [
        { type: 'hunger', value: GameConstants.BASIC_HUNGER_RESTORE, operation: 'add' }
      ],
      conditions: []
    });

    // 窗户对话动作 - 纯对话触发
    this.registerAction({
      id: 'sunbathing',
      name: '晒太阳',
      description: '在温暖的阳光下晒太阳，恢复精力。',
      effects: [], // 效果在对话选项中选择后执行
      conditions: [],
      dialogueId: 'window_conversation',
      triggerDialogue: true
    });

    this.registerAction({
      id: 'look_outside',
      name: '看外面',
      description: '透过门缝看外面的世界。',
      effects: [], // 效果在对话选项中选择后执行
      conditions: [],
      dialogueId: 'window_conversation',
      triggerDialogue: true
    });

    // 沙发对话动作 - 纯对话触发，不包含效果
    this.registerAction({
      id: 'sleep_on_sofa',
      name: '在沙发上睡觉',
      description: '在柔软的沙发上小憩。',
      effects: [], // 效果在对话选项中选择后执行
      conditions: [],
      dialogueId: 'sofa_conversation',
      triggerDialogue: true
    });

    this.registerAction({
      id: 'scratch_sofa',
      name: '抓沙发',
      description: '用爪子抓沙发，感觉很爽。',
      hungerCost: 1,
      effects: [], // 效果在对话选项中选择后执行
      conditions: [],
      dialogueId: 'sofa_conversation',
      triggerDialogue: true
    });

    // 笼子相关动作 - 纯对话触发
    this.registerAction({
      id: 'attack_cage',
      name: '攻击笼子',
      description: '用爪子攻击笼子，试图破坏它。',
      energyCost: 1,
      effects: [], // 效果在对话选项中选择后执行
      conditions: [],
      dialogueId: 'cage_conversation',
      triggerDialogue: true
    });

    this.registerAction({
      id: 'jump_on_cage',
      name: '踩跳',
      description: '跳到笼子上，解锁高处地图。',
      effects: [], // 效果在对话选项中选择后执行
      conditions: [
        { type: 'story_flag', operator: 'eq', value: 'cage_damaged' }
      ],
      dialogueId: 'cage_conversation',
      triggerDialogue: true
    });

    // 猫厕所动作 - 纯对话触发
    this.registerAction({
      id: 'use_litter_box',
      name: '使用猫厕所',
      description: '在猫厕所里方便。',
      effects: [], // 效果在对话选项中选择后执行
      conditions: [
        { type: 'hunger', operator: 'gte', value: 4 }
      ],
      dialogueId: 'litter_box_conversation',
      triggerDialogue: true
    });

    // 猫别墅动作
    this.registerAction({
      id: 'play_in_house',
      name: '在猫别墅里玩耍',
      description: '在猫别墅里玩耍，消耗饥饿值。',
      hungerCost: 1,
      effects: [
        { type: 'story_flag', value: 'play_time', operation: 'set' }
      ],
      conditions: []
    });

    // 鱼干动作
    this.registerAction({
      id: 'eat_fish_treat',
      name: '吃鱼干',
      description: '享用美味的鱼干。',
      effects: [
        { type: 'hunger', value: GameConstants.ADVANCED_HUNGER_RESTORE, operation: 'add' }
      ],
      conditions: []
    });

    // 主人房间动作
    this.registerAction({
      id: 'play_with_mouse',
      name: '和玩具老鼠玩耍',
      description: '和玩具老鼠玩耍，消耗饥饿值。',
      hungerCost: 1,
      effects: [
        { type: 'story_flag', value: 'play_time', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'carry_mouse',
      name: '叼走玩具老鼠',
      description: '把玩具老鼠叼走。',
      effects: [
        { type: 'inventory', value: 'toy_mouse', operation: 'add' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'destroy_screen',
      name: '破坏显示屏',
      description: '破坏主人的显示屏。',
      hungerCost: 1,
      energyCost: 3,
      effects: [
        { type: 'story_flag', value: 'screen_destroyed', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'sleep_on_bed',
      name: '在床上睡觉',
      description: '在主人的床上睡觉，恢复更多精力。',
      effects: [
        { type: 'energy', value: GameConstants.ADVANCED_ENERGY_RESTORE, operation: 'add' }
      ],
      conditions: []
    });

    // 特殊动作
    this.registerAction({
      id: 'house_parkour',
      name: '全屋跑酷',
      description: '在整个房子里跑酷，消耗大量精力。',
      energyCost: 3,
      effects: [
        { type: 'story_flag', value: 'parkour_completed', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'climb_wardrobe',
      name: '钻进衣柜',
      description: '钻进衣柜探索。',
      effects: [
        { type: 'story_flag', value: 'wardrobe_explored', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'sleep_hammock',
      name: '睡猫吊床',
      description: '在猫吊床上睡觉。',
      effects: [
        { type: 'energy', value: GameConstants.BASIC_ENERGY_RESTORE, operation: 'add' }
      ],
      conditions: []
    });

    // 逃跑动作
    this.registerAction({
      id: 'escape',
      name: '逃跑',
      description: '逃离这个房子，获得自由！',
      effects: [
        { type: 'story_flag', value: 'escaped', operation: 'set' },
        { type: 'achievement', value: 'freedom_achieved', operation: 'add' }
      ],
      conditions: []
    });
  }

  public registerAction(action: Action): void {
    this.actions.set(action.id, action);
  }

  public getAction(actionId: string): Action | null {
    return this.actions.get(actionId) || null;
  }

  public getAllActions(): Action[] {
    return Array.from(this.actions.values());
  }

  public getActionIds(): string[] {
    return Array.from(this.actions.keys());
  }

  // 检查动作是否可执行
  public canExecuteAction(actionId: string, gameState: any): boolean {
    const action = this.getAction(actionId);
    if (!action) return false;

    // 检查饥饿值要求
    if (action.hungerRequirement && gameState.hunger < action.hungerRequirement) {
      return false;
    }

    // 检查精力值要求
    if (action.energyRequirement && gameState.energy < action.energyRequirement) {
      return false;
    }

    // 检查物品要求
    if (action.itemRequirement && !gameState.inventory.includes(action.itemRequirement)) {
      return false;
    }

    // 检查条件
    return action.conditions.every(condition => {
      switch (condition.type) {
        case 'hunger':
          return this.checkCondition(gameState.hunger, condition.operator, condition.value);
        case 'energy':
          return this.checkCondition(gameState.energy, condition.operator, condition.value);
        case 'inventory':
          return this.checkCondition(gameState.inventory.includes(condition.value), condition.operator, true);
        case 'story_flag':
          return this.checkCondition(gameState.storyFlags.get(condition.value), condition.operator, condition.value);
        case 'room_visited':
          return this.checkCondition(gameState.visitedRooms.has(condition.value), condition.operator, true);
        case 'action_completed':
          return this.checkCondition(gameState.completedActions.has(condition.value), condition.operator, true);
        default:
          return true;
      }
    });
  }

  private checkCondition(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'gte':
        return actual >= expected;
      case 'lte':
        return actual <= expected;
      case 'eq':
        return actual === expected;
      case 'ne':
        return actual !== expected;
      case 'has':
        return actual === true || actual === expected;
      case 'not_has':
        return actual !== true && actual !== expected;
      default:
        return true;
    }
  }
} 