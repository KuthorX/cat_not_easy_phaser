import { SceneKeys } from '../constants/SceneKeys';
import { TextRenderer } from '../utils/TextRenderer';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.MENU);
  }

  create(): void {
    // 设置背景
    this.add.rectangle(640, 360, 1280, 720, 0x87CEEB);
    
    // 播放背景音乐
    const game = (window as any).game;
    if (game && game.audioManager) {
      game.audioManager.playMusic('bgm_living_room', this);
    }
    
    // 游戏标题 - 使用优化的文字渲染
    TextRenderer.createTitleText(this, 640, 150, '我的一天');

    TextRenderer.createCenteredText(this, 640, 220, 'My Day', {
      fontSize: '32px',
      color: '#666666',
      fontStyle: 'italic'
    });

    // 创建按钮
    this.createButton('睡醒！', 640, 320, () => {
      this.startNewGame();
    });

    this.createButton('这是什么', 640, 440, () => {
      this.showSettings();
    });

    this.createButton('不玩了！', 640, 500, () => {
      this.quitGame();
    });

    // 版本信息
    TextRenderer.createCenteredText(this, 640, 650, '🐈', {
      fontSize: '16px',
      color: '#666666'
    });
  }

  private createButton(text: string, x: number, y: number, callback: () => void): void {
    // 按钮背景
    const button = this.add.rectangle(x, y, 300, 50, 0x4A4A4A, 0.8);
    button.setStrokeStyle(2, 0xFFFFFF);
    button.setInteractive();

    // 按钮文本 - 使用优化的文字渲染
    const buttonText = TextRenderer.createButtonText(this, x, y, text);

    // 鼠标悬停效果
    button.on('pointerover', () => {
      button.setFillStyle(0x666666, 0.8);
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x4A4A4A, 0.8);
    });

    // 点击事件
    button.on('pointerdown', callback);
    buttonText.on('pointerdown', callback);
  }

  private startNewGame(): void {
    const game = (window as any).game;
    if (game) {
      // 重置游戏状态
      game.gameManager.resetGame();
      
      // 启动游戏场景
      this.scene.start(SceneKeys.BALCONY);
    }
  }

  private loadGame(): void {
    const game = (window as any).game;
    if (game) {
      const saveData = game.saveManager.loadGame();
      if (saveData) {
        // 恢复游戏状态
        // 这里需要实现状态恢复逻辑
        
        // 启动游戏场景
        this.scene.start(SceneKeys.LIVING_ROOM_NORTH);
      }
    }
  }

  private showSettings(): void {
    // 跳转到设置场景
    this.scene.start(SceneKeys.SETTINGS);
  }

  private quitGame(): void {
    // 在浏览器环境中，显示确认对话框
    if (confirm('确定要退出游戏吗？')) {
      // 关闭浏览器标签页（如果允许）
      window.close();
    }
  }
} 