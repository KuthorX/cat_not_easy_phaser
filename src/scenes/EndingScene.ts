import { BaseScene } from './BaseScene';
import { SceneKeys } from '../constants/SceneKeys';
import { GameEvents } from '../constants/GameEvents';
import { TextRenderer } from '../utils/TextRenderer';

export class EndingScene extends BaseScene {
  constructor() {
    super(SceneKeys.ENDING);
  }

  protected initializeScene(): void {
    // 设置背景
    this.add.rectangle(640, 360, 1280, 720, 0x000000); // 黑色背景
    
    // 获取游戏状态
    const gameState = this.gameManager?.getState();
    if (!gameState) return;

    // 根据游戏状态显示不同结局
    this.showEnding(gameState);
  }

  private showEnding(gameState: any): void {
    const endingType = gameState.endingType;
    let title = '';
    let description = '';
    let color = 0xffffff;
    let showEndingImage = false;

    switch (endingType) {
      case 'time_up':
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
        const endingSprite = this.add.image(640, 360, randomImage);
        endingSprite.setDisplaySize(1280, 720);
        endingSprite.setOrigin(0.5);
        
        // 设置标题和描述
        title = '时间到了';
        description = '主人回来了，你的一天结束了。';
        color = 0xffd700;
        showEndingImage = true;
        break;
      case 'escaped':
        title = '获得自由！';
        description = '你成功逃离了房子，获得了自由！';
        color = 0x00ff00;
        break;
      case 'energy_depleted':
        title = '精疲力尽';
        description = '你太累了，需要休息。';
        color = 0xff6b6b;
        break;
      case 'hunger_depleted':
        title = '饥饿难耐';
        description = '你太饿了，需要进食。';
        color = 0xffa500;
        break;
      default:
        title = '游戏结束';
        description = '游戏结束了。';
        color = 0xffffff;
    }

    // 显示结局标题
    if (showEndingImage) {
      // 如果有结局图片，在图片上方显示文字
      // 添加半透明背景确保文字可读性
      const textBg = this.add.rectangle(640, 150, 800, 100, 0x000000, 0.7);
      textBg.setOrigin(0.5);
      
      TextRenderer.createCenteredText(this, 640, 120, title, {
        fontSize: '48px',
        color: `#${color.toString(16)}`,
        fontStyle: 'bold'
      });

      TextRenderer.createCenteredText(this, 640, 180, description, {
        fontSize: '24px',
        color: '#ffffff'
      });
    } else {
      // 原来的显示方式
      TextRenderer.createCenteredText(this, 640, 200, title, {
        fontSize: '48px',
        color: `#${color.toString(16)}`,
        fontStyle: 'bold'
      });

      TextRenderer.createCenteredText(this, 640, 280, description, {
        fontSize: '24px',
        color: '#ffffff'
      });
    }

    // 显示游戏统计
    this.showGameStats(gameState, showEndingImage);

    // 显示重新开始按钮
    this.createRestartButton(showEndingImage);
  }

  private showGameStats(gameState: any, showEndingImage: boolean): void {
    const statsY = showEndingImage ? 500 : 400;
    const stats = [
      `访问房间数: ${gameState.visitedRooms.size}`,
      `完成动作数: ${gameState.completedActions.size}`,
      `获得成就数: ${gameState.achievements.length}`,
      `破坏物品数: ${gameState.destroyedItems.size}`,
      `游戏时间: ${Math.floor(gameState.currentTime)}小时`
    ];

    stats.forEach((stat, index) => {
      TextRenderer.createCenteredText(this, 640, statsY + index * 30, stat, {
        fontSize: '18px',
        color: '#cccccc'
      });
    });
  }

  private createRestartButton(showEndingImage: boolean): void {
    const buttonY = showEndingImage ? 650 : 600;
    const button = this.add.rectangle(640, buttonY, 200, 50, 0x666666);
    button.setInteractive();
    
    button.on('pointerdown', () => {
      // 重置游戏状态
      if (this.gameManager) {
        this.gameManager.resetGame();
      }
      
      // 跳转到菜单场景
      this.scene.start(SceneKeys.MENU);
    });

    button.on('pointerover', () => {
      button.setFillStyle(0x888888);
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x666666);
    });

    TextRenderer.createCenteredText(this, 640, buttonY, '重新开始', {
      fontSize: '20px',
      color: '#ffffff'
    });
  }
} 