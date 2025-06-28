import { IUIComponent } from './IUIComponent';
import { Item } from '../../data/BagRegistry';
import { TextRenderer } from '../../utils/TextRenderer';

export class BagPage implements IUIComponent {
  private scene: Phaser.Scene | null = null;
  private container: Phaser.GameObjects.Container | null = null;
  private background: Phaser.GameObjects.Rectangle | null = null;
  private title: Phaser.GameObjects.Text | null = null;
  private itemContainers: Phaser.GameObjects.Container[] = [];
  private closeButton: Phaser.GameObjects.Text | null = null;
  private useButton: Phaser.GameObjects.Text | null = null;
  private dropButton: Phaser.GameObjects.Text | null = null;
  
  private bagRegistry: any = null;
  private gameState: any = null;
  private itemsPerPage: number = 8; // 保留这个属性用于循环
  private selectedItemIndex: number = -1;

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    // 不在初始化时创建，而是在显示时创建
  }

  private createBagPage(): void {
    console.log('createBagPage scene', this.scene);
    if (!this.scene) return;

    try {
      this.container = this.scene.add.container(640, 360);
      
      // 背景
      this.background = this.scene.add.rectangle(0, 0, 800, 600, 0x000000, 0.8);
      this.background.setStrokeStyle(2, 0xFFFFFF);
      
      // 标题
      this.title = TextRenderer.createCenteredText(this.scene, 0, -250, '背包', {
        fontSize: '32px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      });
      
      // 创建物品容器
      this.createItemContainers();
      
      // 操作按钮
      this.createActionButtons();
      
      // 关闭按钮
      this.createCloseButton();
      
      if (this.container && this.background && this.title && this.closeButton && this.useButton && this.dropButton) {
        this.container.add([
          this.background,
          this.title,
          ...this.itemContainers,
          this.useButton,
          this.dropButton,
          this.closeButton
        ]);
        
        this.container.setDepth(1000);
      }
    } catch (error) {
      console.error('创建 BagPage 时出错:', error);
    }
  }

  private createItemContainers(): void {
    // 2x4网格布局，整体居中在800x600内
    const colCount = 2;
    const rowCount = 4;
    const itemWidth = 300;
    const itemHeight = 100;
    const colGap = 80;
    const rowGap = 20;
    const gridWidth = colCount * itemWidth + (colCount - 1) * colGap; // 680
    const gridHeight = rowCount * itemHeight + (rowCount - 1) * rowGap; // 460
    const startX = -gridWidth / 2 + itemWidth / 2; // -190
    const startY = -gridHeight / 2 + itemHeight / 2; // -180

    for (let i = 0; i < this.itemsPerPage; i++) {
      const row = Math.floor(i / colCount);
      const col = i % colCount;
      const x = startX + col * (itemWidth + colGap);
      const y = startY + row * (itemHeight + rowGap);
      const container = this.scene!.add.container(x, y);
      
      // 物品背景 - 更小的尺寸
      const itemBg = this.scene!.add.rectangle(0, 0, 300, 100, 0x333333, 0.9);
      itemBg.setStrokeStyle(1, 0x666666);
      container.add(itemBg);
      
      // 物品图标背景 - 更小的图标
      const iconBg = this.scene!.add.rectangle(-130, 0, 50, 50, 0x444444);
      iconBg.setStrokeStyle(1, 0x888888);
      container.add(iconBg);
      
      // 物品名称 - 更小的字体
      const name = TextRenderer.createChineseText(this.scene!, -70, -30, '', {
        fontSize: '14px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      });
      container.add(name);
      
      // 物品类型和稀有度 - 更小的字体
      const typeRarity = TextRenderer.createChineseText(this.scene!, -70, -15, '', {
        fontSize: '10px',
        color: '#CCCCCC'
      });
      container.add(typeRarity);
      
      // 物品描述 - 更小的字体和宽度
      const description = TextRenderer.createChineseText(this.scene!, -70, 0, '', {
        fontSize: '9px',
        color: '#AAAAAA',
        wordWrap: { width: 200 }
      });
      container.add(description);
      
      // 物品数量 - 更小的字体
      const count = TextRenderer.createChineseText(this.scene!, 130, -30, '', {
        fontSize: '12px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      });
      count.setX(130 - count.width);
      container.add(count);
      
      // 最大堆叠 - 更小的字体
      const maxStack = TextRenderer.createChineseText(this.scene!, 130, -15, '', {
        fontSize: '9px',
        color: '#AAAAAA'
      });
      maxStack.setX(130 - maxStack.width);
      container.add(maxStack);
      
      // 使用条件 - 更小的字体
      const conditions = TextRenderer.createChineseText(this.scene!, -70, 25, '', {
        fontSize: '8px',
        color: '#FF6666'
      });
      container.add(conditions);
      
      // 选择指示器 - 调整大小
      const selectionIndicator = this.scene!.add.rectangle(0, 0, 320, 110, 0x00FF00, 0.3);
      selectionIndicator.setStrokeStyle(2, 0x00FF00);
      selectionIndicator.setVisible(false);
      container.add(selectionIndicator);
      
      // 存储引用以便后续更新
      (container as any).itemBg = itemBg;
      (container as any).iconBg = iconBg;
      (container as any).name = name;
      (container as any).typeRarity = typeRarity;
      (container as any).description = description;
      (container as any).count = count;
      (container as any).maxStack = maxStack;
      (container as any).conditions = conditions;
      (container as any).selectionIndicator = selectionIndicator;
      (container as any).itemIndex = i;
      
      // 添加点击事件 - 调整交互区域
      container.setInteractive(new Phaser.Geom.Rectangle(-150, -50, 300, 100), Phaser.Geom.Rectangle.Contains);
      container.on('pointerdown', () => this.selectItem(i));
      
      this.itemContainers.push(container);
    }
  }

  private createActionButtons(): void {
    if (!this.scene) return;
    
    // 使用按钮
    this.useButton = TextRenderer.createCenteredText(this.scene, -100, 250, '使用', {
      fontSize: '18px',
      color: '#FFFFFF',
      backgroundColor: '#0070DD',
      padding: { x: 15, y: 8 }
    });
    this.useButton.setInteractive();
    this.useButton.on('pointerdown', () => this.useSelectedItem());
    this.useButton.on('pointerover', () => {
      if (this.useButton) this.useButton.setColor('#FFFF00');
    });
    this.useButton.on('pointerout', () => {
      if (this.useButton) this.useButton.setColor('#FFFFFF');
    });
    
    // 丢弃按钮
    this.dropButton = TextRenderer.createCenteredText(this.scene, 100, 250, '丢弃', {
      fontSize: '18px',
      color: '#FFFFFF',
      backgroundColor: '#DD0000',
      padding: { x: 15, y: 8 }
    });
    this.dropButton.setInteractive();
    this.dropButton.on('pointerdown', () => this.dropSelectedItem());
    this.dropButton.on('pointerover', () => {
      if (this.dropButton) this.dropButton.setColor('#FFFF00');
    });
    this.dropButton.on('pointerout', () => {
      if (this.dropButton) this.dropButton.setColor('#FFFFFF');
    });
  }

  private createCloseButton(): void {
    if (!this.scene) return;
    
    this.closeButton = TextRenderer.createCenteredText(this.scene, 350, -250, 'X', {
      fontSize: '24px',
      color: '#FFFFFF',
      backgroundColor: '#FF0000',
      padding: { x: 8, y: 4 }
    });
    this.closeButton.setInteractive();
    this.closeButton.on('pointerdown', () => this.hide());
    this.closeButton.on('pointerover', () => {
      if (this.closeButton) this.closeButton.setColor('#FFFF00');
    });
    this.closeButton.on('pointerout', () => {
      if (this.closeButton) this.closeButton.setColor('#FFFFFF');
    });
  }

  public setBagRegistry(registry: any): void {
    this.bagRegistry = registry;
  }

  public setGameState(state: any): void {
    this.gameState = state;
  }

  private selectItem(index: number): void {
    this.selectedItemIndex = index;
    this.updateItemSelection();
    this.updateActionButtons();
  }

  private updateItemSelection(): void {
    this.itemContainers.forEach((container, index) => {
      const selectionIndicator = (container as any).selectionIndicator as Phaser.GameObjects.Rectangle;
      selectionIndicator.setVisible(index === this.selectedItemIndex);
    });
  }

  private updateActionButtons(): void {
    if (this.selectedItemIndex >= 0) {
      const inventoryStats = this.bagRegistry.getInventoryStats(this.gameState);
      const selectedItem = inventoryStats[this.selectedItemIndex];
      
      if (selectedItem) {
        const canUse = this.bagRegistry.canUseItem(selectedItem.itemId, this.gameState);
        this.useButton?.setVisible(true);
        this.useButton?.setColor(canUse ? '#FFFFFF' : '#666666');
        this.dropButton?.setVisible(true);
      } else {
        this.useButton?.setVisible(false);
        this.dropButton?.setVisible(false);
      }
    } else {
      this.useButton?.setVisible(false);
      this.dropButton?.setVisible(false);
    }
  }

  private useSelectedItem(): void {
    if (this.selectedItemIndex < 0) return;
    
    const inventoryStats = this.bagRegistry.getInventoryStats(this.gameState);
    const selectedItem = inventoryStats[this.selectedItemIndex];
    
    if (selectedItem && this.bagRegistry.canUseItem(selectedItem.itemId, this.gameState)) {
      // 这里应该调用游戏管理器来使用物品
      console.log(`使用物品: ${selectedItem.item.name}`);
      // TODO: 实现物品使用逻辑
      
      // 更新显示
      this.updateItemDisplay();
    }
  }

  private dropSelectedItem(): void {
    if (this.selectedItemIndex < 0) return;
    
    const inventoryStats = this.bagRegistry.getInventoryStats(this.gameState);
    const selectedItem = inventoryStats[this.selectedItemIndex];
    
    if (selectedItem) {
      // 这里应该调用游戏管理器来丢弃物品
      console.log(`丢弃物品: ${selectedItem.item.name}`);
      // TODO: 实现物品丢弃逻辑
      
      // 更新显示
      this.updateItemDisplay();
    }
  }

  private updateItemDisplay(): void {
    if (!this.bagRegistry || !this.gameState) return;

    const inventoryStats = this.bagRegistry.getInventoryStats(this.gameState);
    
    // 显示所有物品（最多8个）
    for (let i = 0; i < this.itemContainers.length; i++) {
      const container = this.itemContainers[i];
      const itemStat = inventoryStats[i];
      
      if (itemStat) {
        this.updateItemContainer(container, itemStat);
        container.setVisible(true);
      } else {
        container.setVisible(false);
      }
    }
    
    // 重置选择
    this.selectedItemIndex = -1;
    this.updateItemSelection();
    this.updateActionButtons();
  }

  private updateItemContainer(container: Phaser.GameObjects.Container, itemStat: { itemId: string; count: number; item: Item }): void {
    const name = (container as any).name as Phaser.GameObjects.Text;
    const typeRarity = (container as any).typeRarity as Phaser.GameObjects.Text;
    const description = (container as any).description as Phaser.GameObjects.Text;
    const count = (container as any).count as Phaser.GameObjects.Text;
    const maxStack = (container as any).maxStack as Phaser.GameObjects.Text;
    const conditions = (container as any).conditions as Phaser.GameObjects.Text;
    const itemBg = (container as any).itemBg as Phaser.GameObjects.Rectangle;
    
    const item = itemStat.item;
    
    // 更新名称和颜色
    name.setText(item.name);
    const rarityColor = this.bagRegistry.getRarityColor(item.rarity);
    name.setColor(rarityColor);
    
    // 更新类型和稀有度
    const typeName = this.bagRegistry.getTypeName(item.type);
    typeRarity.setText(`${typeName} | ${item.rarity.toUpperCase()}`);
    typeRarity.setColor(rarityColor);
    
    // 更新描述
    description.setText(item.description);
    
    // 更新数量
    count.setText(`数量: ${itemStat.count}`);
    count.setX(130 - count.width);
    
    // 更新最大堆叠
    maxStack.setText(`最大: ${item.maxStack}`);
    maxStack.setX(130 - maxStack.width);
    
    // 更新使用条件
    if (item.conditions.length > 0) {
      const conditionTexts = item.conditions.map(condition => {
        switch (condition.type) {
          case 'hunger':
            return `饥饿值 ${condition.operator} ${condition.value}`;
          case 'energy':
            return `能量值 ${condition.operator} ${condition.value}`;
          case 'inventory':
            return `需要物品: ${condition.value}`;
          case 'story_flag':
            return `需要标记: ${condition.value}`;
          case 'room_visited':
            return `需要访问: ${condition.value}`;
          case 'action_completed':
            return `需要完成: ${condition.value}`;
          default:
            return `未知条件: ${condition.value}`;
        }
      });
      conditions.setText(`使用条件: ${conditionTexts.join(', ')}`);
      conditions.setVisible(true);
    } else {
      conditions.setVisible(false);
    }
    
    // 更新背景颜色（根据稀有度）
    const bgColor = this.getRarityBackgroundColor(item.rarity);
    itemBg.setFillStyle(bgColor, 0.9);
  }

  private getRarityBackgroundColor(rarity: string): number {
    switch (rarity) {
      case 'common':
        return 0x333333;
      case 'uncommon':
        return 0x1E3A1E;
      case 'rare':
        return 0x1E1E3A;
      case 'epic':
        return 0x3A1E3A;
      case 'legendary':
        return 0x3A2A1E;
      default:
        return 0x333333;
    }
  }

  show(): void {
    if (this.scene) {
      // 如果容器已存在，先销毁
      if (this.container) {
        this.hide();
      }
      
      // 创建新的容器
      this.createBagPage();
      this.updateItemDisplay();
    }
  }

  hide(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
      this.background = null;
      this.title = null;
      this.itemContainers = [];
      this.closeButton = null;
      this.useButton = null;
      this.dropButton = null;
    }
  }

  destroy(): void {
    console.log('destroy BagPage');
    this.hide();
    this.bagRegistry = null;
    this.gameState = null;
  }
} 