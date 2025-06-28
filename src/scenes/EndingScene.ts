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

    switch (endingType) {
      case 'time_up':
        title = '时间到了';
        description = '主人回来了，你的一天结束了。';
        color = 0xffd700;
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
    TextRenderer.createCenteredText(this, 640, 200, title, {
      fontSize: '48px',
      color: `#${color.toString(16)}`,
      fontStyle: 'bold'
    });

    // 显示结局描述
    TextRenderer.createCenteredText(this, 640, 280, description, {
      fontSize: '24px',
      color: '#ffffff'
    });

    // 显示游戏统计
    this.showGameStats(gameState);

    // 显示重新开始按钮
    this.createRestartButton();
  }

  private showGameStats(gameState: any): void {
    const statsY = 400;
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

  private createRestartButton(): void {
    const button = this.add.rectangle(640, 600, 200, 50, 0x666666);
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

    TextRenderer.createCenteredText(this, 640, 600, '重新开始', {
      fontSize: '20px',
      color: '#ffffff'
    });
  }
} 