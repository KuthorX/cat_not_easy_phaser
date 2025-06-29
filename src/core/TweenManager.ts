import * as Phaser from 'phaser';

export interface TweenPlayOptions {
  tweenKey: string;
  x: number;
  y: number;
  scale?: number;
  fps?: number;
  loop?: boolean;
  repeat?: number;
  onComplete?: () => void;
}

export class TweenManager {
  private scene: Phaser.Scene;
  private activeTweens: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private tweenTimers: Map<string, Phaser.Time.TimerEvent> = new Map();
  private frameTimers: Map<string, Phaser.Time.TimerEvent> = new Map();
  private endCallbacks: Map<string, (() => void) | undefined> = new Map();
  private repeatCounts: Map<string, { current: number; total: number }> = new Map();
  private frameStates: Map<string, { currentFrame: number; frameCount: number }> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 播放PNG序列动画
   * 通过定时器来模拟动画效果
   */
  public playTween(options: TweenPlayOptions, endCallback?: () => void): void {
    const { 
      tweenKey, 
      x, 
      y, 
      scale = 0.5, 
      fps = 60, 
      loop = false, 
      repeat = 1,
      onComplete 
    } = options;

    // 如果已经有相同key的动画在播放，先停止它
    this.stopTween(tweenKey);

    // 检查纹理是否存在
    if (!this.scene.textures.exists(tweenKey)) {
      console.warn(`PNG序列纹理未找到: ${tweenKey}`);
      return;
    }

    // 创建精灵
    const sprite = this.scene.add.sprite(x, y, tweenKey);
    sprite.setScale(scale);
    
    // 存储活跃的动画
    this.activeTweens.set(tweenKey, sprite);

    // 存储回调函数
    this.endCallbacks.set(tweenKey, endCallback);

    // 初始化重复计数
    this.repeatCounts.set(tweenKey, { current: 0, total: repeat });

    // 计算动画持续时间（基于帧数和FPS）
    const frameCount = this.getFrameCount(tweenKey);
    const duration = (frameCount / fps) * 1000; // 转换为毫秒

    // 初始化帧状态
    this.frameStates.set(tweenKey, { currentFrame: 1, frameCount });

    // 开始帧动画
    this.startFrameAnimation(tweenKey, fps, options);
  }

  /**
   * 获取PNG序列的帧数
   */
  private getFrameCount(tweenKey: string): number {
    let frameCount = 0;
    for (let i = 1; i <= 999; i++) {
      const frameNumber = String(i).padStart(3, '0');
      const frameKey = `${tweenKey}_${frameNumber}`;
      if (this.scene.textures.exists(frameKey)) {
        frameCount = i;
      } else {
        break;
      }
    }
    return frameCount;
  }

  /**
   * 开始帧动画
   */
  private startFrameAnimation(tweenKey: string, fps: number, options: TweenPlayOptions): void {
    console.log('startFrameAnimation', tweenKey, fps);
    const sprite = this.activeTweens.get(tweenKey);
    const frameState = this.frameStates.get(tweenKey);
    if (!sprite || !frameState) return;

    const frameDelay = 1000 / fps; // 每帧的延迟时间

    const frameTimer = this.scene.time.addEvent({
      delay: frameDelay,
      callback: () => {
        this.updateFrame(tweenKey, options);
      },
      loop: true
    });

    this.frameTimers.set(tweenKey, frameTimer);
  }

  /**
   * 更新帧
   */
  private updateFrame(tweenKey: string, options: TweenPlayOptions): void {
    const sprite = this.activeTweens.get(tweenKey);
    const frameState = this.frameStates.get(tweenKey);
    const repeatInfo = this.repeatCounts.get(tweenKey);
    
    if (!sprite || !frameState || !repeatInfo) {
      console.warn('updateFrame: 缺少必要的状态信息', { tweenKey, sprite: !!sprite, frameState: !!frameState, repeatInfo: !!repeatInfo });
      return;
    }

    console.log('updateFrame', tweenKey, frameState.currentFrame, frameState.frameCount);

    if (frameState.currentFrame <= frameState.frameCount) {
      // 继续播放当前帧
      const frameNumber = String(frameState.currentFrame).padStart(3, '0');
      const frameKey = `${tweenKey}_${frameNumber}`;
      if (this.scene.textures.exists(frameKey)) {
        sprite.setTexture(frameKey);
      }
      frameState.currentFrame++;
    } else {
      // 当前动画播放完毕，检查是否需要重复
      console.log('动画播放完毕，检查是否需要重复');
      console.log('repeatInfo', repeatInfo);
      
      repeatInfo.current++;
      
      if (repeatInfo.current < repeatInfo.total) {
        // 还需要重复播放
        console.log(`动画 ${tweenKey} 重复播放 ${repeatInfo.current}/${repeatInfo.total}`);
        // 重置帧计数并继续播放
        frameState.currentFrame = 1;
        sprite.setTexture(tweenKey); // 重置为第一帧
      } else {
        // 所有重复播放完成，调用回调函数
        console.log(`动画 ${tweenKey} 播放完毕，共播放 ${repeatInfo.total} 次`);
        const callback = this.endCallbacks.get(tweenKey);
        if (callback) {
          callback();
        }
        // 停止动画
        this.stopTween(tweenKey);
      }
    }
  }

  /**
   * 停止PNG序列动画
   */
  public stopTween(tweenKey: string): void {
    const sprite = this.activeTweens.get(tweenKey);
    if (sprite) {
      sprite.destroy();
      this.activeTweens.delete(tweenKey);
    }

    const timer = this.tweenTimers.get(tweenKey);
    if (timer) {
      timer.destroy();
      this.tweenTimers.delete(tweenKey);
    }

    const frameTimer = this.frameTimers.get(tweenKey);
    if (frameTimer) {
      frameTimer.destroy();
      this.frameTimers.delete(tweenKey);
    }

    // 清理回调函数、重复计数和帧状态
    this.endCallbacks.delete(tweenKey);
    this.repeatCounts.delete(tweenKey);
    this.frameStates.delete(tweenKey);
  }

  /**
   * 停止所有PNG序列动画
   */
  public stopAllTweens(): void {
    this.activeTweens.forEach((sprite, key) => {
      this.stopTween(key);
    });
  }

  /**
   * 检查PNG序列动画是否正在播放
   */
  public isTweenPlaying(tweenKey: string): boolean {
    return this.activeTweens.has(tweenKey);
  }

  /**
   * 获取活跃动画数量
   */
  public getActiveTweenCount(): number {
    return this.activeTweens.size;
  }

  /**
   * 销毁管理器
   */
  public destroy(): void {
    this.stopAllTweens();
    this.activeTweens.clear();
    this.tweenTimers.clear();
    this.frameTimers.clear();
    this.endCallbacks.clear();
    this.repeatCounts.clear();
    this.frameStates.clear();
  }
} 