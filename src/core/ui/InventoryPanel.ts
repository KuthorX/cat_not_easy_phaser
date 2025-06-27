import { IUIComponent } from './IUIComponent';

export class InventoryPanel implements IUIComponent {
  private scene: Phaser.Scene | null = null;
  private container: Phaser.GameObjects.Container | null = null;
  private itemsContainer: Phaser.GameObjects.Container | null = null;

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    this.createInventoryPanel();
  }

  private createInventoryPanel(): void {
    if (!this.scene) return;

    this.container = this.scene.add.container(640, 360);
    
    // 背景
    const background = this.scene.add.rectangle(0, 0, 400, 300, 0x000000, 0.9);
    
    // 标题
    const title = this.scene.add.text(0, -120, '物品栏', {
      fontSize: '24px',
      color: '#ffffff'
    });
    title.setOrigin(0.5);

    // 物品列表容器
    this.itemsContainer = this.scene.add.container(0, 0);

    this.container.add([background, title, this.itemsContainer]);
    this.container.setDepth(1000);
  }

  updateInventory(inventory: string[]): void {
    if (!this.itemsContainer) return;

    this.itemsContainer.removeAll();

    inventory.forEach((item, index) => {
      const itemText = this.scene!.add.text(0, index * 25, `• ${item}`, {
        fontSize: '14px',
        color: '#ffffff'
      });
      itemText.setOrigin(0, 0.5);
      this.itemsContainer!.add(itemText);
    });
  }

  show(): void {
    if (this.container) {
      this.container.setVisible(true);
    }
  }

  hide(): void {
    if (this.container) {
      this.container.setVisible(false);
    }
  }

  destroy(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
      this.itemsContainer = null;
    }
  }
} 