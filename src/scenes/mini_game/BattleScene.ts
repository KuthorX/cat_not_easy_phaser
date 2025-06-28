import { BaseScene } from '../BaseScene';
import { SceneKeys } from '../../constants/SceneKeys';
import { GameEvents } from '../../constants/GameEvents';
import { BattleAction } from '../../types/GameState';

export class BattleScene extends BaseScene {
  private playerSprite!: Phaser.GameObjects.Sprite;
  private enemySprite!: Phaser.GameObjects.Sprite;
  private actionButtons: Phaser.GameObjects.Container[] = [];
  private battleActions: BattleAction[] = [];
  private selectedAction: string | null = null;
  private resultText!: Phaser.GameObjects.Text;
  private returnScene: string = '';
  private returnObjectId: string = '';

  constructor() {
    super(SceneKeys.BATTLE);
  }

  create(): void {
    // 获取全局游戏实例和管理器
    const game = (window as any).game;
    if (game) {
      this.gameManager = game.gameManager;
      this.sceneManager = game.sceneManager;
      this.audioManager = game.audioManager;
      // 战斗场景不需要UIManager，避免UI组件覆盖按钮
      // this.uiManager = game.uiManager;
    }

    // 设置当前场景
    if (this.sceneManager) {
      this.sceneManager.setCurrentScene(this);
    }

    // 初始化场景
    this.initializeScene();
    
    // 设置事件监听
    this.setupEventListeners();
  }

  protected setupEventListeners(): void {
    // 战斗场景不需要监听游戏状态变化
    // super.setupEventListeners();
  }

