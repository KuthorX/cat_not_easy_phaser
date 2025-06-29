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
        { type: 'hunger', value: GameConstants.BASIC_ENERGY_RESTORE, operation: 'add' }
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
      id: 'conversating',
      name: '对话',
      effects: [
        { type: 'story_flag', value: 'balcony_conversation', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'opening',
      name: '打开',
      effects: [
        { type: 'story_flag', value: 'balcony_opened', operation: 'set' }
      ],
      conditions: [
        { type: 'inventory', operator: 'has', value: 'cat_bites_air' }
      ],
      specialCondition: {
        type: 'inventory_check',
        value: 'cat_bites_air',
        failureMessage: '需要咬空气才能打开这个禁制。'
      }
    });

    this.registerAction({
      id: 'catching',
      name: '抓出来',
      effects: [
        { type: 'story_flag', value: 'toy_hidden_deeper', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'shaking_bite_rope',
      name: '甩动咬绳',
      timeCost: 60,
      effects: [
        { type: 'inventory', value: 'spinning_ball', operation: 'add' }
      ],
      conditions: [
        { type: 'inventory', operator: 'has', value: 'cat_bites_rope' }
      ],
      specialCondition: {
        type: 'inventory_check',
        value: 'cat_bites_rope',
        failureMessage: '需要猫咬绳才能甩动。'
      }
    });

    this.registerAction({
      id: 'sleeping',
      name: '睡大觉',
      timeCost: 60,
      effects: [
        { type: 'energy', value: 1, operation: 'add' }
      ],
      conditions: [
        { type: 'energy', operator: 'gte', value: 1 }
      ]
    });

    this.registerAction({
      id: 'sweep_table',
      name: '扫它！',
      timeCost: 60,
      playTweens: {
        tweenKey: 'cat_oars',
        x: 400,
        y: 400,
        scale: 0.5,
        fps: 30,
      },
      effects: [
        { type: 'story_flag', value: 'table_swept', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'push_tv',
      name: '推它！',
      timeCost: 60,
      playTweens: {
        tweenKey: 'cat_push',
        x: 600,
        y: 400,
        scale: 0.5,
        fps: 10,
      },
      effects: [
        { type: 'story_flag', value: 'tv_table_pushed', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'attack_tv',
      name: '攻击',
      energyCost: 1,
      timeCost: 60,
      effects: [
        { type: 'story_flag', value: 'tv_destroyed', operation: 'set' }
      ],
      conditions: [
        { type: 'story_flag', operator: 'has', value: 'on_cat_bed' }
      ],
      specialCondition: {
        type: 'position_check',
        value: 'on_cat_bed',
        failureMessage: '我够不到它！'
      }
    });

    this.registerAction({
      id: 'grinding_claws',
      name: '磨爪',
      timeCost: 60,
      effects: [
        { type: 'story_flag', value: 'claws_sharpened', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'jumping',
      name: '跳跃',
      effects: [
        { type: 'story_flag', value: 'on_cat_bed', operation: 'set' }
      ],
      conditions: [
        { type: 'energy', operator: 'gte', value: 2 }
      ],
      specialCondition: {
        type: 'energy_check',
        value: 2,
        failureMessage: '精力不足，跳不上去...'
      }
    });

    //客厅门口
    this.registerAction({
      id: 'rummage',
      name: '翻找',
      timeCost: 60,
      effects: [
        { type: 'inventory', value: 'medium_box', operation: 'add' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'pounce',
      name: '扑击',
      timeCost: 60,
      effects: [
        { type: 'story_flag', value: 'router_damaged', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'rummage_water',
      name: '翻找',
      timeCost: 60,
      effects: [
        { type: 'inventory', value: 'heavy_water_bottle', operation: 'add' }
      ],
      conditions: []
    });

    //过道
    this.registerAction({
      id: 'unlock',
      name: '解锁',
      effects: [
        { type: 'story_flag', value: 'door_unlocked', operation: 'set' }
      ],
      conditions: [
        { type: 'story_flag', operator: 'has', value: 'on_bookshelf' }
      ]
    });

    this.registerAction({
      id: 'enter',
      name: '进入',
      effects: [],
      conditions: [
        { type: 'story_flag', operator: 'has', value: 'door_unlocked' }
      ]
    });

    this.registerAction({
      id: 'jump_on',
      name: '跳上',
      effects: [
        { type: 'story_flag', value: 'on_small_shelf', operation: 'set' }
      ],
      conditions: [
        { type: 'story_flag', operator: 'has', value: 'robot_stuck_on_shelf' }
      ],
      specialCondition: {
        type: 'position_check',
        value: 'robot_stuck_on_shelf',
        failureMessage: '就差一点点高度了，我需要个垫脚的。'
      }
    });

    this.registerAction({
      id: 'jump_on_big',
      name: '跳上',
      effects: [
        { type: 'story_flag', value: 'on_bookshelf', operation: 'set' }
      ],
      conditions: [
        { type: 'energy', operator: 'gte', value: 2 }
      ],
      specialCondition: {
        type: 'energy_check',
        value: 2,
        failureMessage: '精力不足，跳不上去...'
      }
    });

    this.registerAction({
      id: 'eat',
      name: '进食',
      timeCost: 60,
      effects: [
        { type: 'energy', value: 1, operation: 'add' }
      ],
      conditions: [
        { type: 'energy', operator: 'gte', value: 1 }
      ]
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
      conditions: [],
      playTweens: {
        tweenKey: 'cat_play',
        x: 400,
        y: 300,
      }
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

    // 笼子相关动作 - 纯对话触发
    this.registerAction({
      id: 'attack_cage',
      name: '攻击笼子',
      energyCost: 1,
      timeCost: 60,
      effects: [
        { type: 'story_flag', value: 'cage_attacked', operation: 'set' }
      ],
      conditions: [],
      dialogueId: 'cage_conversation',
      triggerDialogue: true
    });

    this.registerAction({
      id: 'jump_on_cage',
      name: '踩跳',
      effects: [
        { type: 'story_flag', value: 'cage_jumped', operation: 'set' },
        { type: 'room_access', value: 'living_room_west_high', operation: 'add' }
      ],
      conditions: [
        { type: 'story_flag', operator: 'has', value: 'cage_attacked' }
      ]
    });

    // 猫厕所动作 - 纯对话触发
    this.registerAction({
      id: 'use_litter_box',
      name: '使用猫厕所',
      effects: [
        { type: 'energy', value: 1, operation: 'add' }
      ],
      conditions: [
        { type: 'energy', operator: 'gte', value: 1 }
      ],
      dialogueId: 'litter_box_conversation',
      triggerDialogue: true
    });

    // 猫别墅动作
    this.registerAction({
      id: 'play_in_house',
      name: '在猫别墅里玩耍',
      timeCost: 60,
      energyCost: 1,
      effects: [
        { type: 'story_flag', value: 'play_time', operation: 'set' }
      ],
      conditions: []
    });

    // 鱼干动作
    this.registerAction({
      id: 'eat_fish_treat',
      name: '吃鱼干',
      timeCost: 60,
      effects: [
        { type: 'energy', value: 1, operation: 'add' }
      ],
      conditions: [
        { type: 'energy', operator: 'gte', value: 1 }
      ]
    });

    // 叼走绳子
    this.registerAction({
      id: 'bites_rope',
      name: '叼走',
      effects: [
        { type: 'inventory', value: 'cat_bites_rope', operation: 'add' }
      ],
      conditions: []
    });

    // 叼走空气
    this.registerAction({
      id: 'bites_air',
      name: '叼走',
      effects: [
        { type: 'inventory', value: 'cat_bites_air', operation: 'add' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'play_with_mouse',
      name: '和玩具老鼠玩耍',
      energyCost: 1,
      effects: [
        { type: 'story_flag', value: 'play_time', operation: 'set' }
      ],
      conditions: [],
      playTweens: {
        tweenKey: 'cat_tap',
        x: 400,
        y: 300,
      }
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
      energyCost: 3,
      timeCost: 120,
      effects: [
        { type: 'story_flag', value: 'screen_destroyed', operation: 'set' }
      ],
      conditions: [
        { type: 'story_flag', operator: 'has', value: 'claws_sharpened' }
      ],
      specialCondition: {
        type: 'story_flag_check',
        value: 'claws_sharpened',
        failureMessage: '爪子不够锋利，需要先磨爪。'
      }
    });

    this.registerAction({
      id: 'climb_wardrobe',
      name: '钻进衣柜',
      timeCost: 60,
      effects: [
        { type: 'story_flag', value: 'wardrobe_explored', operation: 'set' },
        { type: 'energy', value: 1, operation: 'add' }
      ],
      conditions: [
        { type: 'energy', operator: 'gte', value: 1 }
      ]
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
      id: 'reinforce',
      name: '加固',
      effects: [
        { type: 'story_flag', value: 'fortress_reinforced', operation: 'set' }
      ],
      conditions: [
        { type: 'inventory', operator: 'has', value: 'medium_box' },
        { type: 'inventory', operator: 'has', value: 'heavy_water_bottle' },
        { type: 'inventory', operator: 'has', value: 'expired_drink' }
      ],
      specialCondition: {
        type: 'inventory_check',
        value: ['medium_box', 'heavy_water_bottle', 'expired_drink'],
        failureMessage: '这可是项大工程，还是得两脚兽来做。但他是个蠢货，得我物色好合适的材料才行。'
      }
    });

    this.registerAction({
      id: 'inspect',
      name: '检阅',
      timeCost: 60,
      effects: [
        { type: 'inventory', value: 'large_box', operation: 'add' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'interact',
      name: '互动',
      timeCost: 60,
      effects: [
        { type: 'energy', value: -1, operation: 'add' }
      ],
      conditions: [],
    });

    this.registerAction({
      id: 'revenge',
      name: '报复',
      timeCost: 60,
      effects: [],
      conditions: [],
      thought: '狠狠的对着小圆拳打脚踢，真是愉快！'
    });

    this.registerAction({
      id: 'ride',
      name: '骑上',
      timeCost: 60,
      effects: [],
      conditions: [],
    });

    // 房间B相关动作
    this.registerAction({
      id: 'play',
      name: '玩耍',
      timeCost: 60,
      effects: [
        { type: 'story_flag', value: 'play_time', operation: 'set' }
      ],
      conditions: [
        { type: 'energy', operator: 'gte', value: 1 }
      ]
    });
    
    this.registerAction({
      id: 'carry',
      name: '叼走',
      effects: [
        { type: 'inventory', value: 'toy_mouse', operation: 'add' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'drink_carry',
      name: '叼走',
      effects: [
        { type: 'inventory', value: 'expired_drink', operation: 'add' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'destroy',
      name: '破坏',
      timeCost: 120,
      effects: [],
      conditions: [
        { type: 'energy', operator: 'gte', value: 3 }
      ]
    });

    this.registerAction({
      id: 'hide',
      name: '钻进去',
      timeCost: 60,
      effects: [],
      conditions: [
        { type: 'energy', operator: 'gte', value: 1 }
      ]
    });

    this.registerAction({
      id: 'pee',
      name: '尿床',
      timeCost: 60,
      effects: [
        { type: 'story_flag', value: 'bed_claimed', operation: 'set' }
      ],
      conditions: []
    });

    this.registerAction({
      id: 'scratch_bed',
      name: '抓床',
      energyCost: 1,
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
      energyCost: 1,
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
      energyCost: 1,
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