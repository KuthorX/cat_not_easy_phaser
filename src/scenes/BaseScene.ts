import { GameEvents } from '../constants/GameEvents';
import { GameManager } from '@/core/GameManager';
import { SceneManager } from '@/core/SceneManager';
import { UIManager } from '@/core/UIManager';
import { AudioManager } from '@/core/AudioManager';
import { TweenManager } from '@/core/TweenManager';
import { InteractiveObject, InteractiveObjectWithSprite } from '@/types/GameState';
import { OutlineRenderer } from '../utils/OutlineRenderer';
import { TransitionHelper } from '../utils/TransitionHelper';

export abstract class BaseScene extends Phaser.Scene {
  protected gameManager!: GameManager;
  protected sceneManager!: SceneManager;
  protected audioManager!: AudioManager;
  protected uiManager!: UIManager;
  protected tweenManager!: TweenManager;
  protected outlineRenderer!: OutlineRenderer;

  constructor(key: string) {
    super(key);
  }

  create(): void {
    // 初始化管理器
    const game = (window as any).game;
    this.gameManager = game.gameManager;
    this.sceneManager = game.sceneManager;
    this.audioManager = game.audioManager;
    this.uiManager = game.uiManager;

    // 初始化TweenManager
    this.tweenManager = new TweenManager(this);

    // 设置当前场景
    this.sceneManager.setCurrentScene(this);

    // 初始化描边渲染器
    this.outlineRenderer = new OutlineRenderer(this);

    // 设置事件监听
    this.setupEventListeners();

    // 初始化场景
    this.initializeScene();

    // 初始化UI
    if (this.uiManager) {
      this.uiManager.initialize(this);
      this.uiManager.setDialogueManager(this.gameManager?.getDialogueManager() || null);
      const state = this.gameManager?.getState();
      if (state) {
        this.uiManager.updateStatusBar(state.currentTime, state.energy);
        this.uiManager.updateInventory(state.inventory);
      }
      
      // 设置右上角按钮回调
      this.uiManager.setupTopRightButtons({
        onTimeWaste: () => {
          console.log('打开消磨时间面板');
          this.uiManager?.showTimeWastePanel();
        },
        onOpenLog: () => {
          console.log('打开日志页');
          this.uiManager?.showLogPage();
        },
        onOpenBag: () => {
          console.log('打开背包页');
          this.uiManager?.showBagPage();
        },
        onOpenSettings: () => {
          console.log('打开设置');
          // 设置按钮直接启动设置场景，不需要通过UIManager
        }
      });
      
      // 设置消磨时间面板回调
      this.uiManager.setupTimeWastePanel({
        onCancel: () => {
          console.log('取消消磨时间');
        },
        onWasteOneHour: () => {
          if (this.gameManager) {
            this.gameManager.advanceTime(60); // 前进1小时
            console.log('消磨了一小时');
          }
        },
        onWasteOneDay: () => {
          if (this.gameManager) {
            this.gameManager.advanceTime(720); // 前进12小时
            console.log('消磨了一整天');
          }
        }
      });
      
      // 设置日志页数据
      const game = (window as any).game;
      if (game && game.achievementRegistry) {
        this.uiManager.setupLogPage(game.achievementRegistry, this.gameManager?.getState());
      }
      
      // 设置背包页数据
      if (game && game.bagRegistry) {
        this.uiManager.setupBagPage(game.bagRegistry, this.gameManager?.getState());
      }
    }


    // 设置点击外部处理
    this.setupClickOutsideHandler();
  }

  protected abstract initializeScene(): void;

  protected setupEventListeners(): void {
    // 监听游戏状态变化
    if (this.gameManager) {
      this.gameManager.on(GameEvents.TIME_CHANGED, this.onTimeChanged.bind(this));
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
      this.uiManager.updateStatusBar(data.time, state.energy);
    }
  }

