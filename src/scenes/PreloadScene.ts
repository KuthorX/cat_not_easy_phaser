import { SceneKeys } from '../constants/SceneKeys';
import { TextRenderer } from '../utils/TextRenderer';

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
    this.progressText = TextRenderer.createCenteredText(this, 640, 400, '加载中... 0%', {
      fontSize: '24px',
      color: '#ffffff'
    });

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
    // 动态加载所有图片资源
    this.loadImageAssets();
    
    // 动态加载所有音频资源
    this.loadAudioAssets();
    
    // 动态加载所有动画序列
    this.loadTweenSequences();
  }

  private loadImageAssets(): void {
    // 定义所有图片文件夹及其路径映射
    const imageFolders = [
      { path: 'assets/images/balcony', prefix: 'balcony' },
      { path: 'assets/images/room_b', prefix: 'room_b' },
      { path: 'assets/images/living_room_east', prefix: 'living_room_east' },
      { path: 'assets/images/living_room_west_down', prefix: 'living_room_west_down' },
      { path: 'assets/images/living_room_west_up', prefix: 'living_room_west_up' },
      { path: 'assets/images/hallway', prefix: 'hallway' },
      { path: 'assets/images/menu', prefix: 'menu' },
      { path: 'assets/images/endings', prefix: 'endings' },
      { path: 'assets/images/thought_bubble', prefix: 'thought_bubble' },
      { path: 'assets/images/nav_btn', prefix: 'nav_btn' },
    ];

    // 定义每个文件夹中的文件列表（去掉重复的前缀）
    const imageFiles = {
      balcony: ['bg', 'chair', 'coat_hanger', 'robot_cleaner'],
      room_b: ['bg', 'bed', 'chair', 'computer_screen', 'kettle', 'side_wall'],
      living_room_east: ['bg', 'ball', 'cat_nest', 'cat_tree', 'cola', 'cord', 'dustbin', 'glass', 'milk', 'paper', 'pot', 'sofa', 'table', 'tv', 'tvtable', 'sundries_down', 'tv_down'],
      living_room_west_down: ['bg', 'basket', 'cage', 'cat_toilet', 'cat_villa', 'cord2', 'food', 'ice_maker', 'table'],
      living_room_west_up: ['bg', 'cord', 'handset', 'table', 'umbrella'],
      hallway: ['bg_close', 'bg_open', 'book_shelf', 'food', 'robot', 'eat', 'water'],
      menu: ['start_game', 'settings', 'exit_game', 'bg'],
      endings: ['allies_of_two_legged_beast', 'husky', 'logistics_officer', 'playtime'],
      thought_bubble: ['cat_head', 'outline'],
      nav_btn: ['bg']
    };

    // 动态加载所有图片
    imageFolders.forEach(folder => {
      const files = imageFiles[folder.prefix as keyof typeof imageFiles] || [];
      files.forEach(file => {
        const key = `${folder.prefix}_${file}`;
        const path = `${folder.path}/${file}.png`;
        this.load.image(key, path);
      });
    });
  }

  private loadAudioAssets(): void {
    // 定义音频文件列表
    const audioFiles = [
      { key: 'bgm_living_room', path: 'assets/audio/bgm_living_room.mp3' }
    ];

    // 动态加载所有音频
    audioFiles.forEach(audio => {
      this.load.audio(audio.key, audio.path);
    });
  }

  private loadTweenSequences(): void {
    // 定义所有动画序列及其对应的帧数
    const tweenSequences = [
      { name: 'cat_play', frameCount: 104 },
      { name: 'cat_slap', frameCount: 76 },
      { name: 'cat_kick', frameCount: 6 },
      { name: 'cat_tap', frameCount: 11 },
      { name: 'cat_push', frameCount: 7 },
      { name: 'cat_grab_down_wall', frameCount: 55 },
      { name: 'cat_lick', frameCount: 41 },
      { name: 'cat_shock', frameCount: 41 },
      { name: 'cat_hit_laptop', frameCount: 48 },
      { name: 'cat_meow', frameCount: 11 },
      { name: 'cat_oars', frameCount: 55 },
      { name: 'cat_run', frameCount: 19 },
      { name: 'cat_sleep', frameCount: 4 }
    ];

    // 为每个序列加载PNG文件
    tweenSequences.forEach(sequence => {
      // 加载第一帧作为默认纹理
      this.load.image(sequence.name, `assets/tweens/${sequence.name}/${sequence.name}_001.png`);
      
      // 加载所有帧（从001开始，到实际帧数结束）
      for (let i = 1; i <= sequence.frameCount; i++) {
        const frameNumber = String(i).padStart(3, '0');
        const frameKey = `${sequence.name}_${frameNumber}`;
        const framePath = `assets/tweens/${sequence.name}/${sequence.name}_${frameNumber}.png`;
        
        // 加载每一帧
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