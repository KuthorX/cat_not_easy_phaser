import { GameEvents } from '../constants/GameEvents';
import { SceneKeys } from '../constants/SceneKeys';
import { GameManager } from '@/core/GameManager';
import { SceneManager } from '@/core/SceneManager';
import { UIManager } from '@/core/UIManager';
import { AudioManager } from '@/core/AudioManager';
import { TweenManager } from '@/core/TweenManager';
import { InteractiveObject, InteractiveObjectWithSprite, RoomExit } from '@/types/GameState';
import { InteractiveOutlineRenderer } from '../utils/InteractiveOutlineRenderer';
import { ConditionChecker } from '../utils/ConditionChecker';
import { TransitionHelper } from '../utils/TransitionHelper';
import { ConditionsFormatter } from '../utils/ConditionsFormatter';
import { TextRenderer } from '../utils/TextRenderer';

export abstract class BaseScene extends Phaser.Scene {
  protected gameManager!: GameManager;
  protected sceneManager!: SceneManager;
  protected audioManager!: AudioManager;
  protected uiManager!: UIManager;
  protected tweenManager!: TweenManager;
  protected interactiveOutlineRenderer!: InteractiveOutlineRenderer;
  
  // 存储交互对象的状态
  protected interactiveObjects: Map<string, { object: InteractiveObject | InteractiveObjectWithSprite, gameObject: Phaser.GameObjects.GameObject }> = new Map();

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
    this.interactiveOutlineRenderer = new InteractiveOutlineRenderer(this);

    // 设置事件监听
    this.setupEventListeners();

    // 初始化场景
    this.initializeScene();

    // 增加猫猫头
    const catHead = this.add.image(0, 0, 'thought_bubble_cat_head');
    catHead.setScale(0.5);
    // 放到画面的底部中间
    catHead.setPosition(640, 680);

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
      
      // 监听状态变化事件，用于更新交互对象显示
      this.gameManager.on(GameEvents.STORY_FLAG_SET, this.onStateChanged.bind(this));
      this.gameManager.on(GameEvents.ACTION_COMPLETED, this.onStateChanged.bind(this));
      this.gameManager.on(GameEvents.INVENTORY_CHANGED, this.onStateChanged.bind(this));
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
    
