/**
 * 交互式外框渲染器
 * 为可交互物体渲染虚线外框效果
 */
export class InteractiveOutlineRenderer {
  private scene: Phaser.Scene;
  private outlineGraphics: Phaser.GameObjects.Graphics;
  private activeOutlines: Map<string, Phaser.GameObjects.Graphics> = new Map();
  private tweenManager: Phaser.Tweens.TweenManager;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.outlineGraphics = scene.add.graphics();
    this.outlineGraphics.setDepth(1000);
    this.tweenManager = scene.tweens;
  }

  /**
   * 为交互对象创建虚线外框
   * @param objectId 对象ID
   * @param x X坐标
   * @param y Y坐标
   * @param width 宽度
   * @param height 高度
   * @param color 外框颜色
   * @param thickness 外框厚度
   * @param scale 缩放比例
   * @param outlineConfig 自定义外框配置
   * @returns 外框图形对象
   */
  public createInteractiveOutline(
    objectId: string,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number = 0x000000,
    thickness: number = 2,
    scale: number = 1,
    outlineConfig?: any
  ): Phaser.GameObjects.Graphics {
    // 移除已存在的外框
    this.removeInteractiveOutline(objectId);

    const outline = this.scene.add.graphics();
    outline.setDepth(1000);
    
    // 应用自定义配置
    let finalColor = color;
    let finalThickness = thickness;
    let finalScale = scale;
    let finalX = x;
    let finalY = y;
    let finalWidth = width;
    let finalHeight = height;
    
    if (outlineConfig) {
      // 应用颜色配置
      if (outlineConfig.color) {
        // 将颜色字符串转换为数字
        finalColor = this.parseColor(outlineConfig.color);
      }
      
      // 应用偏移配置
      if (outlineConfig.offset_x !== undefined) {
        finalX += outlineConfig.offset_x;
      }
      if (outlineConfig.offset_y !== undefined) {
        finalY += outlineConfig.offset_y;
      }
      
      // 应用尺寸偏移配置
      if (outlineConfig.offset_width !== undefined) {
        finalWidth += outlineConfig.offset_width;
      }
      if (outlineConfig.offset_height !== undefined) {
        finalHeight += outlineConfig.offset_height;
      }
      
      // 应用缩放偏移配置
      if (outlineConfig.offset_scale !== undefined) {
        finalScale *= outlineConfig.offset_scale;
      }
    }
    
    // 设置线条样式
    outline.lineStyle(finalThickness, finalColor, 1);
    
    // 应用缩放后的尺寸
    const scaledWidth = finalWidth * finalScale;
    const scaledHeight = finalHeight * finalScale;
    
    // 绘制虚线矩形外框 - 以物体中心为原点绘制，应用缩放
    this.drawDashedRect(outline, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
    
    // 设置外框位置为物体中心
    outline.setPosition(finalX, finalY);
    
    // 创建动画效果
    this.createOutlineAnimation(outline, scaledWidth, scaledHeight);
    
    // 存储外框引用
    this.activeOutlines.set(objectId, outline);
    
    return outline;
  }

  /**
   * 绘制虚线矩形
   * @param graphics 图形对象
   * @param x X坐标
   * @param y Y坐标
   * @param width 宽度
   * @param height 高度
   */
  private drawDashedRect(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const dashLength = 10;
    const gapLength = 5;
    const totalLength = dashLength + gapLength;
    
    // 绘制上边
    this.drawDashedLine(graphics, x, y, x + width, y, totalLength, dashLength);
    
    // 绘制右边
    this.drawDashedLine(graphics, x + width, y, x + width, y + height, totalLength, dashLength);
    
    // 绘制下边
    this.drawDashedLine(graphics, x + width, y + height, x, y + height, totalLength, dashLength);
    
    // 绘制左边
    this.drawDashedLine(graphics, x, y + height, x, y, totalLength, dashLength);
  }

  /**
   * 绘制虚线
   * @param graphics 图形对象
   * @param x1 起始X坐标
   * @param y1 起始Y坐标
   * @param x2 结束X坐标
   * @param y2 结束Y坐标
   * @param totalLength 总长度（虚线+空白）
   * @param dashLength 虚线长度
   */
  private drawDashedLine(
    graphics: Phaser.GameObjects.Graphics,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    totalLength: number,
    dashLength: number
  ): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;
    
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    let currentDistance = 0;
    let isDrawing = true;
    
    while (currentDistance < distance) {
      const segmentLength = Math.min(
        isDrawing ? dashLength : totalLength - dashLength,
        distance - currentDistance
      );
      
      if (isDrawing) {
        const startX = x1 + unitX * currentDistance;
        const startY = y1 + unitY * currentDistance;
        const endX = x1 + unitX * (currentDistance + segmentLength);
        const endY = y1 + unitY * (currentDistance + segmentLength);
        
        graphics.beginPath();
        graphics.moveTo(startX, startY);
        graphics.lineTo(endX, endY);
        graphics.strokePath();
      }
      
      currentDistance += segmentLength;
      isDrawing = !isDrawing;
    }
  }

  /**
   * 创建外框动画效果
   * @param outline 外框图形对象
   * @param originalWidth 原始宽度
   * @param originalHeight 原始高度
   */
  private createOutlineAnimation(
    outline: Phaser.GameObjects.Graphics,
    originalWidth: number,
    originalHeight: number
  ): void {
    // 创建缩放动画 - 由于外框已经以物体中心为原点绘制，缩放会以中心为基准
    this.tweenManager.add({
      targets: outline,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 1200,
      ease: 'Power2',
      yoyo: true,
      repeat: -1
    });

    // 创建透明度动画
    this.tweenManager.add({
      targets: outline,
      alpha: 0.4,
      duration: 1000,
      ease: 'Power2',
      yoyo: true,
      repeat: -1,
      delay: 300
    });
  }

  /**
   * 移除交互式外框
   * @param objectId 对象ID
   */
  public removeInteractiveOutline(objectId: string): void {
    const outline = this.activeOutlines.get(objectId);
    if (outline) {
      // 停止动画
      this.tweenManager.killTweensOf(outline);
      
      // 销毁图形对象
      outline.destroy();
      
      // 从映射中移除
      this.activeOutlines.delete(objectId);
    }
  }

  /**
   * 显示交互式外框
   * @param objectId 对象ID
   */
  public showInteractiveOutline(objectId: string): void {
    const outline = this.activeOutlines.get(objectId);
    if (outline) {
      outline.setVisible(true);
    }
  }

  /**
   * 隐藏交互式外框
   * @param objectId 对象ID
   */
  public hideInteractiveOutline(objectId: string): void {
    const outline = this.activeOutlines.get(objectId);
    if (outline) {
      outline.setVisible(false);
    }
  }

  /**
   * 清理所有外框
   */
  public clearAllOutlines(): void {
    this.activeOutlines.forEach((outline, objectId) => {
      this.removeInteractiveOutline(objectId);
    });
  }

  /**
   * 销毁渲染器
   */
  public destroy(): void {
    this.clearAllOutlines();
    if (this.outlineGraphics) {
      this.outlineGraphics.destroy();
    }
  }

  /**
   * 将颜色字符串转换为数字
   * @param colorString 颜色字符串 (如 "#000000", "black", "0x000000")
   * @returns 颜色数字
   */
  private parseColor(colorString: string): number {
    if (colorString.startsWith('#')) {
      // 十六进制颜色
      return parseInt(colorString.substring(1), 16);
    } else if (colorString.startsWith('0x')) {
      // 0x格式颜色
      return parseInt(colorString.substring(2), 16);
    } else {
      // 预定义颜色名称
      const colorMap: Record<string, number> = {
        'black': 0x000000,
        'white': 0xFFFFFF,
        'red': 0xFF0000,
        'green': 0x00FF00,
        'blue': 0x0000FF,
        'yellow': 0xFFFF00,
        'cyan': 0x00FFFF,
        'magenta': 0xFF00FF,
        'gray': 0x808080,
        'grey': 0x808080,
        'orange': 0xFFA500,
        'purple': 0x800080,
        'brown': 0xA52A2A,
        'pink': 0xFFC0CB
      };
      return colorMap[colorString.toLowerCase()] || 0x000000;
    }
  }
} 