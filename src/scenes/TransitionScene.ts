import { BaseScene } from './BaseScene';
import { TransitionPanel, TransitionConfig } from '@/core/ui/TransitionPanel';

export interface TransitionSceneData {
  config: TransitionConfig;
  nextScene?: string;
  nextSceneData?: any;
}

export class TransitionScene extends BaseScene {
  private static transitionPanel?: TransitionPanel;
  private sceneData?: TransitionSceneData;

  constructor() {
    super('TransitionScene');
  }

  init(data?: TransitionSceneData): void {
    this.sceneData = data;
  }

  protected initializeScene(): void {
    if (!this.sceneData?.config) {
      console.error('TransitionScene: No config provided');
      return;
    }

    // 创建过渡面板
    TransitionScene.transitionPanel = new TransitionPanel(this.sceneData.config);
    TransitionScene.transitionPanel.initialize(this);

    // 显示过渡面板
    TransitionScene.transitionPanel.show();
  }

  protected setupEventListeners(): void {
    // 继承父类的事件监听
    super.setupEventListeners();
  }

  // 切换到下一个场景
  private switchToNextScene(): void {
    if (this.sceneData?.nextScene) {
      this.scene.start(this.sceneData.nextScene, this.sceneData.nextSceneData);
    }
  }

  // 返回上一个场景
  private goBack(): void {
    this.scene.stop();
  }

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
      ...TransitionScene.getDefaultConfig(),
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
        TransitionScene.transitionPanel?.hide();
      }
    };

    scene.scene.start('TransitionScene', {
      config: fullConfig,
      nextScene,
      nextSceneData
    });
  }
} 