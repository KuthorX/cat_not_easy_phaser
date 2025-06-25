import { BaseScene } from './BaseScene';
import { SceneKeys } from '../constants/SceneKeys';
import { RoomKeys } from '../constants/SceneKeys';
import { InteractiveObject, RoomExit } from '../types/GameState';

export class LivingRoomWestLowScene extends BaseScene {
  constructor() {
    super(SceneKeys.LIVING_ROOM_WEST_LOW);
  }

  protected initializeScene(): void {
    // 设置背景
    this.add.rectangle(640, 360, 1280, 720, 0x8B4513); // 棕色地板
    
    // 添加房间标题
    this.add.text(640, 50, '客厅 - 向西看（低处）', {
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 获取房间数据
    const roomData = this.sceneManager?.getRoomData(RoomKeys.LIVING_ROOM_WEST_LOW);
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
      this.audioManager.playRoomMusic(RoomKeys.LIVING_ROOM_WEST_LOW);
    }

    // 记录房间访问
    if (this.gameManager) {
      this.gameManager.visitRoom(RoomKeys.LIVING_ROOM_WEST_LOW);
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
      this.executeAction('attack_cage');
    });

    this.input.keyboard?.on('keydown-TWO', () => {
      this.executeAction('jump_on_cage');
    });

    this.input.keyboard?.on('keydown-THREE', () => {
      this.executeAction('use_litter_box');
    });

    this.input.keyboard?.on('keydown-FOUR', () => {
      this.executeAction('play_in_house');
    });
  }
} 