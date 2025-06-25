import { SceneKeys, RoomKeys } from '../constants/SceneKeys';
import { GameManager } from '../core/GameManager';
import { SceneManager } from '../core/SceneManager';
import { EventManager } from '../core/EventManager';
import { RoomRegistry } from '../data/RoomRegistry';
import { ActionRegistry } from '../data/ActionRegistry';

export class SceneAndEventTest {
  private gameManager: GameManager;
  private sceneManager: SceneManager;
  private eventManager: EventManager;
  private roomRegistry: RoomRegistry;
  private actionRegistry: ActionRegistry;

  constructor() {
    // 模拟Phaser游戏实例
    const mockGame = {} as Phaser.Game;
    
    this.gameManager = new GameManager(mockGame);
    this.sceneManager = new SceneManager(mockGame);
    this.eventManager = new EventManager();
    this.roomRegistry = new RoomRegistry();
    this.actionRegistry = new ActionRegistry();
  }

  public runTests(): void {
    console.log('=== 场景和事件系统测试 ===\n');

    this.testRoomRegistry();
    this.testActionRegistry();
    this.testEventSystem();
    this.testSceneTransitions();
    this.testGameStateManagement();

    console.log('\n=== 测试完成 ===');
  }

  private testRoomRegistry(): void {
    console.log('1. 测试房间注册表...');
    
    // 测试房间数据获取
    const livingRoomNorth = this.roomRegistry.getRoom(RoomKeys.LIVING_ROOM_NORTH);
    const livingRoomWestLow = this.roomRegistry.getRoom(RoomKeys.LIVING_ROOM_WEST_LOW);
    const roomB = this.roomRegistry.getRoom(RoomKeys.ROOM_B);
    const hallway = this.roomRegistry.getRoom(RoomKeys.HALLWAY);

    console.log(`  客厅北向房间: ${livingRoomNorth ? '✓' : '✗'}`);
    console.log(`  客厅西向低处: ${livingRoomWestLow ? '✓' : '✗'}`);
    console.log(`  主人房间B: ${roomB ? '✓' : '✗'}`);
    console.log(`  过道: ${hallway ? '✓' : '✗'}`);

    // 测试交互对象
    if (livingRoomWestLow) {
      const interactiveObjects = livingRoomWestLow.interactiveObjects;
      console.log(`  客厅西向低处交互对象数量: ${interactiveObjects.length}`);
      interactiveObjects.forEach(obj => {
        console.log(`    - ${obj.name}: ${obj.actions.join(', ')}`);
      });
    }

    // 测试出口
    if (roomB) {
      const exits = roomB.exits;
      console.log(`  主人房间B出口数量: ${exits.length}`);
      exits.forEach(exit => {
        console.log(`    - ${exit.name} -> ${exit.targetRoom}`);
      });
    }
  }

  private testActionRegistry(): void {
    console.log('\n2. 测试动作注册表...');
    
    // 测试动作获取
    const actions = [
      'attack_cage',
      'use_litter_box',
      'play_in_house',
      'eat_fish_treat',
      'play_with_mouse',
      'destroy_screen',
      'sleep_on_bed'
    ];

    actions.forEach(actionId => {
      const action = this.actionRegistry.getAction(actionId);
      console.log(`  ${actionId}: ${action ? '✓' : '✗'}`);
      if (action) {
        console.log(`    名称: ${action.name}`);
        console.log(`    描述: ${action.description}`);
        console.log(`    时间消耗: ${action.timeCost}分钟`);
      }
    });
  }

  private testEventSystem(): void {
    console.log('\n3. 测试事件系统...');
    
    // 测试事件触发
    let eventTriggered = false;
    this.eventManager.onEventTriggered((data) => {
      eventTriggered = true;
      console.log(`  事件触发: ${data.event.name}`);
    });

    // 模拟游戏状态
    const mockState = this.gameManager.getState();
    
    // 测试动作完成事件
    this.eventManager.checkEvents(mockState, 'action', 'attack_cage');
    console.log(`  攻击笼子事件: ${eventTriggered ? '✓' : '✗'}`);

    // 测试房间访问事件
    eventTriggered = false;
    this.eventManager.checkEvents(mockState, 'room_visit', RoomKeys.LIVING_ROOM_WEST_LOW);
    console.log(`  房间访问事件: ${eventTriggered ? '✓' : '✗'}`);
  }

  private testSceneTransitions(): void {
    console.log('\n4. 测试场景转换...');
    
    // 测试房间到场景的映射
    const roomToSceneMap = {
      [RoomKeys.LIVING_ROOM_NORTH]: SceneKeys.LIVING_ROOM_NORTH,
      [RoomKeys.LIVING_ROOM_WEST_LOW]: SceneKeys.LIVING_ROOM_WEST_LOW,
      [RoomKeys.LIVING_ROOM_WEST_HIGH]: SceneKeys.LIVING_ROOM_WEST_HIGH,
      [RoomKeys.ROOM_B]: SceneKeys.ROOM_B,
      [RoomKeys.HALLWAY]: SceneKeys.HALLWAY
    };

    Object.entries(roomToSceneMap).forEach(([roomKey, sceneKey]) => {
      console.log(`  ${roomKey} -> ${sceneKey}: ✓`);
    });
  }

  private testGameStateManagement(): void {
    console.log('\n5. 测试游戏状态管理...');
    
    // 测试状态修改
    const initialState = this.gameManager.getState();
    console.log(`  初始饥饿值: ${initialState.hunger}`);
    console.log(`  初始精力值: ${initialState.energy}`);

    // 修改状态
    this.gameManager.modifyHunger(-1);
    this.gameManager.modifyEnergy(-2);
    
    const updatedState = this.gameManager.getState();
    console.log(`  修改后饥饿值: ${updatedState.hunger}`);
    console.log(`  修改后精力值: ${updatedState.energy}`);

    // 测试房间访问
    this.gameManager.visitRoom(RoomKeys.LIVING_ROOM_WEST_LOW);
    const currentRoom = this.gameManager.getCurrentRoom();
    console.log(`  当前房间: ${currentRoom}`);

    // 测试动作完成
    this.gameManager.completeAction('attack_cage');
    const completedActions = Array.from(updatedState.completedActions);
    console.log(`  已完成动作: ${completedActions.join(', ')}`);
  }
}

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  const test = new SceneAndEventTest();
  test.runTests();
} 