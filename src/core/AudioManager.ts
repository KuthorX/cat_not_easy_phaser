export class AudioManager {
  private game: Phaser.Game;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private music: Phaser.Sound.BaseSound | null = null;
  private volume: number = 0.5;
  private musicVolume: number = 0.3;

  constructor(game: Phaser.Game) {
    this.game = game;
  }

  // 预加载音频
  public preload(scene: Phaser.Scene): void {
    // 背景音乐
    scene.load.audio('bgm_living_room', 'assets/audio/bgm_living_room.mp3');
    scene.load.audio('bgm_owner_room', 'assets/audio/bgm_owner_room.mp3');
    scene.load.audio('bgm_hallway', 'assets/audio/bgm_hallway.mp3');
    
    // 音效
    scene.load.audio('sfx_cat_meow', 'assets/audio/sfx_cat_meow.mp3');
    scene.load.audio('sfx_cat_purr', 'assets/audio/sfx_cat_purr.mp3');
    scene.load.audio('sfx_cat_scratch', 'assets/audio/sfx_cat_scratch.mp3');
    scene.load.audio('sfx_cat_eat', 'assets/audio/sfx_cat_eat.mp3');
    scene.load.audio('sfx_cat_sleep', 'assets/audio/sfx_cat_sleep.mp3');
    scene.load.audio('sfx_door_open', 'assets/audio/sfx_door_open.mp3');
    scene.load.audio('sfx_door_close', 'assets/audio/sfx_door_close.mp3');
    scene.load.audio('sfx_item_pickup', 'assets/audio/sfx_item_pickup.mp3');
    scene.load.audio('sfx_item_destroy', 'assets/audio/sfx_item_destroy.mp3');
    scene.load.audio('sfx_achievement', 'assets/audio/sfx_achievement.mp3');
    scene.load.audio('sfx_time_advance', 'assets/audio/sfx_time_advance.mp3');
  }

  // 创建音频
  public create(scene: Phaser.Scene): void {
    // 创建音效
    this.sounds.set('cat_meow', scene.sound.add('sfx_cat_meow'));
    this.sounds.set('cat_purr', scene.sound.add('sfx_cat_purr'));
    this.sounds.set('cat_scratch', scene.sound.add('sfx_cat_scratch'));
    this.sounds.set('cat_eat', scene.sound.add('sfx_cat_eat'));
    this.sounds.set('cat_sleep', scene.sound.add('sfx_cat_sleep'));
    this.sounds.set('door_open', scene.sound.add('sfx_door_open'));
    this.sounds.set('door_close', scene.sound.add('sfx_door_close'));
    this.sounds.set('item_pickup', scene.sound.add('sfx_item_pickup'));
    this.sounds.set('item_destroy', scene.sound.add('sfx_item_destroy'));
    this.sounds.set('achievement', scene.sound.add('sfx_achievement'));
    this.sounds.set('time_advance', scene.sound.add('sfx_time_advance'));

    // 设置音量
    this.sounds.forEach(sound => {
      if (sound instanceof Phaser.Sound.WebAudioSound) {
        sound.setVolume(this.volume);
      }
    });
  }

  // 播放音效
  public playSound(soundKey: string, config?: Phaser.Types.Sound.SoundConfig): void {
    const sound = this.sounds.get(soundKey);
    if (sound) {
      sound.play(config);
    }
  }

  // 播放背景音乐
  public playMusic(musicKey: string, loop: boolean = true): void {
    this.stopMusic();
    
    const scene = this.game.scene.getScene('GameScene');
    if (scene) {
      this.music = scene.sound.add(musicKey, {
        volume: this.musicVolume,
        loop: loop
      });
      this.music.play();
    }
  }

  // 停止背景音乐
  public stopMusic(): void {
    if (this.music) {
      this.music.stop();
      this.music.destroy();
      this.music = null;
    }
  }

  // 暂停背景音乐
  public pauseMusic(): void {
    if (this.music) {
      this.music.pause();
    }
  }

  // 恢复背景音乐
  public resumeMusic(): void {
    if (this.music) {
      this.music.resume();
    }
  }

  // 设置音效音量
  public setSoundVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(sound => {
      if (sound instanceof Phaser.Sound.WebAudioSound) {
        sound.setVolume(this.volume);
      }
    });
  }

  // 设置音乐音量
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.music && this.music instanceof Phaser.Sound.WebAudioSound) {
      this.music.setVolume(this.musicVolume);
    }
  }

  // 获取音效音量
  public getSoundVolume(): number {
    return this.volume;
  }

  // 获取音乐音量
  public getMusicVolume(): number {
    return this.musicVolume;
  }

  // 播放房间背景音乐
  public playRoomMusic(roomKey: string): void {
    const musicMap: Record<string, string> = {
      'living_room_north': 'bgm_living_room',
      'living_room_east': 'bgm_living_room',
      'living_room_west_low': 'bgm_living_room',
      'living_room_west_high': 'bgm_living_room',
      'living_room_door': 'bgm_living_room',
      'room_b': 'bgm_owner_room',
      'hallway': 'bgm_hallway'
    };

    const musicKey = musicMap[roomKey];
    if (musicKey) {
      this.playMusic(musicKey);
    }
  }

  // 播放动作相关音效
  public playActionSound(actionId: string): void {
    const soundMap: Record<string, string> = {
      'sunbathing': 'cat_purr',
      'sleep_on_sofa': 'cat_sleep',
      'sleep_on_bed': 'cat_sleep',
      'scratch_sofa': 'cat_scratch',
      'attack_cage': 'cat_scratch',
      'play_in_house': 'cat_meow',
      'play_with_mouse': 'cat_meow',
      'eat_fish_treat': 'cat_eat',
      'carry_mouse': 'item_pickup',
      'destroy_screen': 'item_destroy'
    };

    const soundKey = soundMap[actionId];
    if (soundKey) {
      this.playSound(soundKey);
    }
  }

  // 播放成就音效
  public playAchievementSound(): void {
    this.playSound('achievement');
  }

  // 播放时间推进音效
  public playTimeAdvanceSound(): void {
    this.playSound('time_advance');
  }

  // 播放房间切换音效
  public playRoomChangeSound(): void {
    this.playSound('door_open');
  }
} 