import { BaseScene } from './BaseScene';
import { SceneKeys } from '../constants/SceneKeys';
import { RoomKeys } from '../constants/SceneKeys';
import { InteractiveObject, RoomExit } from '../types/GameState';
import { RobotCleaner } from '../objects/RobotCleaner';
import { GameEvents } from '../constants/GameEvents';

export class LivingRoomNorthScene extends BaseScene {
  private interactiveObjects: Map<string, InteractiveObject> = new Map();
  private interactiveObjectBodies: Phaser.GameObjects.Rectangle[] = [];
  private robotCleaner!: RobotCleaner;

  constructor() {
    super(SceneKeys.LIVING_ROOM_NORTH);
  }

  protected initializeScene(): void {
    // 设置背景
    this.add.rectangle(640, 360, 1280, 720, 0x87CEEB);
    
    // 添加房间标题
    this.add.text(640, 50, '客厅 - 向北看', {
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 获取房间数据
    const roomData = this.sceneManager?.getRoomData(RoomKeys.LIVING_ROOM_NORTH);
    if (!roomData) return;

    // 创建交互对象
    roomData.interactiveObjects.forEach((obj: InteractiveObject) => {
      this.interactiveObjects.set(obj.id, obj);
      const objSprite = this.createInteractiveObject(obj);
      this.interactiveObjectBodies.push(objSprite);
    });

    // 创建出口
    roomData.exits.forEach((exit: RoomExit) => {
      this.createExit(exit);
    });

    // 创建扫地机器人
    this.robotCleaner = new RobotCleaner(this, 0, 400);

    // 添加碰撞
    this.physics.add.collider(this.robotCleaner, this.interactiveObjectBodies);

    // 初始化UI
    if (this.uiManager) {
      this.uiManager.initialize(this);
      this.uiManager.setDialogueManager(this.gameManager?.getDialogueManager() || null);
      const state = this.gameManager?.getState();
      if (state) {
        this.uiManager.updateStatusBar(state.currentTime, state.hunger, state.energy);
        this.uiManager.updateInventory(state.inventory);
      }
    }

    // 播放背景音乐
    if (this.audioManager) {
      this.audioManager.playRoomMusic(RoomKeys.LIVING_ROOM_NORTH);
    }

    // 记录房间访问
    if (this.gameManager) {
      this.gameManager.visitRoom(RoomKeys.LIVING_ROOM_NORTH);
    }

    // 设置键盘快捷键
    this.setupKeyboardShortcuts();

    // 创建扫地机器人
    this.robotCleaner = new RobotCleaner(this, 0, 400);
    // 检查是否有战斗结果需要处理
    this.checkBattleResult();
  }

  private createExit(exit: RoomExit): void {
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
    this.add.text(exit.x, exit.y, exit.name, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 2, y: 1 }
    }).setOrigin(0.5);
  }

