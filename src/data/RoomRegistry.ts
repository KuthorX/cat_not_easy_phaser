import { RoomData } from '../types/GameState';
import { RoomKeys } from '../constants/SceneKeys';

export class RoomRegistry {
  private rooms: Map<string, RoomData> = new Map();

  constructor() {
    this.initializeRooms();
  }

  private initializeRooms(): void {
    // 客厅-向北看
    this.registerRoom({
      id: RoomKeys.LIVING_ROOM_NORTH,
      name: '客厅-向北看',
      description: '宽敞的客厅，阳光从北面的窗户洒进来。',
      background: 'living_room_north_bg',
      interactiveObjects: [
        {
          id: 'window_north',
          name: '北窗',
          description: '阳光透过窗户洒在地板上，温暖舒适。',
          x: 640,
          y: 200,
          width: 200,
          height: 150,
          sprite: 'window_north',
          actions: ['sunbathing', 'look_outside']
        },
        {
          id: 'sofa_north',
          name: '沙发',
          description: '柔软的沙发，是休息的好地方。',
          x: 400,
          y: 400,
          width: 300,
          height: 200,
          sprite: 'sofa',
          actions: ['sleep_on_sofa', 'scratch_sofa']
        }
      ],
      exits: [
        {
          id: 'exit_to_east',
          name: '向东',
          targetRoom: RoomKeys.LIVING_ROOM_EAST,
          x: 1200,
          y: 300,
          width: 80,
          height: 120
        },
        {
          id: 'exit_to_west_low',
          name: '向西',
          targetRoom: RoomKeys.LIVING_ROOM_WEST_LOW,
          x: 0,
          y: 300,
          width: 80,
          height: 120
        }
      ]
    });

    // 客厅-向西看（低处）
    this.registerRoom({
      id: RoomKeys.LIVING_ROOM_WEST_LOW,
      name: '客厅-向西看（低处）',
      description: '客厅的西侧，地面较低的区域。',
      background: 'living_room_west_low_bg',
      interactiveObjects: [
        {
          id: 'cat_cage',
          name: '笼子',
          description: '一个恶毒的陷阱，两脚兽有时会用这个囚禁我。',
          x: 200,
          y: 400,
          width: 150,
          height: 100,
          sprite: 'cat_cage',
          actions: ['attack_cage', 'jump_on_cage']
        },
        {
          id: 'cat_litter_box',
          name: '猫厕所',
          description: '我的排泄处。沙土的质感和野外不太一样。',
          x: 400,
          y: 500,
          width: 100,
          height: 80,
          sprite: 'litter_box',
          actions: ['use_litter_box']
        },
        {
          id: 'cat_house',
          name: '猫别墅',
          description: '自从门坏了之后，就变成我的游乐园了。',
          x: 600,
          y: 450,
          width: 120,
          height: 100,
          sprite: 'cat_house',
          actions: ['play_in_house']
        }
      ],
      exits: [
        {
          id: 'exit_to_north',
          name: '向北',
          targetRoom: RoomKeys.LIVING_ROOM_NORTH,
          x: 640,
          y: 0,
          width: 120,
          height: 80
        },
        {
          id: 'exit_to_high',
          name: '跳上高处',
          targetRoom: RoomKeys.LIVING_ROOM_WEST_HIGH,
          x: 200,
          y: 300,
          width: 150,
          height: 50,
          requirements: [
            {
              type: 'action_completed',
              value: 'attack_cage',
              operator: 'eq'
            }
          ]
        }
      ]
    });

    // 客厅-向西看（高处）
    this.registerRoom({
      id: RoomKeys.LIVING_ROOM_WEST_HIGH,
      name: '客厅-向西看（高处）',
      description: '客厅西侧的高处，视野很好。',
      background: 'living_room_west_high_bg',
      interactiveObjects: [
        {
          id: 'fish_treat',
          name: '长条硬皮鱼',
          description: '皮特别坚韧，但肉是浆糊状，非常美味。',
          x: 300,
          y: 350,
          width: 80,
          height: 40,
          sprite: 'fish_treat',
          actions: ['eat_fish_treat']
        }
      ],
      exits: [
        {
          id: 'exit_to_low',
          name: '跳下',
          targetRoom: RoomKeys.LIVING_ROOM_WEST_LOW,
          x: 200,
          y: 600,
          width: 150,
          height: 50
        }
      ]
    });

    // 主人房间B
    this.registerRoom({
      id: RoomKeys.ROOM_B,
      name: '主人房间',
      description: '主人的房间，充满了主人的气味。',
      background: 'room_b_bg',
      interactiveObjects: [
        {
          id: 'toy_mouse',
          name: '发声玩具老鼠',
          description: '我的劲敌。一只怎么也咬不死，叫声尖锐的老鼠。',
          x: 400,
          y: 300,
          width: 60,
          height: 40,
          sprite: 'toy_mouse',
          actions: ['play_with_mouse', 'carry_mouse']
        },
        {
          id: 'computer_screen',
          name: '显示屏',
          description: '大又扁，有时候黑漆漆，有时候亮闪闪。',
          x: 600,
          y: 200,
          width: 200,
          height: 150,
          sprite: 'computer_screen',
          actions: ['destroy_screen']
        },
        {
          id: 'owner_bed',
          name: '主人的床',
          description: '柔软的床铺，比猫窝舒服多了。',
          x: 200,
          y: 400,
          width: 300,
          height: 200,
          sprite: 'owner_bed',
          actions: ['sleep_on_bed']
        }
      ],
      exits: [
        {
          id: 'exit_to_hallway',
          name: '出门',
          targetRoom: RoomKeys.HALLWAY,
          x: 1200,
          y: 300,
          width: 80,
          height: 120
        }
      ]
    });

    // 过道
    this.registerRoom({
      id: RoomKeys.HALLWAY,
      name: '过道',
      description: '连接各个房间的过道。',
      background: 'hallway_bg',
      interactiveObjects: [],
      exits: [
        {
          id: 'exit_to_room_b',
          name: '主人房间',
          targetRoom: RoomKeys.ROOM_B,
          x: 0,
          y: 300,
          width: 80,
          height: 120
        },
        {
          id: 'exit_to_living_room',
          name: '客厅',
          targetRoom: RoomKeys.LIVING_ROOM_NORTH,
          x: 1200,
          y: 300,
          width: 80,
          height: 120
        }
      ]
    });

    // 客厅-向东看
    this.registerRoom({
      id: RoomKeys.LIVING_ROOM_EAST,
      name: '客厅-向东看',
      description: '客厅的东侧，有一个大衣柜。',
      background: 'living_room_east_bg',
      interactiveObjects: [
        {
          id: 'wardrobe',
          name: '大衣柜',
          description: '一个巨大的衣柜，里面有很多有趣的东西。',
          x: 400,
          y: 300,
          width: 200,
          height: 300,
          sprite: 'wardrobe',
          actions: ['climb_wardrobe']
        },
        {
          id: 'cat_hammock',
          name: '猫吊床',
          description: '一个舒适的猫吊床，是休息的好地方。',
          x: 600,
          y: 400,
          width: 150,
          height: 100,
          sprite: 'cat_hammock',
          actions: ['sleep_hammock']
        }
      ],
      exits: [
        {
          id: 'exit_to_north',
          name: '向北',
          targetRoom: RoomKeys.LIVING_ROOM_NORTH,
          x: 640,
          y: 0,
          width: 120,
          height: 80
        },
        {
          id: 'exit_to_balcony',
          name: '阳台',
          targetRoom: RoomKeys.BALCONY,
          x: 1200,
          y: 300,
          width: 80,
          height: 120
        }
      ]
    });

    // 阳台
    this.registerRoom({
      id: RoomKeys.BALCONY,
      name: '阳台',
      description: '户外的阳台，可以看到外面的世界。',
      background: 'balcony_bg',
      interactiveObjects: [
        {
          id: 'outdoor_exploration',
          name: '户外探索',
          description: '在阳台上探索外面的世界。',
          x: 640,
          y: 360,
          width: 400,
          height: 200,
          sprite: 'outdoor_exploration',
          actions: ['house_parkour']
        }
      ],
      exits: [
        {
          id: 'exit_to_living_room_east',
          name: '返回客厅',
          targetRoom: RoomKeys.LIVING_ROOM_EAST,
          x: 0,
          y: 300,
          width: 80,
          height: 120
        }
      ]
    });

    // 客厅门口
    this.registerRoom({
      id: RoomKeys.LIVING_ROOM_DOOR,
      name: '客厅门口',
      description: '客厅的门口，通向外面。',
      background: 'living_room_door_bg',
      interactiveObjects: [
        {
          id: 'front_door',
          name: '前门',
          description: '通向外面的大门。',
          x: 640,
          y: 400,
          width: 200,
          height: 300,
          sprite: 'front_door',
          actions: ['look_outside']
        }
      ],
      exits: [
        {
          id: 'exit_to_living_room',
          name: '返回客厅',
          targetRoom: RoomKeys.LIVING_ROOM_NORTH,
          x: 640,
          y: 0,
          width: 120,
          height: 80
        },
        {
          id: 'exit_to_outside',
          name: '门外',
          targetRoom: RoomKeys.DOORWAY,
          x: 640,
          y: 700,
          width: 200,
          height: 20,
          requirements: [
            {
              type: 'story_flag',
              value: 'door_opened',
              operator: 'eq'
            }
          ]
        }
      ]
    });

    // 门口
    this.registerRoom({
      id: RoomKeys.DOORWAY,
      name: '门口',
      description: '房子的门口，通向自由的世界。',
      background: 'doorway_bg',
      interactiveObjects: [
        {
          id: 'freedom',
          name: '自由',
          description: '通向自由的道路。',
          x: 640,
          y: 360,
          width: 400,
          height: 200,
          sprite: 'freedom',
          actions: ['escape']
        }
      ],
      exits: [
        {
          id: 'exit_to_living_room_door',
          name: '返回屋内',
          targetRoom: RoomKeys.LIVING_ROOM_DOOR,
          x: 640,
          y: 0,
          width: 200,
          height: 20
        }
      ]
    });

    // 房间A（备用房间）
    this.registerRoom({
      id: RoomKeys.ROOM_A,
      name: '房间A',
      description: '一个备用房间。',
      background: 'room_a_bg',
      interactiveObjects: [],
      exits: [
        {
          id: 'exit_to_hallway',
          name: '过道',
          targetRoom: RoomKeys.HALLWAY,
          x: 1200,
          y: 300,
          width: 80,
          height: 120
        }
      ]
    });

    // 房间C（备用房间）
    this.registerRoom({
      id: RoomKeys.ROOM_C,
      name: '房间C',
      description: '另一个备用房间。',
      background: 'room_c_bg',
      interactiveObjects: [],
      exits: [
        {
          id: 'exit_to_hallway',
          name: '过道',
          targetRoom: RoomKeys.HALLWAY,
          x: 0,
          y: 300,
          width: 80,
          height: 120
        }
      ]
    });
  }

  public registerRoom(room: RoomData): void {
    this.rooms.set(room.id, room);
  }

  public getRoom(roomId: string): RoomData | null {
    return this.rooms.get(roomId) || null;
  }

  public getAllRooms(): RoomData[] {
    return Array.from(this.rooms.values());
  }

  public getRoomIds(): string[] {
    return Array.from(this.rooms.keys());
  }
} 