import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';
import { GameManager } from './core/GameManager';
import { SceneManager } from './core/SceneManager';
import { AudioManager } from './core/AudioManager';
import { UIManager } from './core/UIManager';
import { SaveManager } from './core/SaveManager';
import { SceneKeys } from './constants/SceneKeys';

// 导入场景
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { LivingRoomNorthScene } from './scenes/LivingRoomNorthScene';
import { LivingRoomWestLowScene } from './scenes/LivingRoomWestLowScene';
import { LivingRoomWestHighScene } from './scenes/LivingRoomWestHighScene';
import { LivingRoomEastScene } from './scenes/LivingRoomEastScene';
import { LivingRoomDoorScene } from './scenes/LivingRoomDoorScene';
import { BalconyScene } from './scenes/BalconyScene';
import { RoomBScene } from './scenes/RoomBScene';
import { HallwayScene } from './scenes/HallwayScene';
import { DoorwayScene } from './scenes/DoorwayScene';
import { EndingScene } from './scenes/EndingScene';

class CatGame extends Phaser.Game {
  public gameManager: GameManager;
  public sceneManager: SceneManager;
  public audioManager: AudioManager;
  public uiManager: UIManager;
  public saveManager: SaveManager;

  constructor() {
    super(GameConfig);
    
    // 初始化核心管理器
    this.gameManager = new GameManager(this);
    this.sceneManager = new SceneManager(this);
    this.audioManager = new AudioManager(this);
    this.uiManager = new UIManager(this);
    this.saveManager = new SaveManager(this);
    
    // 注册场景
    this.registerScenes();
    
    // 将管理器挂载到全局游戏实例
    (window as any).game = this;
  }

  private registerScenes(): void {
    // 注册所有场景
    this.scene.add(SceneKeys.BOOT, BootScene, true);
    this.scene.add(SceneKeys.PRELOAD, PreloadScene, false);
    this.scene.add(SceneKeys.MENU, MenuScene, false);
    this.scene.add(SceneKeys.LIVING_ROOM_NORTH, LivingRoomNorthScene, false);
    this.scene.add(SceneKeys.LIVING_ROOM_WEST_LOW, LivingRoomWestLowScene, false);
    this.scene.add(SceneKeys.LIVING_ROOM_WEST_HIGH, LivingRoomWestHighScene, false);
    this.scene.add(SceneKeys.LIVING_ROOM_EAST, LivingRoomEastScene, false);
    this.scene.add(SceneKeys.LIVING_ROOM_DOOR, LivingRoomDoorScene, false);
    this.scene.add(SceneKeys.BALCONY, BalconyScene, false);
    this.scene.add(SceneKeys.ROOM_B, RoomBScene, false);
    this.scene.add(SceneKeys.HALLWAY, HallwayScene, false);
    this.scene.add(SceneKeys.DOORWAY, DoorwayScene, false);
    this.scene.add(SceneKeys.ENDING, EndingScene, false);
    
    // 注册其他房间场景（暂时使用占位符）
    this.registerPlaceholderScenes();
  }

  private registerPlaceholderScenes(): void {
    // 创建占位符场景类
    class PlaceholderScene extends Phaser.Scene {
      constructor(key: string) {
        super(key);
      }
      
      create(): void {
        this.add.text(640, 360, `场景: ${this.scene.key}`, {
          fontSize: '32px',
          color: '#ffffff'
        }).setOrigin(0.5);
        
        this.add.text(640, 400, '此场景正在开发中...', {
          fontSize: '18px',
          color: '#cccccc'
        }).setOrigin(0.5);
        
        // 返回按钮
        const backButton = this.add.rectangle(640, 500, 200, 50, 0x666666);
        backButton.setInteractive();
        backButton.on('pointerdown', () => {
          this.scene.start(SceneKeys.LIVING_ROOM_NORTH);
        });
        
        this.add.text(640, 500, '返回', {
          fontSize: '20px',
          color: '#ffffff'
        }).setOrigin(0.5);
      }
    }

    // 注册占位符场景
    const placeholderScenes = [
      SceneKeys.ROOM_A,
      SceneKeys.ROOM_C
    ];

    placeholderScenes.forEach(sceneKey => {
      this.scene.add(sceneKey, class extends PlaceholderScene {
        constructor() {
          super(sceneKey);
        }
      }, false);
    });
  }
}

// 启动游戏
window.addEventListener('load', () => {
  new CatGame();
}); 