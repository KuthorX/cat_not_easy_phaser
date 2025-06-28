import { IUIComponent } from './IUIComponent';

export interface TopRightButtonCallback {
  onTimeWaste?: () => void;
  onOpenLog?: () => void;
  onOpenSettings?: () => void;
}

export class TopRightButtons implements IUIComponent {
  private scene: Phaser.Scene | null = null;
  private container: Phaser.GameObjects.Container | null = null;
  private timeWasteButton: Phaser.GameObjects.Text | null = null;
  private logButton: Phaser.GameObjects.Text | null = null;
  private settingsButton: Phaser.GameObjects.Text | null = null;
  private callback: TopRightButtonCallback = {};

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    this.createButtons();
  }

  private createButtons(): void {
    console.log('create buttons');
    if (!this.scene) return;

    this.container = this.scene.add.container(1280 - 150, 10);

    // 消磨时间按钮
    this.timeWasteButton = this.scene.add.text(0, 0, '💤', {
      fontSize: '24px',
      backgroundColor: '#333333',
      padding: { x: 8, y: 4 },
      color: '#ffffff'
    });
    this.timeWasteButton.setInteractive();
    this.timeWasteButton.on('pointerdown', () => this.onTimeWasteClick());
    this.timeWasteButton.on('pointerover', () => this.timeWasteButton?.setStyle({ backgroundColor: '#555555' }));
    this.timeWasteButton.on('pointerout', () => this.timeWasteButton?.setStyle({ backgroundColor: '#333333' }));

    // 日志页按钮
    this.logButton = this.scene.add.text(0, 40, '📖', {
      fontSize: '24px',
      backgroundColor: '#333333',
      padding: { x: 8, y: 4 },
      color: '#ffffff'
    });
    this.logButton.setInteractive();
    this.logButton.on('pointerdown', () => this.onLogClick());
    this.logButton.on('pointerover', () => this.logButton?.setStyle({ backgroundColor: '#555555' }));
    this.logButton.on('pointerout', () => this.logButton?.setStyle({ backgroundColor: '#333333' }));

    // 设置按钮
    this.settingsButton = this.scene.add.text(0, 80, '⚙️', {
      fontSize: '24px',
      backgroundColor: '#333333',
      padding: { x: 8, y: 4 },
      color: '#ffffff'
    });
    this.settingsButton.setInteractive();
    this.settingsButton.on('pointerdown', () => this.onSettingsClick());
    this.settingsButton.on('pointerover', () => this.settingsButton?.setStyle({ backgroundColor: '#555555' }));
    this.settingsButton.on('pointerout', () => this.settingsButton?.setStyle({ backgroundColor: '#333333' }));

    this.container.add([this.timeWasteButton, this.logButton, this.settingsButton]);
    this.container.setDepth(1000);
  }

  private onTimeWasteClick(): void {
    console.log('onTimeWasteClick');
    if (this.callback.onTimeWaste) {
      this.callback.onTimeWaste();
    }
  }

  private onLogClick(): void {
    if (this.callback.onOpenLog) {
      this.callback.onOpenLog();
    }
  }

  private onSettingsClick(): void {
    if (this.callback.onOpenSettings) {
      this.callback.onOpenSettings();
    }
  }

  setCallback(callback: TopRightButtonCallback): void {
    console.log('set callback, ', callback);
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
    if (this.container) {
      this.container.destroy();
      this.container = null;
      this.timeWasteButton = null;
      this.logButton = null;
      this.settingsButton = null;
    }
  }
} 