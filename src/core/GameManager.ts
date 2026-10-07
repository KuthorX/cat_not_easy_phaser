import { GameState } from '../types/GameState';
import { GameConstants } from '../config/GameConstants';
import { EventEmitter } from '../utils/EventEmitter';
import { GameEvents } from '../constants/GameEvents';
import { EventManager } from './EventManager';
import { DialogueManager } from './DialogueManager';
import { AchievementRegistry } from '../data/AchievementRegistry';
import { ENDING_ACHIEVEMENT_IDS, OWNER_RETURNED_FLAG, pickDayEndEnding } from '../logic/achievements';

export class GameManager {
  private game: Phaser.Game;
  private state: GameState;
  private eventEmitter: EventEmitter;
  private eventManager: EventManager;
  private dialogueManager: DialogueManager;
  private isInDialogue: boolean = false; // 全局对话状态
  private achievementRegistry: AchievementRegistry = new AchievementRegistry();

  constructor(game: Phaser.Game) {
    this.game = game;
    this.state = this.initializeGameState();
    this.eventEmitter = new EventEmitter();
    this.eventManager = new EventManager();
    this.dialogueManager = new DialogueManager();
    
    // 设置对话结束回调
    this.dialogueManager.setOnDialogueEndCallback(() => {
      this.endDialogue();
    });
    
    // 设置对话效果回调
    this.dialogueManager.setEffectCallback((effects) => {
      this.applyDialogueEffects(effects);
    });
    
    // 设置事件监听
    this.setupEventListeners();
  }

  private initializeGameState(): GameState {
    return {
      currentTime: GameConstants.GAME_START_TIME,
      energy: GameConstants.INITIAL_ENERGY,
      hunger: GameConstants.INITIAL_ENERGY, // 使用相同的初始值
      inventory: [],
      achievements: [],
      visitedRooms: new Set(),
      completedActions: new Set(),
      destroyedItems: new Set(),
      storyFlags: new Map(),
      currentRoom: 'living_room_north',
      gameEnded: false,
      endingType: null,
      currentDialogue: undefined,
      dialogueHistory: [],
      battleState: {
        isActive: false,
        enemyId: '',
        enemyName: '',
        enemyImage: '',
        playerImage: '',
        selectedAction: null,
        result: null,
        returnScene: '',
        returnObjectId: ''
      }
    };
  }

  private setupEventListeners(): void {
    // 监听事件触发
    this.eventManager.onEventTriggered((data) => {
      console.log(`事件触发: ${data.event.name} - ${data.event.description}`);
      
      // 更新游戏状态
      this.state = data.gameState;
      
      // 发出事件通知
      this.eventEmitter.emit(GameEvents.EVENT_TRIGGERED, data);
    });
  }

  // 获取当前游戏时间（小时）
  public getCurrentTime(): number {
    return this.state.currentTime;
  }

