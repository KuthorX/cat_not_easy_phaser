import { IUIComponent } from './IUIComponent';

export class ThoughtBubble implements IUIComponent {
  private scene: Phaser.Scene | null = null;
  private currentBubble: Phaser.GameObjects.Container | null = null;
  private currentTimeout: Phaser.Time.TimerEvent | null = null;

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  showThought(
    thoughtId: string,
    text: string,
    x: number,
    y: number,
    duration: number = 3000
  ): void {
    if (!this.scene) return;

    // 先隐藏当前的气泡
    this.hideCurrentThought();

    const bubble = this.scene.add.container(x, y);
    
    // 计算气泡大小
    const textWidth = text.length * 8;
    const bubbleWidth = Math.min(textWidth + 40, 300);
    const bubbleHeight = 80;

    // 创建气泡背景（使用虚线边框表示想法）
    const background = this.scene.add.rectangle(0, 0, bubbleWidth, bubbleHeight, 0xFFFFFF, 0.9);
    background.setStrokeStyle(2, 0x000000, 0.5);

    // 创建文本
    const textElement = this.scene.add.text(0, 0, text, {
      fontSize: '16px',
      color: '#000000',
      fontStyle: 'italic',
      wordWrap: { width: bubbleWidth - 20 }
    });
    textElement.setOrigin(0.5);

    // 创建小圆点表示想法
    const dots = this.createThoughtDots(bubbleWidth, bubbleHeight);

    bubble.add([background, textElement, ...dots]);
    bubble.setDepth(1001);

    // 设置位置（在右下角显示）
    bubble.setPosition(x - bubbleWidth / 2, y - bubbleHeight / 2);

    this.currentBubble = bubble;

    // 设置自动隐藏
    this.currentTimeout = this.scene.time.delayedCall(duration, () => {
      this.hideCurrentThought();
    });
  }

  private createThoughtDots(width: number, height: number): Phaser.GameObjects.Graphics[] {
    const dots: Phaser.GameObjects.Graphics[] = [];
    const dotSize = 3;
    const spacing = 8;

    // 创建3个小圆点
    for (let i = 0; i < 3; i++) {
      const dot = this.scene!.add.graphics();
      dot.fillStyle(0x000000, 0.7);
      dot.fillCircle(0, 0, dotSize);
      
      // 位置在气泡右侧
      dot.setPosition(width / 2 + 10 + i * spacing, height / 2 - 10);
      dots.push(dot);
    }

    return dots;
  }

  hideThought(thoughtId: string): void {
    // 这个方法现在只是hideCurrentThought的别名
    this.hideCurrentThought();
  }

  private hideCurrentThought(): void {
    if (this.currentBubble) {
      this.currentBubble.destroy();
      this.currentBubble = null;
    }
    
    if (this.currentTimeout) {
      this.currentTimeout.destroy();
      this.currentTimeout = null;
    }
  }

  hideAllThoughts(): void {
    this.hideCurrentThought();
  }

  show(): void {
    // 想法气泡组件不需要统一的显示方法
  }

  hide(): void {
    this.hideCurrentThought();
  }

  destroy(): void {
    this.hideCurrentThought();
  }
} 