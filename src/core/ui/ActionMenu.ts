import { IUIComponent } from './IUIComponent';

export interface Action {
  id: string;
  name: string;
}

export class ActionMenu implements IUIComponent {
  private scene: Phaser.Scene | null = null;
  private container: Phaser.GameObjects.Container | null = null;
  private onActionSelected: ((actionId: string) => void) | null = null;

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    this.createActionMenu();
  }

  private createActionMenu(): void {
    if (!this.scene) return;

    this.container = this.scene.add.container(-1000, -1000); // 初始位置设为屏幕外
    this.container.setDepth(1000);
    this.container.setVisible(false); // 初始时隐藏菜单
  }

  setActionCallback(callback: (actionId: string) => void): void {
    this.onActionSelected = callback;
  }

  showMenu(actions: Action[], x: number = 1280 - 300, y: number = 10): void {
    if (!this.scene) return;

    // 先隐藏并销毁旧的菜单
    this.hide();
    
    // 创建新的菜单容器
    this.container = this.scene.add.container(x, y);
    this.container.setDepth(1000);
    
    // 确保菜单显示在屏幕内
    const menuWidth = 280;
    const menuHeight = actions.length * 40;
    
    // 调整 x 坐标，确保菜单不超出屏幕右边界
    if (x + menuWidth > 1280) {
      x = 1280 - menuWidth - 10;
      this.container.setPosition(x, y);
    }
    
    // 调整 y 坐标，确保菜单不超出屏幕下边界
    if (y + menuHeight > 720) {
      y = 720 - menuHeight - 10;
      this.container.setPosition(x, y);
    }
    
    // 确保坐标不为负数
    if (x < 10) {
      x = 10;
      this.container.setPosition(x, y);
    }
    if (y < 10) {
      y = 10;
      this.container.setPosition(x, y);
    }
    
    actions.forEach((action, index) => {
      const button = this.scene!.add.rectangle(0, index * 40, 280, 35, 0x4A4A4A, 0.8);
      button.setStrokeStyle(1, 0xFFFFFF);
      
      const text = this.scene!.add.text(0, index * 40, action.name, {
        fontSize: '14px',
        color: '#ffffff'
      });
      text.setOrigin(0.5);

      button.setInteractive();
      button.on('pointerdown', () => {
        this.executeAction(action.id);
      });

      this.container!.add([button, text]);
    });
  }

  private executeAction(actionId: string): void {
    console.log('ActionMenu.executeAction 被调用，动作ID:', actionId);
    
    // 隐藏菜单
    this.hide();
    
    // 调用回调函数
    if (this.onActionSelected) {
      this.onActionSelected(actionId);
    }
  }

  show(): void {
    if (this.container) {
      this.container.setVisible(true);
    }
  }

  hide(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }

  destroy(): void {
    this.hide();
  }
} 