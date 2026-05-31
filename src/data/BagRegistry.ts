import { ActionRegistry } from './ActionRegistry';

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'consumable' | 'tool' | 'material' | 'toy' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  effects: ItemEffect[];
  conditions: ItemCondition[];
  maxStack: number;
  icon?: string;
  obtainableFrom: string[]; // 可以从哪些动作获得
  usableIn: string[]; // 可以在哪些场景使用
}

export interface ItemEffect {
  type: 'hunger' | 'energy' | 'story_flag' | 'inventory' | 'room_access' | 'achievement';
  value: any;
  operation: 'add' | 'remove' | 'set' | 'modify';
  duration?: number; // 持续时间（回合数）
}

export interface ItemCondition {
  type: 'hunger' | 'energy' | 'inventory' | 'story_flag' | 'room_visited' | 'action_completed';
  operator: 'gte' | 'lte' | 'eq' | 'ne' | 'has' | 'not_has';
  value: any;
}

export class BagRegistry {
  private items: Map<string, Item> = new Map();
  private actionRegistry: ActionRegistry;

  constructor(actionRegistry: ActionRegistry) {
    this.actionRegistry = actionRegistry;
    this.initializeItems();
  }

  private initializeItems(): void {
    // 食物类物品
    this.registerItem({
      id: 'cat_food',
      name: '猫粮',
      description: '美味的猫粮，可以恢复饥饿值。',
      type: 'consumable',
      rarity: 'common',
      effects: [
        { type: 'hunger', value: 2, operation: 'add' }
      ],
      conditions: [],
      maxStack: 10,
      obtainableFrom: ['eat_food_water', 'rummage'],
      usableIn: ['living_room_east', 'living_room_west_low', 'room_b']
    });

    this.registerItem({
      id: 'fish_treat',
      name: '鱼干',
      description: '高级鱼干，恢复更多饥饿值。',
      type: 'consumable',
      rarity: 'uncommon',
      effects: [
        { type: 'hunger', value: 4, operation: 'add' }
      ],
      conditions: [],
      maxStack: 5,
      obtainableFrom: ['eat', 'rummage_water'],
      usableIn: ['living_room_east', 'living_room_west_low', 'room_b']
    });

    this.registerItem({
      id: 'milk',
      name: '牛奶',
      description: '新鲜的牛奶，恢复能量。',
      type: 'consumable',
      rarity: 'common',
      effects: [
        { type: 'energy', value: 2, operation: 'add' }
      ],
      conditions: [],
      maxStack: 8,
      obtainableFrom: ['eat_food_water'],
      usableIn: ['living_room_east', 'living_room_west_low']
    });

    // 玩具类物品
    this.registerItem({
      id: 'toy_mouse',
      name: '玩具老鼠',
      description: '可爱的玩具老鼠，可以用来玩耍。',
      type: 'toy',
      rarity: 'common',
      effects: [
        { type: 'story_flag', value: 'has_toy_mouse', operation: 'set' }
      ],
      conditions: [],
      maxStack: 3,
      obtainableFrom: ['catching', 'rummage'],
      usableIn: ['living_room_east', 'living_room_west_low', 'room_b']
    });

    this.registerItem({
      id: 'rope_toy',
      name: '咬绳',
      description: '结实的咬绳，可以甩动玩耍。',
      type: 'toy',
      rarity: 'common',
      effects: [
        { type: 'story_flag', value: 'has_rope_toy', operation: 'set' }
      ],
      conditions: [],
      maxStack: 2,
      obtainableFrom: ['shaking_bite_rope'],
      usableIn: ['living_room_east', 'living_room_west_low']
    });

    this.registerItem({
      id: 'ball',
      name: '小球',
      description: '弹跳的小球，可以追逐玩耍。',
      type: 'toy',
      rarity: 'common',
      effects: [
        { type: 'story_flag', value: 'has_ball', operation: 'set' }
      ],
      conditions: [],
      maxStack: 2,
      obtainableFrom: ['jumping', 'pounce'],
      usableIn: ['living_room_east', 'living_room_west_low', 'room_b']
    });

    // 新增道具
    this.registerItem({
      id: 'cat_bites_rope',
      name: '猫咬绳',
      description: '长条粗麻绳，摇晃起来有声音，总感觉在挑衅我。',
      type: 'toy',
      rarity: 'common',
      effects: [],
      conditions: [],
      maxStack: 1,
      obtainableFrom: ['bites_rope'],
      usableIn: ['living_room_west_high']
    });

    this.registerItem({
      id: 'cat_bites_air',
      name: '咬空气',
      description: '神秘的小黑盒子，两脚兽有时候会拿起来摩擦两下就放下。',
      type: 'tool',
      rarity: 'rare',
      effects: [],
      conditions: [],
      maxStack: 1,
      obtainableFrom: ['bites_air'],
      usableIn: ['living_room_west_high']
    });

    this.registerItem({
      id: 'spinning_ball',
      name: '转球',
      description: '从桌下抓出来的小球，可以滚动玩耍。',
      type: 'toy',
      rarity: 'common',
      effects: [],
      conditions: [],
      maxStack: 1,
      obtainableFrom: ['shaking_bite_rope'],
      usableIn: ['living_room_east']
    });

    this.registerItem({
      id: 'medium_box',
      name: '中型箱子',
      description: '从杂物堆中找到的箱子，可以用来加固堡垒。',
      type: 'material',
      rarity: 'common',
      effects: [],
      conditions: [],
      maxStack: 5,
      obtainableFrom: ['rummage'],
      usableIn: ['balcony']
    });

    this.registerItem({
      id: 'heavy_water_bottle',
      name: '沉重水瓶',
      description: '灰扑扑的大圆瓶子，可以用来加固堡垒。',
      type: 'material',
      rarity: 'common',
      effects: [],
      conditions: [],
      maxStack: 3,
      obtainableFrom: ['rummage_water'],
      usableIn: ['balcony']
    });

    this.registerItem({
      id: 'expired_drink',
      name: '过期饮料',
      description: '花花绿绿的水源，两脚兽喜欢饮用。可以用来加固堡垒。',
      type: 'material',
      rarity: 'common',
      effects: [],
      conditions: [],
      maxStack: 5,
      obtainableFrom: ['drink_carry'],
      usableIn: ['balcony']
    });

    this.registerItem({
      id: 'large_box',
      name: '大箱子',
      description: '从堡垒地基中找到的大箱子，可以作为地基使用。',
      type: 'material',
      rarity: 'uncommon',
      effects: [],
      conditions: [],
      maxStack: 2,
      obtainableFrom: ['inspect'],
      usableIn: ['balcony']
    });

    // 工具类物品
    this.registerItem({
      id: 'key',
      name: '钥匙',
      description: '神秘的钥匙，可以解锁某些门。',
      type: 'tool',
      rarity: 'rare',
      effects: [
        { type: 'room_access', value: 'room_b', operation: 'add' }
      ],
      conditions: [],
      maxStack: 1,
      obtainableFrom: ['unlock', 'rummage'],
      usableIn: ['hallway']
    });

    this.registerItem({
      id: 'defense_materials',
      name: '防御材料',
      description: '可以用来构筑防御工事的材料。',
      type: 'material',
      rarity: 'epic',
      effects: [
        { type: 'story_flag', value: 'prepared_defense', operation: 'set' }
      ],
      conditions: [],
      maxStack: 5,
      obtainableFrom: ['rummage'],
      usableIn: ['balcony']
    });

    // 特殊物品
    this.registerItem({
      id: 'neighbor_cat_fur',
      name: '邻居猫的毛',
      description: '从邻居猫身上获得的战利品。',
      type: 'special',
      rarity: 'legendary',
      effects: [
        { type: 'story_flag', value: 'defeated_neighbor_cat', operation: 'set' }
      ],
      conditions: [],
      maxStack: 1,
      obtainableFrom: ['fought_neighbor_cat'],
      usableIn: ['balcony']
    });

    this.registerItem({
      id: 'owner_scent',
      name: '主人的气味',
      description: '带有主人气味的物品，让人安心。',
      type: 'special',
      rarity: 'rare',
      effects: [
        { type: 'energy', value: 1, operation: 'add' },
        { type: 'story_flag', value: 'has_owner_scent', operation: 'set' }
      ],
      conditions: [],
      maxStack: 1,
      obtainableFrom: ['sleep_on_bed'],
      usableIn: ['room_b']
    });
  }

