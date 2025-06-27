import { GameEvents } from '../constants/GameEvents';
import { GameConstants } from '../config/GameConfig';
import { DialogueManager } from './DialogueManager';
import { DialogueBubblePosition, DialogueStep, DialogueChoice } from '../types/GameState';

export class UIManager {
  private game: Phaser.Game;
  private uiScene: Phaser.Scene | null = null;
  private statusBar: Phaser.GameObjects.Container | null = null;
  private actionMenu: Phaser.GameObjects.Container | null = null;
  private dialogueBox: Phaser.GameObjects.Container | null = null;
  private inventoryPanel: Phaser.GameObjects.Container | null = null;
  private achievementPopup: Phaser.GameObjects.Container | null = null;
  
  // 新增：对话气泡相关
  private dialogueBubbles: Map<string, Phaser.GameObjects.Container> = new Map();
  private dialogueChoices: Phaser.GameObjects.Container | null = null;
  private dialogueManager: DialogueManager | null = null;

  constructor(game: Phaser.Game) {
    this.game = game;
  }

  // 设置对话管理器
  public setDialogueManager(dialogueManager: DialogueManager): void {
    this.dialogueManager = dialogueManager;
  }

  // 初始化UI
  public initialize(scene: Phaser.Scene): void {
    this.uiScene = scene;
    this.createStatusBar();
    this.createActionMenu();
    this.createDialogueBox();
    this.createInventoryPanel();
    this.createAchievementPopup();
    this.createDialogueChoices();
    
    // 初始隐藏一些UI元素
    this.hideActionMenu();
    this.hideDialogueBox();
    this.hideInventoryPanel();
    this.hideAchievementPopup();
    this.hideDialogueChoices();
    
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
    if (this.dialogueManager) {
      console.log('dialogueManager 存在，调用 updateDialogueDisplay');
      this.updateDialogueDisplay();
    } else {
      console.error('dialogueManager 不存在！');
    }
  }

