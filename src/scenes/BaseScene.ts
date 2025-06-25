import { SceneKeys } from '../constants/SceneKeys';
import { GameEvents } from '../constants/GameEvents';

export abstract class BaseScene extends Phaser.Scene {
  protected gameManager: any;
  protected sceneManager: any;
  protected audioManager: any;
  protected uiManager: any;
  protected saveManager: any;

  constructor(key: string) {
    super(key);
  }

  create(): void {
    // 获取全局游戏实例和管理器
    const game = (window as any).game;
    if (game) {
      this.gameManager = game.gameManager;
      this.sceneManager = game.sceneManager;
      this.audioManager = game.audioManager;
      this.uiManager = game.uiManager;
      this.saveManager = game.saveManager;
    }

    // 设置当前场景
    if (this.sceneManager) {
      this.sceneManager.setCurrentScene(this);
    }

    // 初始化场景
    this.initializeScene();
    
    // 设置事件监听
    this.setupEventListeners();
  }

  protected abstract initializeScene(): void;

  protected setupEventListeners(): void {
    // 监听游戏状态变化
    if (this.gameManager) {
      this.gameManager.on(GameEvents.TIME_CHANGED, this.onTimeChanged.bind(this));
      this.gameManager.on(GameEvents.HUNGER_CHANGED, this.onHungerChanged.bind(this));
      this.gameManager.on(GameEvents.ENERGY_CHANGED, this.onEnergyChanged.bind(this));
      this.gameManager.on(GameEvents.INVENTORY_CHANGED, this.onInventoryChanged.bind(this));
      this.gameManager.on(GameEvents.ACHIEVEMENT_UNLOCKED, this.onAchievementUnlocked.bind(this));
      this.gameManager.on(GameEvents.GAME_ENDED, this.onGameEnded.bind(this));
    }
  }

  // 事件处理方法
  protected onTimeChanged(data: { time: number }): void {
    if (this.uiManager) {
      const state = this.gameManager.getState();
      this.uiManager.updateStatusBar(data.time, state.hunger, state.energy);
    }
  }

  protected onHungerChanged(data: { hunger: number }): void {
    if (this.uiManager) {
      const state = this.gameManager.getState();
      this.uiManager.updateStatusBar(state.currentTime, data.hunger, state.energy);
    }
  }

  protected onEnergyChanged(data: { energy: number }): void {
    if (this.uiManager) {
      const state = this.gameManager.getState();
      this.uiManager.updateStatusBar(state.currentTime, state.hunger, data.energy);
    }
  }

  protected onInventoryChanged(data: { inventory: string[] }): void {
    if (this.uiManager) {
      this.uiManager.updateInventory(data.inventory);
    }
  }

  protected onAchievementUnlocked(data: { achievement: string }): void {
    if (this.uiManager) {
      this.uiManager.showAchievementPopup(data.achievement);
    }
    if (this.audioManager) {
      this.audioManager.playAchievementSound();
    }
  }

  protected onGameEnded(data: { endingType: string }): void {
    if (this.uiManager) {
      this.uiManager.showGameEndScreen(data.endingType);
    }
  }

  // 执行动作
  protected executeAction(actionId: string): boolean {
    if (!this.gameManager) return false;

    const action = this.sceneManager.getAction(actionId);
    if (!action) return false;

    const gameState = this.gameManager.getState();
    
    // 检查是否可以执行动作
    if (!this.sceneManager.canAccessRoom(gameState.currentRoom, gameState)) {
      return false;
    }

    // 检查动作要求
    if (!this.checkActionRequirements(action, gameState)) {
      return false;
    }

    // 执行动作效果
    this.applyActionEffects(action, gameState);

    // 播放音效
    if (this.audioManager) {
      this.audioManager.playActionSound(actionId);
    }

    // 显示对话框
    if (this.uiManager) {
      this.uiManager.showDialogue(action.description, 2000);
    }

    return true;
  }

  private checkActionRequirements(action: any, gameState: any): boolean {
    // 检查饥饿值要求
    if (action.hungerRequirement && gameState.hunger < action.hungerRequirement) {
      return false;
    }

    // 检查精力值要求
    if (action.energyRequirement && gameState.energy < action.energyRequirement) {
      return false;
    }

    // 检查物品要求
    if (action.itemRequirement && !gameState.inventory.includes(action.itemRequirement)) {
      return false;
    }

    return true;
  }

