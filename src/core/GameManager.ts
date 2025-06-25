import { GameState } from '../types/GameState';
import { GameConstants } from '../config/GameConfig';
import { EventEmitter } from '../utils/EventEmitter';
import { GameEvents } from '../constants/GameEvents';
import { EventManager } from './EventManager';

export class GameManager {
  private game: Phaser.Game;
  private state: GameState;
  private eventEmitter: EventEmitter;
  private eventManager: EventManager;
  private timeInterval: NodeJS.Timeout | null = null;

  constructor(game: Phaser.Game) {
    this.game = game;
    this.eventEmitter = new EventEmitter();
    this.eventManager = new EventManager();
    this.state = this.initializeGameState();
    
    // 设置事件监听
    this.setupEventListeners();
  }

  private initializeGameState(): GameState {
    return {
      currentTime: GameConstants.GAME_START_TIME,
      hunger: GameConstants.INITIAL_HUNGER,
      energy: GameConstants.INITIAL_ENERGY,
      inventory: [],
      achievements: [],
      visitedRooms: new Set(),
      completedActions: new Set(),
      destroyedItems: new Set(),
      storyFlags: new Map(),
      currentRoom: 'living_room_north',
      gameEnded: false,
      endingType: null
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

  // 时间管理
  public advanceTime(minutes: number): boolean {
    const newTime = this.state.currentTime + (minutes / 60);
    
    if (newTime >= GameConstants.GAME_END_TIME) {
      this.endGame('time_up');
      return false;
    }

    this.state.currentTime = newTime;
    this.eventEmitter.emit(GameEvents.TIME_CHANGED, { time: this.state.currentTime });
    
    // 检查特殊事件
    this.checkSpecialEvents();
    
    // 检查随机事件
    this.checkRandomEvents();
    
    return true;
  }

  private checkSpecialEvents(): void {
    const hour = Math.floor(this.state.currentTime);
    
    if (hour === GameConstants.SPECIAL_EVENTS.OWNER_RETURN) {
      this.eventEmitter.emit(GameEvents.OWNER_RETURN);
    }
    
    if (hour === GameConstants.SPECIAL_EVENTS.NEIGHBOR_CAT_FIGHT) {
      this.eventEmitter.emit(GameEvents.NEIGHBOR_CAT_FIGHT);
    }
  }

  private checkRandomEvents(): void {
    // 随机触发事件（10%概率）
    if (Math.random() < 0.1) {
      this.eventManager.checkEvents(this.state, 'time', 'random');
    }
  }

  // 状态管理
  public modifyHunger(delta: number): boolean {
    const newHunger = Math.max(0, Math.min(GameConstants.MAX_HUNGER, this.state.hunger + delta));
    const changed = newHunger !== this.state.hunger;
    
    if (changed) {
      this.state.hunger = newHunger;
      this.eventEmitter.emit(GameEvents.HUNGER_CHANGED, { hunger: this.state.hunger });
    }
    
    return changed;
  }

  public modifyEnergy(delta: number): boolean {
    const newEnergy = Math.max(0, Math.min(GameConstants.MAX_ENERGY, this.state.energy + delta));
    const changed = newEnergy !== this.state.energy;
    
    if (changed) {
      this.state.energy = newEnergy;
      this.eventEmitter.emit(GameEvents.ENERGY_CHANGED, { energy: this.state.energy });
    }
    
    return changed;
  }

  // 物品管理
  public addToInventory(item: string): void {
    if (!this.state.inventory.includes(item)) {
      this.state.inventory.push(item);
      this.eventEmitter.emit(GameEvents.INVENTORY_CHANGED, { inventory: this.state.inventory });
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
  }

  // 动作完成
  public completeAction(action: string): void {
    this.state.completedActions.add(action);
    this.eventEmitter.emit(GameEvents.ACTION_COMPLETED, { action });
    
    // 检查动作完成事件
    this.eventManager.checkEvents(this.state, 'action', action);
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
  }

  public getStoryFlag(flag: string): any {
    return this.state.storyFlags.get(flag);
  }

  // 游戏结束
  public endGame(endingType: string): void {
    this.state.gameEnded = true;
    this.state.endingType = endingType;
    this.eventEmitter.emit(GameEvents.GAME_ENDED, { endingType });
  }

  // 获取状态
  public getState(): GameState {
    return { ...this.state };
  }

  public getCurrentTime(): number {
    return this.state.currentTime;
  }

  public getHunger(): number {
    return this.state.hunger;
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
    this.eventManager.resetTriggeredEvents();
    this.eventEmitter.emit(GameEvents.GAME_RESET);
  }
} 