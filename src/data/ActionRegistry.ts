import { Action } from '../types/GameState';
import { GameConstants } from '../config/GameConfig';

export class ActionRegistry {
  private actions: Map<string, Action> = new Map();

  constructor() {
    this.initializeActions();
  }

  private initializeActions(): void {
    // 基础恢复动作
    this.registerAction({
      id: 'eat_food_water',
      name: '吃粮喝水',
      timeCost: GameConstants.BASIC_ACTION_COST,
      effects: [
        { type: 'hunger', value: GameConstants.BASIC_HUNGER_RESTORE, operation: 'add' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'sleep_in_cat_bed',
      name: '猫窝睡觉',
      timeCost: GameConstants.BASIC_ACTION_COST,
      effects: [
        { type: 'energy', value: GameConstants.BASIC_ENERGY_RESTORE, operation: 'add' }
      ],
      conditions: []
    });

    // 客厅-向东看场景动作
    this.registerAction({
      id: 'chew_rope',
      name: '啃咬',
      timeCost: GameConstants.ADVANCED_ACTION_COST,
      effects: [
        { type: 'story_flag', value: 'chew_rope_completed', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'chase_ball',
      name: '追逐',
      timeCost: GameConstants.ADVANCED_ACTION_COST,
      effects: [
        { type: 'story_flag', value: 'chase_ball_completed', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'sweep_table',
      name: '扫落',
      timeCost: GameConstants.ADVANCED_ACTION_COST,
      effects: [
        { type: 'story_flag', value: 'table_swept', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'attack_tv',
      name: '攻击',
      timeCost: GameConstants.ADVANCED_ACTION_COST,
      energyCost: 1,
      effects: [
        { type: 'story_flag', value: 'tv_destroyed', operation: 'set' }
      ],
      conditions: [
        { type: 'story_flag', value: 'on_cat_bed', operator: 'eq' }
      ],
      specialCondition: {
        type: 'position_check',
        value: 'cat_bed',
        failureMessage: '我够不到它！'
      }
    });

    // 主人房间动作
    this.registerAction({
      id: 'sleep_on_bed',
      name: '床上睡觉',
      timeCost: GameConstants.ADVANCED_ACTION_COST,
      effects: [
        { type: 'energy', value: GameConstants.ADVANCED_ENERGY_RESTORE, operation: 'add' }
      ],
      conditions: []
    });

    // 特殊动作
    this.registerAction({
      id: 'poop',
      name: '拉屎',
      timeCost: GameConstants.BASIC_ACTION_COST,
      effects: [],
      conditions: [
        { type: 'hunger', operator: 'gte', value: 4 }
      ]
    });

    this.registerAction({
      id: 'house_parkour',
      name: '全屋跑酷',
      timeCost: GameConstants.ADVANCED_ACTION_COST,
      energyCost: 3,
      effects: [
        { type: 'story_flag', value: 'parkour_completed', operation: 'set' }
      ],
      conditions: []
    });

    // 窗户对话动作 - 纯对话触发
    this.registerAction({
      id: 'sunbathing',
      name: '晒太阳',
      effects: [], // 效果在对话选项中选择后执行
      conditions: [],
      dialogueId: 'window_conversation',
      triggerDialogue: true
    });

    this.registerAction({
      id: 'look_outside',
      name: '看外面',
      effects: [], // 效果在对话选项中选择后执行
      conditions: [],
      dialogueId: 'window_conversation',
      triggerDialogue: true
    });

    // 沙发对话动作 - 纯对话触发，不包含效果
    this.registerAction({
      id: 'sleep_on_sofa',
      name: '在沙发上睡觉',
      effects: [], // 效果在对话选项中选择后执行
      conditions: [],
      dialogueId: 'sofa_conversation',
      triggerDialogue: true
    });

    this.registerAction({
      id: 'scratch_sofa',
      name: '抓沙发',
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
      energyCost: 1,
      effects: [], // 效果在对话选项中选择后执行
      conditions: [],
      dialogueId: 'cage_conversation',
      triggerDialogue: true
    });

    this.registerAction({
      id: 'jump_on_cage',
      name: '踩跳',
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
      effects: [
        { type: 'hunger', value: GameConstants.ADVANCED_HUNGER_RESTORE, operation: 'add' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'play_with_mouse',
      name: '和玩具老鼠玩耍',
      hungerCost: 1,
      effects: [
        { type: 'story_flag', value: 'play_time', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'carry_mouse',
      name: '叼走玩具老鼠',
      effects: [
        { type: 'inventory', value: 'toy_mouse', operation: 'add' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'destroy_screen',
      name: '破坏显示屏',
      hungerCost: 1,
      energyCost: 3,
      effects: [
        { type: 'story_flag', value: 'screen_destroyed', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'climb_wardrobe',
      name: '钻进衣柜',
      effects: [
        { type: 'story_flag', value: 'wardrobe_explored', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'sleep_hammock',
      name: '睡猫吊床',
      effects: [
        { type: 'energy', value: GameConstants.BASIC_ENERGY_RESTORE, operation: 'add' }
      ],
      conditions: []
    });

    // 逃跑动作
    this.registerAction({
      id: 'escape',
      name: '逃跑',
      effects: [
        { type: 'story_flag', value: 'escaped', operation: 'set' },
        { type: 'achievement', value: 'freedom_achieved', operation: 'add' }
      ],
      conditions: []
    });

    // 阳台相关动作
    this.registerAction({
      id: 'sit_on_chair',
      name: '坐在椅子上',
      effects: [
        { type: 'energy', value: GameConstants.BASIC_ENERGY_RESTORE, operation: 'add' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'jump_on_chair',
      name: '跳到椅子上',
      energyCost: 1,
      effects: [
        { type: 'story_flag', value: 'chair_jumped', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'climb_hanger',
      name: '爬上衣架',
      energyCost: 1,
      effects: [
        { type: 'story_flag', value: 'hanger_climbed', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'play_with_clothes',
      name: '玩衣服',
      hungerCost: 1,
      effects: [
        { type: 'story_flag', value: 'clothes_played', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'chase_robot',
      name: '追扫地机器人',
      energyCost: 2,
      effects: [
        { type: 'story_flag', value: 'robot_chased', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'ride_robot',
      name: '骑扫地机器人',
      energyCost: 1,
      effects: [
        { type: 'story_flag', value: 'robot_ridden', operation: 'set' }
      ],
      conditions: []
    });

    // 房间B相关动作
    this.registerAction({
      id: 'scratch_bed',
      name: '抓床',
      hungerCost: 1,
      effects: [
        { type: 'story_flag', value: 'bed_scratched', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'sit_on_chair',
      name: '坐在椅子上',
      effects: [
        { type: 'energy', value: GameConstants.BASIC_ENERGY_RESTORE, operation: 'add' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'climb_chair',
      name: '爬上椅子',
      energyCost: 1,
      effects: [
        { type: 'story_flag', value: 'chair_climbed', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'watch_screen',
      name: '看屏幕',
      effects: [
        { type: 'story_flag', value: 'screen_watched', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'paw_screen',
      name: '用爪子拍屏幕',
      hungerCost: 1,
      effects: [
        { type: 'story_flag', value: 'screen_pawed', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'investigate_kettle',
      name: '调查水壶',
      effects: [
        { type: 'story_flag', value: 'kettle_investigated', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'knock_over_kettle',
      name: '推倒水壶',
      energyCost: 1,
      effects: [
        { type: 'story_flag', value: 'kettle_knocked', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'climb_wall',
      name: '爬墙',
      energyCost: 2,
      effects: [
        { type: 'story_flag', value: 'wall_climbed', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'scratch_wall',
      name: '抓墙',
      hungerCost: 1,
      effects: [
        { type: 'story_flag', value: 'wall_scratched', operation: 'set' }
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