  private applyActionEffects(action: any, gameState: any): void {
    // 消耗时间
    if (action.timeCost > 0) {
      this.gameManager.advanceTime(action.timeCost);
      if (this.audioManager) {
        this.audioManager.playTimeAdvanceSound();
      }
    }

    // 消耗饥饿值
    if (action.hungerCost) {
      this.gameManager.modifyHunger(-action.hungerCost);
    }

    // 消耗精力值
    if (action.energyCost) {
      this.gameManager.modifyEnergy(-action.energyCost);
    }

    // 应用效果
    action.effects.forEach((effect: any) => {
      switch (effect.type) {
        case 'hunger':
          if (effect.operation === 'add') {
            this.gameManager.modifyHunger(effect.value);
          }
          break;
        case 'energy':
          if (effect.operation === 'add') {
            this.gameManager.modifyEnergy(effect.value);
          }
          break;
        case 'inventory':
          if (effect.operation === 'add') {
            this.gameManager.addToInventory(effect.value);
          } else if (effect.operation === 'remove') {
            this.gameManager.removeFromInventory(effect.value);
          }
          break;
        case 'story_flag':
          if (effect.operation === 'set') {
            this.gameManager.setStoryFlag(effect.value, true);
          }
          break;
        case 'achievement':
          this.gameManager.unlockAchievement(effect.value);
          break;
      }
    });

    // 记录动作完成
    this.gameManager.completeAction(action.id);
  }

  // 切换到其他房间
  protected switchToRoom(roomKey: string): void {
    console.log('BaseScene.switchToRoom 被调用，目标房间:', roomKey);
    if (this.sceneManager) {
      console.log('SceneManager 存在，调用 switchToRoom');
      this.sceneManager.switchToRoom(roomKey);
      if (this.audioManager) {
        this.audioManager.playRoomChangeSound();
      }
    } else {
      console.error('SceneManager 不存在！');
    }
  }

  // 创建交互对象
  protected createInteractiveObject(obj: any): Phaser.GameObjects.Rectangle {
    const rect = this.add.rectangle(obj.x, obj.y, obj.width, obj.height, 0x00ff00, 0.3);
    rect.setInteractive();
    
    rect.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.onObjectClicked(obj, pointer);
    });

    rect.on('pointerover', () => {
      rect.setFillStyle(0x00ff00, 0.5);
    });

    rect.on('pointerout', () => {
      rect.setFillStyle(0x00ff00, 0.3);
    });

    return rect;
  }

  protected onObjectClicked(obj: any, pointer?: Phaser.Input.Pointer): void {
    if (!this.gameManager) return;

    const gameState = this.gameManager.getState();
    const availableActions = obj.actions
      .map((actionId: string) => this.sceneManager.getAction(actionId))
      .filter((action: any) => action && this.sceneManager.canExecuteAction(action.id, gameState));

    if (availableActions.length > 0 && this.uiManager) {
      // 优先使用点击位置，否则使用对象中心位置
      const x = pointer ? pointer.worldX : obj.x;
      const y = pointer ? pointer.worldY : obj.y;
      this.uiManager.showActionMenu(availableActions, x, y);
    }
  }

  // 清理事件监听
  shutdown(): void {
    if (this.gameManager) {
      this.gameManager.off(GameEvents.TIME_CHANGED, this.onTimeChanged.bind(this));
      this.gameManager.off(GameEvents.HUNGER_CHANGED, this.onHungerChanged.bind(this));
      this.gameManager.off(GameEvents.ENERGY_CHANGED, this.onEnergyChanged.bind(this));
      this.gameManager.off(GameEvents.INVENTORY_CHANGED, this.onInventoryChanged.bind(this));
      this.gameManager.off(GameEvents.ACHIEVEMENT_UNLOCKED, this.onAchievementUnlocked.bind(this));
      this.gameManager.off(GameEvents.GAME_ENDED, this.onGameEnded.bind(this));
    }
  }
} 