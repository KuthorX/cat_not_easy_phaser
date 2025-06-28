import { IUIComponent } from './IUIComponent';
import { TextRenderer } from '../../utils/TextRenderer';

export class DialogueBox implements IUIComponent {
  private scene: Phaser.Scene | null = null;
  private container: Phaser.GameObjects.Container | null = null;
  private textElement: Phaser.GameObjects.Text | null = null;

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    this.createDialogueBox();
  }

  private createDialogueBox(): void {
    if (!this.scene) return;

    this.container = this.scene.add.container(640, 600);
    
    // 背景
    const background = this.scene.add.rectangle(0, 0, 800, 100, 0x000000, 0.8);
    
    // 文本
    this.textElement = TextRenderer.createCenteredText(this.scene, 0, 0, '', {
      fontSize: '18px',
      color: '#ffffff',
      wordWrap: { width: 780 }
    });

    this.container.add([background, this.textElement]);
    this.container.setDepth(1000);
  }

  showText(text: string, duration: number = 3000): void {
    if (!this.textElement || !this.container) return;

    this.textElement.setText(text);
    this.container.setVisible(true);

    if (duration > 0) {
      this.scene!.time.delayedCall(duration, () => {
        this.hide();
      });
    }
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
      this.textElement = null;
    }
  }
} 