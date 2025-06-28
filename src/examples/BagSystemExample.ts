import { BagRegistry } from '../data/BagRegistry';
import { ActionRegistry } from '../data/ActionRegistry';
import { BagPage } from '../core/ui/BagPage';

/**
 * 背包系统使用示例
 * 
 * 这个示例展示了如何：
 * 1. 创建和初始化 BagRegistry
 * 2. 设置 BagPage UI 组件
 * 3. 管理物品的获取和使用
 * 4. 处理物品条件检查
 */

export class BagSystemExample {
  private actionRegistry: ActionRegistry;
  private bagRegistry: BagRegistry;
  private bagPage: BagPage;
  private gameState: any;

  constructor() {
    // 初始化动作注册表
    this.actionRegistry = new ActionRegistry();
    
    // 初始化背包注册表（需要传入 ActionRegistry）
    this.bagRegistry = new BagRegistry(this.actionRegistry);
    
    // 初始化背包页面
    this.bagPage = new BagPage();
    
    // 模拟游戏状态
    this.gameState = {
      inventory: ['cat_food', 'cat_food', 'toy_mouse', 'key'],
      energy: 5,
      hunger: 3,
      visitedRooms: new Set(['living_room_east', 'living_room_west_low']),
      completedActions: new Set(['eat_food_water', 'rummage']),
      storyFlags: new Map()
    };
  }

  /**
   * 初始化背包页面（需要在 Phaser 场景中调用）
   */
  public initializeBagPage(scene: Phaser.Scene): void {
    this.bagPage.initialize(scene);
    this.bagPage.setBagRegistry(this.bagRegistry);
    this.bagPage.setGameState(this.gameState);
  }

  /**
   * 显示背包页面
   */
  public showBagPage(): void {
    this.bagPage.show();
  }

  /**
   * 隐藏背包页面
   */
  public hideBagPage(): void {
    this.bagPage.hide();
  }

  /**
   * 添加物品到背包
   */
  public addItem(itemId: string): void {
    const item = this.bagRegistry.getItem(itemId);
    if (item) {
      // 检查是否达到最大堆叠数量
      const currentCount = this.bagRegistry.getItemCount(itemId, this.gameState);
      if (currentCount < item.maxStack) {
        this.gameState.inventory.push(itemId);
        console.log(`添加物品: ${item.name}`);
      } else {
        console.log(`物品 ${item.name} 已达到最大堆叠数量`);
      }
    } else {
      console.log(`物品 ${itemId} 不存在`);
    }
  }

  /**
   * 从背包移除物品
   */
  public removeItem(itemId: string): boolean {
    const index = this.gameState.inventory.indexOf(itemId);
    if (index > -1) {
      this.gameState.inventory.splice(index, 1);
      const item = this.bagRegistry.getItem(itemId);
      console.log(`移除物品: ${item?.name || itemId}`);
      return true;
    }
    return false;
  }

  /**
   * 使用物品
   */
  public useItem(itemId: string): boolean {
    const item = this.bagRegistry.getItem(itemId);
    if (!item) {
      console.log(`物品 ${itemId} 不存在`);
      return false;
    }

    // 检查使用条件
    if (!this.bagRegistry.canUseItem(itemId, this.gameState)) {
      console.log(`无法使用物品 ${item.name}，条件不满足`);
      return false;
    }

    // 检查是否拥有该物品
    if (!this.gameState.inventory.includes(itemId)) {
      console.log(`背包中没有物品 ${item.name}`);
      return false;
    }

    // 应用物品效果
    item.effects.forEach(effect => {
      this.applyItemEffect(effect);
    });

    // 移除物品（如果是消耗品）
    if (item.type === 'consumable') {
      this.removeItem(itemId);
    }

    console.log(`使用物品: ${item.name}`);
    return true;
  }