  protected initializeScene(): void {
    console.log('BattleScene.initializeScene 开始');
    
    // 清理旧的按钮
    this.cleanupButtons();
    
    // 设置背景
    this.add.rectangle(640, 360, 1280, 720, 0x000000); // 全黑背景
    
    // 添加战斗标题
    this.add.text(640, 50, 'Fighting!', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 初始化战斗动作
    this.initializeBattleActions();
    console.log('战斗动作初始化完成，数量:', this.battleActions.length);

    // 创建角色精灵
    this.createCharacters();
    console.log('角色创建完成');

    // 创建战斗动作按钮
    this.createActionButtons();
    console.log('按钮创建完成，按钮数组长度:', this.actionButtons.length);

    // 创建结果显示文本
    this.resultText = this.add.text(640, 300, '', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 设置输入事件
    this.setupInputEvents();

    // 处理传入的战斗参数
    this.handleBattleParams();
    
    console.log('BattleScene.initializeScene 完成');
  }

  private cleanupButtons(): void {
    // 清理旧的按钮
    this.actionButtons.forEach(container => {
      if (container && container.destroy) {
        container.destroy();
      }
    });
    this.actionButtons = [];
    this.selectedAction = null;
    console.log('清理旧按钮完成');
  }

  private initializeBattleActions(): void {
    this.battleActions = [
      {
        id: 'claw_swipe',
        name: '爪子横扫',
        description: '用爪子横扫攻击',
        successRate: 0.6
      },
      {
        id: 'claw_tear',
        name: '爪子撕扯',
        description: '用爪子撕扯攻击',
        successRate: 0.7
      },
      {
        id: 'bite_hard',
        name: '用力啃咬',
        description: '用力啃咬攻击',
        successRate: 0.8
      },
      {
        id: 'sit_squash',
        name: '屁股坐压',
        description: '用屁股坐压攻击',
        successRate: 0.5
      }
    ];
  }

  private createCharacters(): void {
    // 创建玩家角色（左）
    this.playerSprite = this.add.sprite(200, 300, 'balcony_robot_cleaner');
    this.playerSprite.setScale(0.8);
    this.playerSprite.setDepth(1000); // 设置深度

    // 创建敌人角色（右）
    this.enemySprite = this.add.sprite(1080, 300, 'room_b_bed');
    this.enemySprite.setScale(0.8);
    this.enemySprite.setDepth(1000); // 设置深度

    // 添加角色标签
    this.add.text(200, 400, '玩家', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(1000);

    this.add.text(1080, 400, '敌人', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(1000);
  }

  private createActionButtons(): void {
    const buttonWidth = 250; // 扩大按钮宽度
    const buttonHeight = 80; // 扩大按钮高度
    const startX = 150;
    const startY = 580; // 往上提
    const spacing = 320; // 增加间距

    console.log('创建战斗按钮:', this.battleActions);

    this.battleActions.forEach((action, index) => {
      const x = startX + (index * spacing);
      const y = startY;

      console.log(`创建按钮 ${index}: ${action.name} 位置 (${x}, ${y})`);

      // 创建按钮背景
      const buttonBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0xffffff); // 白色背景
      buttonBg.setStrokeStyle(3, 0x000000); // 黑色边框

      // 创建按钮文本
      const buttonText = this.add.text(0, 0, action.name, {
        fontSize: '24px', // 增大字体
        color: '#000000', // 黑色文字
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 创建按钮容器
      const buttonContainer = this.add.container(x, y, [buttonBg, buttonText]);
      buttonContainer.setSize(buttonWidth, buttonHeight);
      buttonContainer.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
      buttonContainer.setDepth(9999); // 最高深度

      // 设置按钮事件
      buttonContainer.on('pointerdown', () => {
        console.log('点击战斗按钮:', action.id);
        this.selectAction(action.id);
      });

      buttonContainer.on('pointerover', () => {
        buttonBg.setFillStyle(0xcccccc); // 悬停时变灰色
        console.log('鼠标悬停在按钮上:', action.name);
      });

      buttonContainer.on('pointerout', () => {
        buttonBg.setFillStyle(0xffffff); // 恢复白色
      });

      this.actionButtons.push(buttonContainer);
    });

    console.log('按钮创建完成，总数:', this.actionButtons.length);
  }

  private selectAction(actionId: string): void {
    this.selectedAction = actionId;
    
    // 高亮选中的按钮
    this.actionButtons.forEach((container, index) => {
      const action = this.battleActions[index];
      const buttonBg = container.getAt(0) as Phaser.GameObjects.Rectangle;
      
      if (action.id === actionId) {
        buttonBg.setFillStyle(0xe74c3c);
      } else {
        buttonBg.setFillStyle(0x34495e);
      }
    });

    // 执行战斗
    this.executeBattle();
  }

  private executeBattle(): void {
    const selectedAction = this.battleActions.find(action => action.id === this.selectedAction);
    if (!selectedAction) return;

    // 随机决定成功或失败
    const random = Math.random();
    const isSuccess = random <= selectedAction.successRate;

    // 显示结果
    this.showBattleResult(isSuccess);
  }

  private showBattleResult(isSuccess: boolean): void {
    const result = isSuccess ? 'success' : 'failure';
    const resultText = isSuccess ? '战斗成功！' : '战斗失败！';
    const color = isSuccess ? '#2ecc71' : '#e74c3c';

    this.resultText.setText(resultText);
    this.resultText.setColor(color);
    this.resultText.setVisible(true);

    // 隐藏按钮而不是禁用交互
    this.actionButtons.forEach(container => {
      container.setVisible(false);
    });

    // 2秒后返回原场景
    this.time.delayedCall(2000, () => {
      this.returnToOriginalScene(result);
    });
  }

  private returnToOriginalScene(result: 'success' | 'failure'): void {
    console.log('返回原场景:', { result, returnScene: this.returnScene, returnObjectId: this.returnObjectId });
    
    // 触发战斗结束事件
    this.events.emit(GameEvents.BATTLE_END, {
      result,
      returnScene: this.returnScene,
      returnObjectId: this.returnObjectId
    });

    // 直接返回原场景，不使用过渡场景
    if (this.sceneManager) {
      this.sceneManager.startScene(this.returnScene, {
        battleResult: result,
        damagedObject: this.returnObjectId
      });
    } else {
      console.error('SceneManager不存在，无法返回原场景');
    }
  }

  private setupInputEvents(): void {
    // ESC键返回
    this.input.keyboard?.on('keydown-ESC', () => {
      this.returnToOriginalScene('failure');
    });
  }

  private handleBattleParams(): void {
    // 从场景数据中获取战斗参数
    const battleData = (this as any).scene.settings.data;
    if (battleData) {
      this.returnScene = battleData.returnScene || 'LivingRoomNorthScene';
      this.returnObjectId = battleData.returnObjectId || 'sofa_north';
      
      // 更新敌人精灵
      if (this.enemySprite && battleData.enemyImage) {
        this.enemySprite.setTexture(battleData.enemyImage);
      }
      
      // 更新玩家精灵
      if (this.playerSprite && battleData.playerImage) {
        this.playerSprite.setTexture(battleData.playerImage);
      }
    }
  }

  shutdown(): void {
    console.log('BattleScene.shutdown 开始');
    
    // 清理按钮
    this.cleanupButtons();
    
    // 清理事件监听器
    this.input.keyboard?.off('keydown-ESC');
    
    // 清理其他游戏对象
    if (this.playerSprite) {
      this.playerSprite.destroy();
    }
    if (this.enemySprite) {
      this.enemySprite.destroy();
    }
    if (this.resultText) {
      this.resultText.destroy();
    }
    
    super.shutdown();
    console.log('BattleScene.shutdown 完成');
  }
} 