import { BaseScene } from './BaseScene';
import { SceneKeys } from '../constants/SceneKeys';
import { RoomKeys } from '../constants/SceneKeys';
import { InteractiveObject, RoomExit } from '../types/GameState';

export class BalconyScene extends BaseScene {
  constructor() {
    super(SceneKeys.BALCONY);
  }

  protected initializeScene(): void {
    // 设置背景
    this.add.rectangle(640, 360, 1280, 720, 0x87CEEB); // 天蓝色背景
    
    // 添加房间标题
    this.add.text(640, 50, '阳台', {
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 获取房间数据
    const roomData = this.sceneManager?.getRoomData(RoomKeys.BALCONY);
    if (!roomData) return;

    // 创建交互对象
    roomData.interactiveObjects.forEach((obj: InteractiveObject) => {
      this.createInteractiveObject(obj);
    });

    // 创建出口
    roomData.exits.forEach((exit: RoomExit) => {
      this.createExit(exit);
    });

    // 初始化UI
    if (this.uiManager) {
      this.uiManager.initialize(this);
      const state = this.gameManager?.getState();
      if (state) {
        this.uiManager.updateStatusBar(state.currentTime, state.hunger, state.energy);
        this.uiManager.updateInventory(state.inventory);
      }
    }

    // 播放背景音乐
    if (this.audioManager) {
      this.audioManager.playRoomMusic(RoomKeys.BALCONY);
    }

    // 记录房间访问
    if (this.gameManager) {
      this.gameManager.visitRoom(RoomKeys.BALCONY);
    }

    // 设置键盘快捷键
    this.setupKeyboardShortcuts();
  }

  private createExit(exit: RoomExit): void {
    console.log('创建出口:', exit.name, '目标房间:', exit.targetRoom);
    
    const exitRect = this.add.rectangle(exit.x, exit.y, exit.width, exit.height, 0xff0000, 0.3);
    exitRect.setInteractive();
    
    exitRect.on('pointerdown', () => {
      console.log('点击出口:', exit.name, '切换到房间:', exit.targetRoom);
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
      this.executeAction('house_parkour');
    });
  }
} 