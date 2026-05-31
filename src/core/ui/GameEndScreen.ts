import { IUIComponent } from './IUIComponent';
import { TextRenderer } from '../../utils/TextRenderer';
import { SceneKeys } from '@/constants/SceneKeys';

export class GameEndScreen implements IUIComponent {
  private scene: Phaser.Scene | null = null;
  private container: Phaser.GameObjects.Container | null = null;
  private game: Phaser.Game | null = null;

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    this.game = scene.game;
  }

  showGameEnd(endingType: string): void {
    if (!this.scene || !this.game) return;

    this.hide(); // 先隐藏之前的结束界面

    // 随机选择一张结局图片
    const endingImages = [
      'endings_allies_of_two_legged_beast',
      'endings_logistics_officer', 
      'endings_playtime',
      'endings_husky'
    ];
    const randomImage = endingImages[Math.floor(Math.random() * endingImages.length)];
    console.log("randomImage", randomImage);
    // 显示全屏结局图片
    const endingSprite = this.scene.add.image(100, 0, randomImage);
    endingSprite.setScale(1.5);
    endingSprite.setOrigin(0.5);

    const title = TextRenderer.createCenteredText(this.scene, 0, -250, '我的一天结束啦', {
      fontSize: '48px',
      color: '#000000'
    });
    // 白色的 title 背景
    const titleBg = this.scene.add.rectangle(0, -250, 600, 100, 0xffffff);
    titleBg.setOrigin(0.5);

    // 重新开始按钮
    const restartButton = this.scene.add.rectangle(0, 200, 200, 50, 0xffffff);
    restartButton.setInteractive();
    restartButton.on('pointerdown', () => {
      if (this.scene) {
        window.location.reload();
      }
    });

    const restartButtonText = TextRenderer.createCenteredText(this.scene, 0, 200, '重新开始', {
      fontSize: '20px',
      color: '#000'
    });

    this.container = this.scene.add.container(640, 360);
    this.container.add([endingSprite, titleBg, title, restartButton, restartButtonText]);
    this.container.setDepth(1002);


  }

  show(): void {
    if (this.container) {
      this.container.setVisible(true);
    }
  }

  hide(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }

  destroy(): void {
    this.hide();
  }
} 