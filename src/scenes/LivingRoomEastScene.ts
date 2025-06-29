import { BaseScene } from './BaseScene';
import { SceneKeys } from '../constants/SceneKeys';
import { RoomKeys } from '../constants/SceneKeys';
import { InteractiveObject, InteractiveObjectWithSprite, RoomExit } from '../types/GameState';
import { TextRenderer } from '../utils/TextRenderer';

export class LivingRoomEastScene extends BaseScene {
  constructor() {
    super(SceneKeys.LIVING_ROOM_EAST);
  }

  protected initializeScene(): void {
    
    // 添加房间标题
    TextRenderer.createCenteredText(this, 640, 50, '客厅 - 向东看', {
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold'
    });

    // 获取房间数据
    const roomData = this.sceneManager?.getRoomData(RoomKeys.LIVING_ROOM_EAST);
    if (!roomData) return;

    // 渲染背景，传递目标尺寸参数
    super.renderBackground(roomData.background, roomData.background_target_width, roomData.background_target_height);

    // 创建交互对象
    roomData.interactiveObjects.forEach((obj) => {
      this.addInteractiveObjects(obj);
    });

    // 创建出口
    roomData.exits.forEach((exit: RoomExit) => {
      this.createExit(exit);
    });

    // 播放背景音乐
    if (this.audioManager) {
      this.audioManager.playRoomMusic(RoomKeys.LIVING_ROOM_EAST);
    }

    // 记录房间访问
    if (this.gameManager) {
      this.gameManager.visitRoom(RoomKeys.LIVING_ROOM_EAST);
    }

  }

} 