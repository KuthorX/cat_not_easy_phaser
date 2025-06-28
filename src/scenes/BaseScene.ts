import { GameEvents } from '../constants/GameEvents';
import { GameManager } from '@/core/GameManager';
import { SceneManager } from '@/core/SceneManager';
import { UIManager } from '@/core/UIManager';
import { AudioManager } from '@/core/AudioManager';

export abstract class BaseScene extends Phaser.Scene {
  protected gameManager!: GameManager;
  protected sceneManager!: SceneManager;
  protected audioManager!: AudioManager;
  protected uiManager!: UIManager;

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
    }

    // 设置当前场景
    if (this.sceneManager) {
      this.sceneManager.setCurrentScene(this);
    }

    // 设置UIManager的对话管理器
    if (this.uiManager && this.gameManager) {
      this.uiManager.setDialogueManager(this.gameManager.getDialogueManager());
    }

    // 初始化场景
    this.initializeScene();
    
    // 设置事件监听
    this.setupEventListeners();
    
    // 添加点击空白区域隐藏对话选项的功能
    this.setupClickOutsideHandler();
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
      // 使用GameManager的格式化时间
      const formattedTime = this.gameManager.getFormattedTime();
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
  protected executeAction(actionId: string, initialPosition?: { x: number, y: number }): boolean {
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

    // 检查特殊条件
    if (action.specialCondition && !this.checkSpecialCondition(action.specialCondition, gameState)) {
      // 显示失败消息
      if (this.uiManager) {
        this.uiManager.showDialogue(action.specialCondition.failureMessage, 2000);
      }
      return false;
    }

    // 执行动作效果
    this.applyActionEffects(action, gameState);

    // 播放音效
    if (this.audioManager) {
      this.audioManager.playActionSound(actionId);
    }

    // 处理对话或显示描述
    if (action.triggerDialogue && action.dialogueId && this.uiManager) {
      console.log('BaseScene.executeAction: 触发对话', { actionId, dialogueId: action.dialogueId });
      // 启动对话系统
      const objectPosition = initialPosition || { x: 640, y: 360 }; // 使用传入的位置或默认位置
      // 使用动作ID作为objectId，因为对话系统需要知道是哪个物体在说话
      this.gameManager.startDialogue(action.dialogueId, action.id, action.name, objectPosition);
    } else if (this.uiManager) {
      console.log('BaseScene.executeAction: 显示传统对话框', action.description);
      // 显示传统对话框
      this.uiManager.showDialogue(action.description, 2000);
    }

    return true;
  }

  protected checkActionRequirements(action: any, gameState: any): boolean {
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

  protected applyActionEffects(action: any, gameState: any): void {
    // 如果是对话动作，不立即应用效果，让效果在对话选项中选择后执行
    if (action.triggerDialogue && action.dialogueId) {
      // 只应用消耗，不应用效果
      if (action.hungerCost) {
        this.gameManager.modifyHunger(-action.hungerCost);
      }
      if (action.energyCost) {
        this.gameManager.modifyEnergy(-action.energyCost);
      }
      // 记录动作完成
      this.gameManager.completeAction(action.id);
      return;
    }

    // 非对话动作，正常应用效果
    // 消耗时间
    if (action.timeCost) {
      this.gameManager.advanceTime(action.timeCost);
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

  protected checkSpecialCondition(specialCondition: any, gameState: any): boolean {
    switch (specialCondition.type) {
      case 'position_check':
        // 检查是否在指定物体上
        return gameState.storyFlags.get(specialCondition.value) === true;
      default:
        return true;
    }
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
    this.physics.add.existing(rect, true);
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

  // 创建带描边效果的图片交互对象
  protected createInteractiveImageObject(obj: any, imageKey: string): Phaser.GameObjects.Image {
    // 创建图片对象
    const image = this.add.image(obj.x, obj.y, imageKey);
    
    // 创建不可见的交互区域
    const interactiveArea = this.add.rectangle(obj.x, obj.y, obj.width, obj.height, 0x000000, 0);
    interactiveArea.setInteractive();
    
    // 创建描边效果（初始隐藏）
    const outline = this.add.graphics();
    outline.setDepth(image.depth + 1); // 确保描边在图片上方
    
    // 存储引用关系
    (interactiveArea as any).outline = outline;
    (interactiveArea as any).targetImage = image;
    
    // 点击事件
    interactiveArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.onObjectClicked(obj, pointer);
    });

    // 鼠标悬停事件 - 显示描边
    interactiveArea.on('pointerover', () => {
      this.showObjectOutline(interactiveArea, 0x000000, 3);
    });

    // 鼠标离开事件 - 隐藏描边
    interactiveArea.on('pointerout', () => {
      this.hideObjectOutline(interactiveArea);
    });

    return image;
  }

  // 显示物体描边 - 基于图片的实际形状
  private showObjectOutline(interactiveArea: Phaser.GameObjects.Rectangle, color: number, thickness: number = 3): void {
    const outline = (interactiveArea as any).outline;
    const targetImage = (interactiveArea as any).targetImage;
    
    if (!outline || !targetImage) return;

    outline.clear();
    outline.lineStyle(thickness, color, 1);
    
    // 获取图片的实际边界（去除透明区域）
    const bounds = this.getImageNonTransparentBounds(targetImage);
    if (bounds) {
      outline.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }
  }

  // 获取图片的非透明区域边界
  private getImageNonTransparentBounds(image: Phaser.GameObjects.Image): { x: number; y: number; width: number; height: number } | null {
    try {
      // 获取图片的纹理
      const texture = image.texture;
      const source = texture.getSourceImage() as HTMLImageElement;
      
      if (!source || !source.complete) {
        // 如果图片还没加载完成，使用默认边界
        const bounds = image.getBounds();
        return bounds;
      }

      // 创建canvas来分析图片的透明区域
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      canvas.width = source.width;
      canvas.height = source.height;
      ctx.drawImage(source, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = 0;
      let maxY = 0;
      let hasNonTransparentPixel = false;

      // 扫描图片找到非透明像素的边界
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          const alpha = data[index + 3]; // 透明度通道
          
          if (alpha > 0) { // 非透明像素
            hasNonTransparentPixel = true;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      if (!hasNonTransparentPixel) {
        return null;
      }

      // 计算实际边界
      const imageBounds = image.getBounds();
      const scaleX = imageBounds.width / canvas.width;
      const scaleY = imageBounds.height / canvas.height;
      
      return {
        x: imageBounds.x + minX * scaleX,
        y: imageBounds.y + minY * scaleY,
        width: (maxX - minX + 1) * scaleX,
        height: (maxY - minY + 1) * scaleY
      };
    } catch (error) {
      console.warn('无法分析图片透明区域，使用默认边界:', error);
      return image.getBounds();
    }
  }

  // 隐藏物体描边
  private hideObjectOutline(interactiveArea: Phaser.GameObjects.Rectangle): void {
    const outline = (interactiveArea as any).outline;
    if (outline) {
      outline.clear();
    }
  }

  protected onObjectClicked(obj: any, pointer?: Phaser.Input.Pointer): void {
    if (!this.gameManager) return;

    // 检查是否正在对话中，如果是则禁止点击
    if (this.gameManager.isInDialogueMode()) {
      console.log('正在对话中，禁止点击物体');
      return;
    }

    const gameState = this.gameManager.getState();
    
    // 如果有thought，先显示想法气泡（会自动替换当前的气泡）
    if (obj.thought && this.uiManager) {
      const thoughtId = `thought_${obj.id}`;
      const x = 1280 - 200; // 右下角位置
      const y = 720 - 100;
      this.uiManager.showThought(thoughtId, obj.thought, x, y, 3000);
    }
    
    // 检查是否有对话动作
    const dialogueActions = obj.actions
      .map((actionId: string) => this.sceneManager.getAction(actionId))
      .filter((action: any) => action && action.triggerDialogue && action.dialogueId);
    
    if (dialogueActions.length > 0) {
      // 如果有对话动作，直接触发第一个对话
      const dialogueAction = dialogueActions[0];
      console.log('直接触发对话:', dialogueAction.id);
      
      // 使用点击位置作为初始对话位置（带随机偏移）
      const clickPosition = pointer ? { x: pointer.worldX, y: pointer.worldY } : { x: obj.x, y: obj.y };
      const randomOffset = {
        x: (Math.random() - 0.5) * 100, // -50 到 50 的随机偏移
        y: (Math.random() - 0.5) * 100
      };
      const initialPosition = {
        x: clickPosition.x + randomOffset.x,
        y: clickPosition.y + randomOffset.y
      };
      
      this.executeAction(dialogueAction.id, initialPosition);
    } else {
      // 如果没有对话动作，显示传统动作菜单
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

  // 设置点击空白区域处理
  private setupClickOutsideHandler(): void {

  }
}