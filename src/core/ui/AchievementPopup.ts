import { IUIComponent } from './IUIComponent';
import { TextRenderer } from '../../utils/TextRenderer';

export class AchievementPopup implements IUIComponent {
  private scene: Phaser.Scene | null = null;
  private container: Phaser.GameObjects.Container | null = null;
  private achievementText: Phaser.GameObjects.Text | null = null;

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    this.createAchievementPopup();
  }

  private createAchievementPopup(): void {
    if (!this.scene) return;

    this.container = this.scene.add.container(640, 200);
    
    // 背景
    const background = this.scene.add.rectangle(0, 0, 400, 100, 0xFFD700, 0.9);
    background.setStrokeStyle(2, 0x000000);
    
    // 标题
    const title = TextRenderer.createCenteredText(this.scene, 0, -30, '成就解锁！', {
      fontSize: '20px',
      color: '#000000',
      fontStyle: 'bold'
    });

    // 成就名称
    this.achievementText = TextRenderer.createCenteredText(this.scene, 0, 0, '', {
      fontSize: '16px',
      color: '#000000'
    });

    this.container.add([background, title, this.achievementText]);
    this.container.setDepth(1001);
  }

  showAchievement(achievementName: string): void {
    if (!this.achievementText || !this.container) return;

    this.achievementText.setText(achievementName);
    this.container.setVisible(true);

    // 3秒后自动隐藏
    this.scene!.time.delayedCall(3000, () => {
      this.hide();
    });
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
      this.achievementText = null;
    }
  }
} 