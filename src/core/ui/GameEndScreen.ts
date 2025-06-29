import { IUIComponent } from './IUIComponent';
import { TextRenderer } from '../../utils/TextRenderer';
import { SceneKeys } from '@/constants/SceneKeys';

export class GameEndScreen implements IUIComponent {
  private scene: Phaser.Scene | null = null;
  private container: Phaser.GameObjects.Container | null = null;
  private game: Phaser.Game | null = null;

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    this.game = scene.game;
  }

  showGameEnd(endingType: string): void {
    if (!this.scene || !this.game) return;

    this.hide(); // 先隐藏之前的结束界面

    this.container = this.scene.add.container(640, 360);
    
    const background = this.scene.add.rectangle(0, 0, 800, 600, 0x000000, 0.8);
    
    const title = TextRenderer.createCenteredText(this.scene, 0, -200, '游戏结束', {
      fontSize: '48px',
      color: '#ffffff'
    });

    const endingText = TextRenderer.createCenteredText(this.scene, 0, -100, this.getEndingText(endingType), {
      fontSize: '24px',
      color: '#ffffff',
      wordWrap: { width: 700 }
    });

    const restartButton = this.scene.add.rectangle(0, 100, 200, 50, 0x4A4A4A);
    restartButton.setInteractive();
    restartButton.on('pointerdown', () => {
      if (this.scene) {
        this.scene.scene.start(SceneKeys.MENU);
      }
    });

    const restartText = TextRenderer.createCenteredText(this.scene, 0, 100, '重新开始', {
      fontSize: '20px',
      color: '#ffffff'
    });


    this.container.add([background, title, endingText, restartButton, restartText]);
    this.container.setDepth(1002);
  }

  private getEndingText(endingType: string): string {
    const endingTexts: Record<string, string> = {
      'time_up': '时间到了，主人回家了！',
      'play_time': '你度过了愉快的玩耍时光！',
      'hooligan': '你成为了猫中哈士奇！',
      'good_cat': '你是一只温顺的好猫！',
      'runaway': '你成功离家出走了！',
      'logistics': '你成为了优秀的后勤官！',
      'trap_master': '你布置了完美的陷阱！'
    };
    
    return endingTexts[endingType] || '游戏结束';
  }

  show(): void {
    if (this.container) {
      this.container.setVisible(true);
    }
  }

  hide(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }

  destroy(): void {
    this.hide();
  }
} 