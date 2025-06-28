import { BaseScene } from './BaseScene';
import { SceneKeys } from '../constants/SceneKeys';
import { RoomKeys } from '../constants/SceneKeys';
import { InteractiveObject, RoomExit } from '../types/GameState';

export class RoomBScene extends BaseScene {
  constructor() {
    super(SceneKeys.ROOM_B);
  }

  protected initializeScene(): void {
    // 设置背景图片
    this.add.image(640, 360, 'room_b_bg');
    
    // 添加房间标题
    this.add.text(640, 50, '主人房间', {
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加room_b场景的图片对象
    this.addRoomBObjects();

    // 获取房间数据
    const roomData = this.sceneManager?.getRoomData(RoomKeys.ROOM_B);
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
      this.audioManager.playRoomMusic(RoomKeys.ROOM_B);
    }

    // 记录房间访问
    if (this.gameManager) {
      this.gameManager.visitRoom(RoomKeys.ROOM_B);
    }

    // 设置键盘快捷键
    this.setupKeyboardShortcuts();
  }

  private addRoomBObjects(): void {
    // 添加床
    const bed = this.add.image(300, 400, 'room_b_bed');
    
    // 添加椅子
    const chair = this.add.image(800, 450, 'room_b_chair');
    
    // 添加电脑屏幕
    const computerScreen = this.add.image(900, 350, 'room_b_computer_screen');
    
    // 添加水壶
    const kettle = this.add.image(700, 300, 'room_b_kettle');
    
    // 添加侧墙
    const sideWall = this.add.image(1000, 360, 'room_b_side_wall');

    // 为这些对象创建交互区域
    this.createInteractiveImageObject({
      id: 'room_b_bed',
      name: '主人的床',
      description: '柔软的床铺，比猫窝舒服多了。',
      x: 300,
      y: 400,
      width: 200,
      height: 150,
      actions: ['sleep_on_bed', 'scratch_bed']
    }, 'room_b_bed');

    this.createInteractiveImageObject({
      id: 'room_b_chair',
      name: '椅子',
      description: '主人坐的椅子。',
      x: 800,
      y: 450,
      width: 120,
      height: 100,
      actions: ['sit_on_chair', 'climb_chair']
    }, 'room_b_chair');

    this.createInteractiveImageObject({
      id: 'room_b_computer_screen',
      name: '电脑屏幕',
      description: '大又扁，有时候黑漆漆，有时候亮闪闪。',
      x: 900,
      y: 350,
      width: 150,
      height: 100,
      actions: ['watch_screen', 'paw_screen']
    }, 'room_b_computer_screen');

    this.createInteractiveImageObject({
      id: 'room_b_kettle',
      name: '水壶',
      description: '主人用来烧水的壶。',
      x: 700,
      y: 300,
      width: 80,
      height: 60,
      actions: ['investigate_kettle', 'knock_over_kettle']
    }, 'room_b_kettle');

    this.createInteractiveImageObject({
      id: 'room_b_side_wall',
      name: '侧墙',
      description: '房间的侧墙。',
      x: 1000,
      y: 360,
      width: 100,
      height: 400,
      actions: ['climb_wall', 'scratch_wall']
    }, 'room_b_side_wall');
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
      this.executeAction('play_with_mouse');
    });

    this.input.keyboard?.on('keydown-TWO', () => {
      this.executeAction('carry_mouse');
    });

    this.input.keyboard?.on('keydown-THREE', () => {
      this.executeAction('destroy_screen');
    });

    this.input.keyboard?.on('keydown-FOUR', () => {
      this.executeAction('sleep_on_bed');
    });
  }
} 