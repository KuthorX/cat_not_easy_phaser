import { SceneKeys } from '../constants/SceneKeys';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.BOOT);
  }

  preload(): void {
    // 加载加载画面资源
    this.load.image('loading_bg', 'assets/ui/loading_bg.png');
    this.load.image('loading_bar', 'assets/ui/loading_bar.png');
  }

  create(): void {
    // 设置游戏配置
    this.scale.setGameSize(1280, 720);
    this.scale.setZoom(1);
    
    // 启动预加载场景
    this.scene.start(SceneKeys.PRELOAD);
  }
} 