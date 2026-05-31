export class TextRenderer {
  /**
   * 创建优化的中文文字
   * @param scene Phaser场景
   * @param x X坐标
   * @param y Y坐标
   * @param text 文字内容
   * @param config 文字配置
   * @returns 文字对象
   */
  static createChineseText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    config: Phaser.Types.GameObjects.Text.TextStyle = {}
  ): Phaser.GameObjects.Text {
    // 默认配置，优化中文显示
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
      lineSpacing: 2,
      ...config
    };

    const textObject = scene.add.text(x, y, text, defaultConfig);
    
    // 设置原点为左上角，然后手动调整位置
    textObject.setOrigin(0, 0);
    
    // 根据配置调整位置
    if (config.align === 'center') {
      textObject.setX(x - textObject.width / 2);
    } else if (config.align === 'right') {
      textObject.setX(x - textObject.width);
    }
    
    // 垂直居中调整
    if (config.align === 'center') {
      textObject.setY(y - textObject.height / 2);
    }
    
    return textObject;
  }

  /**
   * 创建居中的中文文字
   */
  static createCenteredText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    config: Phaser.Types.GameObjects.Text.TextStyle = {}
  ): Phaser.GameObjects.Text {
    return this.createChineseText(scene, x, y, text, {
      align: 'center',
      ...config
    });
  }

  /**
   * 创建标题文字
   */
  static createTitleText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    config: Phaser.Types.GameObjects.Text.TextStyle = {}
  ): Phaser.GameObjects.Text {
    return this.createCenteredText(scene, x, y, text, {
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#000000',
      padding: {
        top: 8,
        bottom: 8,
        left: 4,
        right: 4
      },
      ...config
    });
  }

  /**
   * 创建按钮文字
   */
  static createButtonText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    config: Phaser.Types.GameObjects.Text.TextStyle = {}
  ): Phaser.GameObjects.Text {
    return this.createCenteredText(scene, x, y, text, {
      fontSize: '24px',
      color: '#FFFFFF',
      padding: {
        top: 6,
        bottom: 6,
        left: 3,
        right: 3
      },
      ...config
    });
  }

  /**
   * 创建标签文字
   */
  static createLabelText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    config: Phaser.Types.GameObjects.Text.TextStyle = {}
  ): Phaser.GameObjects.Text {
    return this.createChineseText(scene, x, y, text, {
      fontSize: '20px',
      color: '#000000',
      align: 'left',
      padding: {
        top: 2,
        bottom: 2,
        left: 1,
        right: 1
      },
      ...config
    });
  }
} 