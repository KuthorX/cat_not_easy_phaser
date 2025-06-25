import { GameState } from '../types/GameState';
import { GameEvents } from '../constants/GameEvents';

export class SaveManager {
  private game: Phaser.Game;
  private saveKey: string = 'cat_game_save';

  constructor(game: Phaser.Game) {
    this.game = game;
  }

  // 保存游戏
  public saveGame(gameState: GameState): boolean {
    try {
      const saveData = this.serializeGameState(gameState);
      localStorage.setItem(this.saveKey, saveData);
      return true;
    } catch (error) {
      console.error('保存游戏失败:', error);
      return false;
    }
  }

  // 加载游戏
  public loadGame(): GameState | null {
    try {
      const saveData = localStorage.getItem(this.saveKey);
      if (!saveData) {
        return null;
      }
      
      return this.deserializeGameState(saveData);
    } catch (error) {
      console.error('加载游戏失败:', error);
      return null;
    }
  }

  // 检查是否有存档
  public hasSaveGame(): boolean {
    return localStorage.getItem(this.saveKey) !== null;
  }

  // 删除存档
  public deleteSaveGame(): boolean {
    try {
      localStorage.removeItem(this.saveKey);
      return true;
    } catch (error) {
      console.error('删除存档失败:', error);
      return false;
    }
  }

  // 序列化游戏状态
  private serializeGameState(gameState: GameState): string {
    const serializedState = {
      currentTime: gameState.currentTime,
      hunger: gameState.hunger,
      energy: gameState.energy,
      inventory: gameState.inventory,
      achievements: gameState.achievements,
      visitedRooms: Array.from(gameState.visitedRooms),
      completedActions: Array.from(gameState.completedActions),
      destroyedItems: Array.from(gameState.destroyedItems),
      storyFlags: Array.from(gameState.storyFlags.entries()),
      currentRoom: gameState.currentRoom,
      gameEnded: gameState.gameEnded,
      endingType: gameState.endingType,
      saveTime: new Date().toISOString()
    };

    return JSON.stringify(serializedState);
  }

  // 反序列化游戏状态
  private deserializeGameState(saveData: string): GameState {
    const data = JSON.parse(saveData);
    
    return {
      currentTime: data.currentTime,
      hunger: data.hunger,
      energy: data.energy,
      inventory: data.inventory,
      achievements: data.achievements,
      visitedRooms: new Set(data.visitedRooms),
      completedActions: new Set(data.completedActions),
      destroyedItems: new Set(data.destroyedItems),
      storyFlags: new Map(data.storyFlags),
      currentRoom: data.currentRoom,
      gameEnded: data.gameEnded,
      endingType: data.endingType
    };
  }

  // 获取存档信息
  public getSaveInfo(): { saveTime: string; currentTime: number; currentRoom: string } | null {
    try {
      const saveData = localStorage.getItem(this.saveKey);
      if (!saveData) {
        return null;
      }
      
      const data = JSON.parse(saveData);
      return {
        saveTime: data.saveTime,
        currentTime: data.currentTime,
        currentRoom: data.currentRoom
      };
    } catch (error) {
      console.error('获取存档信息失败:', error);
      return null;
    }
  }

  // 自动保存
  public autoSave(gameState: GameState): void {
    // 每5分钟自动保存一次
    const autoSaveKey = 'cat_game_autosave';
    const lastAutoSave = localStorage.getItem(autoSaveKey);
    const now = Date.now();
    
    if (!lastAutoSave || (now - parseInt(lastAutoSave)) > 5 * 60 * 1000) {
      this.saveGame(gameState);
      localStorage.setItem(autoSaveKey, now.toString());
    }
  }

  // 导出存档
  public exportSaveGame(): string | null {
    try {
      const saveData = localStorage.getItem(this.saveKey);
      if (!saveData) {
        return null;
      }
      
      const data = JSON.parse(saveData);
      data.exportTime = new Date().toISOString();
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('导出存档失败:', error);
      return null;
    }
  }

  // 导入存档
  public importSaveGame(importData: string): boolean {
    try {
      const data = JSON.parse(importData);
      
      // 验证存档数据格式
      if (!this.validateSaveData(data)) {
        throw new Error('存档数据格式无效');
      }
      
      // 移除导入时间戳
      delete data.exportTime;
      
      localStorage.setItem(this.saveKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('导入存档失败:', error);
      return false;
    }
  }

  // 验证存档数据
  private validateSaveData(data: any): boolean {
    const requiredFields = [
      'currentTime', 'hunger', 'energy', 'inventory', 
      'achievements', 'visitedRooms', 'completedActions',
      'destroyedItems', 'storyFlags', 'currentRoom'
    ];
    
    return requiredFields.every(field => data.hasOwnProperty(field));
  }

  // 获取存档大小
  public getSaveSize(): number {
    try {
      const saveData = localStorage.getItem(this.saveKey);
      return saveData ? new Blob([saveData]).size : 0;
    } catch (error) {
      return 0;
    }
  }

  // 清理过期存档
  public cleanupOldSaves(): void {
    try {
      const saveData = localStorage.getItem(this.saveKey);
      if (!saveData) {
        return;
      }
      
      const data = JSON.parse(saveData);
      const saveTime = new Date(data.saveTime);
      const now = new Date();
      const daysDiff = (now.getTime() - saveTime.getTime()) / (1000 * 60 * 60 * 24);
      
      // 删除超过30天的存档
      if (daysDiff > 30) {
        this.deleteSaveGame();
      }
    } catch (error) {
      console.error('清理过期存档失败:', error);
    }
  }
} 