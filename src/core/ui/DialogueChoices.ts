import { IUIComponent } from './IUIComponent';
import { DialogueBubblePosition, DialogueChoice } from '../../types/GameState';

export class DialogueChoices implements IUIComponent {
  private scene: Phaser.Scene | null = null;
  private container: Phaser.GameObjects.Container | null = null;
  private onChoiceSelected: ((choiceId: string) => void) | null = null;

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    this.createDialogueChoices();
  }

  private createDialogueChoices(): void {
    if (!this.scene) return;

    this.container = this.scene.add.container(640, 500);
    this.container.setDepth(1001);
  }

  setChoiceCallback(callback: (choiceId: string) => void): void {
    this.onChoiceSelected = callback;
  }

  showChoices(choices: DialogueChoice[], bubblePosition: DialogueBubblePosition): void {
    if (!this.container || !this.scene) return;

    this.hideChoices();

    choices.forEach((choice, index) => {
      const button = this.scene!.add.rectangle(0, index * 50, 200, 40, 0x4A4A4A, 0.8);
      button.setStrokeStyle(1, 0xFFFFFF);
      
      const text = this.scene!.add.text(0, index * 50, choice.text, {
        fontSize: '14px',
        color: '#ffffff'
      });
      text.setOrigin(0.5);

      button.setInteractive();
      button.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        // 阻止事件冒泡，避免触发场景的点击事件
        pointer.event.stopPropagation();
        this.selectChoice(choice.id);
      });

      this.container!.add([button, text]);
    });

    // 根据最后一个对话框的位置设置选项框位置
    let optionsX = bubblePosition.x;
    let optionsY = bubblePosition.y;

    // 根据最后一个对话框的方向决定选项框位置
    if (bubblePosition.direction === 'right') {
      // 对话框向右，选项框在右侧
      optionsX = bubblePosition.x + 200;
    } else if (bubblePosition.direction === 'left') {
      // 对话框向左，选项框在左侧
      optionsX = bubblePosition.x - 200;
    } else if (bubblePosition.direction === 'up') {
      // 对话框向上，选项框在右侧
      optionsX = bubblePosition.x + 200;
    } else if (bubblePosition.direction === 'down') {
      // 对话框向下，选项框在右侧
      optionsX = bubblePosition.x + 200;
    }

    // 确保选项框不超出屏幕边界
    const optionsWidth = 200;
    const optionsHeight = choices.length * 50;
    
    if (optionsX < optionsWidth / 2) {
      optionsX = optionsWidth / 2;
    } else if (optionsX > 1280 - optionsWidth / 2) {
      optionsX = 1280 - optionsWidth / 2;
    }
    
    if (optionsY < optionsHeight / 2) {
      optionsY = optionsHeight / 2;
    } else if (optionsY > 720 - optionsHeight / 2) {
      optionsY = 720 - optionsHeight / 2;
    }

    // 确保位置有效
    if (isNaN(optionsX) || isNaN(optionsY)) {
      // 如果位置无效，使用默认位置
      optionsX = 640;
      optionsY = 360;
    }

    console.log('设置选项框位置:', { optionsX, optionsY, bubblePosition });
    this.container.setPosition(optionsX, optionsY);
    // 设置渲染层级到正常值，确保选项框可见
    this.container.setDepth(1000);
  }

  private selectChoice(choiceId: string): void {
    console.log('选择对话选项:', choiceId);
    if (this.onChoiceSelected) {
      this.onChoiceSelected(choiceId);
    }
    this.hideChoices();
  }

  hideChoices(): void {
    if (this.container) {
      this.container.removeAll(true);
      // 设置到最底层来隐藏选项框
      this.container.setDepth(-9999);
    }
  }

  show(): void {
    if (this.container) {
      this.container.setDepth(1000);
    }
  }

  hide(): void {
    this.hideChoices();
  }

  destroy(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
} 