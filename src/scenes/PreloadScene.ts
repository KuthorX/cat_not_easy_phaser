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
    // 加载UI资源
    this.load.image('button_bg', 'assets/ui/button_bg.png');
    this.load.image('panel_bg', 'assets/ui/panel_bg.png');
    this.load.image('icon_hunger', 'assets/ui/icon_hunger.png');
    this.load.image('icon_energy', 'assets/ui/icon_energy.png');
    this.load.image('icon_time', 'assets/ui/icon_time.png');

    // 加载房间背景
    this.load.image('living_room_north_bg', 'assets/rooms/living_room_north_bg.png');
    this.load.image('living_room_east_bg', 'assets/rooms/living_room_east_bg.png');
    this.load.image('living_room_west_low_bg', 'assets/rooms/living_room_west_low_bg.png');
    this.load.image('living_room_west_high_bg', 'assets/rooms/living_room_west_high_bg.png');
    this.load.image('living_room_door_bg', 'assets/rooms/living_room_door_bg.png');
    this.load.image('hallway_bg', 'assets/rooms/hallway_bg.png');
    this.load.image('room_b_bg', 'assets/rooms/room_b_bg.png');

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

    // 加载物品精灵
    this.load.image('window_north', 'assets/objects/window_north.png');
    this.load.image('sofa', 'assets/objects/sofa.png');
    this.load.image('cat_cage', 'assets/objects/cat_cage.png');
    this.load.image('litter_box', 'assets/objects/litter_box.png');
    this.load.image('cat_house', 'assets/objects/cat_house.png');
    this.load.image('fish_treat', 'assets/objects/fish_treat.png');
    this.load.image('toy_mouse', 'assets/objects/toy_mouse.png');
    this.load.image('computer_screen', 'assets/objects/computer_screen.png');
    this.load.image('owner_bed', 'assets/objects/owner_bed.png');

    // 加载音频资源 - 只保留存在的文件
    this.load.audio('bgm_living_room', 'assets/audio/bgm_living_room.mp3');
  }

  create(): void {
    // 延迟一秒后启动菜单场景
    this.time.delayedCall(1000, () => {
      this.scene.start(SceneKeys.MENU);
    });
  }
}