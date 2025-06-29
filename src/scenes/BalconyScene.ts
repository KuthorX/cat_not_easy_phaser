import { BaseScene } from './BaseScene';
import { SceneKeys } from '../constants/SceneKeys';
import { RoomKeys } from '../constants/SceneKeys';
import { InteractiveObject, RoomExit, InteractiveObjectWithSprite } from '../types/GameState';
import { TextRenderer } from '../utils/TextRenderer';

export class BalconyScene extends BaseScene {
  constructor() {
    super(SceneKeys.BALCONY);
  }

  protected initializeScene(): void {

    // 添加房间标题
    TextRenderer.createCenteredText(this, 640, 50, '阳台', {
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold'
    });

    // 获取房间数据
    const roomData = this.sceneManager?.getRoomData(RoomKeys.BALCONY);
    if (!roomData) return;

    super.renderBackground(roomData.background);

    // 创建交互对象
    const interactiveGameObjects = roomData.interactiveObjects.map((obj) => {
      return this.addInteractiveObjecrs(obj);
    });

    // 创建一个虚拟的斜线矩形列表
    const horizonLineRects = this.addHorizonLine();

    const robotCleaner = interactiveGameObjects.find(pair => pair.first === 'balcony_robot_cleaner')?.second;

    const collidableObjects = interactiveGameObjects.filter(pair => pair.first !== 'balcony_robot_cleaner').map(pair => pair.second);

    if (robotCleaner) {
      this.physics.add.collider(robotCleaner, collidableObjects);
      this.physics.add.collider(robotCleaner, horizonLineRects);
    }

    // 创建出口
    roomData.exits.forEach((exit: RoomExit) => {
      this.createExit(exit);
    });

    // 初始化UI
    if (this.uiManager) {
      this.uiManager.initialize(this);
      const state = this.gameManager?.getState();
      if (state) {
        this.uiManager.updateStatusBar(state.currentTime, state.energy);
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

  private addHorizonLine() {
    let allRects: Phaser.GameObjects.Rectangle[] = [];

    const startX = 0;
    const startY = 290;
    const endX = this.game.config.width as number;
    const endY = 480;

    // Calculate the number of squares needed based on the distance between start and end points
    const distance = Phaser.Math.Distance.Between(startX, startY, endX, endY);
    const squareSize = 10;
    const numSquares = Math.floor(distance / squareSize);

    // Calculate the angle between start and end points
    const angle = Phaser.Math.Angle.Between(startX, startY, endX, endY);

    // Create a series of squares connected to form a diagonal line
    for (let i = 0; i < numSquares; i++) {
      const x = startX + Math.cos(angle) * i * squareSize;
      const y = startY + Math.sin(angle) * i * squareSize;
      const square = this.add.rectangle(x, y, squareSize, squareSize, 0x00ff00, 0);
      this.physics.add.existing(square, true);
      allRects.push(square);
    }

    return allRects;
  }

  private createExit(exit: RoomExit): void {
    console.log('创建出口:', exit.name, '目标房间:', exit.targetRoom);
    
    const exitRect = this.add.rectangle(exit.x, exit.y, exit.width, exit.height, 0xff0000, 0.3);
    exitRect.setInteractive();
    
    exitRect.on('pointerdown', () => {
      console.log('点击出口:', exit.name, '切换到房间:', exit.targetRoom);
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