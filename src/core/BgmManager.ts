import { VolumeManager } from './VolumeManager';

export class BgmManager {
  private static instance: BgmManager;
  private currentMusic: Phaser.Sound.BaseSound | null = null;
  private currentMusicKey: string | null = null;
  private volumeManager: VolumeManager;
  private isPlaying: boolean = false;

  private constructor() {
    this.volumeManager = VolumeManager.getInstance();
    
    // 监听音量变化事件
    this.volumeManager.onMusicVolumeChanged((volume) => {
      this.updateVolume(volume);
    });
  }

  public static getInstance(): BgmManager {
    if (!BgmManager.instance) {
      BgmManager.instance = new BgmManager();
    }
    return BgmManager.instance;
  }

  // 播放BGM，如果已经在播放相同的音乐则不会重新播放
  public playBgm(musicKey: string, scene: Phaser.Scene, loop: boolean = true): void {
    // 如果已经在播放相同的音乐，则不重新播放
    if (this.currentMusicKey === musicKey && this.isPlaying) {
      return;
    }

    // 停止当前音乐
    this.stopBgm();

    // 创建新的音乐
    this.currentMusic = scene.sound.add(musicKey, {
      volume: this.volumeManager.getMusicVolume(),
      loop: loop
    });

    this.currentMusicKey = musicKey;
    this.currentMusic.play();
    this.isPlaying = true;
  }

  // 停止BGM
  public stopBgm(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = null;
    }
    this.currentMusicKey = null;
    this.isPlaying = false;
  }

  // 暂停BGM
  public pauseBgm(): void {
    if (this.currentMusic && this.isPlaying) {
      this.currentMusic.pause();
      this.isPlaying = false;
    }
  }

  // 恢复BGM
  public resumeBgm(): void {
    if (this.currentMusic && !this.isPlaying) {
      this.currentMusic.resume();
      this.isPlaying = true;
    }
  }

  // 更新音量
  private updateVolume(volume: number): void {
    if (this.currentMusic && this.currentMusic instanceof Phaser.Sound.WebAudioSound) {
      this.currentMusic.setVolume(volume);
    }
  }

  // 获取当前播放的音乐键
  public getCurrentMusicKey(): string | null {
    return this.currentMusicKey;
  }

  // 检查是否正在播放
  public isBgmPlaying(): boolean {
    return this.isPlaying;
  }
} 