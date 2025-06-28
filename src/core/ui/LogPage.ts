import { IUIComponent } from './IUIComponent';
import { AchievementRegistry } from '../../data/AchievementRegistry';

export class LogPage implements IUIComponent {
  private scene: Phaser.Scene | null = null;
  private container: Phaser.GameObjects.Container | null = null;
  private background: Phaser.GameObjects.Rectangle | null = null;
  private title: Phaser.GameObjects.Text | null = null;
  private closeButton: Phaser.GameObjects.Text | null = null;
  private scrollContainer: Phaser.GameObjects.Container | null = null;
  private achievementRegistry: AchievementRegistry | null = null;
  private gameState: any = null;

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    this.createLogPage();
  }

  private createLogPage(): void {
    if (!this.scene) return;

    this.container = this.scene.add.container(640, 360);

    // 背景
    this.background = this.scene.add.rectangle(0, 0, 800, 600, 0x000000, 0.8);
    this.background.setStrokeStyle(2, 0xffffff);

    // 标题
    this.title = this.scene.add.text(0, -250, '日志页 - 成就路线提示', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.title.setOrigin(0.5);

    // 关闭按钮
    this.closeButton = this.scene.add.text(350, -250, '✕', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#ff0000',
      padding: { x: 8, y: 4 }
    });
    this.closeButton.setOrigin(0.5);
    this.closeButton.setInteractive();
    this.closeButton.on('pointerdown', () => this.hide());
    this.closeButton.on('pointerover', () => this.closeButton?.setStyle({ backgroundColor: '#cc0000' }));
    this.closeButton.on('pointerout', () => this.closeButton?.setStyle({ backgroundColor: '#ff0000' }));

    // 滚动容器
    this.scrollContainer = this.scene.add.container(0, -200);

    this.container.add([this.background, this.title, this.closeButton, this.scrollContainer]);
    this.container.setDepth(2000);
    this.hide();
  }

  setAchievementRegistry(registry: AchievementRegistry): void {
    this.achievementRegistry = registry;
  }

  setGameState(gameState: any): void {
    this.gameState = gameState;
  }

  private createAchievementItems(): void {
    if (!this.scrollContainer || !this.achievementRegistry || !this.gameState || !this.scene) return;

    // 清空现有内容
    this.scrollContainer.removeAll();

    const achievements = this.achievementRegistry.getAllAchievements();
    let yOffset = 0;

    achievements.forEach((achievement, index) => {
      // 成就标题
      const title = this.scene.add.text(-350, yOffset, `${achievement.name}`, {
        fontSize: '18px',
        color: '#ffff00',
        fontStyle: 'bold'
      });
      title.setOrigin(0, 0);

      // 成就描述
      const description = this.scene.add.text(-350, yOffset + 25, achievement.description, {
        fontSize: '14px',
        color: '#ffffff',
        wordWrap: { width: 650 }
      });
      description.setOrigin(0, 0);

      // 进度信息
      const progress = this.achievementRegistry.getAchievementProgress(achievement.id, this.gameState);
      const progressText = this.scene.add.text(-350, yOffset + 50, `进度: ${progress.current}/${progress.total}`, {
        fontSize: '12px',
        color: '#cccccc'
      });
      progressText.setOrigin(0, 0);

      // 条件列表
      let conditionY = yOffset + 70;
      achievement.conditions.forEach((condition, condIndex) => {
        const isCompleted = this.checkConditionCompleted(condition);
        const conditionText = this.scene.add.text(-330, conditionY, `• ${this.getConditionDescription(condition)}`, {
          fontSize: '12px',
          color: isCompleted ? '#00ff00' : '#ff6666'
        });
        conditionText.setOrigin(0, 0);
        conditionY += 15;
      });

      // 分隔线
      if (index < achievements.length - 1) {
        const separator = this.scene.add.rectangle(0, conditionY + 10, 700, 1, 0x666666);
        separator.setOrigin(0.5);
        this.scrollContainer.add(separator);
        yOffset = conditionY + 20;
      } else {
        yOffset = conditionY;
      }

      this.scrollContainer.add([title, description, progressText]);
    });

    // 调整滚动容器高度
    this.scrollContainer.setY(-200);
  }

  private checkConditionCompleted(condition: any): boolean {
    if (!this.gameState) return false;

    switch (condition.type) {
      case 'action_completed':
        return this.gameState.completedActions.has(condition.value);
      case 'item_destroyed':
        return this.gameState.destroyedItems.has(condition.value);
      case 'room_visited':
        return this.gameState.visitedRooms.has(condition.value);
      case 'inventory_has':
        return this.gameState.inventory.includes(condition.value);
      case 'story_flag':
        return this.gameState.storyFlags.get(condition.value) === condition.value;
      default:
        return false;
    }
  }

  private getConditionDescription(condition: any): string {
    switch (condition.type) {
      case 'action_completed':
        return `完成动作: ${condition.value}`;
      case 'item_destroyed':
        return `破坏物品: ${condition.value}`;
      case 'room_visited':
        return `访问房间: ${condition.value}`;
      case 'inventory_has':
        return `拥有物品: ${condition.value}`;
      case 'story_flag':
        return `故事标记: ${condition.value}`;
      default:
        return `未知条件: ${condition.value}`;
    }
  }

  show(): void {
    if (this.container) {
      this.container.setVisible(true);
      this.createAchievementItems();
    }
  }

  hide(): void {
    if (this.container) {
      this.container.setVisible(false);
    }
  }

  destroy(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
      this.background = null;
      this.title = null;
      this.closeButton = null;
      this.scrollContainer = null;
    }
  }
} 