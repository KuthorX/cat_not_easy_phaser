import { IUIComponent } from './IUIComponent';
import { DialogueBubblePosition } from '../../types/GameState';
import { TextRenderer } from '../../utils/TextRenderer';

export class DialogueBubble implements IUIComponent {
  private scene: Phaser.Scene | null = null;
  private dialogueBubbles: Map<string, Phaser.GameObjects.Container> = new Map();

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  showBubble(
    bubbleId: string,
    text: string,
    position: DialogueBubblePosition,
    speaker: 'object' | 'cat' | 'system' | 'thought',
    duration: number = 0
  ): void {
    if (!this.scene) return;

    // 先隐藏已存在的同名气泡
    this.hideBubble(bubbleId);

    const bubble = this.scene.add.container(position.x, position.y);
    
    // 计算气泡大小
    const textWidth = text.length * 8;
    const bubbleWidth = Math.min(textWidth + 40, 300);
    const bubbleHeight = 80;

    // 根据说话者类型设置不同的背景颜色
    let backgroundColor = 0xFFFFFF;
    let textColor = '#000000';
    
    if (speaker === 'system') {
      backgroundColor = 0xFFD700; // 金色背景
      textColor = '#000000';
    } else if (speaker === 'cat') {
      backgroundColor = 0x87CEEB; // 天蓝色背景
      textColor = '#000000';
    } else {
      backgroundColor = 0xFFFFFF; // 白色背景
      textColor = '#000000';
    }

    // 创建气泡背景
    const background = this.scene.add.rectangle(0, 0, bubbleWidth, bubbleHeight, backgroundColor, 0.9);
    background.setStrokeStyle(2, 0x000000);

    // 创建文本
    const textElement = TextRenderer.createCenteredText(this.scene, 0, 0, text, {
      fontSize: '16px',
      color: textColor,
      wordWrap: { width: bubbleWidth - 20 }
    });

    // 创建小尾巴（指向说话者），系统消息不显示尾巴
    let tail: Phaser.GameObjects.Graphics | null = null;
    if (speaker !== 'system') {
      tail = this.createBubbleTail(position.direction, bubbleWidth, bubbleHeight);
    }

    const bubbleElements: any[] = [background, textElement];
    if (tail) {
      bubbleElements.push(tail);
    }
    
    bubble.add(bubbleElements);
    bubble.setDepth(1001);

    // 设置锚点
    if (position.anchor === 'left') {
      bubble.setPosition(position.x, position.y);
    } else if (position.anchor === 'right') {
      bubble.setPosition(position.x - bubbleWidth, position.y);
    } else {
      bubble.setPosition(position.x - bubbleWidth / 2, position.y - bubbleHeight / 2);
    }

    this.dialogueBubbles.set(bubbleId, bubble);

    // 如果设置了持续时间，自动隐藏
    if (duration > 0) {
      this.scene.time.delayedCall(duration, () => {
        this.hideBubble(bubbleId);
      });
    }
  }

  private createBubbleTail(direction: 'up' | 'down' | 'left' | 'right', width: number, height: number): Phaser.GameObjects.Graphics {
    const graphics = this.scene!.add.graphics();
    graphics.fillStyle(0xFFFFFF, 0.9);
    graphics.lineStyle(2, 0x000000);

    const tailSize = 10;
    let points: number[] = [];

    switch (direction) {
      case 'up':
        points = [
          -tailSize, height / 2,
          0, height / 2 + tailSize,
          tailSize, height / 2
        ];
        break;
      case 'down':
        points = [
          -tailSize, -height / 2,
          0, -height / 2 - tailSize,
          tailSize, -height / 2
        ];
        break;
      case 'left':
        points = [
          width / 2, -tailSize,
          width / 2 + tailSize, 0,
          width / 2, tailSize
        ];
        break;
      case 'right':
        points = [
          -width / 2, -tailSize,
          -width / 2 - tailSize, 0,
          -width / 2, tailSize
        ];
        break;
    }

    graphics.fillPoints(points, true, true);
    graphics.strokePoints(points, true, true);

    return graphics;
  }

  hideBubble(bubbleId: string): void {
    const bubble = this.dialogueBubbles.get(bubbleId);
    if (bubble) {
      bubble.destroy();
      this.dialogueBubbles.delete(bubbleId);
    }
  }

  hideAllBubbles(): void {
    this.dialogueBubbles.forEach(bubble => bubble.destroy());
    this.dialogueBubbles.clear();
  }

  show(): void {
    // 对话气泡组件不需要统一的显示方法
  }

  hide(): void {
    this.hideAllBubbles();
  }

  destroy(): void {
    this.hideAllBubbles();
  }
} 