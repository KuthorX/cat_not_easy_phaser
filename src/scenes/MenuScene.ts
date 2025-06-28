import { SceneKeys } from '../constants/SceneKeys';
import { TextRenderer } from '../utils/TextRenderer';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.MENU);
  }

  create(): void {
    // 设置背景
    this.add.rectangle(640, 360, 1280, 720, 0x87CEEB);
    
    // 播放背景音乐 - 使用BgmManager确保不会重复播放
    const game = (window as any).game;
    if (game && game.audioManager) {
      game.audioManager.playMusic('bgm_living_room', this);
    }
    
    // 游戏标题 - 使用优化的文字渲染
    TextRenderer.createTitleText(this, 640, 150, '猫不易');

    TextRenderer.createCenteredText(this, 640, 220, 'Cat Not Easy', {
      fontSize: '32px',
      color: '#666666',
      fontStyle: 'italic'
    });

    // 创建图片按钮
    this.createImageButton('menu_start_game', 640, 320, () => {
      this.startNewGame();
    });

    this.createImageButton('menu_settings', 640, 410, () => {
      this.showSettings();
    });

    this.createImageButton('menu_exit_game', 640, 500, () => {
      this.quitGame();
    });

    // 版本信息
    TextRenderer.createCenteredText(this, 640, 650, '🐈', {
      fontSize: '16px',
      color: '#666666'
    });
  }

  private createImageButton(imageKey: string, x: number, y: number, callback: () => void): void {
    // 创建图片按钮
    const button = this.add.image(x, y, imageKey);
    button.setScale(0.5); // 设置初始缩放为0.5
    button.setInteractive();

    // 鼠标悬停效果 - 缩放效果
    button.on('pointerover', () => {
      this.tweens.add({
        targets: button,
        scaleX: 0.55,
        scaleY: 0.55,
        duration: 200,
        ease: 'Power2'
      });
    });

    button.on('pointerout', () => {
      this.tweens.add({
        targets: button,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 200,
        ease: 'Power2'
      });
    });

    // 点击效果
    button.on('pointerdown', () => {
      this.tweens.add({
        targets: button,
        scaleX: 0.475,
        scaleY: 0.475,
        duration: 100,
        yoyo: true,
        ease: 'Power2',
        onComplete: callback
      });
    });
  }

  private startNewGame(): void {
    const game = (window as any).game;
    if (game) {
      // 重置游戏状态
      game.gameManager.resetGame();
      
      // 启动游戏场景
      this.scene.start(SceneKeys.LIVING_ROOM_EAST);
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