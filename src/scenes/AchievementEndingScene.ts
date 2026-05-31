import { BaseScene } from './BaseScene';
import { SceneKeys } from '../constants/SceneKeys';
import { TextRenderer } from '../utils/TextRenderer';

export class AchievementEndingScene extends BaseScene {
  private achievementId: string = '';

  constructor() {
    super(SceneKeys.ACHIEVEMENT_ENDING);
  }

  protected initializeScene(): void {
    // 设置背景
    this.add.rectangle(640, 360, 1280, 720, 0x000000); // 黑色背景
    
    // 获取场景数据中的成就ID
    const sceneData = (this as any).scene.settings.data;
    this.achievementId = sceneData?.achievementId || '';
    
    console.log('AchievementEndingScene初始化:', { achievementId: this.achievementId });
    
    if (this.achievementId) {
      this.showAchievementEnding(this.achievementId);
    }
  }

  private showAchievementEnding(achievementId: string): void {
    // 成就ID到图片的映射
    const achievementImageMap: Record<string, string> = {
      'play_time': 'endings_playtime',
      'hooligan': 'endings_husky',
      'good_cat': 'endings_allies_of_two_legged_beast',
      'logistics': 'endings_logistics_officer'
    };

    const imageKey = achievementImageMap[achievementId];
    
    console.log('显示成就结束场景:', { achievementId, imageKey });
    
    if (imageKey) {
      // 检查图片是否存在
      if (this.textures.exists(imageKey)) {
        // 显示成就图片
        const achievementImage = this.add.image(640, 360, imageKey);
        achievementImage.setDisplaySize(800, 600); // 设置合适的显示尺寸
        achievementImage.setDepth(1);
        
        console.log('成就图片已显示:', imageKey);
      } else {
        console.error('图片不存在:', imageKey);
        // 显示错误信息
        TextRenderer.createCenteredText(this, 640, 300, `图片未找到: ${imageKey}`, {
          fontSize: '24px',
          color: '#ffffff'
        });
      }
    } else {
      console.error('未找到成就对应的图片:', achievementId);
      // 显示错误信息
      TextRenderer.createCenteredText(this, 640, 300, `未找到成就: ${achievementId}`, {
        fontSize: '24px',
        color: '#ffffff'
      });
    }

    // 添加重新开始按钮
    this.createRestartButton();
  }

  private createRestartButton(): void {
    // 创建重新开始按钮
    const restartButton = this.add.rectangle(640, 600, 200, 50, 0x4CAF50);
    restartButton.setInteractive();
    restartButton.setDepth(10);
    
    // 按钮文本
    TextRenderer.createCenteredText(this, 640, 600, '重新开始', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    
    // 点击事件
    restartButton.on('pointerdown', () => {
      console.log('重新开始游戏');
      this.scene.start(SceneKeys.MENU);
    });
    
    // 悬停效果
    restartButton.on('pointerover', () => {
      restartButton.setFillStyle(0x66BB6A);
    });
    
    restartButton.on('pointerout', () => {
      restartButton.setFillStyle(0x4CAF50);
    });
  }
} 