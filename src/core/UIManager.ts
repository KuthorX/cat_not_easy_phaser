import { GameEvents } from '../constants/GameEvents';
import { GameConstants } from '../config/GameConfig';

export class UIManager {
  private game: Phaser.Game;
  private uiScene: Phaser.Scene | null = null;
  private statusBar: Phaser.GameObjects.Container | null = null;
  private actionMenu: Phaser.GameObjects.Container | null = null;
  private dialogueBox: Phaser.GameObjects.Container | null = null;
  private inventoryPanel: Phaser.GameObjects.Container | null = null;
  private achievementPopup: Phaser.GameObjects.Container | null = null;

  constructor(game: Phaser.Game) {
    this.game = game;
  }

  // 初始化UI
  public initialize(scene: Phaser.Scene): void {
    this.uiScene = scene;
    this.createStatusBar();
    this.createActionMenu();
    this.createDialogueBox();
    this.createInventoryPanel();
    this.createAchievementPopup();
    
    // 初始隐藏一些UI元素
    this.hideActionMenu();
    this.hideDialogueBox();
    this.hideInventoryPanel();
    this.hideAchievementPopup();
  }

  // 创建状态栏
  private createStatusBar(): void {
    if (!this.uiScene) return;

    this.statusBar = this.uiScene.add.container(10, 10);

    // 时间显示
    const timeText = this.uiScene.add.text(0, 0, '时间: 8:00', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 2 }
    });

    // 饥饿值显示
    const hungerText = this.uiScene.add.text(0, 30, '饥饿: 1/5', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#8B4513',
      padding: { x: 5, y: 2 }
    });

    // 精力值显示
    const energyText = this.uiScene.add.text(0, 60, '精力: 1/5', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#4169E1',
      padding: { x: 5, y: 2 }
    });

    this.statusBar.add([timeText, hungerText, energyText]);
    this.statusBar.setDepth(1000);
  }

  // 创建动作菜单
  private createActionMenu(): void {
    if (!this.uiScene) return;

    this.actionMenu = this.uiScene.add.container(-1000, -1000); // 初始位置设为屏幕外
    this.actionMenu.setDepth(1000);
    this.actionMenu.setVisible(false); // 初始时隐藏菜单
  }

  // 创建对话框
  private createDialogueBox(): void {
    if (!this.uiScene) return;

    this.dialogueBox = this.uiScene.add.container(640, 600);
    
    // 背景
    const background = this.uiScene.add.rectangle(0, 0, 800, 100, 0x000000, 0.8);
    
    // 文本
    const text = this.uiScene.add.text(0, 0, '', {
      fontSize: '18px',
      color: '#ffffff',
      wordWrap: { width: 780 }
    });
    text.setOrigin(0.5);

    this.dialogueBox.add([background, text]);
    this.dialogueBox.setDepth(1000);
  }

  // 创建物品栏
  private createInventoryPanel(): void {
    if (!this.uiScene) return;

    this.inventoryPanel = this.uiScene.add.container(640, 360);
    
    // 背景
    const background = this.uiScene.add.rectangle(0, 0, 400, 300, 0x000000, 0.9);
    
    // 标题
    const title = this.uiScene.add.text(0, -120, '物品栏', {
      fontSize: '24px',
      color: '#ffffff'
    });
    title.setOrigin(0.5);

    // 物品列表容器
    const itemsContainer = this.uiScene.add.container(0, 0);

    this.inventoryPanel.add([background, title, itemsContainer]);
    this.inventoryPanel.setDepth(1000);
  }

  // 创建成就弹窗
  private createAchievementPopup(): void {
    if (!this.uiScene) return;

    this.achievementPopup = this.uiScene.add.container(640, 200);
    
    // 背景
    const background = this.uiScene.add.rectangle(0, 0, 400, 100, 0xFFD700, 0.9);
    background.setStrokeStyle(2, 0x000000);
    
    // 标题
    const title = this.uiScene.add.text(0, -30, '成就解锁！', {
      fontSize: '20px',
      color: '#000000',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 成就名称
    const achievementName = this.uiScene.add.text(0, 0, '', {
      fontSize: '16px',
      color: '#000000'
    });
    achievementName.setOrigin(0.5);

    this.achievementPopup.add([background, title, achievementName]);
    this.achievementPopup.setDepth(1001);
  }

  // 更新状态栏
  public updateStatusBar(time: number, hunger: number, energy: number): void {
    if (!this.statusBar) return;

    const timeText = this.statusBar.getAt(0) as Phaser.GameObjects.Text;
    const hungerText = this.statusBar.getAt(1) as Phaser.GameObjects.Text;
    const energyText = this.statusBar.getAt(2) as Phaser.GameObjects.Text;

    const hours = Math.floor(time);
    const minutes = Math.floor((time - hours) * 60);
    timeText.setText(`时间: ${hours}:${minutes.toString().padStart(2, '0')}`);
    
    hungerText.setText(`饥饿: ${hunger}/${GameConstants.MAX_HUNGER}`);
    energyText.setText(`精力: ${energy}/${GameConstants.MAX_ENERGY}`);
  }

  // 显示动作菜单
  public showActionMenu(actions: any[], x: number = 1280 - 300, y: number = 10): void {
    if (!this.uiScene) return;

    // 先隐藏并销毁旧的菜单
    this.hideActionMenu();
    
    // 创建新的菜单容器
    this.actionMenu = this.uiScene.add.container(x, y);
    this.actionMenu.setDepth(1000);
    
    // 确保菜单显示在屏幕内
    const menuWidth = 280;
    const menuHeight = actions.length * 40;
    
    // 调整 x 坐标，确保菜单不超出屏幕右边界
    if (x + menuWidth > 1280) {
      x = 1280 - menuWidth - 10;
      this.actionMenu.setPosition(x, y);
    }
    
    // 调整 y 坐标，确保菜单不超出屏幕下边界
    if (y + menuHeight > 720) {
      y = 720 - menuHeight - 10;
      this.actionMenu.setPosition(x, y);
    }
    
    // 确保坐标不为负数
    if (x < 10) {
      x = 10;
      this.actionMenu.setPosition(x, y);
    }
    if (y < 10) {
      y = 10;
      this.actionMenu.setPosition(x, y);
    }
    
    actions.forEach((action, index) => {
      const button = this.uiScene!.add.rectangle(0, index * 40, 280, 35, 0x4A4A4A, 0.8);
      button.setStrokeStyle(1, 0xFFFFFF);
      
      const text = this.uiScene!.add.text(0, index * 40, action.name, {
        fontSize: '14px',
        color: '#ffffff'
      });
      text.setOrigin(0.5);

      button.setInteractive();
      button.on('pointerdown', () => {
        this.executeAction(action.id);
      });

      this.actionMenu!.add([button, text]);
    });
  }

  // 隐藏动作菜单
  public hideActionMenu(): void {
    if (this.actionMenu) {
      this.actionMenu.destroy();
      this.actionMenu = null;
    }
  }

  // 显示对话框
  public showDialogue(text: string, duration: number = 3000): void {
    if (!this.dialogueBox) return;

    const textElement = this.dialogueBox.getAt(1) as Phaser.GameObjects.Text;
    textElement.setText(text);
    this.dialogueBox.setVisible(true);

    if (duration > 0) {
      this.uiScene!.time.delayedCall(duration, () => {
        this.hideDialogueBox();
      });
    }
  }

  // 隐藏对话框
  public hideDialogueBox(): void {
    if (this.dialogueBox) {
      this.dialogueBox.setVisible(false);
    }
  }

  // 更新物品栏
  public updateInventory(inventory: string[]): void {
    if (!this.inventoryPanel) return;

    const itemsContainer = this.inventoryPanel.getAt(2) as Phaser.GameObjects.Container;
    itemsContainer.removeAll();

    inventory.forEach((item, index) => {
      const itemText = this.uiScene!.add.text(0, index * 25, `• ${item}`, {
        fontSize: '14px',
        color: '#ffffff'
      });
      itemText.setOrigin(0, 0.5);
      itemsContainer.add(itemText);
    });
  }

  // 显示物品栏
  public showInventoryPanel(): void {
    if (this.inventoryPanel) {
      this.inventoryPanel.setVisible(true);
    }
  }

  // 隐藏物品栏
  public hideInventoryPanel(): void {
    if (this.inventoryPanel) {
      this.inventoryPanel.setVisible(false);
    }
  }

  // 显示成就弹窗
  public showAchievementPopup(achievementName: string): void {
    if (!this.achievementPopup) return;

    const achievementText = this.achievementPopup.getAt(2) as Phaser.GameObjects.Text;
    achievementText.setText(achievementName);
    this.achievementPopup.setVisible(true);

    // 3秒后自动隐藏
    this.uiScene!.time.delayedCall(3000, () => {
      this.hideAchievementPopup();
    });
  }

  // 隐藏成就弹窗
  public hideAchievementPopup(): void {
    if (this.achievementPopup) {
      this.achievementPopup.setVisible(false);
    }
  }

  // 执行动作
  private executeAction(actionId: string): void {
    console.log('UIManager.executeAction 被调用，动作ID:', actionId);
    
    // 隐藏菜单
    this.hideActionMenu();
    
    // 获取当前场景并执行动作
    const currentScene = this.game.scene.getScene('LivingRoomNorthScene') || 
                        this.game.scene.getScene('LivingRoomEastScene') ||
                        this.game.scene.getScene('LivingRoomWestLowScene') ||
                        this.game.scene.getScene('LivingRoomWestHighScene') ||
                        this.game.scene.getScene('LivingRoomDoorScene') ||
                        this.game.scene.getScene('BalconyScene') ||
                        this.game.scene.getScene('RoomBScene') ||
                        this.game.scene.getScene('HallwayScene') ||
                        this.game.scene.getScene('DoorwayScene');
    
    console.log('找到当前场景:', currentScene?.scene.key);
    
    if (currentScene && (currentScene as any).executeAction) {
      console.log('调用场景的 executeAction 方法');
      (currentScene as any).executeAction(actionId);
    } else {
      console.error('无法找到当前场景或场景没有 executeAction 方法');
    }
  }

  // 显示游戏结束界面
  public showGameEndScreen(endingType: string): void {
    if (!this.uiScene) return;

    const endContainer = this.uiScene.add.container(640, 360);
    
    const background = this.uiScene.add.rectangle(0, 0, 800, 600, 0x000000, 0.8);
    
    const title = this.uiScene.add.text(0, -200, '游戏结束', {
      fontSize: '48px',
      color: '#ffffff'
    });
    title.setOrigin(0.5);

    const endingText = this.uiScene.add.text(0, -100, this.getEndingText(endingType), {
      fontSize: '24px',
      color: '#ffffff',
      wordWrap: { width: 700 }
    });
    endingText.setOrigin(0.5);

    const restartButton = this.uiScene.add.rectangle(0, 100, 200, 50, 0x4A4A4A);
    restartButton.setInteractive();
    restartButton.on('pointerdown', () => {
      this.game.scene.start('MenuScene');
    });

    const restartText = this.uiScene.add.text(0, 100, '重新开始', {
      fontSize: '20px',
      color: '#ffffff'
    });
    restartText.setOrigin(0.5);

    endContainer.add([background, title, endingText, restartButton, restartText]);
    endContainer.setDepth(1002);
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
} 