  protected onEnergyChanged(data: { energy: number }): void {
    if (this.uiManager) {
      const state = this.gameManager.getState();
      this.uiManager.updateStatusBar(state.currentTime, data.energy);
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

    // 播放PNG序列动画并处理thought时序
    this.handleActionAnimationAndThought(action, actionId);

    // 处理对话或显示描述
    if (action.triggerDialogue && action.dialogueId && this.uiManager) {
      console.log('BaseScene.executeAction: 触发对话', { actionId, dialogueId: action.dialogueId });
      
      // 获取物体位置：优先使用传入的位置，然后尝试从物体映射获取，最后使用默认位置
      let objectPosition = initialPosition;
      if (!objectPosition) {
        const objectId = this.getObjectIdForAction(actionId);
        if (objectId) {
          const object = this.getInteractiveObject(objectId);
          objectPosition = object ? { x: object.x, y: object.y } : { x: 640, y: 360 };
        } else {
          objectPosition = { x: 640, y: 360 }; // 默认位置
        }
      }
      
      // 启动对话系统
      this.gameManager.startDialogue(action.dialogueId, action.id, action.name, objectPosition);
    }

    return true;
  }

  // 子类可以重写此方法来提供动作ID到物体ID的映射
  protected getObjectIdForAction(actionId: string): string | null {
    return null; // 默认返回null，表示没有映射
  }

  // 子类可以重写此方法来获取交互对象
  protected getInteractiveObject(objectId: string): any {
    return null; // 默认返回null，子类需要重写
  }

  // 统一处理动作动画和想法气泡的时序关系
  protected handleActionAnimationAndThought(action: any, actionId: string): void {
    // 播放PNG序列动画
    if (action.playTweens && this.tweenManager) {
      this.tweenManager.playTween({
        tweenKey: action.playTweens.tweenKey,
        x: action.playTweens.x,
        y: action.playTweens.y,
        scale: action.playTweens.scale,
        fps: action.playTweens.fps,
        loop: action.playTweens.loop
      }, () => {
        console.log('action.thought', action.thought);
        if (action.thought && this.uiManager) {
          const thoughtId = `thought_${actionId}`;
          const x = 1280 - 200; // 右下角位置
          const y = 720 - 100;
          this.uiManager.showThought(thoughtId, action.thought, x, y, 3000);
        }
      });
    } else {
      // 如果没有动画，立即显示想法气泡（如果有的话）
      if (action.thought && this.uiManager) {
        const thoughtId = `thought_${actionId}`;
        const x = 1280 - 200; // 右下角位置
        const y = 720 - 100;
        this.uiManager.showThought(thoughtId, action.thought, x, y, 3000);
      }
    }
  }

  // 获取动画的帧数
  protected getTweenFrameCount(tweenKey: string): number {
    // 根据tweenKey返回对应的帧数
    const frameCountMap: Record<string, number> = {
      'cat_play': 104,
      'cat_slap': 7,
      'cat_kick': 6,
      'cat_tap': 11,
      'cat_grab_down_wall': 55,
      'cat_lick': 41,
      'cat_shock': 41,
      'cat_push': 7
    };
    
    return frameCountMap[tweenKey] || 24; // 默认24帧
  }

  protected checkActionRequirements(action: any, gameState: any): boolean {
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

    // 消耗精力值
    if (action.energyCost) {
      this.gameManager.modifyEnergy(-action.energyCost);
    }

    // 应用效果
    action.effects.forEach((effect: any) => {
      switch (effect.type) {
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
    console.log('当前场景:', this.scene.key);
    console.log('SceneManager 存在:', !!this.sceneManager);
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

  // 带过渡效果的房间切换方法
  protected switchToRoomWithTransition(roomKey: string, exitName: string): void {
    const sceneKey = this.sceneManager?.getSceneKeyForRoom(roomKey);
    if (!sceneKey) {
      console.error(`Unknown room key: ${roomKey}`);
      return;
    }

    // 根据出口名称生成过渡文本
    const transitionText = this.getTransitionTextForExit(exitName);
    
    TransitionHelper.createTransition(
      this,
      {
        text: transitionText,
        leftButtonText: '返回',
        rightButtonText: '进入',
        backgroundColor: 0x1a1a2e,
        textColor: 0xf0f0f0,
        buttonColor: 0x16213e,
        buttonTextColor: 0xffffff
      },
      sceneKey
    );
  }

  // 根据出口名称生成过渡文本
  protected getTransitionTextForExit(exitName: string): string {
    const transitionTexts: Record<string, string> = {
      '向东': '你转向东边，准备探索客厅的另一侧...',
      '向西': '你向西边走去，那里似乎有什么有趣的东西...',
      '向南': '你回到客厅的中央区域...',
      '向北': '你向北边走去，寻找新的发现...',
      '走廊': '你走向走廊，准备探索房子的其他部分...',
      '阳台': '你走向阳台，想要呼吸一些新鲜空气...',
      '房间A': '你准备进入房间A，不知道里面有什么...',
      '房间B': '你走向房间B，心中充满好奇...',
      '房间C': '你准备探索房间C...',
      '门口': '你走向门口，准备离开这个房间...',
      '返回客厅': '你回到客厅的中央区域...',
      '返回屋内': '你回到屋内，继续探索...',
      '过道': '你走向过道，准备探索房子的其他部分...',
      '主人房间': '你走向主人的房间，心中充满好奇...'
    };
    
    return transitionTexts[exitName] || `你走向${exitName}...`;
  }

  protected addInteractiveObjecrs(obj : InteractiveObject | InteractiveObjectWithSprite) : { first: string; second: Phaser.GameObjects.GameObject } {
    let gameObject: Phaser.GameObjects.GameObject;
    switch (obj.type) {
      case 'InteractiveObject':
        if (obj.imageKey) {
          // Create interactive object
          gameObject = this.createInteractiveImageObject(obj, obj.imageKey);
        } else {
          // Create traditional rectangular interactive object
          gameObject = this.createInteractiveObject(obj);
        }
        break;
      case 'InteractiveObjectWithSprite':
        gameObject = this.createInteractiveObjectsWithSprite(obj);
        break;
    }
    return { first: obj.id, second: gameObject };
  }

  // 创建交互对象
  private createInteractiveObject(obj: any): Phaser.GameObjects.Rectangle {
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
  private createInteractiveImageObject(obj: any, imageKey: string): Phaser.GameObjects.Image {
    // 创建图片对象
    const image = this.add.image(obj.x, obj.y, imageKey);
    this.physics.add.existing(image, true); // true使其成为静态物理体

    // 设置物理体的大小以匹配交互区域
    const body = image.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(obj.width, obj.height);
    
    // 创建不可见的交互区域
    const interactiveArea = this.add.rectangle(obj.x, obj.y, obj.width, obj.height, 0x000000, 0);
    interactiveArea.setInteractive();
    
    // 使用新的描边渲染器创建交互式描边
    this.outlineRenderer.createInteractiveOutline(image, interactiveArea, 0x000000, 3);
    
    // 点击事件
    interactiveArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.onObjectClicked(obj, pointer);
    });

    return image;
  }

  private createInteractiveObjectsWithSprite(obj : InteractiveObjectWithSprite): Phaser.GameObjects.Sprite {
    const sprite = obj.spriteConstructor(this, obj.x, obj.y);
    sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.onObjectClicked(obj, pointer);
    });
    return sprite;
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
      this.gameManager.off(GameEvents.ENERGY_CHANGED, this.onEnergyChanged.bind(this));
      this.gameManager.off(GameEvents.INVENTORY_CHANGED, this.onInventoryChanged.bind(this));
      this.gameManager.off(GameEvents.ACHIEVEMENT_UNLOCKED, this.onAchievementUnlocked.bind(this));
      this.gameManager.off(GameEvents.GAME_ENDED, this.onGameEnded.bind(this));
    }

    // 清理TweenManager
    if (this.tweenManager) {
      this.tweenManager.destroy();
    }

    // 清理描边渲染器
    if (this.outlineRenderer) {
      this.outlineRenderer.destroy();
    }
  }

  // 设置点击空白区域处理
  private setupClickOutsideHandler(): void {

  }
}