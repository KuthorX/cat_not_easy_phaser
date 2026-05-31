import { SceneKeys } from '../constants/SceneKeys';
import { TextRenderer } from '../utils/TextRenderer';

export class ThanksScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.THANKS);
  }

  create(): void {
    // 设置背景
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8);
    
    // 标题
    TextRenderer.createCenteredText(this, 640, 80, '制作人员', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 制作人员信息 - 4列布局
    this.createStaffSection();

    // 返回按钮
    this.createBackButton();
  }

  private createStaffSection(): void {
    const startY = 150;
    const lineHeight = 35;
    const columnWidth = 320; // 每列宽度
    const columnGap = 0; // 列间距
    const totalWidth = columnWidth * 4 + columnGap * 3;
    const startX = 640 - totalWidth / 2 + columnWidth / 2; // 居中开始

    // 第一列：策划
    this.createColumn(startX, startY, '策划', [
      '叶灵心'
    ], lineHeight);

    // 第二列：美术
    this.createColumn(startX + columnWidth + columnGap, startY, '美术', [
      '那子你所',
      '渡渡'
    ], lineHeight);

    // 第三列：程序
    this.createColumn(startX + (columnWidth + columnGap) * 2, startY, '程序', [
      'UKO19',
      'GhostFlying', 
      'KuthorX'
    ], lineHeight, [
      'https://github.com/int33',
      'https://github.com/GhostFlying',
      'https://kuthorx.github.io/'
    ]);

    // 第四列：音乐来源
    this.createColumn(startX + (columnWidth + columnGap) * 3, startY, '音乐来源', [
      'Thanks for joshuuu',
      '《High End Party》'
    ], lineHeight, [
      'https://joshuuu.itch.io/short-loopable-background-music',
      'https://joshuuu.itch.io/short-loopable-background-music'
    ]);
  }

  private createColumn(x: number, startY: number, title: string, items: string[], lineHeight: number, urls?: string[]): void {
    let currentY = startY;

    // 列标题
    TextRenderer.createCenteredText(this, x, currentY, title, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    currentY += lineHeight;

    // 列内容
    items.forEach((item, index) => {
      if (urls && urls[index]) {
        // 带超链接的文本
        this.createClickableText(x, currentY, item, urls[index]);
      } else {
        // 普通文本
        TextRenderer.createCenteredText(this, x, currentY, item, {
          fontSize: '18px',
          color: '#ffffff'
        });
      }
      currentY += lineHeight;
    });
  }

  private createClickableText(x: number, y: number, text: string, url: string): void {
    const textObj = TextRenderer.createCenteredText(this, x, y, text, {
      fontSize: '18px',
      color: '#4CAF50',
      fontStyle: 'bold'
    });

    // 添加下划线效果
    const underline = this.add.rectangle(x, y + 12, textObj.width, 2, 0x4CAF50);
    underline.setDepth(textObj.depth + 1);

    // 设置交互
    textObj.setInteractive();
    underline.setInteractive();

    // 悬停效果
    const hoverEffect = () => {
      textObj.setColor('#66BB6A');
      underline.setFillStyle(0x66BB6A);
    };

    const leaveEffect = () => {
      textObj.setColor('#4CAF50');
      underline.setFillStyle(0x4CAF50);
    };

    textObj.on('pointerover', hoverEffect);
    textObj.on('pointerout', leaveEffect);
    underline.on('pointerover', hoverEffect);
    underline.on('pointerout', leaveEffect);

    // 点击事件
    const clickHandler = () => {
      window.open(url, '_blank');
    };

    textObj.on('pointerdown', clickHandler);
    underline.on('pointerdown', clickHandler);
  }

  private createBackButton(): void {
    const button = this.add.rectangle(640, 650, 200, 50, 0x666666);
    button.setInteractive();
    
    button.on('pointerdown', () => {
      this.scene.start(SceneKeys.MENU);
    });

    button.on('pointerover', () => {
      button.setFillStyle(0x888888);
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x666666);
    });

    TextRenderer.createCenteredText(this, 640, 650, '返回', {
      fontSize: '20px',
      color: '#ffffff'
    });
  }
} 