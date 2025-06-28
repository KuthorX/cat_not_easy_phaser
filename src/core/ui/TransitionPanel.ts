import { IUIComponent } from './IUIComponent';

export interface TransitionConfig {
  text: string;
  leftButtonText: string;
  rightButtonText: string;
  leftButtonCallback?: () => void;
  rightButtonCallback?: () => void;
  backgroundColor?: number;
  textColor?: number;
  buttonColor?: number;
  buttonTextColor?: number;
}

export class TransitionPanel implements IUIComponent {
  private scene!: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private background!: Phaser.GameObjects.Rectangle;
  private text!: Phaser.GameObjects.Text;
  private leftButton!: Phaser.GameObjects.Container;
  private rightButton!: Phaser.GameObjects.Container;
  private config!: TransitionConfig;
  private fadeTween?: Phaser.Tweens.Tween;

  constructor(config: TransitionConfig) {
    this.config = {
      backgroundColor: 0x000000,
      textColor: 0xffffff,
      buttonColor: 0x4a4a4a,
      buttonTextColor: 0xffffff,
      ...config
    };
  }

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    this.createUI();
  }

  private createUI(): void {
    const { width, height } = this.scene.scale;

    // 创建容器
    this.container = this.scene.add.container(0, 0);

    // 创建背景
    this.background = this.scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      this.config.backgroundColor!,
      0.8
    );

    // 创建文本
    this.text = this.scene.add.text(
      width / 2,
      height / 2 - 100,
      this.config.text,
      {
        fontSize: '24px',
        color: `#${this.config.textColor!.toString(16).padStart(6, '0')}`,
        fontFamily: 'Arial',
        align: 'center',
        wordWrap: { width: width - 200 }
      }
    ).setOrigin(0.5);

    // 创建左按钮
    this.leftButton = this.createButton(
      width / 2 - 150,
      height / 2 + 100,
      this.config.leftButtonText,
      this.config.leftButtonCallback
    );

    // 创建右按钮
    this.rightButton = this.createButton(
      width / 2 + 150,
      height / 2 + 100,
      this.config.rightButtonText,
      this.config.rightButtonCallback
    );

    // 添加到容器
    this.container.add([this.background, this.text, this.leftButton, this.rightButton]);

    // 初始状态隐藏
    this.container.setAlpha(0);
  }

  private createButton(x: number, y: number, text: string, callback?: () => void): Phaser.GameObjects.Container {
    const buttonContainer = this.scene.add.container(x, y);

    // 按钮背景
    const buttonBg = this.scene.add.rectangle(0, 0, 200, 50, this.config.buttonColor!);
    
    // 按钮文本
    const buttonText = this.scene.add.text(0, 0, text, {
      fontSize: '18px',
      color: `#${this.config.buttonTextColor!.toString(16).padStart(6, '0')}`,
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    buttonContainer.add([buttonBg, buttonText]);

    // 添加交互
    buttonBg.setInteractive({ useHandCursor: true });
    
    // 悬停效果
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(this.config.buttonColor! + 0x222222);
    });
    
    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(this.config.buttonColor!);
    });

    // 点击效果
    buttonBg.on('pointerdown', () => {
      if (callback) {
        callback();
      }
    });

    return buttonContainer;
  }

  show(): void {
    // 淡入效果
    this.fadeTween = this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });
  }

  hide(): void {
    // 淡出效果
    this.fadeTween = this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      }
    });
  }

  destroy(): void {
    if (this.fadeTween) {
      this.fadeTween.stop();
    }
    if (this.container) {
      this.container.destroy();
    }
  }

  update(): void {
    // 可以在这里添加更新逻辑
  }
} 