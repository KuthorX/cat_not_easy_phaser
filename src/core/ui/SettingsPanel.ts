import { VolumeManager } from '../VolumeManager';
import { IUIComponent } from './IUIComponent';

export class SettingsPanel implements IUIComponent {
  private scene: Phaser.Scene | null = null;
  private container: Phaser.GameObjects.Container | null = null;
  private volumeManager: VolumeManager;
  private isDraggingMusic: boolean = false;
  private isDraggingSound: boolean = false;

  constructor() {
    this.volumeManager = VolumeManager.getInstance();
  }

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    this.createPanel();
    this.hide(); // Initially hidden
  }

  private createPanel(): void {
    if (!this.scene) return;

    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    this.container = this.scene.add.container(centerX, centerY);
    this.container.setDepth(2000); // Ensure it's on top

    const background = this.scene.add.graphics();
    background.fillStyle(0x000000, 0.7);
    background.fillRect(-200, -150, 400, 300);
    this.container.add(background);

    const title = this.scene.add.text(0, -120, '设置', { fontSize: '24px', color: '#ffffff' });
    title.setOrigin(0.5, 0.5);
    this.container.add(title);

    this.createVolumeControl('音乐音量', 0, -50, (volume: number) => {
      this.volumeManager.setMusicVolume(volume);
    }, true);

    this.createVolumeControl('音效音量', 0, 20, (volume: number) => {
      this.volumeManager.setSoundVolume(volume);
    }, false);

    const closeButton = this.scene.add.text(0, 120, '关闭', { fontSize: '20px', color: '#ffffff', backgroundColor: '#333333', padding: { x: 10, y: 5 } });
    closeButton.setOrigin(0.5, 0.5);
    closeButton.setInteractive();
    closeButton.on('pointerdown', () => this.hide());
    this.container.add(closeButton);
  }

  private createVolumeControl(
    label: string, 
    x: number, 
    y: number, 
    onVolumeChange: (volume: number) => void,
    isMusic: boolean
  ): void {
    if (!this.scene || !this.container) return;

    const labelText = this.scene.add.text(x - 150, y, label + ':', { fontSize: '18px', color: '#ffffff' });
    this.container.add(labelText);

    const volumeText = this.scene.add.text(x + 100, y, '0%', { fontSize: '18px', color: '#ffffff' });
    this.container.add(volumeText);

    const slider = this.scene.add.rectangle(x + 10, y + 10, 150, 8, 0x666666);
    slider.setInteractive();
    this.container.add(slider);

    const handle = this.scene.add.rectangle(x + 10, y + 10, 16, 16, 0xffffff);
    handle.setInteractive();
    this.container.add(handle);

    const initialVolume = isMusic ? this.volumeManager.getMusicVolume() : this.volumeManager.getSoundVolume();
    const handleX = x - 75 + (initialVolume * 150);
    handle.setPosition(handleX, y + 10);
    volumeText.setText(`${Math.round(initialVolume * 100)}%`);

    handle.on('pointerdown', () => {
      if (isMusic) this.isDraggingMusic = true;
      else this.isDraggingSound = true;
    });

    this.scene.input.on('pointerup', () => {
      this.isDraggingMusic = false;
      this.isDraggingSound = false;
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (!this.container) return;
        const localPoint = this.scene.input.activePointer;
        const worldPoint = this.container.getWorldTransformMatrix().transformPoint(localPoint.x, localPoint.y);

        if (isMusic && this.isDraggingMusic) {
            this.updateSliderPosition(pointer.x - this.container.x, slider, handle, onVolumeChange, volumeText);
        } else if (!isMusic && this.isDraggingSound) {
            this.updateSliderPosition(pointer.x - this.container.x, slider, handle, onVolumeChange, volumeText);
        }
    });

    slider.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (!this.container) return;
        this.updateSliderPosition(pointer.x - this.container.x, slider, handle, onVolumeChange, volumeText);
    });
  }

  private updateSliderPosition(
    x: number, 
    slider: Phaser.GameObjects.Rectangle, 
    handle: Phaser.GameObjects.Rectangle, 
    onVolumeChange: (volume: number) => void,
    volumeText: Phaser.GameObjects.Text
  ): void {
    const sliderX = slider.x;
    const sliderWidth = 150;
    const minX = sliderX - sliderWidth / 2;
    const maxX = sliderX + sliderWidth / 2;
    
    let newX = Math.max(minX, Math.min(maxX, x));
    handle.setX(newX);
    
    const volume = (newX - minX) / sliderWidth;
    onVolumeChange(volume);
    
    volumeText.setText(`${Math.round(volume * 100)}%`);
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

  toggle(): void {
      if (this.container) {
          this.container.setVisible(!this.container.visible);
      }
  }

  destroy(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}