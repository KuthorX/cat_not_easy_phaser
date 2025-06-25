import { GameState } from '../types/GameState';
import { EventEmitter } from '../utils/EventEmitter';
import { GameEvents } from '../constants/GameEvents';

export interface GameStatistics {
  totalPlayTime: number;
  roomsVisited: number;
  actionsCompleted: number;
  achievementsUnlocked: number;
  itemsDestroyed: number;
  storyFlagsSet: number;
  escapeAttempts: number;
  successfulEscapes: number;
  favoriteRoom: string;
  mostUsedAction: string;
  gameEndings: Map<string, number>;
}

export class StatisticsManager {
  private statistics: GameStatistics;
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.statistics = this.initializeStatistics();
  }

  private initializeStatistics(): GameStatistics {
    return {
      totalPlayTime: 0,
      roomsVisited: 0,
      actionsCompleted: 0,
      achievementsUnlocked: 0,
      itemsDestroyed: 0,
      storyFlagsSet: 0,
      escapeAttempts: 0,
      successfulEscapes: 0,
      favoriteRoom: '',
      mostUsedAction: '',
      gameEndings: new Map()
    };
  }

  public updateFromGameState(gameState: GameState): void {
    this.statistics.roomsVisited = gameState.visitedRooms.size;
    this.statistics.actionsCompleted = gameState.completedActions.size;
    this.statistics.achievementsUnlocked = gameState.achievements.length;
    this.statistics.itemsDestroyed = gameState.destroyedItems.size;
    this.statistics.storyFlagsSet = gameState.storyFlags.size;

    // 更新游戏时间
    this.statistics.totalPlayTime = gameState.currentTime;

    // 检查是否尝试逃跑
    if (gameState.storyFlags.get('door_opened')) {
      this.statistics.escapeAttempts = 1;
    }

    if (gameState.storyFlags.get('escaped')) {
      this.statistics.successfulEscapes = 1;
    }

    // 记录游戏结局
    if (gameState.endingType) {
      const currentCount = this.statistics.gameEndings.get(gameState.endingType) || 0;
      this.statistics.gameEndings.set(gameState.endingType, currentCount + 1);
    }

    this.eventEmitter.emit(GameEvents.STATISTICS_UPDATED, this.statistics);
  }

  public getStatistics(): GameStatistics {
    return { ...this.statistics };
  }

  public getCompletionPercentage(): number {
    const totalAchievements = 8; // 总成就数
    const totalRooms = 11; // 总房间数
    const totalActions = 17; // 总动作数

    const achievementProgress = this.statistics.achievementsUnlocked / totalAchievements;
    const roomProgress = this.statistics.roomsVisited / totalRooms;
    const actionProgress = this.statistics.actionsCompleted / totalActions;

    return Math.round((achievementProgress + roomProgress + actionProgress) / 3 * 100);
  }

  public getGameSummary(): string {
    const completion = this.getCompletionPercentage();
    const playTime = Math.floor(this.statistics.totalPlayTime);
    
    return `游戏完成度: ${completion}%\n` +
           `游戏时间: ${playTime}小时\n` +
           `访问房间: ${this.statistics.roomsVisited}/11\n` +
           `完成动作: ${this.statistics.actionsCompleted}/17\n` +
           `获得成就: ${this.statistics.achievementsUnlocked}/8\n` +
           `破坏物品: ${this.statistics.itemsDestroyed}个\n` +
           `逃跑尝试: ${this.statistics.escapeAttempts}次\n` +
           `成功逃跑: ${this.statistics.successfulEscapes}次`;
  }

  public resetStatistics(): void {
    this.statistics = this.initializeStatistics();
    this.eventEmitter.emit(GameEvents.STATISTICS_RESET);
  }

  public onStatisticsUpdated(callback: (stats: GameStatistics) => void): void {
    this.eventEmitter.on(GameEvents.STATISTICS_UPDATED, callback);
  }

  public onStatisticsReset(callback: () => void): void {
    this.eventEmitter.on(GameEvents.STATISTICS_RESET, callback);
  }
} 