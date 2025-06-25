import { SceneKeys, RoomKeys } from '../constants/SceneKeys';
import { RoomData } from '../types/GameState';
import { RoomRegistry } from '../data/RoomRegistry';
import { ActionRegistry } from '../data/ActionRegistry';

export class SceneManager {
  private game: Phaser.Game;
  private currentScene: Phaser.Scene | null = null;
  private roomRegistry: RoomRegistry;
  private actionRegistry: ActionRegistry;
  private startedScenes: Set<string> = new Set(); // 记录已启动的场景

  constructor(game: Phaser.Game) {
    this.game = game;
    this.roomRegistry = new RoomRegistry();
    this.actionRegistry = new ActionRegistry();
  }

  // 注册场景
  public registerScene(sceneKey: string, sceneClass: any): void {
    this.game.scene.add(sceneKey, sceneClass, false);
  }

  // 启动或切换场景（自动 stop 当前场景）
  public startScene(sceneKey: string, data?: any): void {
    console.log('SceneManager.startScene 被调用，场景键:', sceneKey);
    // 1. stop 当前场景（如果有且不是目标场景）
    if (this.currentScene && this.currentScene.scene.key !== sceneKey) {
      console.log('停止当前场景:', this.currentScene.scene.key);
      this.game.scene.stop(this.currentScene.scene.key);
    }
    // 2. 启动或切换目标场景
    if (this.startedScenes.has(sceneKey)) {
      console.log('场景已启动过，使用 switch:', sceneKey);
      this.game.scene.switch(this.currentScene?.scene.key || '', sceneKey, data);
    } else {
      console.log('场景未启动过，使用 start:', sceneKey);
      this.game.scene.start(sceneKey, data);
      this.startedScenes.add(sceneKey);
    }
  }

  // 切换到房间
  public switchToRoom(roomKey: string, data?: any): void {
    console.log('SceneManager.switchToRoom 被调用，房间键:', roomKey);
    const sceneKey = this.getSceneKeyForRoom(roomKey);
    console.log('对应的场景键:', sceneKey);
    if (sceneKey) {
      console.log('启动场景:', sceneKey);
      this.startScene(sceneKey, { roomKey, ...data });
    } else {
      console.error('无法找到房间对应的场景键:', roomKey);
    }
  }

  // 获取房间对应的场景键
  private getSceneKeyForRoom(roomKey: string): string | null {
    const roomToSceneMap: Record<string, string> = {
      [RoomKeys.LIVING_ROOM_NORTH]: SceneKeys.LIVING_ROOM_NORTH,
      [RoomKeys.LIVING_ROOM_EAST]: SceneKeys.LIVING_ROOM_EAST,
      [RoomKeys.LIVING_ROOM_WEST_LOW]: SceneKeys.LIVING_ROOM_WEST_LOW,
      [RoomKeys.LIVING_ROOM_WEST_HIGH]: SceneKeys.LIVING_ROOM_WEST_HIGH,
      [RoomKeys.LIVING_ROOM_DOOR]: SceneKeys.LIVING_ROOM_DOOR,
      [RoomKeys.HALLWAY]: SceneKeys.HALLWAY,
      [RoomKeys.BALCONY]: SceneKeys.BALCONY,
      [RoomKeys.ROOM_A]: SceneKeys.ROOM_A,
      [RoomKeys.ROOM_B]: SceneKeys.ROOM_B,
      [RoomKeys.ROOM_C]: SceneKeys.ROOM_C,
      [RoomKeys.DOORWAY]: SceneKeys.DOORWAY
    };
    
    return roomToSceneMap[roomKey] || null;
  }

  // 获取房间数据
  public getRoomData(roomKey: string): RoomData | null {
    return this.roomRegistry.getRoom(roomKey);
  }

  // 获取动作数据
  public getAction(actionId: string): any {
    return this.actionRegistry.getAction(actionId);
  }

  // 获取所有可用动作
  public getAvailableActions(roomKey: string): any[] {
    const room = this.getRoomData(roomKey);
    if (!room) return [];

    return room.interactiveObjects.flatMap(obj => 
      obj.actions.map(actionId => this.actionRegistry.getAction(actionId))
    ).filter(Boolean);
  }

  // 暂停当前场景
  public pauseCurrentScene(): void {
    if (this.currentScene) {
      this.currentScene.scene.pause();
    }
  }

  // 恢复当前场景
  public resumeCurrentScene(): void {
    if (this.currentScene) {
      this.currentScene.scene.resume();
    }
  }

  // 设置当前场景
  public setCurrentScene(scene: Phaser.Scene): void {
    this.currentScene = scene;
  }

  // 获取当前场景
  public getCurrentScene(): Phaser.Scene | null {
    return this.currentScene;
  }

  // 检查房间是否可访问
  public canAccessRoom(roomKey: string, gameState: any): boolean {
    const room = this.getRoomData(roomKey);
    if (!room || !room.requirements) return true;

    return room.requirements.every(req => {
      switch (req.type) {
        case 'story_flag':
          return this.checkRequirement(gameState.storyFlags.get(req.value), req.operator, req.value);
        case 'inventory':
          return this.checkRequirement(gameState.inventory.includes(req.value), req.operator, true);
        case 'achievement':
          return this.checkRequirement(gameState.achievements.includes(req.value), req.operator, true);
        case 'action_completed':
          return this.checkRequirement(gameState.completedActions.has(req.value), req.operator, true);
        default:
          return true;
      }
    });
  }

  private checkRequirement(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
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

  // 判断某个动作是否可执行
  public canExecuteAction(actionId: string, gameState: any): boolean {
    return this.actionRegistry.canExecuteAction(actionId, gameState);
  }
} 