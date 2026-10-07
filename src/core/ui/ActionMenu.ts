import { IUIComponent } from './IUIComponent';
import { TextRenderer } from '../../utils/TextRenderer';
import { clampMenuPosition, formatActionLabel, LabelledAction } from '../../logic/actionLabel';

export interface Action extends LabelledAction {
  id: string;
  name: string;
}

const MENU_WIDTH = 300;
const ROW_HEIGHT = 40;

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

    // 按钮以 x 为中心排列；最后一行是“算了”，用于关闭菜单
    const rows: Array<{ label: string; onClick: () => void; color: number }> = [
      ...actions.map(action => ({
        label: formatActionLabel(action),
        onClick: () => this.executeAction(action.id),
        color: 0x4A4A4A
      })),
      { label: '算了', onClick: () => this.hide(), color: 0x7A7A7A }
    ];
    const pos = clampMenuPosition(x, y, MENU_WIDTH, rows.length * ROW_HEIGHT);
    this.container = this.scene.add.container(pos.x, pos.y);
    this.container.setDepth(1000);

    rows.forEach((row, index) => {
      const button = this.scene!.add.rectangle(0, index * ROW_HEIGHT, MENU_WIDTH, 35, row.color, 0.85);
      button.setStrokeStyle(1, 0xFFFFFF);

      const text = TextRenderer.createCenteredText(this.scene!, 0, index * ROW_HEIGHT, row.label, {
        fontSize: '15px',
        color: '#ffffff'
      });

      button.setInteractive({ useHandCursor: true });
      button.on('pointerover', () => button.setFillStyle(0x2E6FD8, 0.9));
      button.on('pointerout', () => button.setFillStyle(row.color, 0.85));
      button.on('pointerdown', row.onClick);

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