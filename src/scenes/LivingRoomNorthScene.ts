import { BaseScene } from './BaseScene';
import { SceneKeys } from '../constants/SceneKeys';
import { RoomKeys } from '../constants/SceneKeys';
import { InteractiveObject, RoomExit } from '../types/GameState';

export class LivingRoomNorthScene extends BaseScene {
  private interactiveObjects: Map<string, InteractiveObject> = new Map();

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
      this.createInteractiveObject(obj);
    });

    // 创建出口
    roomData.exits.forEach((exit: RoomExit) => {
      this.createExit(exit);
    });

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
  }

  private createExit(exit: RoomExit): void {
    const exitRect = this.add.rectangle(exit.x, exit.y, exit.width, exit.height, 0xff0000, 0.3);
    exitRect.setInteractive();
    
    exitRect.on('pointerdown', () => {
      this.switchToRoom(exit.targetRoom);
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
} 