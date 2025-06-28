import Phaser from 'phaser';

export class RobotCleaner extends Phaser.Physics.Arcade.Sprite {

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'robot_cleaner');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.5);
    this.setCollideWorldBounds(true);
    this.setBounce(0.6, 0.6);
    this.setDamping(true);
    this.setDrag(0.7);

    this.setInteractive();
    this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.FloatBetween(50, 200);
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      this.setVelocity(velocityX, velocityY);
    });

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.onWorldBounds = true;
  }
}