  /**
   * 应用物品效果
   */
  private applyItemEffect(effect: any): void {
    switch (effect.type) {
      case 'hunger':
        if (effect.operation === 'add') {
          this.gameState.hunger = Math.min(10, this.gameState.hunger + effect.value);
        }
        break;
      case 'energy':
        if (effect.operation === 'add') {
          this.gameState.energy = Math.min(10, this.gameState.energy + effect.value);
        }
        break;
      case 'story_flag':
        if (effect.operation === 'set') {
          this.gameState.storyFlags.set(effect.value, true);
        }
        break;
      case 'inventory':
        if (effect.operation === 'add') {
          this.addItem(effect.value);
        } else if (effect.operation === 'remove') {
          this.removeItem(effect.value);
        }
        break;
      case 'room_access':
        // 处理房间访问权限
        console.log(`获得房间访问权限: ${effect.value}`);
        break;
      case 'achievement':
        // 处理成就解锁
        console.log(`解锁成就: ${effect.value}`);
        break;
    }
  }

  /**
   * 获取背包统计信息
   */
  public getInventoryStats(): any[] {
    return this.bagRegistry.getInventoryStats(this.gameState);
  }

  /**
   * 检查物品使用条件
   */
  public canUseItem(itemId: string): boolean {
    return this.bagRegistry.canUseItem(itemId, this.gameState);
  }

  /**
   * 获取物品信息
   */
  public getItemInfo(itemId: string): any {
    return this.bagRegistry.getItem(itemId);
  }

  /**
   * 获取从特定动作可能获得的物品
   */
  public getItemsFromAction(actionId: string): any[] {
    return this.bagRegistry.getItemsFromAction(actionId);
  }

  /**
   * 获取在特定场景可使用的物品
   */
  public getUsableItemsInRoom(roomId: string): any[] {
    return this.bagRegistry.getUsableItemsInRoom(roomId);
  }

  /**
   * 演示背包系统功能
   */
  public demonstrate(): void {
    console.log('=== 背包系统演示 ===');
    
    // 显示当前背包内容
    console.log('当前背包内容:');
    const stats = this.getInventoryStats();
    stats.forEach(stat => {
      console.log(`- ${stat.item.name} x${stat.count} (${stat.item.type})`);
    });

    // 演示添加物品
    console.log('\n添加物品演示:');
    this.addItem('fish_treat');
    this.addItem('milk');
    this.addItem('defense_materials');

    // 显示更新后的背包内容
    console.log('\n更新后的背包内容:');
    const updatedStats = this.getInventoryStats();
    updatedStats.forEach(stat => {
      console.log(`- ${stat.item.name} x${stat.count} (${stat.item.type})`);
    });

    // 演示使用物品
    console.log('\n使用物品演示:');
    console.log(`使用前 - 饥饿值: ${this.gameState.hunger}, 能量: ${this.gameState.energy}`);
    this.useItem('cat_food');
    console.log(`使用后 - 饥饿值: ${this.gameState.hunger}, 能量: ${this.gameState.energy}`);

    // 演示条件检查
    console.log('\n条件检查演示:');
    const canUseKey = this.canUseItem('key');
    console.log(`可以使用钥匙: ${canUseKey}`);

    // 演示获取物品信息
    console.log('\n物品信息演示:');
    const keyInfo = this.getItemInfo('key');
    console.log(`钥匙信息:`, keyInfo);

    // 演示从动作获取物品
    console.log('\n从动作获取物品演示:');
    const itemsFromRummage = this.getItemsFromAction('rummage');
    console.log('从翻找动作可能获得的物品:');
    itemsFromRummage.forEach(item => {
      console.log(`- ${item.name} (${item.rarity})`);
    });

    // 演示场景可用物品
    console.log('\n场景可用物品演示:');
    const usableInLivingRoom = this.getUsableItemsInRoom('living_room_east');
    console.log('在客厅可使用的物品:');
    usableInLivingRoom.forEach(item => {
      console.log(`- ${item.name} (${item.type})`);
    });
  }
}

// 使用示例：
/*
// 在游戏场景中初始化
const bagExample = new BagSystemExample();
bagExample.initializeBagPage(scene);

// 显示背包
bagExample.showBagPage();

// 演示功能
bagExample.demonstrate();
*/ 