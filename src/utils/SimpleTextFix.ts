/**
 * 简单的文字渲染修复工具
 * 解决中文文字被切断的问题
 */
export class SimpleTextFix {
  /**
   * 创建不会被切断的中文文字
   * @param scene Phaser场景
   * @param x X坐标
   * @param y Y坐标
   * @param text 文字内容
   * @param config 文字配置
   * @returns 文字对象
   */
  static createText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    config: Phaser.Types.GameObjects.Text.TextStyle = {}
  ): Phaser.GameObjects.Text {
    // 添加内边距来防止文字被切断
    const defaultConfig: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '24px',
      color: '#000000',
      fontFamily: 'Arial, "Microsoft YaHei", "微软雅黑", sans-serif',
      padding: {
        top: 4,
        bottom: 4,
        left: 2,
        right: 2
      },
      ...config
    };

    const textObject = scene.add.text(x, y, text, defaultConfig);
    
    // 使用左上角原点，然后手动调整位置
    textObject.setOrigin(0, 0);
    
    // 根据对齐方式调整位置
    if (config.align === 'center') {
      textObject.setX(x - textObject.width / 2);
      textObject.setY(y - textObject.height / 2);
    } else if (config.align === 'right') {
      textObject.setX(x - textObject.width);
      textObject.setY(y - textObject.height / 2);
    } else {
      // 左对齐，只调整垂直位置
      textObject.setY(y - textObject.height / 2);
    }
    
    return textObject;
  }

  /**
   * 快速修复现有文字对象
   * @param textObject 文字对象
   * @param x 新的X坐标
   * @param y 新的Y坐标
   */
  static fixTextPosition(
    textObject: Phaser.GameObjects.Text,
    x: number,
    y: number
  ): void {
    textObject.setOrigin(0, 0);
    textObject.setX(x - textObject.width / 2);
    textObject.setY(y - textObject.height / 2);
  }
} 