import { GameEvents } from '../constants/GameEvents';
import { DialogueManager } from './DialogueManager';
import {
  StatusBar,
  ActionMenu,
  DialogueBox,
  InventoryPanel,
  AchievementPopup,
  DialogueUIManager,
  GameEndScreen,
  type Action
} from './ui';

export class UIManager {
  private game: Phaser.Game;
  private uiScene: Phaser.Scene | null = null;
  
  // UI 组件
  private statusBar: StatusBar;
  private actionMenu: ActionMenu;
  private dialogueBox: DialogueBox;
  private inventoryPanel: InventoryPanel;
  private achievementPopup: AchievementPopup;
  private dialogueUIManager: DialogueUIManager;
  private gameEndScreen: GameEndScreen;
  
  // 对话管理器
  private dialogueManager: DialogueManager | null = null;

  constructor(game: Phaser.Game) {
    this.game = game;
    
    // 初始化所有 UI 组件
    this.statusBar = new StatusBar();
    this.actionMenu = new ActionMenu();
    this.dialogueBox = new DialogueBox();
    this.inventoryPanel = new InventoryPanel();
    this.achievementPopup = new AchievementPopup();
    this.dialogueUIManager = new DialogueUIManager();
    this.gameEndScreen = new GameEndScreen();
  }

  // 设置对话管理器
  public setDialogueManager(dialogueManager: DialogueManager): void {
    this.dialogueManager = dialogueManager;
    this.dialogueUIManager.setCoreDialogueManager(dialogueManager);
  }

  // 初始化UI
  public initialize(scene: Phaser.Scene): void {
    this.uiScene = scene;
    
    // 初始化所有 UI 组件
    this.statusBar.initialize(scene);
    this.actionMenu.initialize(scene);
    this.dialogueBox.initialize(scene);
    this.inventoryPanel.initialize(scene);
    this.achievementPopup.initialize(scene);
    this.dialogueUIManager.initialize(scene);
    this.gameEndScreen.initialize(scene);
    
    // 设置动作菜单回调
    this.actionMenu.setActionCallback((actionId: string) => {
      this.executeAction(actionId);
    });
    
    // 初始隐藏一些UI元素
    this.hideActionMenu();
    this.hideDialogueBox();
    this.hideInventoryPanel();
    this.hideAchievementPopup();
    
    // 设置对话事件监听
    this.setupDialogueEventListeners();
  }

  // 设置对话事件监听
  private setupDialogueEventListeners(): void {
    // 通过全局游戏实例获取GameManager
    const game = (window as any).game;
    if (!game || !game.gameManager) {
      console.error('无法获取GameManager');
      return;
    }
    
    // 监听对话开始事件
    game.gameManager.on(GameEvents.DIALOGUE_STARTED, (data: { dialogueId: string, objectId: string }) => {
      this.onDialogueStarted(data);
    });
    
    // 监听对话结束事件
    game.gameManager.on(GameEvents.DIALOGUE_ENDED, () => {
      this.onDialogueEnded();
    });
  }

  // 对话开始事件处理
  private onDialogueStarted(data: { dialogueId: string, objectId: string }): void {
    console.log('UIManager.onDialogueStarted 被调用:', data);
    
    // 在开始新对话前，先清理所有旧的对话元素
    this.dialogueUIManager.hide();
    
    if (this.dialogueManager) {
      console.log('dialogueManager 存在，调用 updateDialogueDisplay');
      this.dialogueUIManager.updateDialogueDisplay();
    } else {
      console.error('dialogueManager 不存在！');
    }
  }

  // 对话结束事件处理
  private onDialogueEnded(): void {
    console.log('UIManager.onDialogueEnded 被调用');
    this.dialogueUIManager.hide();
  }

  // 更新状态栏
  public updateStatusBar(time: number, hunger: number, energy: number): void {
    this.statusBar.update(time, hunger, energy);
  }

  // 显示动作菜单
  public showActionMenu(actions: Action[], x: number = 1280 - 300, y: number = 10): void {
    this.actionMenu.showMenu(actions, x, y);
  }

  // 隐藏动作菜单
  public hideActionMenu(): void {
    this.actionMenu.hide();
  }

  // 显示对话框
  public showDialogue(text: string, duration: number = 3000): void {
    this.dialogueBox.showText(text, duration);
  }

  // 隐藏对话框
  public hideDialogueBox(): void {
    this.dialogueBox.hide();
  }

  // 更新物品栏
  public updateInventory(inventory: string[]): void {
    this.inventoryPanel.updateInventory(inventory);
  }

  // 显示物品栏
  public showInventoryPanel(): void {
    this.inventoryPanel.show();
  }

  // 隐藏物品栏
  public hideInventoryPanel(): void {
    this.inventoryPanel.hide();
  }

  // 显示成就弹窗
  public showAchievementPopup(achievementName: string): void {
    this.achievementPopup.showAchievement(achievementName);
  }

  // 隐藏成就弹窗
  public hideAchievementPopup(): void {
    this.achievementPopup.hide();
  }

  // 执行动作
  private executeAction(actionId: string): void {
    console.log('UIManager.executeAction 被调用，动作ID:', actionId);
    
    // 隐藏菜单
    this.hideActionMenu();
    
    // 通过全局游戏实例获取SceneManager和当前场景
    const game = (window as any).game;
    if (!game || !game.sceneManager) {
      console.error('无法获取SceneManager');
      return;
    }
    
    const currentScene = game.sceneManager.getCurrentScene();
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
    this.gameEndScreen.showGameEnd(endingType);
  }

  // 更新对话显示
  public updateDialogueDisplay(): void {
    this.dialogueUIManager.updateDialogueDisplay();
  }
}