  public registerItem(item: Item): void {
    this.items.set(item.id, item);
  }

  public getItem(itemId: string): Item | null {
    return this.items.get(itemId) || null;
  }

  public getAllItems(): Item[] {
    return Array.from(this.items.values());
  }

  public getItemIds(): string[] {
    return Array.from(this.items.keys());
  }

  // 根据动作获取可能获得的物品
  public getItemsFromAction(actionId: string): Item[] {
    return this.getAllItems().filter(item => 
      item.obtainableFrom.includes(actionId)
    );
  }

  // 获取在特定场景可使用的物品
  public getUsableItemsInRoom(roomId: string): Item[] {
    return this.getAllItems().filter(item => 
      item.usableIn.includes(roomId)
    );
  }

  // 检查物品使用条件
  public canUseItem(itemId: string, gameState: any): boolean {
    const item = this.getItem(itemId);
    if (!item) return false;

    return item.conditions.every(condition => {
      switch (condition.type) {
        case 'hunger':
          return this.checkCondition(gameState.hunger || 0, condition.operator, condition.value);
        case 'energy':
          return this.checkCondition(gameState.energy || 0, condition.operator, condition.value);
        case 'inventory':
          return this.checkCondition(gameState.inventory || [], condition.operator, condition.value);
        case 'story_flag':
          return this.checkCondition(gameState.storyFlags?.get(condition.value), condition.operator, condition.value);
        case 'room_visited':
          return this.checkCondition(gameState.visitedRooms || new Set(), condition.operator, condition.value);
        case 'action_completed':
          return this.checkCondition(gameState.completedActions || new Set(), condition.operator, condition.value);
        default:
          return false;
      }
    });
  }

