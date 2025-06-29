import { SceneKeys } from '../constants/SceneKeys';
import { VolumeManager } from '../core/VolumeManager';
import { TextRenderer } from '../utils/TextRenderer';

export class SettingScene extends Phaser.Scene {
  private musicVolumeSlider!: Phaser.GameObjects.Rectangle;
  private musicVolumeHandle!: Phaser.GameObjects.Rectangle;
  private soundVolumeSlider!: Phaser.GameObjects.Rectangle;
  private soundVolumeHandle!: Phaser.GameObjects.Rectangle;
  private musicVolumeText!: Phaser.GameObjects.Text;
  private soundVolumeText!: Phaser.GameObjects.Text;
  private isDraggingMusic: boolean = false;
  private isDraggingSound: boolean = false;
  private volumeManager: VolumeManager;
  private unsubscribeMusic: (() => void) | null = null;
  private unsubscribeSound: (() => void) | null = null;
  private sourceScene: string = SceneKeys.MENU; // 默认来源场景

  constructor() {
    super(SceneKeys.SETTINGS);
    this.volumeManager = VolumeManager.getInstance();
  }

  create(data?: any): void {
    // 获取来源场景信息
    if (data && data.sourceScene) {
      this.sourceScene = data.sourceScene;
    }

    // 设置背景
    this.add.rectangle(640, 360, 1280, 720, 0x87CEEB);
    
    // 标题 - 使用优化的文字渲染
    TextRenderer.createTitleText(this, 640, 100, '设置');

    // 音乐音量设置
    this.createVolumeControl('音乐音量', 640, 250, (volume: number) => {
      this.volumeManager.setMusicVolume(volume);
    }, true);

    // 音效音量设置
    this.createVolumeControl('音效音量', 640, 350, (volume: number) => {
      this.volumeManager.setSoundVolume(volume);
    }, false);

    // 返回按钮
    this.createButton('返回', 640, 500, () => {
      this.returnToSourceScene();
    });

    // 订阅音量变化事件
    this.unsubscribeMusic = this.volumeManager.onMusicVolumeChanged((volume) => {
      this.updateMusicVolumeDisplay(volume);
    });
    
    this.unsubscribeSound = this.volumeManager.onSoundVolumeChanged((volume) => {
      this.updateSoundVolumeDisplay(volume);
    });

    // 初始化音量显示
    this.updateVolumeDisplay();
  }

  private createVolumeControl(
    label: string, 
    x: number, 
    y: number, 
    onVolumeChange: (volume: number) => void,
    isMusic: boolean
  ): void {
    // 标签 - 使用优化的文字渲染
    const labelText = TextRenderer.createLabelText(this, x - 250, y, label + ':');

    // 音量文本显示 - 使用优化的文字渲染
    const volumeText = TextRenderer.createLabelText(this, x + 200, y, '0%', {
      fontSize: '20px',
      color: '#000000'
    });

    if (isMusic) {
      this.musicVolumeText = volumeText;
    } else {
      this.soundVolumeText = volumeText;
    }

    // 滑块背景
    const slider = this.add.rectangle(x, y, 200, 10, 0x666666);
    slider.setInteractive();

    // 滑块手柄
    const handle = this.add.rectangle(x, y, 20, 20, 0xFFFFFF);
    handle.setStrokeStyle(2, 0x000000);
    handle.setInteractive();

    if (isMusic) {
      this.musicVolumeSlider = slider;
      this.musicVolumeHandle = handle;
    } else {
      this.soundVolumeSlider = slider;
      this.soundVolumeHandle = handle;
    }

    // 设置初始位置
    const initialVolume = isMusic ? this.volumeManager.getMusicVolume() : this.volumeManager.getSoundVolume();
    const handleX = x - 100 + (initialVolume * 200);
    handle.setPosition(handleX, y);

    // 更新初始文本显示
    volumeText.setText(`${Math.round(initialVolume * 100)}%`);

    // 拖拽事件
    handle.on('pointerdown', () => {
      if (isMusic) {
        this.isDraggingMusic = true;
      } else {
        this.isDraggingSound = true;
      }
    });

    this.input.on('pointerup', () => {
      this.isDraggingMusic = false;
      this.isDraggingSound = false;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDraggingMusic && isMusic) {
        this.updateSliderPosition(pointer.x, slider, handle, onVolumeChange, volumeText);
      } else if (this.isDraggingSound && !isMusic) {
        this.updateSliderPosition(pointer.x, slider, handle, onVolumeChange, volumeText);
      }
    });

    // 点击滑块背景设置音量
    slider.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.updateSliderPosition(pointer.x, slider, handle, onVolumeChange, volumeText);
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
    const sliderWidth = 200;
    const minX = sliderX - sliderWidth / 2;
    const maxX = sliderX + sliderWidth / 2;
    
    let newX = Math.max(minX, Math.min(maxX, x));
    handle.setX(newX);
    
    const volume = (newX - minX) / sliderWidth;
    onVolumeChange(volume);
    
    // 更新文本显示
    volumeText.setText(`${Math.round(volume * 100)}%`);
  }

  private updateMusicVolumeDisplay(volume: number): void {
    if (this.musicVolumeText) {
      this.musicVolumeText.setText(`${Math.round(volume * 100)}%`);
    }
    
    // 更新滑块位置
    if (this.musicVolumeHandle && this.musicVolumeSlider) {
      const sliderX = this.musicVolumeSlider.x;
      const handleX = sliderX - 100 + (volume * 200);
      this.musicVolumeHandle.setX(handleX);
    }
  }

  private updateSoundVolumeDisplay(volume: number): void {
    if (this.soundVolumeText) {
      this.soundVolumeText.setText(`${Math.round(volume * 100)}%`);
    }
    
    // 更新滑块位置
    if (this.soundVolumeHandle && this.soundVolumeSlider) {
      const sliderX = this.soundVolumeSlider.x;
      const handleX = sliderX - 100 + (volume * 200);
      this.soundVolumeHandle.setX(handleX);
    }
  }

  private updateVolumeDisplay(): void {
    const musicVolume = this.volumeManager.getMusicVolume();
    const soundVolume = this.volumeManager.getSoundVolume();
    
    this.updateMusicVolumeDisplay(musicVolume);
    this.updateSoundVolumeDisplay(soundVolume);
  }

  private createButton(text: string, x: number, y: number, callback: () => void): void {
    // 按钮背景
    const button = this.add.rectangle(x, y, 200, 50, 0x4A4A4A, 0.8);
    button.setStrokeStyle(2, 0xFFFFFF);
    button.setInteractive();

    // 按钮文本 - 使用优化的文字渲染
    const buttonText = TextRenderer.createButtonText(this, x, y, text);

    // 鼠标悬停效果
    button.on('pointerover', () => {
      button.setFillStyle(0x666666, 0.8);
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x4A4A4A, 0.8);
    });

    // 点击事件
    button.on('pointerdown', callback);
    buttonText.on('pointerdown', callback);
  }

  private returnToSourceScene(): void {
    // 清理事件订阅
    if (this.unsubscribeMusic) {
      this.unsubscribeMusic();
    }
    if (this.unsubscribeSound) {
      this.unsubscribeSound();
    }
    
    // 返回到来源场景
    this.scene.start(this.sourceScene);
  }
} 