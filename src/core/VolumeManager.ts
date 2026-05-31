import { EventEmitter } from '../utils/EventEmitter';

export interface VolumeState {
  musicVolume: number;
  soundVolume: number;
}

export class VolumeManager extends EventEmitter {
  private static instance: VolumeManager;
  private state: VolumeState = {
    musicVolume: 0, // 默认音乐音量为0
    soundVolume: 0  // 默认音效音量为0
  };

  private constructor() {
    super();
    // 从本地存储加载音量设置
    this.loadFromStorage();
  }

  public static getInstance(): VolumeManager {
    if (!VolumeManager.instance) {
      VolumeManager.instance = new VolumeManager();
    }
    return VolumeManager.instance;
  }

  // 获取当前音量状态
  public getState(): VolumeState {
    return { ...this.state };
  }

  // 获取音乐音量
  public getMusicVolume(): number {
    return this.state.musicVolume;
  }

  // 获取音效音量
  public getSoundVolume(): number {
    return this.state.soundVolume;
  }

  // 设置音乐音量
  public setMusicVolume(volume: number): void {
    const newVolume = Math.max(0, Math.min(1, volume));
    if (this.state.musicVolume !== newVolume) {
      this.state.musicVolume = newVolume;
      this.saveToStorage();
      this.emit('volumeChanged', { ...this.state });
      this.emit('musicVolumeChanged', newVolume);
    }
  }

  // 设置音效音量
  public setSoundVolume(volume: number): void {
    const newVolume = Math.max(0, Math.min(1, volume));
    if (this.state.soundVolume !== newVolume) {
      this.state.soundVolume = newVolume;
      this.saveToStorage();
      this.emit('volumeChanged', { ...this.state });
      this.emit('soundVolumeChanged', newVolume);
    }
  }

  // 批量更新音量设置
  public updateVolume(updates: Partial<VolumeState>): void {
    let hasChanges = false;
    
    if (updates.musicVolume !== undefined) {
      const newMusicVolume = Math.max(0, Math.min(1, updates.musicVolume));
      if (this.state.musicVolume !== newMusicVolume) {
        this.state.musicVolume = newMusicVolume;
        hasChanges = true;
      }
    }
    
    if (updates.soundVolume !== undefined) {
      const newSoundVolume = Math.max(0, Math.min(1, updates.soundVolume));
      if (this.state.soundVolume !== newSoundVolume) {
        this.state.soundVolume = newSoundVolume;
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      this.saveToStorage();
      this.emit('volumeChanged', { ...this.state });
      if (updates.musicVolume !== undefined) {
        this.emit('musicVolumeChanged', this.state.musicVolume);
      }
      if (updates.soundVolume !== undefined) {
        this.emit('soundVolumeChanged', this.state.soundVolume);
      }
    }
  }

  // 重置为默认值
  public resetToDefaults(): void {
    this.updateVolume({
      musicVolume: 0,
      soundVolume: 0
    });
  }

  // 保存到本地存储
  private saveToStorage(): void {
    try {
      localStorage.setItem('cat_game_volume', JSON.stringify(this.state));
    } catch (error) {
      console.warn('Failed to save volume settings to localStorage:', error);
    }
  }

  // 从本地存储加载
  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('cat_game_volume');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // 确保加载的数据是有效的
          if (typeof parsed.musicVolume === 'number' && parsed.musicVolume >= 0 && parsed.musicVolume <= 1) {
            this.state.musicVolume = parsed.musicVolume;
          }
          if (typeof parsed.soundVolume === 'number' && parsed.soundVolume >= 0 && parsed.soundVolume <= 1) {
            this.state.soundVolume = parsed.soundVolume;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load volume settings from localStorage:', error);
    }
  }

  // 订阅音量变化事件
  public onVolumeChanged(callback: (state: VolumeState) => void): () => void {
    this.on('volumeChanged', callback);
    return () => this.off('volumeChanged', callback);
  }

  // 订阅音乐音量变化事件
  public onMusicVolumeChanged(callback: (volume: number) => void): () => void {
    this.on('musicVolumeChanged', callback);
    return () => this.off('musicVolumeChanged', callback);
  }

  // 订阅音效音量变化事件
  public onSoundVolumeChanged(callback: (volume: number) => void): () => void {
    this.on('soundVolumeChanged', callback);
    return () => this.off('soundVolumeChanged', callback);
  }
} 