  // 获取物品在背包中的数量
  public getItemCount(itemId: string, gameState: any): number {
    return (gameState.inventory || []).filter((item: string) => item === itemId).length;
  }

  // 获取背包中所有物品的统计信息
  public getInventoryStats(gameState: any): { itemId: string; count: number; item: Item }[] {
    const inventory = gameState.inventory || [];
    const itemCounts = new Map<string, number>();
    
    inventory.forEach((itemId: string) => {
      itemCounts.set(itemId, (itemCounts.get(itemId) || 0) + 1);
    });

    return Array.from(itemCounts.entries()).map(([itemId, count]) => ({
      itemId,
      count,
      item: this.getItem(itemId)!
    })).filter(entry => entry.item); // 过滤掉无效物品
  }

  // 检查条件
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
        if (Array.isArray(actual)) {
          return actual.includes(expected);
        } else if (actual instanceof Set) {
          return actual.has(expected);
        } else if (actual instanceof Map) {
          return actual.has(expected);
        }
        return false;
      case 'not_has':
        if (Array.isArray(actual)) {
          return !actual.includes(expected);
        } else if (actual instanceof Set) {
          return !actual.has(expected);
        } else if (actual instanceof Map) {
          return !actual.has(expected);
        }
        return true;
      default:
        return false;
    }
  }

  // 获取物品的稀有度颜色
  public getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common':
        return '#FFFFFF';
      case 'uncommon':
        return '#1EFF00';
      case 'rare':
        return '#0070DD';
      case 'epic':
        return '#A335EE';
      case 'legendary':
        return '#FF8000';
      default:
        return '#FFFFFF';
    }
  }

  // 获取物品类型的中文名称
  public getTypeName(type: string): string {
    switch (type) {
      case 'consumable':
        return '消耗品';
      case 'tool':
        return '工具';
      case 'material':
        return '材料';
      case 'toy':
        return '玩具';
      case 'special':
        return '特殊';
      default:
        return '未知';
    }
  }
} 