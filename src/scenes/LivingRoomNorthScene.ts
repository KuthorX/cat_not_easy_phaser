import { BaseScene } from './BaseScene';
import { SceneKeys } from '../constants/SceneKeys';
import { RoomKeys } from '../constants/SceneKeys';
import { InteractiveObject, RoomExit } from '../types/GameState';
import { TransitionScene } from './TransitionScene';
import { runTransitionTests } from '../test/TransitionSceneTest';
import { GameEvents } from '../constants/GameEvents';

export class LivingRoomNorthScene extends BaseScene {
  private interactiveObjects: Map<string, InteractiveObject> = new Map();
  private interactiveObjectBodies: Phaser.GameObjects.Rectangle[] = [];
  private robotCleaner!: RobotCleaner;

  constructor() {
    super(SceneKeys.LIVING_ROOM_NORTH);
  }

  protected initializeScene(): void {
    // 设置背景
    this.add.rectangle(640, 360, 1280, 720, 0x87CEEB);
    
    // 添加房间标题
    this.add.text(640, 50, '客厅 - 向北看', {
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 获取房间数据
    const roomData = this.sceneManager?.getRoomData(RoomKeys.LIVING_ROOM_NORTH);
    if (!roomData) return;

    // 创建交互对象
    roomData.interactiveObjects.forEach((obj: InteractiveObject) => {
      this.interactiveObjects.set(obj.id, obj);
      const objSprite = this.createInteractiveObject(obj);
      this.interactiveObjectBodies.push(objSprite);
    });

    // 创建出口
    roomData.exits.forEach((exit: RoomExit) => {
      this.createExit(exit);
    });

    // 添加碰撞
    this.physics.add.collider(this.robotCleaner, this.interactiveObjectBodies);

    // 初始化UI
    if (this.uiManager) {
      this.uiManager.initialize(this);
      this.uiManager.setDialogueManager(this.gameManager?.getDialogueManager() || null);
      const state = this.gameManager?.getState();
      if (state) {
        this.uiManager.updateStatusBar(state.currentTime, state.hunger, state.energy);
        this.uiManager.updateInventory(state.inventory);
      }
    }

    // 播放背景音乐
    if (this.audioManager) {
      this.audioManager.playRoomMusic(RoomKeys.LIVING_ROOM_NORTH);
    }

    // 记录房间访问
    if (this.gameManager) {
      this.gameManager.visitRoom(RoomKeys.LIVING_ROOM_NORTH);
    }

    // 设置键盘快捷键
    this.setupKeyboardShortcuts();

    // 创建扫地机器人
    this.robotCleaner = new RobotCleaner(this, 0, 400);
    // 检查是否有战斗结果需要处理
    this.checkBattleResult();
  }

  private createExit(exit: RoomExit): void {
    const exitRect = this.add.rectangle(exit.x, exit.y, exit.width, exit.height, 0xff0000, 0.3);
    exitRect.setInteractive();
    
    exitRect.on('pointerdown', () => {
      this.switchToRoomWithTransition(exit.targetRoom, exit.name);
    });

    exitRect.on('pointerover', () => {
      exitRect.setFillStyle(0xff0000, 0.5);
    });

    exitRect.on('pointerout', () => {
      exitRect.setFillStyle(0xff0000, 0.3);
    });

    // 添加出口标签
    this.add.text(exit.x, exit.y, exit.name, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 2, y: 1 }
    }).setOrigin(0.5);
  }