  private setupKeyboardShortcuts(): void {
    // I键打开物品栏
    this.input.keyboard?.on('keydown-I', () => {
      if (this.uiManager) {
        this.uiManager.showInventoryPanel();
      }
    });

    // ESC键隐藏UI
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.uiManager) {
        this.uiManager.hideActionMenu();
        this.uiManager.hideInventoryPanel();
      }
    });

    // 数字键快速执行动作
    this.input.keyboard?.on('keydown-ONE', () => {
      this.executeAction('sunbathing');
    });

    this.input.keyboard?.on('keydown-TWO', () => {
      this.executeAction('sleep_on_sofa');
    });

    this.input.keyboard?.on('keydown-THREE', () => {
      this.executeAction('scratch_sofa');
    });

    // 测试战斗系统
    this.input.keyboard?.on('keydown-B', () => {
      console.log('测试战斗系统...');
      // 直接触发战斗开始事件
      const battleEvent = new CustomEvent('start_battle', {
        detail: {
          enemyId: 'sofa_north',
          enemyName: '沙发',
          enemyImage: 'room_b_bed',
          playerImage: 'balcony_robot_cleaner',
          returnScene: 'LivingRoomNorthScene',
          returnObjectId: 'sofa_north'
        }
      });
      window.dispatchEvent(battleEvent);
    });
  }

  // 重写executeAction方法以支持对话系统
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

    // 处理对话或显示描述
    if (action.triggerDialogue && action.dialogueId && this.uiManager) {
      console.log('LivingRoomNorthScene.executeAction: 触发对话', { actionId, dialogueId: action.dialogueId });
      // 获取物体位置
      const objectId = this.getObjectIdForAction(actionId);
      const object = objectId ? this.interactiveObjects.get(objectId) : null;
      const objectPosition = object ? { x: object.x, y: object.y } : { x: 640, y: 360 };
      
      console.log('物体信息:', { objectId, object, objectPosition });
      
      // 启动对话系统
      this.gameManager.startDialogue(action.dialogueId, objectId || actionId, action.name, objectPosition);
    } else if (this.uiManager) {
      console.log('LivingRoomNorthScene.executeAction: 显示传统对话框', action.description);
      // 显示传统对话框
      this.uiManager.showDialogue(action.description, 2000);
    }

    return true;
  }

  // 根据动作ID获取对应的物体ID
  private getObjectIdForAction(actionId: string): string | null {
    const actionToObjectMap: Record<string, string> = {
      'sleep_on_sofa': 'sofa_north',
      'scratch_sofa': 'sofa_north',
      'attack_cage': 'cat_cage',
      'jump_on_cage': 'cat_cage',
      'use_litter_box': 'cat_litter_box'
    };
    
    return actionToObjectMap[actionId] || null;
  }

  protected setupEventListeners(): void {
    super.setupEventListeners();
    
    // 监听战斗开始事件
    window.addEventListener('start_battle', this.onStartBattle.bind(this) as EventListener);
    
    // 监听战斗结束事件
    this.events.on(GameEvents.BATTLE_END, this.onBattleEnd.bind(this));
  }

  private onStartBattle(event: Event): void {
    const customEvent = event as CustomEvent;
    const battleData = customEvent.detail;
    console.log('开始战斗:', battleData);
    
    // 切换到战斗场景
    this.sceneManager?.startScene(SceneKeys.BATTLE, battleData);
  }

  private onBattleEnd(data: any): void {
    console.log('战斗结束:', data);
    
    if (data.result === 'success') {
      // 战斗成功，将沙发标记为损坏
      this.markObjectAsDamaged(data.returnObjectId);
    }
    // 战斗失败则不做任何改变
  }

  private markObjectAsDamaged(objectId: string): void {
    // 更新物体的损坏状态
    const object = this.interactiveObjects.get(objectId);
    if (object) {
      // 更新物体精灵为损坏状态
      const objectSprite = this.interactiveObjectBodies.find((_, index) => {
        const objArray = Array.from(this.interactiveObjects.values());
        return objArray[index]?.id === objectId;
      });
      
      if (objectSprite) {
        // 将损坏的沙发替换为损坏的椅子图片
        // 这里我们暂时用颜色变化表示损坏，实际项目中应该替换为损坏的图片
        objectSprite.setFillStyle(0x8b4513, 0.8);
        
        // 如果有损坏的图片，可以这样替换：
        // const damagedSprite = this.add.sprite(object.x, object.y, 'room_b_chair');
        // damagedSprite.setScale(0.8);
        // objectSprite.destroy();
      }
      
      // 记录损坏状态到游戏状态
      if (this.gameManager) {
        this.gameManager.getState().destroyedItems.add(objectId);
      }
    }
  }

  private checkBattleResult(): void {
    // 从场景数据中获取战斗结果
    const sceneData = (this as any).scene.settings.data;
    if (sceneData && sceneData.battleResult) {
      console.log('处理战斗结果:', sceneData);
      
      if (sceneData.battleResult === 'success' && sceneData.damagedObject) {
        // 战斗成功，标记物体为损坏状态
        this.markObjectAsDamaged(sceneData.damagedObject);
        
        // 显示成功提示
        if (this.uiManager) {
          this.uiManager.showDialogue('破坏成功！', 3000);
        }
      } else if (sceneData.battleResult === 'failure') {
        // 战斗失败，显示失败提示
        if (this.uiManager) {
          this.uiManager.showDialogue('破坏失败！', 3000);
        }
      }
    }
  }

  shutdown(): void {
    // 清理事件监听器
    window.removeEventListener('start_battle', this.onStartBattle.bind(this) as EventListener);
    this.events.off(GameEvents.BATTLE_END, this.onBattleEnd.bind(this));
    
    super.shutdown();
  }
}