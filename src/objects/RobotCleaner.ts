import Phaser from 'phaser';

export class RobotCleaner extends Phaser.Physics.Arcade.Sprite {
  private robotMovingDown = true;
  private readonly ROBOT_SHIFT_AMOUNT = 50;
  private isTurning = false;
  private robotSpeedX = 150 * 4;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'robot_cleaner');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.5);
    this.setCollideWorldBounds(true);
    this.setBounce(0, 0);
    this.setVelocityX(this.robotSpeedX);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.onWorldBounds = true;

    this.scene.physics.world.on('worldbounds', this.handleWorldBounds, this);
  }

  private handleWorldBounds(body: Phaser.Physics.Arcade.Body): void {
    if (body.gameObject !== this || this.isTurning) {
      return;
    }

    if (body.blocked.right || body.blocked.left) {
      console.log('reach right or left, turn')
      this.isTurning = true;
      this.setVelocityX(0);

      // in phaser, the body.position is the left-top corner of the object
      let isAlmostOnTopOrBottomEdge = body.position.y < 1 + this.body!.height || body.position.y + this.body!.height > this.scene.physics.world.bounds.height - 1;

      if ((body.blocked.up || body.blocked.down || isAlmostOnTopOrBottomEdge) && this.isTurning) {
        console.log('reach downside, revert')
        this.robotMovingDown = !this.robotMovingDown;
      }

      const yVelocity = this.robotMovingDown ? 100 : -100;
      this.setVelocityY(yVelocity);

      const turnDuration = (this.ROBOT_SHIFT_AMOUNT / Math.abs(yVelocity)) * 1000;
      this.scene.time.delayedCall(turnDuration, () => {
        this.setVelocityY(0);
        this.robotSpeedX = -this.robotSpeedX;
        this.setVelocityX(this.robotSpeedX);
        console.log('turn complete, continue moving')
        this.isTurning = false;
      });
    }
  }
}