  private setupKeyboardShortcuts(): void {
    // I键打开物品栏
    this.input.keyboard?.on('keydown-I', () => {
      if (this.uiManager) {
        this.uiManager.showInventoryPanel();
      }
    });

    // ESC键隐藏UI
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.uiManager) {
        this.uiManager.hideActionMenu();
        this.uiManager.hideInventoryPanel();
      }
    });

    // 数字键快速执行动作
    this.input.keyboard?.on('keydown-ONE', () => {
      this.executeAction('sunbathing');
    });

    this.input.keyboard?.on('keydown-TWO', () => {
      this.executeAction('sleep_on_sofa');
    });

    this.input.keyboard?.on('keydown-THREE', () => {
      this.executeAction('scratch_sofa');
    });

    // 测试过渡场景的快捷键
    this.input.keyboard?.on('keydown-T', () => {
      console.log('按下了T键，启动过渡场景测试...');
      runTransitionTests(this);
    });

    // 快速测试过渡场景
    this.input.keyboard?.on('keydown-Y', () => {
      console.log('快速测试过渡场景...');
      TransitionScene.createTransition(
        this,
        {
          text: '这是一个快速测试！\n按Y键触发的过渡场景。',
          leftButtonText: '取消',
          rightButtonText: '继续',
          backgroundColor: 0x8b4513,
          textColor: 0xffd700,
          buttonColor: 0x654321,
          buttonTextColor: 0xffffff
        },
        'LivingRoomNorthScene'
      );
    });

    // 测试战斗系统
    this.input.keyboard?.on('keydown-B', () => {
      console.log('测试战斗系统...');
      // 直接触发战斗开始事件
      const battleEvent = new CustomEvent('start_battle', {
        detail: {
          enemyId: 'sofa_north',
          enemyName: '沙发',
          enemyImage: 'room_b_bed',
          playerImage: 'balcony_robot_cleaner',
          returnScene: 'LivingRoomNorthScene',
          returnObjectId: 'sofa_north'
        }
      });
      window.dispatchEvent(battleEvent);
    });
  }

  // 重写executeAction方法以支持对话系统
  protected executeAction(actionId: string): boolean {
    if (!this.gameManager) return false;

    const action = this.sceneManager.getAction(actionId);
    if (!action) return false;

    const gameState = this.gameManager.getState();
    
    // 检查是否可以执行动作
    if (!this.sceneManager.canAccessRoom(gameState.currentRoom, gameState)) {
      return false;
    }

    // 检查动作要求
    if (!this.checkActionRequirements(action, gameState)) {
      return false;
    }

    // 执行动作效果
    this.applyActionEffects(action, gameState);

    // 播放音效
    if (this.audioManager) {
      this.audioManager.playActionSound(actionId);
    }

    // 处理对话或显示描述
    if (action.triggerDialogue && action.dialogueId && this.uiManager) {
      console.log('LivingRoomNorthScene.executeAction: 触发对话', { actionId, dialogueId: action.dialogueId });
      // 获取物体位置
      const objectId = this.getObjectIdForAction(actionId);
      const object = objectId ? this.interactiveObjects.get(objectId) : null;
      const objectPosition = object ? { x: object.x, y: object.y } : { x: 640, y: 360 };
      
      console.log('物体信息:', { objectId, object, objectPosition });
      
      // 启动对话系统
      this.gameManager.startDialogue(action.dialogueId, objectId || actionId, action.name, objectPosition);
    } else if (this.uiManager) {
      console.log('LivingRoomNorthScene.executeAction: 显示传统对话框', action.description);
      // 显示传统对话框
      this.uiManager.showDialogue(action.description, 2000);
    }

    return true;
  }

  // 根据动作ID获取对应的物体ID
  private getObjectIdForAction(actionId: string): string | null {
    const actionToObjectMap: Record<string, string> = {
      'sleep_on_sofa': 'sofa_north',
      'scratch_sofa': 'sofa_north',
      'attack_cage': 'cat_cage',
      'jump_on_cage': 'cat_cage',
      'use_litter_box': 'cat_litter_box'
    };
    
    return actionToObjectMap[actionId] || null;
  }

  // 新增：带过渡效果的房间切换方法
  private switchToRoomWithTransition(roomKey: string, exitName: string): void {
    const sceneKey = this.getSceneKeyForRoom(roomKey);
    if (!sceneKey) {
      console.error(`Unknown room key: ${roomKey}`);
      return;
    }

    // 根据出口名称生成过渡文本
    const transitionText = this.getTransitionTextForExit(exitName);
    
    TransitionScene.createTransition(
      this,
      {
        text: transitionText,
        leftButtonText: '返回',
        rightButtonText: '进入',
        backgroundColor: 0x1a1a2e,
        textColor: 0xf0f0f0,
        buttonColor: 0x16213e,
        buttonTextColor: 0xffffff
      },
      sceneKey
    );
  }

  // 新增：根据房间键获取场景键
  private getSceneKeyForRoom(roomKey: string): string | null {
    const roomToSceneMap: Record<string, string> = {
      [RoomKeys.LIVING_ROOM_EAST]: SceneKeys.LIVING_ROOM_EAST,
      [RoomKeys.LIVING_ROOM_WEST_LOW]: SceneKeys.LIVING_ROOM_WEST_LOW,
      [RoomKeys.LIVING_ROOM_WEST_HIGH]: SceneKeys.LIVING_ROOM_WEST_HIGH,
      [RoomKeys.LIVING_ROOM_DOOR]: SceneKeys.LIVING_ROOM_DOOR,
      [RoomKeys.HALLWAY]: SceneKeys.HALLWAY,
      [RoomKeys.BALCONY]: SceneKeys.BALCONY,
      [RoomKeys.ROOM_A]: SceneKeys.ROOM_A,
      [RoomKeys.ROOM_B]: SceneKeys.ROOM_B,
      [RoomKeys.ROOM_C]: SceneKeys.ROOM_C,
      [RoomKeys.DOORWAY]: SceneKeys.DOORWAY
    };
    
    return roomToSceneMap[roomKey] || null;
  }

  // 新增：根据出口名称生成过渡文本
  private getTransitionTextForExit(exitName: string): string {
    const transitionTexts: Record<string, string> = {
      '向东': '你转向东边，准备探索客厅的另一侧...',
      '向西': '你向西边走去，那里似乎有什么有趣的东西...',
      '向南': '你回到客厅的中央区域...',
      '向北': '你向北边走去，寻找新的发现...',
      '走廊': '你走向走廊，准备探索房子的其他部分...',
      '阳台': '你走向阳台，想要呼吸一些新鲜空气...',
      '房间A': '你准备进入房间A，不知道里面有什么...',
      '房间B': '你走向房间B，心中充满好奇...',
      '房间C': '你准备探索房间C...',
      '门口': '你走向门口，准备离开这个房间...'
    };
    
    return transitionTexts[exitName] || `你走向${exitName}...`;
  }

  protected setupEventListeners(): void {
    super.setupEventListeners();
    
    // 监听战斗开始事件
    window.addEventListener('start_battle', this.onStartBattle.bind(this) as EventListener);
    
    // 监听战斗结束事件
    this.events.on(GameEvents.BATTLE_END, this.onBattleEnd.bind(this));
  }

  private onStartBattle(event: Event): void {
    const customEvent = event as CustomEvent;
    const battleData = customEvent.detail;
    console.log('开始战斗:', battleData);
    
    // 切换到战斗场景
    this.sceneManager?.startScene(SceneKeys.BATTLE, battleData);
  }

  private onBattleEnd(data: any): void {
    console.log('战斗结束:', data);
    
    if (data.result === 'success') {
      // 战斗成功，将沙发标记为损坏
      this.markObjectAsDamaged(data.returnObjectId);
    }
    // 战斗失败则不做任何改变
  }

  private markObjectAsDamaged(objectId: string): void {
    // 更新物体的损坏状态
    const object = this.interactiveObjects.get(objectId);
    if (object) {
      // 更新物体精灵为损坏状态
      const objectSprite = this.interactiveObjectBodies.find((_, index) => {
        const objArray = Array.from(this.interactiveObjects.values());
        return objArray[index]?.id === objectId;
      });
      
      if (objectSprite) {
        // 将损坏的沙发替换为损坏的椅子图片
        // 这里我们暂时用颜色变化表示损坏，实际项目中应该替换为损坏的图片
        objectSprite.setFillStyle(0x8b4513, 0.8);
        
        // 如果有损坏的图片，可以这样替换：
        // const damagedSprite = this.add.sprite(object.x, object.y, 'room_b_chair');
        // damagedSprite.setScale(0.8);
        // objectSprite.destroy();
      }
      
      // 记录损坏状态到游戏状态
      if (this.gameManager) {
        this.gameManager.getState().destroyedItems.add(objectId);
      }
    }
  }

  private checkBattleResult(): void {
    // 从场景数据中获取战斗结果
    const sceneData = (this as any).scene.settings.data;
    if (sceneData && sceneData.battleResult) {
      console.log('处理战斗结果:', sceneData);
      
      if (sceneData.battleResult === 'success' && sceneData.damagedObject) {
        // 战斗成功，标记物体为损坏状态
        this.markObjectAsDamaged(sceneData.damagedObject);
        
        // 显示成功提示
        if (this.uiManager) {
          this.uiManager.showDialogue('破坏成功！', 3000);
        }
      } else if (sceneData.battleResult === 'failure') {
        // 战斗失败，显示失败提示
        if (this.uiManager) {
          this.uiManager.showDialogue('破坏失败！', 3000);
        }
      }
    }
  }

  shutdown(): void {
    // 清理事件监听器
    window.removeEventListener('start_battle', this.onStartBattle.bind(this) as EventListener);
    this.events.off(GameEvents.BATTLE_END, this.onBattleEnd.bind(this));
    
    super.shutdown();
  }
}