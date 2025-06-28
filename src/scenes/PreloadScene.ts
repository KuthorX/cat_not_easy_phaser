import { SceneKeys } from '../constants/SceneKeys';

export class PreloadScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressText!: Phaser.GameObjects.Text;

  constructor() {
    super(SceneKeys.PRELOAD);
  }

  preload(): void {
    this.createProgressBar();
    this.loadAssets();
  }

  private createProgressBar(): void {
    // 创建进度条背景
    this.progressBar = this.add.graphics();
    this.progressBar.setPosition(240, 360);
    
    // 创建进度文本
    this.progressText = this.add.text(640, 400, '加载中... 0%', {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.progressText.setOrigin(0.5);

    // 监听加载进度
    this.load.on('progress', (value: number) => {
      this.updateProgressBar(value);
    });

    this.load.on('complete', () => {
      this.progressText.setText('加载完成！');
    });
  }

  private updateProgressBar(value: number): void {
    this.progressBar.clear();
    this.progressBar.fillStyle(0x222222);
    this.progressBar.fillRect(0, 0, 800, 20);
    this.progressBar.fillStyle(0xffffff);
    this.progressBar.fillRect(0, 0, 800 * value, 20);
    
    this.progressText.setText(`加载中... ${Math.round(value * 100)}%`);
  }

  private loadAssets(): void {
    // 加载balcony场景图片
    this.load.image('balcony_bg', 'assets/images/balcony_bg.png');
    this.load.image('balcony_chair', 'assets/images/balcony_chair.png');
    this.load.image('balcony_coat_hanger', 'assets/images/balcony_coat_hanger.png');
    this.load.image('balcony_robot_cleaner', 'assets/images/balcony_robot_cleaner.png');

    // 加载room_b场景图片
    this.load.image('room_b_bg', 'assets/images/room_b_bg.png');
    this.load.image('room_b_bed', 'assets/images/room_b_bed.png');
    this.load.image('room_b_chair', 'assets/images/room_b_chair.png');
    this.load.image('room_b_computer_screen', 'assets/images/room_b_computer_screen.png');
    this.load.image('room_b_kettle', 'assets/images/room_b_kettle.png');
    this.load.image('room_b_side_wall', 'assets/images/room_b_side_wall.png');

    // 批量加载PNG序列动画资源
    this.loadTweenSequences();

    // 加载音频资源
    this.load.audio('bgm_living_room', 'assets/audio/bgm_living_room.mp3');
  }

  private loadTweenSequences(): void {
    // 定义所有动画序列
    const tweenSequences = [
      'cat_play',
      'cat_kick', 
      'cat_slap',
      'cat_tap',
      'cat_push',
      'cat_grab_down_wall',
      'cat_lick',
      'cat_shock',
      'cat_hit_laptop',
      'cat_meow',
      'cat_oars',
      'cat_run',
      'cat_sleep',
    ];

    // 为每个序列加载PNG文件
    tweenSequences.forEach(sequenceName => {
      // 加载第一帧作为默认纹理
      this.load.image(sequenceName, `assets/tweens/${sequenceName}/${sequenceName}_001.png`);
      
      // 加载所有帧（从001开始，最多到110）
      for (let i = 1; i <= 110; i++) {
        const frameNumber = String(i).padStart(3, '0');
        const frameKey = `${sequenceName}_${frameNumber}`;
        const framePath = `assets/tweens/${sequenceName}/${sequenceName}_${frameNumber}.png`;
        
        // 尝试加载每一帧，如果文件不存在会自动跳过
        this.load.image(frameKey, framePath);
      }
    });
  }

  create(): void {
    // 延迟一秒后启动菜单场景
    this.time.delayedCall(1000, () => {
      this.scene.start(SceneKeys.MENU);
    });
  }
}