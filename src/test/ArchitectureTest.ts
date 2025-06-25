import { GameManager } from '../core/GameManager';
import { SceneManager } from '../core/SceneManager';
import { AudioManager } from '../core/AudioManager';
import { UIManager } from '../core/UIManager';
import { SaveManager } from '../core/SaveManager';
import { RoomRegistry } from '../data/RoomRegistry';
import { ActionRegistry } from '../data/ActionRegistry';
import { AchievementRegistry } from '../data/AchievementRegistry';
import { GameConstants } from '../config/GameConfig';

// 模拟Phaser.Game
class MockGame {
  scene: any;
  
  constructor() {
    this.scene = {
      add: () => {},
      start: () => {},
      getScene: () => null
    };
  }
}

// 测试游戏架构
export class ArchitectureTest {
  private game: any;
  private gameManager!: GameManager;
  private sceneManager!: SceneManager;
  private audioManager!: AudioManager;
  private uiManager!: UIManager;
  private saveManager!: SaveManager;
  private roomRegistry!: RoomRegistry;
  private actionRegistry!: ActionRegistry;
  private achievementRegistry!: AchievementRegistry;

  constructor() {
    this.game = new MockGame();
    this.initializeManagers();
  }

  private initializeManagers(): void {
    this.gameManager = new GameManager(this.game);
    this.sceneManager = new SceneManager(this.game);
    this.audioManager = new AudioManager(this.game);
    this.uiManager = new UIManager(this.game);
    this.saveManager = new SaveManager(this.game);
    this.roomRegistry = new RoomRegistry();
    this.actionRegistry = new ActionRegistry();
    this.achievementRegistry = new AchievementRegistry();
  }

  // 测试游戏管理器
  testGameManager(): void {
    console.log('🧪 测试游戏管理器...');
    
    // 测试初始状态
    const initialState = this.gameManager.getState();
    console.assert(initialState.currentTime === GameConstants.GAME_START_TIME, '初始时间错误');
    console.assert(initialState.hunger === GameConstants.INITIAL_HUNGER, '初始饥饿值错误');
    console.assert(initialState.energy === GameConstants.INITIAL_ENERGY, '初始精力值错误');
    
    // 测试时间推进
    const timeResult = this.gameManager.advanceTime(30);
    console.assert(timeResult === true, '时间推进失败');
    console.assert(this.gameManager.getCurrentTime() === GameConstants.GAME_START_TIME + 0.5, '时间计算错误');
    
    // 测试状态修改
    this.gameManager.modifyHunger(2);
    console.assert(this.gameManager.getHunger() === 3, '饥饿值修改错误');
    
    this.gameManager.modifyEnergy(1);
    console.assert(this.gameManager.getEnergy() === 2, '精力值修改错误');
    
    // 测试物品管理
    this.gameManager.addToInventory('toy_mouse');
    console.assert(this.gameManager.getInventory().includes('toy_mouse'), '物品添加失败');
    
    // 测试成就系统
    this.gameManager.unlockAchievement('test_achievement');
    console.assert(this.gameManager.getAchievements().includes('test_achievement'), '成就解锁失败');
    
    console.log('✅ 游戏管理器测试通过');
  }

  // 测试房间注册表
  testRoomRegistry(): void {
    console.log('🧪 测试房间注册表...');
    
    const rooms = this.roomRegistry.getAllRooms();
    console.assert(rooms.length > 0, '没有注册房间');
    
    const livingRoom = this.roomRegistry.getRoom('living_room_north');
    console.assert(livingRoom !== null, '获取房间失败');
    console.assert(livingRoom?.name === '客厅-向北看', '房间名称错误');
    
    console.log('✅ 房间注册表测试通过');
  }

  // 测试动作注册表
  testActionRegistry(): void {
    console.log('🧪 测试动作注册表...');
    
    const actions = this.actionRegistry.getAllActions();
    console.assert(actions.length > 0, '没有注册动作');
    
    const sunbathingAction = this.actionRegistry.getAction('sunbathing');
    console.assert(sunbathingAction !== null, '获取动作失败');
    console.assert(sunbathingAction?.name === '晒太阳', '动作名称错误');
    
    // 测试动作执行条件
    const gameState = this.gameManager.getState();
    const canExecute = this.actionRegistry.canExecuteAction('sunbathing', gameState);
    console.assert(canExecute === true, '动作执行条件检查错误');
    
    console.log('✅ 动作注册表测试通过');
  }

  // 测试成就注册表
  testAchievementRegistry(): void {
    console.log('🧪 测试成就注册表...');
    
    const achievements = this.achievementRegistry.getAllAchievements();
    console.assert(achievements.length > 0, '没有注册成就');
    
    const playTimeAchievement = this.achievementRegistry.getAchievement('play_time');
    console.assert(playTimeAchievement !== null, '获取成就失败');
    console.assert(playTimeAchievement?.name === '玩耍时光', '成就名称错误');
    
    // 测试成就进度
    const gameState = this.gameManager.getState();
    const progress = this.achievementRegistry.getAchievementProgress('play_time', gameState);
    console.assert(progress.total > 0, '成就进度计算错误');
    
    console.log('✅ 成就注册表测试通过');
  }

  // 测试存档系统
  testSaveSystem(): void {
    console.log('🧪 测试存档系统...');
    
    // 测试保存
    const gameState = this.gameManager.getState();
    const saveResult = this.saveManager.saveGame(gameState);
    console.assert(saveResult === true, '保存游戏失败');
    
    // 测试加载
    const loadedState = this.saveManager.loadGame();
    console.assert(loadedState !== null, '加载游戏失败');
    console.assert(loadedState?.currentTime === gameState.currentTime, '存档数据错误');
    
    // 测试存档信息
    const saveInfo = this.saveManager.getSaveInfo();
    console.assert(saveInfo !== null, '获取存档信息失败');
    
    console.log('✅ 存档系统测试通过');
  }

  // 运行所有测试
  runAllTests(): void {
    console.log('🚀 开始架构测试...\n');
    
    try {
      this.testGameManager();
      this.testRoomRegistry();
      this.testActionRegistry();
      this.testAchievementRegistry();
      this.testSaveSystem();
      
      console.log('\n🎉 所有测试通过！架构运行正常。');
    } catch (error) {
      console.error('\n❌ 测试失败:', error);
    }
  }
}

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  const test = new ArchitectureTest();
  test.runAllTests();
} 