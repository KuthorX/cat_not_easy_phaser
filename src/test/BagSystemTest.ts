/**
 * 背包系统测试
 * 
 * 这个文件用于测试背包系统的基本功能
 */

import { BagRegistry } from '../data/BagRegistry';
import { ActionRegistry } from '../data/ActionRegistry';

export class BagSystemTest {
  private actionRegistry: ActionRegistry;
  private bagRegistry: BagRegistry;
  private gameState: any;

  constructor() {
    // 初始化注册表
    this.actionRegistry = new ActionRegistry();
    this.bagRegistry = new BagRegistry(this.actionRegistry);
    
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
   * 运行所有测试
   */
  public runAllTests(): void {
    console.log('=== 背包系统测试开始 ===');
    
    this.testItemRegistration();
    this.testItemRetrieval();
    this.testInventoryStats();
    this.testItemConditions();
    this.testItemEffects();
    this.testRarityColors();
    
    console.log('=== 背包系统测试完成 ===');
  }

  /**
   * 测试物品注册
   */
  private testItemRegistration(): void {
    console.log('\n--- 测试物品注册 ---');
    
    const allItems = this.bagRegistry.getAllItems();
    console.log(`注册的物品数量: ${allItems.length}`);
    
    allItems.forEach(item => {
      console.log(`- ${item.name} (${item.type}, ${item.rarity})`);
    });
  }

  /**
   * 测试物品获取
   */
  private testItemRetrieval(): void {
    console.log('\n--- 测试物品获取 ---');
    
    const catFood = this.bagRegistry.getItem('cat_food');
    const key = this.bagRegistry.getItem('key');
    const nonExistent = this.bagRegistry.getItem('non_existent');
    
    console.log(`猫粮: ${catFood ? catFood.name : '未找到'}`);
    console.log(`钥匙: ${key ? key.name : '未找到'}`);
    console.log(`不存在的物品: ${nonExistent ? '找到了' : '未找到'}`);
  }

  /**
   * 测试背包统计
   */
  private testInventoryStats(): void {
    console.log('\n--- 测试背包统计 ---');
    
    const stats = this.bagRegistry.getInventoryStats(this.gameState);
    console.log(`背包中的物品种类: ${stats.length}`);
    
    stats.forEach(stat => {
      console.log(`- ${stat.item.name} x${stat.count} (最大堆叠: ${stat.item.maxStack})`);
    });
  }

  /**
   * 测试物品条件
   */
  private testItemConditions(): void {
    console.log('\n--- 测试物品条件 ---');
    
    const canUseCatFood = this.bagRegistry.canUseItem('cat_food', this.gameState);
    const canUseKey = this.bagRegistry.canUseItem('key', this.gameState);
    
    console.log(`可以使用猫粮: ${canUseCatFood}`);
    console.log(`可以使用钥匙: ${canUseKey}`);
  }

  /**
   * 测试物品效果
   */
  private testItemEffects(): void {
    console.log('\n--- 测试物品效果 ---');
    
    const catFood = this.bagRegistry.getItem('cat_food');
    if (catFood) {
      console.log(`猫粮效果: ${catFood.effects.length} 个`);
      catFood.effects.forEach(effect => {
        console.log(`  - ${effect.type}: ${effect.operation} ${effect.value}`);
      });
    }
  }

  /**
   * 测试稀有度颜色
   */
  private testRarityColors(): void {
    console.log('\n--- 测试稀有度颜色 ---');
    
    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    rarities.forEach(rarity => {
      const color = this.bagRegistry.getRarityColor(rarity);
      console.log(`${rarity}: ${color}`);
    });
  }

  /**
   * 测试从动作获取物品
   */
  private testItemsFromAction(): void {
    console.log('\n--- 测试从动作获取物品 ---');
    
    const itemsFromRummage = this.bagRegistry.getItemsFromAction('rummage');
    console.log(`从翻找动作可能获得的物品: ${itemsFromRummage.length}`);
    itemsFromRummage.forEach(item => {
      console.log(`  - ${item.name} (${item.rarity})`);
    });
  }

  /**
   * 测试场景可用物品
   */
  private testUsableItemsInRoom(): void {
    console.log('\n--- 测试场景可用物品 ---');
    
    const usableInLivingRoom = this.bagRegistry.getUsableItemsInRoom('living_room_east');
    console.log(`在客厅可使用的物品: ${usableInLivingRoom.length}`);
    usableInLivingRoom.forEach(item => {
      console.log(`  - ${item.name} (${item.type})`);
    });
  }
}

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  // 在浏览器环境中
  (window as any).runBagSystemTest = () => {
    const test = new BagSystemTest();
    test.runAllTests();
  };
  
  console.log('背包系统测试已加载，运行 window.runBagSystemTest() 来执行测试');
} 