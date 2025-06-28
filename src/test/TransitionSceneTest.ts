import { TransitionScene } from '../scenes/TransitionScene';
import { TransitionConfig } from '../core/ui/TransitionPanel';

/**
 * 过渡场景测试类
 * 用于验证过渡场景的各种功能
 */
export class TransitionSceneTest {
  
  /**
   * 测试基本过渡功能
   */
  static testBasicTransition(scene: Phaser.Scene): void {
    console.log('测试基本过渡功能...');
    
    const config: TransitionConfig = {
      text: '这是一个测试过渡场景',
      leftButtonText: '取消',
      rightButtonText: '继续',
      backgroundColor: 0x2c3e50,
      textColor: 0xecf0f1,
      buttonColor: 0x34495e,
      buttonTextColor: 0xffffff
    };
    
    TransitionScene.createTransition(
      scene,
      config,
      'LivingRoomNorthScene'
    );
  }
  
  /**
   * 测试自定义样式过渡
   */
  static testCustomStyleTransition(scene: Phaser.Scene): void {
    console.log('测试自定义样式过渡...');
    
    TransitionScene.createTransition(
      scene,
      {
        text: '夜深了，你感到有些疲惫...',
        leftButtonText: '休息一下',
        rightButtonText: '继续冒险',
        backgroundColor: 0x1a1a2e,
        textColor: 0xf0f0f0,
        buttonColor: 0x16213e,
        buttonTextColor: 0xffffff
      },
      'LivingRoomNorthScene'
    );
  }
  
  /**
   * 测试带数据的场景切换
   */
  static testTransitionWithData(scene: Phaser.Scene): void {
    console.log('测试带数据的场景切换...');
    
    TransitionScene.createTransition(
      scene,
      {
        text: '你选择进入这个房间...',
        leftButtonText: '重新选择',
        rightButtonText: '进入房间'
      },
      'LivingRoomNorthScene',
      { 
        entryPoint: 'north',
        timeOfDay: 'night',
        testData: '这是测试数据'
      }
    );
  }
  
  /**
   * 测试默认配置
   */
  static testDefaultConfig(scene: Phaser.Scene): void {
    console.log('测试默认配置...');
    
    const defaultConfig = TransitionScene.getDefaultConfig();
    console.log('默认配置:', defaultConfig);
    
    TransitionScene.createTransition(
      scene,
      {}, // 使用默认配置
      'LivingRoomNorthScene'
    );
  }
  
  /**
   * 运行所有测试
   */
  static runAllTests(scene: Phaser.Scene): void {
    console.log('开始运行过渡场景测试...');
    
    // 延迟执行测试，确保场景已完全加载
    setTimeout(() => {
      this.testBasicTransition(scene);
    }, 1000);
    
    setTimeout(() => {
      this.testCustomStyleTransition(scene);
    }, 3000);
    
    setTimeout(() => {
      this.testTransitionWithData(scene);
    }, 5000);
    
    setTimeout(() => {
      this.testDefaultConfig(scene);
    }, 7000);
  }
}

/**
 * 在控制台中运行测试的便捷函数
 */
export function runTransitionTests(scene: Phaser.Scene): void {
  // 将测试函数挂载到全局，方便在控制台调用
  (window as any).transitionTests = {
    basic: () => TransitionSceneTest.testBasicTransition(scene),
    custom: () => TransitionSceneTest.testCustomStyleTransition(scene),
    withData: () => TransitionSceneTest.testTransitionWithData(scene),
    default: () => TransitionSceneTest.testDefaultConfig(scene),
    all: () => TransitionSceneTest.runAllTests(scene)
  };
  
  console.log('过渡场景测试已准备就绪！');
  console.log('在控制台中可以使用以下命令：');
  console.log('- transitionTests.basic() - 测试基本过渡');
  console.log('- transitionTests.custom() - 测试自定义样式');
  console.log('- transitionTests.withData() - 测试带数据的切换');
  console.log('- transitionTests.default() - 测试默认配置');
  console.log('- transitionTests.all() - 运行所有测试');
} 