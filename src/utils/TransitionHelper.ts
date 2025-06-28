import { TransitionPanel, TransitionConfig } from '../core/ui/TransitionPanel';

export class TransitionHelper {
  // 获取默认配置
  static getDefaultConfig(): TransitionConfig {
    return {
      text: '这是一个过渡场景',
      leftButtonText: '返回',
      rightButtonText: '继续',
      backgroundColor: 0x000000,
      textColor: 0xffffff,
      buttonColor: 0x4a4a4a,
      buttonTextColor: 0xffffff
    };
  }

  // 创建过渡场景的便捷方法
  static createTransition(
    scene: Phaser.Scene,
    config: Partial<TransitionConfig>,
    nextScene?: string,
    nextSceneData?: any
  ): void {
    const fullConfig: TransitionConfig = {
      ...TransitionHelper.getDefaultConfig(),
      ...config,
      leftButtonCallback: () => {
        scene.scene.stop();
      },
      rightButtonCallback: () => {
        if (nextScene) {
          scene.scene.start(nextScene, nextSceneData);
        } else {
          scene.scene.stop();
        }
        // 销毁过渡场景
        scene.scene.stop('TransitionScene');
      }
    };

    scene.scene.start('TransitionScene', {
      config: fullConfig,
      nextScene,
      nextSceneData
    });
  }
} 