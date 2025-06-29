import { BaseScene } from './BaseScene';
import { SceneKeys } from '../constants/SceneKeys';
import { RoomKeys } from '../constants/SceneKeys';
import { InteractiveObject, InteractiveObjectWithSprite, RoomExit } from '../types/GameState';
import { GameEvents } from '../constants/GameEvents';
import { TextRenderer } from '../utils/TextRenderer';

export class LivingRoomNorthScene extends BaseScene {
  private interactiveObjects: Map<string, InteractiveObject> = new Map();
  private interactiveObjectBodies: Phaser.GameObjects.GameObject [] = [];

  constructor() {
    super(SceneKeys.LIVING_ROOM_NORTH);
  }

  protected initializeScene(): void {
    // 设置背景
    this.add.rectangle(640, 360, 1280, 720, 0x87CEEB);
    
    // 添加房间标题
    TextRenderer.createCenteredText(this, 640, 50, '客厅 - 向北看', {
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold'
    });

    // 获取房间数据
    const roomData = this.sceneManager?.getRoomData(RoomKeys.LIVING_ROOM_NORTH);
    if (!roomData) return;

    // 创建交互对象
    roomData.interactiveObjects.forEach((obj: InteractiveObject | InteractiveObjectWithSprite) => {
      this.interactiveObjects.set(obj.id, obj as InteractiveObject);
      const objSprite = this.addInteractiveObjecrs(obj);
      this.interactiveObjectBodies.push(objSprite.second);
    });

    // 创建出口
    roomData.exits.forEach((exit: RoomExit) => {
      this.createExit(exit);
    });

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
    TextRenderer.createCenteredText(this, exit.x, exit.y, exit.name, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 2, y: 1 }
    });
  }

  // 获取交互对象
  protected getInteractiveObject(objectId: string): any {
    return this.interactiveObjects.get(objectId) || null;
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
        // objectSprite.setFillStyle(0x8b4513, 0.8);
        
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

  shutdown(): void {
    // 清理事件监听器
    window.removeEventListener('start_battle', this.onStartBattle.bind(this) as EventListener);
    this.events.off(GameEvents.BATTLE_END, this.onBattleEnd.bind(this));
    
    super.shutdown();
  }
}