import { SceneKeys } from '../constants/SceneKeys';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.BOOT);
  }

  create(): void {
    // 设置游戏配置
    this.scale.setGameSize(1280, 720);
    this.scale.setZoom(1);
    
    // 启动预加载场景
    this.scene.start(SceneKeys.PRELOAD);
  }
} 