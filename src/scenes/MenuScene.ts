import { SceneKeys } from '../constants/SceneKeys';
import { TextRenderer } from '../utils/TextRenderer';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.MENU);
  }

  create(): void {
    // 设置背景
    this.add.image(640, 360, 'menu_bg');
    
    // 播放背景音乐 - 使用BgmManager确保不会重复播放
    const game = (window as any).game;
    if (game && game.audioManager) {
      game.audioManager.playMusic('bgm_living_room', this);
    }

    const group_start_x = 320;
    const group_gap_x = 320;
    const group_start_y = 650;

    // 创建图片按钮
    this.createImageButton('menu_start_game', group_start_x, group_start_y, () => {
      this.startNewGame();
    });

    this.createImageButton('menu_settings', group_start_x + group_gap_x, group_start_y, () => {
      this.showSettings();
    });

    this.createImageButton('menu_exit_game', group_start_x + group_gap_x * 2, group_start_y, () => {
      this.quitGame();
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
      this.scene.start(SceneKeys.ROOM_B);
    }
  }

  private showSettings(): void {
    // 跳转到设置场景，传递来源场景信息
    this.scene.start(SceneKeys.SETTINGS, { sourceScene: SceneKeys.MENU });
  }

  private quitGame(): void {
    // 在浏览器环境中，显示确认对话框
    if (confirm('确定要退出游戏吗？')) {
      // 关闭浏览器标签页（如果允许）
      window.close();
    }
  }
} 