    // 延迟2秒后显示成就结束场景
    this.time.delayedCall(2000, () => {
      this.scene.start(SceneKeys.ACHIEVEMENT_ENDING, { achievementId: data.achievement });
    });
  }

  protected onGameEnded(data: { endingType: string }): void {
    if (this.uiManager) {
      this.uiManager.showGameEndScreen(data.endingType);
    }
  }

  /**
   * 状态变化时的处理
   * 用于更新交互对象的显示状态
   */
  protected onStateChanged(): void {
    this.updateInteractiveObjectsVisibility();
  }

  /**
   * 更新交互对象的可见性
   */
  protected updateInteractiveObjectsVisibility(): void {
    if (!this.gameManager) return;

    const gameState = this.gameManager.getState();
    
    console.log('updateInteractiveObjectsVisibility 被调用');
    console.log('当前 story_flags:', Object.fromEntries(gameState.storyFlags));
    
    this.interactiveObjects.forEach((entry, objectId) => {
      const { object, gameObject } = entry;
      
      // 检查条件
      const shouldShow = this.shouldShowInteractiveObject(object, gameState);
      
      console.log(`对象 ${objectId}: shouldShow = ${shouldShow}`);
      
      // 如果应该显示但当前是占位符，重新创建真正的对象
      if (shouldShow && gameObject instanceof Phaser.GameObjects.Rectangle && 
          (gameObject as any).fillColor === 0x000000 && (gameObject as any).fillAlpha === 0) {
        
        console.log('重新创建对象', objectId);
        
        // 销毁占位符
        gameObject.destroy();
        
        // 重新创建真正的对象
        let newGameObject: Phaser.GameObjects.GameObject;
        switch (object.type) {
          case 'InteractiveObject':
            if (object.imageKey) {
              newGameObject = this.createInteractiveImageObject(object, object.imageKey);
            } else {
              newGameObject = this.createInteractiveObject(object);
            }
            break;
          case 'InteractiveObjectWithSprite':
            newGameObject = this.createInteractiveObjectsWithSprite(object);
            break;
          default:
            return;
        }
        
        // 更新映射
        this.interactiveObjects.set(objectId, { object, gameObject: newGameObject });
      } else if (!shouldShow && !(gameObject instanceof Phaser.GameObjects.Rectangle && 
                (gameObject as any).fillColor === 0x000000 && (gameObject as any).fillAlpha === 0)) {
        // 如果不应该显示且当前不是占位符，销毁对象并创建占位符
        console.log('隐藏对象，创建占位符', objectId);
        
        // 销毁当前对象
        gameObject.destroy();
        
        // 创建占位符
        const placeholder = this.add.rectangle(object.x, object.y, object.width, object.height, 0x000000, 0);
        placeholder.setVisible(false);
        
        // 更新映射
        this.interactiveObjects.set(objectId, { object, gameObject: placeholder });
      } else {
        // 更新可见性 - 使用类型断言确保有setVisible方法
        if ('setVisible' in gameObject) {
          (gameObject as any).setVisible(shouldShow);
        }
        
        // 如果对象不可见，隐藏其外框
        if (!shouldShow) {
          this.interactiveOutlineRenderer.hideInteractiveOutline(objectId);
        }
      }
    });
  }

  /**
   * 检查交互对象是否应该显示
   * @param object 交互对象
   * @param gameState 游戏状态
   * @returns 是否应该显示
   */
  protected shouldShowInteractiveObject(object: InteractiveObject | InteractiveObjectWithSprite, gameState: any): boolean {
    // 检查条件
    if ('conditions' in object && object.conditions && object.conditions.length > 0) {
      const result = ConditionChecker.checkConditions(object.conditions, gameState);
      console.log(`对象 ${object.id} 条件检查:`, object.conditions, '结果:', result);
      return result;
    }
    
    return true; // 没有条件限制，默认显示
  }

  // 执行动作
  protected executeAction(actionId: string, initialPosition?: { x: number, y: number }): boolean {
    if (!this.gameManager) return false;

    const action = this.sceneManager.getAction(actionId);
    if (!action) return false;

    const gameState = this.gameManager.getState();
    
    // 使用ConditionsFormatter检查动作条件
    const conditionCheck = ConditionsFormatter.checkActionConditions(action, gameState);
    
    if (!conditionCheck.canExecute) {
      // 条件不满足，显示提示信息
      if (this.uiManager && conditionCheck.message) {
        const x = 1280 - 200; // 右下角位置
        const y = 720 - 100;
        this.uiManager.showThought(`condition_failed_${actionId}`, conditionCheck.message, x, y, 3000);
      }
      return false;
    }
    
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

    // 播放音效
    if (this.audioManager) {
      this.audioManager.playActionSound(actionId);
    }

    // 播放PNG序列动画并处理thought时序，在动画完成后应用效果
    this.handleActionAnimationAndThought(action, actionId, () => {
      console.log('动画完成，现在应用动作效果');
      // 执行动作效果
      this.applyActionEffects(action, gameState);
    });

    // 处理对话或显示描述
    if (action.triggerDialogue && action.dialogueId && this.uiManager) {
      console.log('BaseScene.executeAction: 触发对话', { actionId, dialogueId: action.dialogueId });
      
      // 获取物体位置：优先使用传入的位置，然后尝试从当前场景的交互对象中查找，最后使用默认位置
      let objectPosition = initialPosition;
      if (!objectPosition) {
        const object = this.findObjectWithAction(actionId);
        objectPosition = object ? { x: object.x, y: object.y } : { x: 640, y: 360 };
      }
      
      // 启动对话系统
      this.gameManager.startDialogue(action.dialogueId, action.id, action.name, objectPosition);
    }

    return true;
  }

  // 查找包含指定动作的交互对象
  protected findObjectWithAction(actionId: string): any {
    // 获取当前房间数据
    const currentRoomKey = this.gameManager?.getState()?.currentRoom;
    if (!currentRoomKey || !this.sceneManager) {
      return null;
    }
    
    const roomData = this.sceneManager.getRoomData(currentRoomKey);
    if (!roomData || !roomData.interactiveObjects) {
      return null;
    }
    
    // 查找包含指定动作的物体
    return roomData.interactiveObjects.find((obj: any) => 
      obj.actions && obj.actions.includes(actionId)
    ) || null;
  }

  // 子类可以重写此方法来获取交互对象
  protected getInteractiveObject(objectId: string): any {
    return null; // 默认返回null，子类需要重写
  }

  /**
   * 计算物体的缩放比例
   * @param obj 交互对象
   * @returns 缩放比例
   */
  private calculateObjectScale(obj: any): number {
    if (obj.scale_width && obj.scale_height) {
      // 如果有scale_width和scale_height，计算平均缩放比例
      const scaleX = obj.scale_width / obj.width;
      const scaleY = obj.scale_height / obj.height;
      return (scaleX + scaleY) / 2;
    } else if (obj.scale) {
      return obj.scale;
    }
    return 1;
  }

  // 统一处理动作动画和想法气泡的时序关系
  protected handleActionAnimationAndThought(action: any, actionId: string, onAnimationComplete?: () => void): void {
    // 播放PNG序列动画
    if (action.playTweens && this.tweenManager) {
      this.tweenManager.playTween({
        tweenKey: action.playTweens.tweenKey,
        x: action.playTweens.x,
        y: action.playTweens.y,
        scale: action.playTweens.scale,
        fps: action.playTweens.fps,
        loop: action.playTweens.loop,
        repeat: action.playTweens.repeat
      }, () => {
        console.log('动画播放完成');
        console.log('action.thought', action.thought);
        if (action.thought && this.uiManager) {
          const thoughtId = `thought_${actionId}`;
          const x = 1280 - 200; // 右下角位置
          const y = 720 - 100;
          this.uiManager.showThought(thoughtId, action.thought, x, y, 3000);
        }
        
        // 动画完成后调用回调
        if (onAnimationComplete) {
          onAnimationComplete();
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
      
      // 没有动画时立即调用回调
      if (onAnimationComplete) {
        onAnimationComplete();
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
      case 'energy_check':
        // 检查精力值是否足够
        return gameState.energy >= specialCondition.value;
      case 'inventory_check':
        // 检查是否拥有指定物品
        if (Array.isArray(specialCondition.value)) {
          return specialCondition.value.every((itemId: string) => 
            gameState.inventory.includes(itemId)
          );
        } else {
          return gameState.inventory.includes(specialCondition.value);
        }
      case 'story_flag_check':
        // 检查是否拥有指定故事标记
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
    return this.switchToRoom(roomKey);
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
      sceneKey || undefined
    );
  }

  // 根据出口名称生成过渡文本
  protected getTransitionTextForExit(exitName: string): string {
    const transitionTexts: Record<string, string> = {
      '向东': '看看东边有什么好玩的！',
      '向西': '看看西边有什么好玩的!',
      '向南': '看看南边有什么好玩的！',
      '向北': '看看北边有什么好玩的！',
      '走廊': '超级大连廊！',
      '阳台': '离外面最近的地方！',
      '房间A': '房间A，我讨厌这个地方，但是这个地方似乎有用...',
      '房间B': '房间B，我讨厌这个地方，但是这个地方似乎有用...',
      '房间C': '房间C，我讨厌这个地方，但是这个地方似乎有用...',
      '门口': '门口，我讨厌这个地方，但是这个地方似乎有用...',
      '返回客厅': '我讨厌这个地方，但是这个地方似乎有用...',
      '返回屋内': '我讨厌这个地方，但是这个地方似乎有用...',
      '过道': '这个地方，很宽阔，但是很无聊...',
      '主人房间': '我讨厌这个地方，但是这个地方似乎有用...',
      '高处': '跳到高处看看！',
      '低处': '回到低处看看！',
      '返回': '返回！'
    };
    
    return transitionTexts[exitName] || `看看${exitName}...`;
  }

  protected addInteractiveObjects(obj : InteractiveObject | InteractiveObjectWithSprite) : { first: string; second: Phaser.GameObjects.GameObject } {
    let gameObject: Phaser.GameObjects.GameObject;
    
    // 检查条件，如果条件不满足则不创建对象
    if (!this.shouldShowInteractiveObject(obj, this.gameManager?.getState())) {
      console.log('条件不满足，不创建对象', obj.id);
      // 创建一个不可见的占位对象
      const placeholder = this.add.rectangle(obj.x, obj.y, obj.width, obj.height, 0x000000, 0);
      placeholder.setVisible(false);
      this.interactiveObjects.set(obj.id, { object: obj, gameObject: placeholder });
      return { first: obj.id, second: placeholder };
    }
    
    switch (obj.type) {
      case 'InteractiveObject':
        console.log('InteractiveObject 创建交互对象', obj.id);
        if (obj.imageKey) {
          // Create interactive object
          gameObject = this.createInteractiveImageObject(obj, obj.imageKey);
        } else {
          // Create traditional rectangular interactive object
          gameObject = this.createInteractiveObject(obj);
        }
        break;
      case 'InteractiveObjectWithSprite':
        console.log('InteractiveObjectWithSprite 创建交互对象', obj.id);
        gameObject = this.createInteractiveObjectsWithSprite(obj);
        break;
    }
    
    // 存储交互对象信息
    this.interactiveObjects.set(obj.id, { object: obj, gameObject });
    
    return { first: obj.id, second: gameObject };
  }

  // 创建交互对象
  private createInteractiveObject(obj: any): Phaser.GameObjects.Rectangle {
    const scale = this.calculateObjectScale(obj);
    const scaledWidth = obj.width * scale;
    const scaledHeight = obj.height * scale;
    
    const rect = this.add.rectangle(obj.x, obj.y, scaledWidth, scaledHeight, 0x00ff00, 0.3);
    this.physics.add.existing(rect, true);
    
    // 如果disableInteractive不为true，则需要设置交互
    if (obj.disableInteractive !== true) {
      rect.setInteractive();
      
      rect.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.onObjectClicked(obj, pointer);
      });

      rect.on('pointerover', () => {
        console.log('InteractiveObject 鼠标悬停', obj.id);
        rect.setFillStyle(0x00ff00, 0.5);
        // 创建交互式外框 - 传递缩放参数和outline配置
        this.interactiveOutlineRenderer.createInteractiveOutline(obj.id, obj.x, obj.y, obj.width, obj.height, 0x000000, 2, scale, obj.outline);
      });

      rect.on('pointerout', () => {
        rect.setFillStyle(0x00ff00, 0.3);
        // 移除交互式外框
        this.interactiveOutlineRenderer.removeInteractiveOutline(obj.id);
      });
    }

    return rect;
  }

  // 创建带描边效果的图片交互对象
  private createInteractiveImageObject(obj: any, imageKey: string): Phaser.GameObjects.Image {
    // 创建图片对象
    const image = this.add.image(obj.x, obj.y, imageKey);
    this.physics.add.existing(image, true); // true使其成为静态物理体

    // 处理缩放参数
    if (obj.scale_width && obj.scale_height) {
      // 优先使用 scale_width 和 scale_height，强制拉伸到指定尺寸
      image.setDisplaySize(obj.scale_width, obj.scale_height);
    } else if (obj.scale) {
      // 使用 scale 参数进行等比缩放
      image.setScale(obj.scale);
    }

    // 计算缩放后的尺寸
    const scale = this.calculateObjectScale(obj);
    const scaledWidth = obj.width * scale;
    const scaledHeight = obj.height * scale;

    // 设置物理体的大小以匹配交互区域
    const body = image.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(scaledWidth, scaledHeight);
    
    // 如果disableInteractive不为true，创建交互区域
    if (obj.disableInteractive !== true) {
      // 创建不可见的交互区域
      const interactiveArea = this.add.rectangle(obj.x, obj.y, scaledWidth, scaledHeight, 0x000000, 0);
      interactiveArea.setInteractive();
    
      // 点击事件
      interactiveArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.onObjectClicked(obj, pointer);
      });

      // 悬停事件
      interactiveArea.on('pointerover', () => {
        console.log('InteractiveImageObject 鼠标悬停', obj.id);
        // 创建交互式外框 - 传递缩放参数和outline配置
        this.interactiveOutlineRenderer.createInteractiveOutline(obj.id, obj.x, obj.y, obj.width, obj.height, 0x000000, 2, scale, obj.outline);
      });

      interactiveArea.on('pointerout', () => {
        // 移除交互式外框
        this.interactiveOutlineRenderer.removeInteractiveOutline(obj.id);
      });
    }

    return image;
  }

  private createInteractiveObjectsWithSprite(obj : InteractiveObjectWithSprite): Phaser.GameObjects.Sprite {
    const sprite = obj.spriteConstructor(this, obj.x, obj.y);
    
    // 如果disableInteractive不为true，设置交互
    if (obj.disableInteractive !== true) {
      // 计算缩放后的交互区域大小
      const scale = this.calculateObjectScale(obj);
      const scaledWidth = obj.width * scale;
      const scaledHeight = obj.height * scale;
      
      // 设置交互区域大小
      sprite.setInteractive(new Phaser.Geom.Rectangle(-scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight), Phaser.Geom.Rectangle.Contains);
      
      sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.onObjectClicked(obj, pointer);
      });

      // 悬停事件
      sprite.on('pointerover', () => {
        console.log('InteractiveObjectWithSprite 鼠标悬停', obj.id);
        // 创建交互式外框 - 传递缩放参数和outline配置
        this.interactiveOutlineRenderer.createInteractiveOutline(obj.id, obj.x, obj.y, obj.width, obj.height, 0x000000, 2, scale, obj.outline);
      });

      sprite.on('pointerout', () => {
        // 移除交互式外框
        this.interactiveOutlineRenderer.removeInteractiveOutline(obj.id);
      });
    }
    
    return sprite;
  }

  protected onObjectClicked(obj: any, pointer?: Phaser.Input.Pointer): void {
    if (!this.gameManager) return;

    // 检查是否正在对话中，如果是则禁止点击
    if (this.gameManager.isInDialogueMode()) {
      console.log('正在对话中，禁止点击物体');
      return;
    }
    
    // 新增：如果有thought属性，先显示想法气泡
    if (obj.thought && this.uiManager) {
      const x = 1280 - 200; // 右下角位置
      const y = 720 - 100;
      this.uiManager.showThought(obj.id, obj.thought, x, y, 3000);
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
      // 显示所有动作（不再过滤可执行的动作）
      const allActions = obj.actions
        .map((actionId: string) => this.sceneManager.getAction(actionId))
        .filter((action: any) => action); // 只过滤掉不存在的动作

      if (allActions.length > 0 && this.uiManager) {
        // 优先使用点击位置，否则使用对象中心位置
        const x = pointer ? pointer.worldX : obj.x;
        const y = pointer ? pointer.worldY : obj.y;
        this.uiManager.showActionMenu(allActions, x, y);
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
      this.gameManager.off(GameEvents.STORY_FLAG_SET, this.onStateChanged.bind(this));
      this.gameManager.off(GameEvents.ACTION_COMPLETED, this.onStateChanged.bind(this));
    }

    // 清理TweenManager
    if (this.tweenManager) {
      this.tweenManager.destroy();
    }

    // 清理交互式外框渲染器
    if (this.interactiveOutlineRenderer) {
      this.interactiveOutlineRenderer.destroy();
    }

    // 清理交互对象映射
    this.interactiveObjects.clear();
  }

  // 设置点击空白区域处理
  private setupClickOutsideHandler(): void {

  }

  // 渲染房间背景
  protected renderBackground(backgroundKey: string, targetWidth?: number, targetHeight?: number): void {
    console.log('渲染房间背景:', backgroundKey);
    // 背景图默认居中铺满
    const bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, backgroundKey);
    console.log('bg:', bg);
    bg.setOrigin(0.5, 0.5);
    bg.setDepth(-100); // 保证在最底层
    
    // 如果指定了目标尺寸，则强制拉伸缩放
    if (targetWidth && targetHeight) {
      bg.setDisplaySize(targetWidth, targetHeight);
    }
  }

  // 创建出口
  protected createExit(exit: RoomExit): void {
    const exitRect = this.add.rectangle(exit.x, exit.y, exit.width, exit.height, 0xff0000, 0.3);
    exitRect.setInteractive();
    
    exitRect.on('pointerdown', () => {
      this.switchToRoomWithTransition(exit.targetRoom, exit.name);
    });

    exitRect.on('pointerover', () => {
      exitRect.setFillStyle(0xff0000, 0.5);
    });

    exitRect.on('pointerout', () => {
      exitRect.setFillStyle(0xff0000, 0.3);
    });

    // 添加出口标签
    TextRenderer.createCenteredText(this, exit.x, exit.y, exit.name, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 2, y: 1 }
    });
  }
}