import { IUIComponent } from './IUIComponent';
import { SceneKeys } from '../../constants/SceneKeys';
import { TextRenderer } from '../../utils/TextRenderer';

export interface TopRightButtonCallback {
  onTimeWaste?: () => void;
  onOpenLog?: () => void;
  onOpenBag?: () => void;
  onOpenSettings?: () => void;
}

export class TopRightButtons implements IUIComponent {
  private scene: Phaser.Scene | null = null;
  private container: Phaser.GameObjects.Container | null = null;
  private timeWasteButton: Phaser.GameObjects.Text | null = null;
  private logButton: Phaser.GameObjects.Text | null = null;
  private bagButton: Phaser.GameObjects.Text | null = null;
  private settingsButton: Phaser.GameObjects.Text | null = null;
  private callback: TopRightButtonCallback = {};

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    this.createButtons();
  }

  private createButtons(): void {
    console.log('create buttons');
    if (!this.scene) return;

    this.container = this.scene.add.container(1280 - 200, 10);

    // 消磨时间按钮
    this.timeWasteButton = TextRenderer.createChineseText(this.scene, 0, 0, '💤', {
      fontSize: '24px',
      backgroundColor: '#00000000',
      padding: { x: 8, y: 4 },
      color: '#ffffff'
    });
    this.timeWasteButton.setInteractive();
    this.timeWasteButton.on('pointerdown', () => this.onTimeWasteClick());
    this.timeWasteButton.on('pointerover', () => this.timeWasteButton?.setStyle({ backgroundColor: '#33333333' }));
    this.timeWasteButton.on('pointerout', () => this.timeWasteButton?.setStyle({ backgroundColor: '#00000000' }));

    // 日志页按钮
    this.logButton = TextRenderer.createChineseText(this.scene, 50, 0, '📖', {
      fontSize: '24px',
      backgroundColor: '#00000000',
      padding: { x: 8, y: 4 },
      color: '#ffffff'
    });
    this.logButton.setInteractive();
    this.logButton.on('pointerdown', () => this.onLogClick());
    this.logButton.on('pointerover', () => this.logButton?.setStyle({ backgroundColor: '#33333333' }));
    this.logButton.on('pointerout', () => this.logButton?.setStyle({ backgroundColor: '#00000000' }));

    // 背包按钮
    this.bagButton = TextRenderer.createChineseText(this.scene, 100, 0, '🎒', {
      fontSize: '24px',
      backgroundColor: '#00000000',
      padding: { x: 8, y: 4 },
      color: '#ffffff'
    });
    this.bagButton.setInteractive();
    this.bagButton.on('pointerdown', () => this.onBagClick());
    this.bagButton.on('pointerover', () => this.bagButton?.setStyle({ backgroundColor: '#33333333' }));
    this.bagButton.on('pointerout', () => this.bagButton?.setStyle({ backgroundColor: '#00000000' }));

    // 设置按钮
    this.settingsButton = TextRenderer.createChineseText(this.scene, 150, 0, '⚙️', {
      fontSize: '24px',
      backgroundColor: '#00000000',
      padding: { x: 8, y: 4 },
      color: '#ffffff'
    });
    this.settingsButton.setInteractive();
    this.settingsButton.on('pointerdown', () => this.onSettingsClick());
    this.settingsButton.on('pointerover', () => this.settingsButton?.setStyle({ backgroundColor: '#33333333' }));
    this.settingsButton.on('pointerout', () => this.settingsButton?.setStyle({ backgroundColor: '#00000000' }));

    this.container.add([this.timeWasteButton, this.logButton, this.bagButton, this.settingsButton]);
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

  private onBagClick(): void {
    if (this.callback.onOpenBag) {
      this.callback.onOpenBag();
    }
  }

  private onSettingsClick(): void {
    // 直接启动设置场景
    if (this.scene) {
      this.scene.scene.start(SceneKeys.SETTINGS);
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
      this.bagButton = null;
      this.settingsButton = null;
    }
  }
}