  // 获取格式化的时间字符串
  public getFormattedTime(): string {
    const hours = Math.floor(this.state.currentTime);
    const minutes = Math.floor((this.state.currentTime - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // 推进游戏时间
  public advanceTime(minutes: number): void {
    if (this.state.gameEnded || minutes <= 0) return;

    const previousTime = this.state.currentTime;
    const newTime = Math.min(previousTime + minutes / 60, GameConstants.GAME_END_TIME);

    this.state.currentTime = newTime;
    this.eventEmitter.emit(GameEvents.TIME_CHANGED, { time: this.state.currentTime });

    if (newTime >= GameConstants.GAME_END_TIME) {
      this.endDay();
      return;
    }

    // 检查特殊事件（只在跨过整点时触发一次）
    this.checkSpecialEvents(previousTime, newTime);
  }

  // 时间耗尽：两脚兽回家，根据今天的表现决定结局
  private endDay(): void {
    this.state.storyFlags.set(OWNER_RETURNED_FLAG, true);
    const ending = pickDayEndEnding(this.achievementRegistry.getAllAchievements(), this.state);
    this.unlockAchievement(ending);
    this.endGame(ending, 'time_up');
  }

  private checkSpecialEvents(previousTime: number, newTime: number): void {
    const crossed = (hour: number) => previousTime < hour && newTime >= hour;

    if (crossed(GameConstants.SPECIAL_EVENTS.OWNER_RETURN)) {
      this.eventEmitter.emit(GameEvents.OWNER_RETURN);
    }

    if (crossed(GameConstants.SPECIAL_EVENTS.NEIGHBOR_CAT_FIGHT)) {
      this.eventEmitter.emit(GameEvents.NEIGHBOR_CAT_FIGHT);
    }
  }

  // 检查成就；结局类成就达成时当天结束
  private checkAchievements(): void {
    if (this.state.gameEnded) return;
    const unlockable = this.achievementRegistry.getUnlockableAchievements(this.state);
    unlockable.forEach(achievement => this.unlockAchievement(achievement.id));
    const ending = unlockable.find(a => (ENDING_ACHIEVEMENT_IDS as readonly string[]).includes(a.id));
    if (ending) {
      this.endGame(ending.id, 'achievement');
    }
  }

  // 物品管理
  public addToInventory(item: string): void {
    if (!this.state.inventory.includes(item)) {
      this.state.inventory.push(item);
      this.eventEmitter.emit(GameEvents.INVENTORY_CHANGED, { inventory: this.state.inventory });
      this.checkAchievements();
    }
  }

  public removeFromInventory(item: string): boolean {
    const index = this.state.inventory.indexOf(item);
    if (index > -1) {
      this.state.inventory.splice(index, 1);
      this.eventEmitter.emit(GameEvents.INVENTORY_CHANGED, { inventory: this.state.inventory });
      return true;
    }
    return false;
  }

  // 成就系统
  public unlockAchievement(achievement: string): void {
    if (!this.state.achievements.includes(achievement)) {
      this.state.achievements.push(achievement);
      this.eventEmitter.emit(GameEvents.ACHIEVEMENT_UNLOCKED, { achievement });
    }
  }

  // 房间访问
  public visitRoom(room: string): void {
    this.state.visitedRooms.add(room);
    this.state.currentRoom = room;
    this.eventEmitter.emit(GameEvents.ROOM_VISITED, { room });
    
    // 检查房间访问事件
    this.eventManager.checkEvents(this.state, 'room_visit', room);
    this.checkAchievements();
  }

  // 动作完成
  public completeAction(action: string): void {
    this.state.completedActions.add(action);
    this.eventEmitter.emit(GameEvents.ACTION_COMPLETED, { action });
    
    // 检查动作完成事件
    this.eventManager.checkEvents(this.state, 'action', action);
    this.checkAchievements();
  }

  // 物品破坏
  public destroyItem(item: string): void {
    this.state.destroyedItems.add(item);
    this.eventEmitter.emit(GameEvents.ITEM_DESTROYED, { item });
  }

  // 故事标记
  public setStoryFlag(flag: string, value: any): void {
    this.state.storyFlags.set(flag, value);
    this.eventEmitter.emit(GameEvents.STORY_FLAG_SET, { flag, value });
    this.checkAchievements();
  }

  public getStoryFlag(flag: string): any {
    return this.state.storyFlags.get(flag);
  }

  // 游戏结束
  public endGame(endingType: string, reason: 'achievement' | 'time_up' = 'achievement'): void {
    if (this.state.gameEnded) return;
    this.state.gameEnded = true;
    this.state.endingType = endingType;
    this.eventEmitter.emit(GameEvents.GAME_ENDED, { endingType, reason });
  }

  // 清理资源
  public cleanup(): void {
    // 清理事件监听器
    this.eventEmitter.removeAllListeners();
  }

  // 获取状态
  public getState(): GameState {
    return { ...this.state };
  }

  public getEnergy(): number {
    return this.state.energy;
  }

  public getInventory(): string[] {
    return [...this.state.inventory];
  }

  public getAchievements(): string[] {
    return [...this.state.achievements];
  }

  public getCurrentRoom(): string {
    return this.state.currentRoom;
  }

  public isGameEnded(): boolean {
    return this.state.gameEnded;
  }

  // 事件监听
  public on(event: string, callback: (...args: any[]) => void): void {
    this.eventEmitter.on(event, callback);
  }

  public off(event: string, callback: (...args: any[]) => void): void {
    this.eventEmitter.off(event, callback);
  }

  // 获取事件管理器
  public getEventManager(): EventManager {
    return this.eventManager;
  }

  // 重置游戏
  public resetGame(): void {
    this.state = this.initializeGameState();
    this.isInDialogue = false;
    this.eventManager.resetTriggeredEvents();
    this.eventEmitter.emit(GameEvents.GAME_RESET);
  }

  // 对话系统
  public getDialogueManager(): DialogueManager {
    return this.dialogueManager;
  }

  public startDialogue(dialogueId: string, objectId: string, objectName: string, objectPosition: { x: number; y: number }): boolean {
    console.log('GameManager.startDialogue 被调用:', { dialogueId, objectId, objectName, objectPosition });
    
    // 如果已经在对话中，拒绝新的对话
    if (this.isInDialogue) {
      console.log('已在对话中，拒绝新对话');
      return false;
    }
    
    const success = this.dialogueManager.startDialogue(dialogueId, objectId, objectName, objectPosition);
    console.log('dialogueManager.startDialogue 结果:', success);
    if (success) {
      this.state.currentDialogue = this.dialogueManager.getCurrentDialogueState() || undefined;
      this.setDialogueMode(true); // 设置对话状态
      console.log('触发 DIALOGUE_STARTED 事件');
      this.eventEmitter.emit(GameEvents.DIALOGUE_STARTED, { dialogueId, objectId });
    }
    return success;
  }

  public endDialogue(): void {
    console.log('GameManager.endDialogue 被调用');
    this.dialogueManager.endDialogue();
    this.state.currentDialogue = undefined;
    this.setDialogueMode(false); // 清除对话状态
    console.log('触发 DIALOGUE_ENDED 事件');
    this.eventEmitter.emit(GameEvents.DIALOGUE_ENDED, {});
  }

  public getCurrentDialogueState(): any {
    return this.dialogueManager.getCurrentDialogueState();
  }

  // 应用对话效果
  public applyDialogueEffects(effects: any[]): void {
    effects.forEach(effect => {
      switch (effect.type) {
        case 'energy':
          if (effect.operation === 'add') {
            this.modifyEnergy(effect.value);
          } else if (effect.operation === 'remove') {
            this.modifyEnergy(-effect.value);
          }
          break;
        case 'inventory':
          if (effect.operation === 'add') {
            this.addToInventory(effect.value);
          } else if (effect.operation === 'remove') {
            this.removeFromInventory(effect.value);
          }
          break;
        case 'story_flag':
          if (effect.operation === 'set') {
            this.setStoryFlag(effect.value, true);
          }
          break;
        case 'achievement':
          if (effect.operation === 'add') {
            this.unlockAchievement(effect.value);
          }
          break;
      }
    });
  }

  // 检查是否正在对话中
  public isInDialogueMode(): boolean {
    return this.isInDialogue;
  }

  // 设置对话状态
  public setDialogueMode(inDialogue: boolean): void {
    this.isInDialogue = inDialogue;
    console.log('对话状态变更:', inDialogue ? '进入对话模式' : '退出对话模式');
  }

  // 状态管理
  public modifyEnergy(delta: number): boolean {
    const newEnergy = Math.max(0, Math.min(GameConstants.MAX_ENERGY, this.state.energy + delta));
    const changed = newEnergy !== this.state.energy;
    
    if (changed) {
      this.state.energy = newEnergy;
      this.eventEmitter.emit(GameEvents.ENERGY_CHANGED, { energy: this.state.energy });
    }
    
    return changed;
  }
} 