  // 对话结束事件处理
  private onDialogueEnded(): void {
    console.log('UIManager.onDialogueEnded 被调用');
    this.hideAllDialogueBubbles();
    this.hideDialogueChoices();
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

  // 创建对话选择界面
  private createDialogueChoices(): void {
    if (!this.uiScene) return;

    this.dialogueChoices = this.uiScene.add.container(640, 500);
    this.dialogueChoices.setDepth(1001);
  }

  // 更新状态栏
  public updateStatusBar(time: number, hunger: number, energy: number): void {
    if (!this.statusBar) return;

    const timeText = this.statusBar.getAt(0) as Phaser.GameObjects.Text;
    const hungerText = this.statusBar.getAt(1) as Phaser.GameObjects.Text;
    const energyText = this.statusBar.getAt(2) as Phaser.GameObjects.Text;

    // 获取格式化的时间字符串
    const game = (window as any).game;
    let formattedTime = '';
    if (game && game.gameManager) {
      formattedTime = game.gameManager.getFormattedTime();
    } else {
      // 备用格式化方法
      const hours = Math.floor(time);
      const minutes = Math.floor((time - hours) * 60);
      formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    timeText.setText(`时间: ${formattedTime}`);
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

  // 显示对话气泡
  public showDialogueBubble(
    bubbleId: string,
    text: string,
    position: DialogueBubblePosition,
    speaker: 'object' | 'cat',
    duration: number = 0
  ): void {
    if (!this.uiScene) return;

    // 先隐藏已存在的同名气泡
    this.hideDialogueBubble(bubbleId);

    const bubble = this.uiScene.add.container(position.x, position.y);
    
    // 计算气泡大小
    const textWidth = text.length * 8;
    const bubbleWidth = Math.min(textWidth + 40, 300);
    const bubbleHeight = 80;

    // 创建气泡背景
    const background = this.uiScene.add.rectangle(0, 0, bubbleWidth, bubbleHeight, 0xFFFFFF, 0.9);
    background.setStrokeStyle(2, 0x000000);

    // 创建文本
    const textElement = this.uiScene.add.text(0, 0, text, {
      fontSize: '16px',
      color: '#000000',
      wordWrap: { width: bubbleWidth - 20 }
    });
    textElement.setOrigin(0.5);

    // 创建小尾巴（指向说话者）
    const tail = this.createBubbleTail(position.direction, bubbleWidth, bubbleHeight);

    bubble.add([background, textElement, tail]);
    bubble.setDepth(1001);

    // 设置锚点
    if (position.anchor === 'left') {
      bubble.setPosition(position.x, position.y);
    } else if (position.anchor === 'right') {
      bubble.setPosition(position.x - bubbleWidth, position.y);
    } else {
      bubble.setPosition(position.x - bubbleWidth / 2, position.y - bubbleHeight / 2);
    }

    this.dialogueBubbles.set(bubbleId, bubble);

    // 如果设置了持续时间，自动隐藏
    if (duration > 0) {
      this.uiScene.time.delayedCall(duration, () => {
        this.hideDialogueBubble(bubbleId);
      });
    }
  }

  // 创建气泡尾巴
  private createBubbleTail(direction: 'up' | 'down' | 'left' | 'right', width: number, height: number): Phaser.GameObjects.Graphics {
    const graphics = this.uiScene!.add.graphics();
    graphics.fillStyle(0xFFFFFF, 0.9);
    graphics.lineStyle(2, 0x000000);

    const tailSize = 10;
    let points: number[] = [];

    switch (direction) {
      case 'up':
        points = [
          -tailSize, height / 2,
          0, height / 2 + tailSize,
          tailSize, height / 2
        ];
        break;
      case 'down':
        points = [
          -tailSize, -height / 2,
          0, -height / 2 - tailSize,
          tailSize, -height / 2
        ];
        break;
      case 'left':
        points = [
          width / 2, -tailSize,
          width / 2 + tailSize, 0,
          width / 2, tailSize
        ];
        break;
      case 'right':
        points = [
          -width / 2, -tailSize,
          -width / 2 - tailSize, 0,
          -width / 2, tailSize
        ];
        break;
    }

    graphics.fillPoints(points, true, true);
    graphics.strokePoints(points, true, true);

    return graphics;
  }

  // 隐藏对话气泡
  public hideDialogueBubble(bubbleId: string): void {
    const bubble = this.dialogueBubbles.get(bubbleId);
    if (bubble) {
      bubble.destroy();
      this.dialogueBubbles.delete(bubbleId);
    }
  }

  // 隐藏所有对话气泡
  public hideAllDialogueBubbles(): void {
    this.dialogueBubbles.forEach(bubble => bubble.destroy());
    this.dialogueBubbles.clear();
  }

  // 显示对话选择
  public showDialogueChoices(choices: DialogueChoice[], bubblePosition: DialogueBubblePosition): void {
    if (!this.dialogueChoices || !this.uiScene) return;

    this.hideDialogueChoices();

    choices.forEach((choice, index) => {
      const button = this.uiScene!.add.rectangle(0, index * 50, 200, 40, 0x4A4A4A, 0.8);
      button.setStrokeStyle(1, 0xFFFFFF);
      
      const text = this.uiScene!.add.text(0, index * 50, choice.text, {
        fontSize: '14px',
        color: '#ffffff'
      });
      text.setOrigin(0.5);

      button.setInteractive();
      button.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        // 阻止事件冒泡，避免触发场景的点击事件
        pointer.event.stopPropagation();
        this.selectDialogueChoice(choice.id);
      });

      this.dialogueChoices!.add([button, text]);
    });

    // 根据最后一个对话框的位置设置选项框位置
    let optionsX = bubblePosition.x;
    let optionsY = bubblePosition.y;

    // 根据最后一个对话框的方向决定选项框位置
    if (bubblePosition.direction === 'right') {
      // 对话框向右，选项框在右侧
      optionsX = bubblePosition.x + 200;
    } else if (bubblePosition.direction === 'left') {
      // 对话框向左，选项框在左侧
      optionsX = bubblePosition.x - 200;
    } else if (bubblePosition.direction === 'up') {
      // 对话框向上，选项框在右侧
      optionsX = bubblePosition.x + 200;
    } else if (bubblePosition.direction === 'down') {
      // 对话框向下，选项框在右侧
      optionsX = bubblePosition.x + 200;
    }

    // 确保选项框不超出屏幕边界
    const optionsWidth = 200;
    const optionsHeight = choices.length * 50;
    
    if (optionsX < optionsWidth / 2) {
      optionsX = optionsWidth / 2;
    } else if (optionsX > 1280 - optionsWidth / 2) {
      optionsX = 1280 - optionsWidth / 2;
    }
    
    if (optionsY < optionsHeight / 2) {
      optionsY = optionsHeight / 2;
    } else if (optionsY > 720 - optionsHeight / 2) {
      optionsY = 720 - optionsHeight / 2;
    }

    // 确保位置有效
    if (isNaN(optionsX) || isNaN(optionsY)) {
      // 如果位置无效，使用默认位置
      optionsX = 640;
      optionsY = 360;
    }

    console.log('设置选项框位置:', { optionsX, optionsY, bubblePosition });
    this.dialogueChoices.setPosition(optionsX, optionsY);
    // 设置渲染层级到正常值，确保选项框可见
    this.dialogueChoices.setDepth(1000);
  }

  // 隐藏对话选择
  public hideDialogueChoices(): void {
    if (this.dialogueChoices) {
      this.dialogueChoices.removeAll();
      // 设置到最底层来隐藏选项框
      this.dialogueChoices.setDepth(-9999);
    }
  }

  // 选择对话选项
  private selectDialogueChoice(choiceId: string): void {
    console.log('选择对话选项:', choiceId);
    if (this.dialogueManager) {
      this.dialogueManager.nextStep(choiceId);
      this.hideDialogueChoices();
      this.hideAllDialogueBubbles(); // 隐藏当前的气泡
      this.updateDialogueDisplay();
    }
  }

  // 更新对话显示
  public updateDialogueDisplay(): void {
    console.log('UIManager.updateDialogueDisplay 被调用');
    if (!this.dialogueManager) {
      console.error('dialogueManager 不存在！');
      return;
    }

    const currentState = this.dialogueManager.getCurrentDialogueState();
    console.log('当前对话状态:', currentState);
    if (!currentState) {
      console.log('没有当前对话状态，隐藏所有对话元素');
      this.hideAllDialogueBubbles();
      this.hideDialogueChoices();
      return;
    }

    const currentStep = this.dialogueManager.getCurrentStep();
    console.log('当前对话步骤:', currentStep);
    if (!currentStep) {
      console.error('没有当前对话步骤！');
      return;
    }

    console.log(`显示对话: ${currentStep.speaker} - ${currentStep.text}`);

    // 显示当前对话步骤的气泡
    if (currentStep.speaker === 'object') {
      const objectPosition = this.dialogueManager.calculateBubblePosition(
        currentState.objectPosition,
        currentStep.text,
        'object'
      );
      console.log('物体气泡位置:', objectPosition);
      this.showDialogueBubble('object', currentStep.text, objectPosition, 'object', 0); // 不自动消失
      
      // 更新对话状态中的最后一个气泡位置
      currentState.lastBubblePosition = objectPosition;
      
    } else {
      // 猫的对话气泡
      const catPosition = { x: 640, y: 600 }; // 猫的默认位置
      const catBubblePosition = this.dialogueManager.calculateBubblePosition(
        catPosition,
        currentStep.text,
        'cat'
      );
      console.log('猫气泡位置:', catBubblePosition);
      this.showDialogueBubble('cat', currentStep.text, catBubblePosition, 'cat', 0); // 不自动消失
      
      // 更新对话状态中的最后一个气泡位置
      currentState.lastBubblePosition = catBubblePosition;
    }

    // 检查当前步骤是否有选项需要显示
    if (currentStep.choices && currentStep.choices.length > 0) {
      console.log('当前步骤有选项，显示选项框');
      // 使用最后一个气泡位置来显示选项框
      if (currentState.lastBubblePosition) {
        this.showDialogueChoices(currentStep.choices, currentState.lastBubblePosition);
      }
    }

    // 处理自动进入下一步的情况
    if (currentStep.autoNext && !currentStep.choices) {
      console.log('自动进入下一步，2秒后执行');
      // 自动进入下一步
      this.uiScene!.time.delayedCall(2000, () => {
        console.log('自动进入下一步');
        // 检查对话是否还在进行
        if (this.dialogueManager?.getCurrentDialogueState()) {
          this.dialogueManager!.nextStep();
          this.updateDialogueDisplay();
        }
      });
    }
  }
} 