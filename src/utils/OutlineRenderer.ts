/**
 * 物体轮廓描边渲染工具
 * 使用Phaser的渲染机制实现精确的物体轮廓描边
 */
export class OutlineRenderer {
  private scene: Phaser.Scene;
  private outlineGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.outlineGraphics = scene.add.graphics();
    this.outlineGraphics.setDepth(1000); // 确保描边在最上层
  }

  /**
   * 为图片对象创建精确的轮廓描边
   * @param image 目标图片对象
   * @param color 描边颜色
   * @param thickness 描边厚度
   * @returns 描边图形对象
   */
  public createPreciseOutline(
    image: Phaser.GameObjects.Image,
    color: number = 0x000000,
    thickness: number = 3
  ): Phaser.GameObjects.Graphics {
    const outline = this.scene.add.graphics();
    outline.setDepth(image.depth + 1);

    // 获取图片的实际轮廓路径
    const outlinePath = this.generateOptimizedOutline(image, thickness);
    
    if (outlinePath.length > 0) {
      outline.lineStyle(thickness, color, 1);
      outline.strokePoints(outlinePath, true, true);
    }

    return outline;
  }

  /**
   * 生成优化的轮廓路径
   * @param image 目标图片
   * @param thickness 描边厚度
   * @returns 轮廓路径点数组
   */
  private generateOptimizedOutline(
    image: Phaser.GameObjects.Image,
    thickness: number
  ): number[] {
    try {
      const texture = image.texture;
      const source = texture.getSourceImage() as HTMLImageElement;
      
      if (!source || !source.complete) {
        return this.generateFallbackOutline(image);
      }

      // 创建canvas来分析图片
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return this.generateFallbackOutline(image);

      canvas.width = source.width;
      canvas.height = source.height;
      ctx.drawImage(source, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 使用优化的轮廓检测算法
      const contour = this.detectOptimizedContour(data, canvas.width, canvas.height, thickness);
      
      // 将轮廓点转换为世界坐标
      const worldPoints = this.convertToWorldCoordinates(contour, image, canvas.width, canvas.height);
      
      return worldPoints;
    } catch (error) {
      console.warn('轮廓生成失败，使用备用方法:', error);
      return this.generateFallbackOutline(image);
    }
  }

  /**
   * 优化的轮廓检测算法
   * @param data 图片数据
   * @param width 图片宽度
   * @param height 图片高度
   * @param thickness 描边厚度
   * @returns 轮廓点数组
   */
  private detectOptimizedContour(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    thickness: number
  ): number[] {
    const contour: number[] = [];
    const step = Math.max(2, thickness); // 增加步长以提高性能
    const alphaThreshold = 128; // 透明度阈值

    // 首先找到非透明区域的边界框
    const bounds = this.findNonTransparentBounds(data, width, height, alphaThreshold);
    
    if (!bounds) {
      return this.generateBoundingBoxContour(width, height);
    }

    // 只在边界框内扫描，提高性能
    for (let y = bounds.minY; y <= bounds.maxY; y += step) {
      for (let x = bounds.minX; x <= bounds.maxX; x += step) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3];

        // 如果当前像素非透明，检查是否在轮廓上
        if (alpha > alphaThreshold) {
          if (this.isOnOptimizedContour(data, x, y, width, height, alphaThreshold)) {
            contour.push(x, y);
          }
        }
      }
    }

    // 如果轮廓点太少，使用边界框
    if (contour.length < 4) {
      return [
        bounds.minX, bounds.minY,
        bounds.maxX, bounds.minY,
        bounds.maxX, bounds.maxY,
        bounds.minX, bounds.maxY
      ];
    }

    return contour;
  }

  /**
   * 找到非透明区域的边界框
   * @param data 图片数据
   * @param width 图片宽度
   * @param height 图片高度
   * @param threshold 透明度阈值
   * @returns 边界框或null
   */
  private findNonTransparentBounds(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    threshold: number
  ): { minX: number; minY: number; maxX: number; maxY: number } | null {
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let hasNonTransparentPixel = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3];
        
        if (alpha > threshold) {
          hasNonTransparentPixel = true;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (!hasNonTransparentPixel) {
      return null;
    }

    return { minX, minY, maxX, maxY };
  }

  /**
   * 优化的轮廓检测
   * @param data 图片数据
   * @param x X坐标
   * @param y Y坐标
   * @param width 图片宽度
   * @param height 图片高度
   * @param threshold 透明度阈值
   * @returns 是否在轮廓上
   */
  private isOnOptimizedContour(
    data: Uint8ClampedArray,
    x: number,
    y: number,
    width: number,
    height: number,
    threshold: number
  ): boolean {
    // 检查周围4个方向的像素
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      // 如果超出边界或邻居像素透明，说明在轮廓上
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
        return true;
      }

      const neighborIndex = (ny * width + nx) * 4;
      const neighborAlpha = data[neighborIndex + 3];

      if (neighborAlpha <= threshold) {
        return true;
      }
    }

    return false;
  }

  /**
   * 生成边界框轮廓
   * @param width 图片宽度
   * @param height 图片高度
   * @returns 边界框轮廓点数组
   */
  private generateBoundingBoxContour(width: number, height: number): number[] {
    return [
      0, 0,
      width, 0,
      width, height,
      0, height
    ];
  }

  /**
   * 将像素坐标转换为世界坐标
   * @param contour 轮廓点数组
   * @param image 图片对象
   * @param imageWidth 图片宽度
   * @param imageHeight 图片高度
   * @returns 世界坐标点数组
   */
  private convertToWorldCoordinates(
    contour: number[],
    image: Phaser.GameObjects.Image,
    imageWidth: number,
    imageHeight: number
  ): number[] {
    const worldPoints: number[] = [];
    const imageBounds = image.getBounds();
    const scaleX = imageBounds.width / imageWidth;
    const scaleY = imageBounds.height / imageHeight;

    for (let i = 0; i < contour.length; i += 2) {
      const pixelX = contour[i];
      const pixelY = contour[i + 1];

      const worldX = imageBounds.x + (pixelX - imageWidth / 2) * scaleX;
      const worldY = imageBounds.y + (pixelY - imageHeight / 2) * scaleY;

      worldPoints.push(worldX, worldY);
    }

    return worldPoints;
  }

  /**
   * 生成备用描边（简单的矩形边界）
   * @param image 图片对象
   * @returns 矩形边界点数组
   */
  private generateFallbackOutline(image: Phaser.GameObjects.Image): number[] {
    const bounds = image.getBounds();
    return [
      bounds.x, bounds.y,
      bounds.x + bounds.width, bounds.y,
      bounds.x + bounds.width, bounds.y + bounds.height,
      bounds.x, bounds.y + bounds.height
    ];
  }

  /**
   * 显示物体描边
   * @param image 目标图片
   * @param color 描边颜色
   * @param thickness 描边厚度
   * @returns 描边图形对象
   */
  public showOutline(
    image: Phaser.GameObjects.Image,
    color: number = 0x000000,
    thickness: number = 3
  ): Phaser.GameObjects.Graphics {
    const outline = this.createPreciseOutline(image, color, thickness);
    return outline;
  }

  /**
   * 隐藏描边
   * @param outline 描边图形对象
   */
  public hideOutline(outline: Phaser.GameObjects.Graphics): void {
    if (outline && outline.active) {
      outline.clear();
    }
  }

  /**
   * 创建交互式描边效果
   * @param image 目标图片
   * @param interactiveArea 交互区域
   * @param color 描边颜色
   * @param thickness 描边厚度
   * @returns 描边图形对象
   */
  public createInteractiveOutline(
    image: Phaser.GameObjects.Image,
    interactiveArea: Phaser.GameObjects.Rectangle,
    color: number = 0x000000,
    thickness: number = 3
  ): Phaser.GameObjects.Graphics {
    const outline = this.createPreciseOutline(image, color, thickness);
    outline.setVisible(false);

    // 存储引用关系
    (interactiveArea as any).outline = outline;
    (interactiveArea as any).targetImage = image;

    // 添加鼠标事件
    interactiveArea.on('pointerover', () => {
      outline.setVisible(true);
    });

    interactiveArea.on('pointerout', () => {
      outline.setVisible(false);
    });

    return outline;
  }

  /**
   * 清理资源
   */
  public destroy(): void {
    if (this.outlineGraphics) {
      this.outlineGraphics.destroy();
    }
  }
} 