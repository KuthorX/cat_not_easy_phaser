import { VolumeManager } from './VolumeManager';

export class AudioManager {
  private game: Phaser.Game;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private music: Phaser.Sound.BaseSound | null = null;
  private volumeManager: VolumeManager;

  constructor(game: Phaser.Game) {
    this.game = game;
    this.volumeManager = VolumeManager.getInstance();
    
    // 监听音量变化事件
    this.volumeManager.onMusicVolumeChanged((volume) => {
      this.updateMusicVolume(volume);
    });
    
    this.volumeManager.onSoundVolumeChanged((volume) => {
      this.updateSoundVolume(volume);
    });
  }

  // 预加载音频
  public preload(scene: Phaser.Scene): void {
    // 背景音乐
    scene.load.audio('bgm_living_room', 'assets/audio/bgm_living_room.mp3');
  }

  // 创建音频
  public create(scene: Phaser.Scene): void {
    // 设置音量
    this.sounds.forEach(sound => {
      if (sound instanceof Phaser.Sound.WebAudioSound) {
        sound.setVolume(this.volumeManager.getSoundVolume());
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
  public playMusic(musicKey: string, scene?: Phaser.Scene, loop: boolean = true): void {
    this.stopMusic();
    
    // 如果没有传入场景，尝试获取当前活跃场景
    const targetScene = scene || this.game.scene.getScene('MENU');
    if (targetScene) {
      this.music = targetScene.sound.add(musicKey, {
        volume: this.volumeManager.getMusicVolume(),
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

  // 更新音乐音量（内部方法，由VolumeManager调用）
  private updateMusicVolume(volume: number): void {
    if (this.music && this.music instanceof Phaser.Sound.WebAudioSound) {
      this.music.setVolume(volume);
    }
  }

  // 更新音效音量（内部方法，由VolumeManager调用）
  private updateSoundVolume(volume: number): void {
    this.sounds.forEach(sound => {
      if (sound instanceof Phaser.Sound.WebAudioSound) {
        sound.setVolume(volume);
      }
    });
  }

  // 播放房间背景音乐
  public playRoomMusic(roomKey: string, scene?: Phaser.Scene): void {
    const musicMap: Record<string, string> = {
      'living_room_north': 'bgm_living_room',
      'living_room_east': 'bgm_living_room',
      'living_room_west_low': 'bgm_living_room',
      'living_room_west_high': 'bgm_living_room',
      'living_room_door': 'bgm_living_room',
      'room_b': 'bgm_living_room',
      'hallway': 'bgm_living_room'
    };

    const musicKey = musicMap[roomKey];
    if (musicKey) {
      this.playMusic(musicKey, scene);
    }
  }

  // 播放动作相关音效
  public playActionSound(actionId: string): void {
    // 暂时不播放音效，因为音效文件不存在
  }

  // 播放成就音效
  public playAchievementSound(): void {
    // 暂时不播放音效，因为音效文件不存在
  }

  // 播放时间推进音效
  public playTimeAdvanceSound(): void {
    // 暂时不播放音效，因为音效文件不存在
  }

  // 播放房间切换音效
  public playRoomChangeSound(): void {
    // 暂时不播放音效，因为音效文件不存在
  }
} 