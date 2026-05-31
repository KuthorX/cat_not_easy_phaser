import { IUIComponent } from './IUIComponent';
import { GameConstants } from '../../config/GameConfig';
import { TextRenderer } from '../../utils/TextRenderer';

export class StatusBar implements IUIComponent {
  private scene: Phaser.Scene | null = null;
  private container: Phaser.GameObjects.Container | null = null;
  private timeText: Phaser.GameObjects.Text | null = null;
  private energyText: Phaser.GameObjects.Text | null = null;

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    this.createStatusBar();
  }

  private createStatusBar(): void {
    if (!this.scene) return;

    this.container = this.scene.add.container(10, 10);

    // 时间显示
    this.timeText = TextRenderer.createChineseText(this.scene, 0, 0, '时间: 8:00', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 2 }
    });

    // 精力值显示
    this.energyText = TextRenderer.createChineseText(this.scene, 0, 30, '精力: 1/5', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#4169E1',
      padding: { x: 5, y: 2 }
    });

    this.container.add([this.timeText, this.energyText]);
    this.container.setDepth(1000);
  }

  update(time: number, energy: number): void {
    if (!this.timeText || !this.energyText) return;

    // 获取格式化的时间字符串
    const game = (window as any).game;
    let formattedTime = '';
    if (game && game.gameManager) {
      formattedTime = game.gameManager.getFormattedTime();
    } else {
      // 备用格式化方法
      const hours = Math.floor(time);
      const minutes = Math.floor((time - hours) * 60);
      formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    this.timeText.setText(`时间: ${formattedTime}`);
    this.energyText.setText(`精力: ${energy}/${GameConstants.MAX_ENERGY}`);
  }

  show(): void {
    if (this.container) {
      this.container.setVisible(true);
    }
  }

  hide(): void {
    if (this.container) {
      this.container.setVisible(false);
    }
  }

  destroy(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
      this.timeText = null;
      this.energyText = null;
    }
  }
} 