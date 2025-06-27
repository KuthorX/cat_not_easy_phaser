export interface IUIComponent {
  initialize(scene: Phaser.Scene): void;
  show(): void;
  hide(): void;
  destroy(): void;
  update?(...args: any[]): void;
} 