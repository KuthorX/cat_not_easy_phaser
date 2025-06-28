import * as Phaser from 'phaser';

export interface TweenPlayOptions {
  tweenKey: string;
  x: number;
  y: number;
  scale?: number;
  fps?: number;
  loop?: boolean;
  onComplete?: () => void;
}

export class TweenManager {
  private scene: Phaser.Scene;
  private activeTweens: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private tweenTimers: Map<string, Phaser.Time.TimerEvent> = new Map();
  private frameTimers: Map<string, Phaser.Time.TimerEvent> = new Map();
  private endCallbacks: Map<string, (() => void) | undefined> = new Map();

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

    // 计算动画持续时间（基于帧数和FPS）
    const frameCount = this.getFrameCount(tweenKey);
    const duration = (frameCount / fps) * 1000; // 转换为毫秒

    // 如果设置了循环，设置定时器重复播放
    if (loop) {
      const timer = this.scene.time.addEvent({
        delay: duration,
        callback: () => {
          this.restartTween(tweenKey, options);
        },
        loop: true
      });
      this.tweenTimers.set(tweenKey, timer);
    } else {
      // 如果不循环，设置定时器停止（但不调用回调，让帧动画结束时调用）
      const timer = this.scene.time.delayedCall(duration, () => {
        this.stopTween(tweenKey);
      });
      this.tweenTimers.set(tweenKey, timer);
    }

    // 开始帧动画
    this.startFrameAnimation(tweenKey, fps, frameCount);
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
  private startFrameAnimation(tweenKey: string, fps: number, frameCount: number): void {
    console.log('startFrameAnimation', tweenKey, fps, frameCount);
    const sprite = this.activeTweens.get(tweenKey);
    if (!sprite) return;

    let currentFrame = 1;
    const frameDelay = 1000 / fps; // 每帧的延迟时间

    const frameTimer = this.scene.time.addEvent({
      delay: frameDelay,
      callback: () => {
        if (currentFrame <= frameCount - 2) {
          const frameNumber = String(currentFrame).padStart(3, '0');
          const frameKey = `${tweenKey}_${frameNumber}`;
          if (this.scene.textures.exists(frameKey)) {
            sprite.setTexture(frameKey);
          }
          currentFrame++;
        } else {
          // 动画播放完毕，调用回调函数
          console.log('动画播放完毕，调用回调函数');
          const callback = this.endCallbacks.get(tweenKey);
          if (callback) {
            callback();
          }
          // 停止动画
          this.stopTween(tweenKey);
        }
      },
      loop: true
    });

    this.frameTimers.set(tweenKey, frameTimer);
  }

  /**
   * 重新开始动画
   */
  private restartTween(tweenKey: string, options: TweenPlayOptions): void {
    const sprite = this.activeTweens.get(tweenKey);
    if (sprite) {
      sprite.setTexture(tweenKey); // 重置为第一帧
    }
    
    // 重新开始帧动画
    const frameCount = this.getFrameCount(tweenKey);
    this.startFrameAnimation(tweenKey, options.fps || 10, frameCount);
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

    // 清理回调函数
    this.endCallbacks.delete(tweenKey);
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
  }
} 