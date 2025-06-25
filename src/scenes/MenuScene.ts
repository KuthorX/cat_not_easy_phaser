import { SceneKeys } from '../constants/SceneKeys';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.MENU);
  }

  create(): void {
    // 设置背景
    this.add.rectangle(640, 360, 1280, 720, 0x87CEEB);
    
    // 游戏标题
    this.add.text(640, 150, '猫咪的一天', {
      fontSize: '64px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(640, 220, 'A Cat\'s Day', {
      fontSize: '32px',
      color: '#666666',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // 创建按钮
    this.createButton('开始新游戏', 640, 320, () => {
      this.startNewGame();
    });

    // 检查是否有存档
    const game = (window as any).game;
    if (game && game.saveManager.hasSaveGame()) {
      this.createButton('继续游戏', 640, 380, () => {
        this.loadGame();
      });
    }

    this.createButton('设置', 640, 440, () => {
      this.showSettings();
    });

    this.createButton('退出', 640, 500, () => {
      this.quitGame();
    });

    // 版本信息
    this.add.text(640, 650, '版本 1.0.0', {
      fontSize: '16px',
      color: '#666666'
    }).setOrigin(0.5);
  }

  private createButton(text: string, x: number, y: number, callback: () => void): void {
    // 按钮背景
    const button = this.add.rectangle(x, y, 300, 50, 0x4A4A4A, 0.8);
    button.setStrokeStyle(2, 0xFFFFFF);
    button.setInteractive();

    // 按钮文本
    const buttonText = this.add.text(x, y, text, {
      fontSize: '24px',
      color: '#FFFFFF'
    });
    buttonText.setOrigin(0.5);

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
      this.scene.start(SceneKeys.LIVING_ROOM_NORTH);
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
    // 创建设置面板
    const settingsPanel = this.add.rectangle(640, 360, 600, 400, 0x000000, 0.9);
    settingsPanel.setStrokeStyle(2, 0xFFFFFF);

    // 设置标题
    this.add.text(640, 200, '设置', {
      fontSize: '32px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // 音效音量设置
    this.add.text(400, 280, '音效音量:', {
      fontSize: '20px',
      color: '#FFFFFF'
    });

    // 音乐音量设置
    this.add.text(400, 320, '音乐音量:', {
      fontSize: '20px',
      color: '#FFFFFF'
    });

    // 关闭按钮
    const closeButton = this.add.rectangle(640, 480, 100, 40, 0x666666);
    closeButton.setInteractive();
    closeButton.on('pointerdown', () => {
      settingsPanel.destroy();
    });

    this.add.text(640, 480, '关闭', {
      fontSize: '18px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
  }

  private quitGame(): void {
    // 在浏览器环境中，显示确认对话框
    if (confirm('确定要退出游戏吗？')) {
      // 关闭浏览器标签页（如果允许）
      window.close();
    }
  }
} 