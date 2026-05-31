import { IUIComponent } from './IUIComponent';
import { TextRenderer } from '../../utils/TextRenderer';

export interface TimeWasteCallback {
  onCancel?: () => void;
  onWasteOneHour?: () => void;
  onWasteOneDay?: () => void;
}

export class TimeWastePanel implements IUIComponent {
  private scene: Phaser.Scene | null = null;
  private container: Phaser.GameObjects.Container | null = null;
  private background: Phaser.GameObjects.Rectangle | null = null;
  private title: Phaser.GameObjects.Text | null = null;
  private cancelButton: Phaser.GameObjects.Text | null = null;
  private oneHourButton: Phaser.GameObjects.Text | null = null;
  private oneDayButton: Phaser.GameObjects.Text | null = null;
  private callback: TimeWasteCallback = {};

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    this.createPanel();
  }

  private createPanel(): void {
    if (!this.scene) return;

    this.container = this.scene.add.container(640, 360);

    // 背景
    this.background = this.scene.add.rectangle(0, 0, 400, 300, 0x000000, 0.9);
    this.background.setStrokeStyle(2, 0xffffff);

    // 标题
    this.title = TextRenderer.createCenteredText(this.scene, 0, -100, '消磨时间', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 取消按钮
    this.cancelButton = TextRenderer.createCenteredText(this.scene, 0, 0, '取消', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#666666',
      padding: { x: 20, y: 10 }
    });
    this.cancelButton.setInteractive();
    this.cancelButton.on('pointerdown', () => this.onCancelClick());
    this.cancelButton.on('pointerover', () => this.cancelButton?.setStyle({ backgroundColor: '#888888' }));
    this.cancelButton.on('pointerout', () => this.cancelButton?.setStyle({ backgroundColor: '#666666' }));

    // 消磨一小时按钮
    this.oneHourButton = TextRenderer.createCenteredText(this.scene, 0, 50, '消磨一小时', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#4169E1',
      padding: { x: 20, y: 10 }
    });
    this.oneHourButton.setInteractive();
    this.oneHourButton.on('pointerdown', () => this.onOneHourClick());
    this.oneHourButton.on('pointerover', () => this.oneHourButton?.setStyle({ backgroundColor: '#5A7BE1' }));
    this.oneHourButton.on('pointerout', () => this.oneHourButton?.setStyle({ backgroundColor: '#4169E1' }));

    // 消磨一整天按钮
    this.oneDayButton = TextRenderer.createCenteredText(this.scene, 0, 100, '消磨一整天', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#8B4513',
      padding: { x: 20, y: 10 }
    });
    this.oneDayButton.setInteractive();
    this.oneDayButton.on('pointerdown', () => this.onOneDayClick());
    this.oneDayButton.on('pointerover', () => this.oneDayButton?.setStyle({ backgroundColor: '#A0522D' }));
    this.oneDayButton.on('pointerout', () => this.oneDayButton?.setStyle({ backgroundColor: '#8B4513' }));

    this.container.add([this.background, this.title, this.cancelButton, this.oneHourButton, this.oneDayButton]);
    this.container.setDepth(2000);
    this.hide();
  }

  private onCancelClick(): void {
    if (this.callback.onCancel) {
      this.callback.onCancel();
    }
    this.hide();
  }

  private onOneHourClick(): void {
    if (this.callback.onWasteOneHour) {
      this.callback.onWasteOneHour();
    }
    this.hide();
  }

  private onOneDayClick(): void {
    if (this.callback.onWasteOneDay) {
      this.callback.onWasteOneDay();
    }
    this.hide();
  }

  setCallback(callback: TimeWasteCallback): void {
    this.callback = callback;
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
    console.log('destroy TimeWastePanel');
    if (this.container) {
      this.container.destroy();
      this.container = null;
      this.background = null;
      this.title = null;
      this.cancelButton = null;
      this.oneHourButton = null;
      this.oneDayButton = null;
    }
  }
} 