import { SceneKeys } from '../constants/SceneKeys';
import { TextRenderer } from '../utils/TextRenderer';
import { AchievementRegistry } from '../data/AchievementRegistry';

// 成就ID到结局插画的映射
const ENDING_IMAGES: Record<string, string> = {
  play_time: 'endings_playtime',
  hooligan: 'endings_husky',
  good_cat: 'endings_allies_of_two_legged_beast',
  logistics: 'endings_logistics_officer'
};

interface EndingData {
  achievementId?: string;
  reason?: 'achievement' | 'time_up';
}

/**
 * 结局画面：全屏展示结局插画，并说明获得了哪个结局、为什么。
 * 不继承 BaseScene，避免在结局画面上叠加 HUD 和房间交互。
 */
export class AchievementEndingScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.ACHIEVEMENT_ENDING);
  }

  create(data: EndingData): void {
    this.input.enabled = true;
    this.add.rectangle(640, 360, 1280, 720, 0x000000);

    const achievementId = data?.achievementId ?? '';
    const imageKey = ENDING_IMAGES[achievementId];
    if (imageKey && this.textures.exists(imageKey)) {
      this.add.image(640, 360, imageKey).setDisplaySize(1280, 720);
    }

    const registry: AchievementRegistry = (window as any).game?.achievementRegistry ?? new AchievementRegistry();
    const achievement = registry.getAchievement(achievementId);
    const reasonText = data?.reason === 'time_up' ? '21:00，两脚兽回家了。' : '目标达成，今天提前收工！';

    this.add.rectangle(640, 640, 1280, 160, 0xffffff, 0.88);
    TextRenderer.createCenteredText(this, 640, 590, `结局：${achievement?.name ?? '我的一天结束啦'}`, {
      fontSize: '30px',
      color: '#000000',
      fontStyle: 'bold'
    });
    TextRenderer.createCenteredText(this, 640, 632, `${reasonText}${achievement?.description ?? ''}`, {
      fontSize: '18px',
      color: '#333333',
      wordWrap: { width: 1100 }
    });

    this.createRestartButton();
  }

  private createRestartButton(): void {
    const restartButton = this.add.rectangle(640, 685, 200, 40, 0x4CAF50);
    restartButton.setInteractive({ useHandCursor: true });
    TextRenderer.createCenteredText(this, 640, 685, '再来一天', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    restartButton.on('pointerdown', () => this.restart());
    restartButton.on('pointerover', () => restartButton.setFillStyle(0x66BB6A));
    restartButton.on('pointerout', () => restartButton.setFillStyle(0x4CAF50));
  }

  private restart(): void {
    const game = (window as any).game;
    game?.gameManager?.resetGame();
    this.scene.start(SceneKeys.MENU);
  }
}
