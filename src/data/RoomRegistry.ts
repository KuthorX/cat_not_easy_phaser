import { RoomData } from '../types/GameState';
import { RoomKeys } from '../constants/SceneKeys';
import { RobotCleaner } from '@/objects/RobotCleaner';

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
      
      background: 'living_room_north_bg',
      interactiveObjects: [
        {
          type: 'InteractiveObject',
          id: 'window_north',
          name: '北窗',
          
          x: 640,
          y: 200,
          width: 200,
          height: 150,
          sprite: 'window_north',
          actions: ['sunbathing', 'look_outside']
        },
        {
          type: 'InteractiveObject',
          id: 'sofa_north',
          name: '沙发',
          
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
      
      background: 'living_room_west_low_bg',
      interactiveObjects: [
        {
          type: 'InteractiveObject',
          id: 'cat_cage',
          name: '笼子',
          thought: '一个恶毒的陷阱，两脚兽有时会用这个囚禁我，带我去到钢铁巨兽腹中。无论最后是见到白袍祭司，还是暴雨之女，都是不好的回忆。',
          x: 200,
          y: 400,
          width: 150,
          height: 100,
          sprite: 'cat_cage',
          actions: ['attack_cage', 'jump_on_cage']
        },
        {
          type: 'InteractiveObject',
          id: 'cat_litter_box',
          name: '猫厕所',
          thought:'我的排泄处。沙土的质感和野外不太一样，但掩盖气味的能力优秀。毕竟从来没有天敌循着气味来攻击我。',
          x: 400,
          y: 500,
          width: 100,
          height: 80,
          sprite: 'litter_box',
          actions: ['use_litter_box']
        },
        {
          type: 'InteractiveObject',
          id: 'cat_house',
          name: '猫别墅',
          thought:'自从门坏了之后，就变成我的游乐园了。',
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
      
      background: 'living_room_west_high_bg',
      interactiveObjects: [
        {
          type: 'InteractiveObject',
          id: 'fish_treat',
          name: '长条硬皮鱼',
          thought: '皮特别坚韧，但肉是浆糊状，非常美味。两脚兽隔很久才会给我吃一条，但很多第一次见的两脚兽会慷慨地多给我几根。',
          x: 300,
          y: 350,
          width: 80,
          height: 40,
          sprite: 'fish_treat',
          actions: ['eat_fish_treat']
        },
        {
          type: 'InteractiveObject',
          id: 'cat_bites_rope',
          name: '猫咬绳',
          thought: '长条粗麻绳，摇晃起来有声音，总感觉在挑衅我。',
          x: 400,
          y: 450,
          width: 80,
          height: 40,
          sprite: 'cat_bites_rope',
          actions: ['bites_rope']
        },
        {
          type: 'InteractiveObject',
          id: 'cat_bites_air',
          name: '咬空气',
          thought: '神秘的小黑盒子，两脚兽有时候会拿起来摩擦两下就放下。',
          x: 450,
          y: 550,
          width: 80,
          height: 40,
          sprite: 'cat_bites_air',
          actions: ['bites_air']
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

    // 客厅-向东看
    this.registerRoom({
      id: RoomKeys.LIVING_ROOM_EAST,
      name: '客厅-向东看',
      background: 'living_room_east_bg',
      interactiveObjects: [
        {
          type: 'InteractiveObject',
          id: 'living_room_east_sofa',
          name: '沙发',
          x: 150,
          y: 500,
          width: 846,
          height: 1288,
          imageKey: 'living_room_east_sofa',
          actions: ['sleep_on_sofa', 'scratch_sofa']
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_table',
          name: '茶几',
          x: 400,
          y: 600,
          width: 302,
          height: 291,
          imageKey: 'living_room_east_table',
          actions: ['jump_on_table', 'push_item_from_table']
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_dustbin',
          name: '垃圾桶',
          x: 500,
          y: 750,
          width: 302,
          height: 291,
          imageKey: 'living_room_east_dustbin',
          actions: ['search_dustbin', 'knock_over_dustbin']
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_tvtable',
          name: '电视柜',
          x: 950,
          y: 600,
          width: 743,
          height: 940,
          imageKey: 'living_room_east_tvtable',
          actions: ['jump_on_tvtable', 'hide_in_tvtable']
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_tv',
          name: '电视',
          x: 1100,
          y: 400,
          width: 541,
          height: 1088,
          imageKey: 'living_room_east_tv',
          actions: ['watch_tv', 'paw_tv']
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_cat_tree',
          name: '猫爬架',
          x: 800,
          y: 500,
          width: 302,
          height: 483,
          imageKey: 'living_room_east_cat_tree',
          actions: ['climb_cat_tree', 'play_cat_tree']
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_ball',
          name: '球',
          x: 900,
          y: 750,
          width: 120,
          height: 117,
          imageKey: 'living_room_east_ball',
          actions: ['play_ball', 'paw_ball']
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_glass',
          name: '玻璃杯',
          x: 420,
          y: 620,
          width: 190,
          height: 150,
          imageKey: 'living_room_east_glass',
          actions: ['push_glass', 'lick_glass']
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_paper',
          name: '纸团',
          x: 470,
          y: 630,
          width: 177,
          height: 228,
          imageKey: 'living_room_east_paper',
          actions: ['play_paper', 'push_paper']
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_milk',
          name: '牛奶',
          x: 460,
          y: 610,
          width: 112,
          height: 192,
          imageKey: 'living_room_east_milk',
          actions: ['drink_milk', 'push_milk']
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_cola',
          name: '可乐罐',
          x: 440,
          y: 600,
          width: 144,
          height: 176,
          imageKey: 'living_room_east_cola',
          actions: ['push_cola', 'lick_cola']
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_cord',
          name: '电线',
          x: 1000,
          y: 700,
          width: 144,
          height: 107,
          imageKey: 'living_room_east_cord',
          actions: ['play_cord', 'bite_cord']
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_pot',
          name: '花盆',
          x: 600,
          y: 700,
          width: 213,
          height: 202,
          imageKey: 'living_room_east_pot',
          actions: ['push_pot', 'sniff_pot']
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_cat_nest',
          name: '猫窝',
          x: 300,
          y: 700,
          width: 574,
          height: 356,
          imageKey: 'living_room_east_cat_nest',
          actions: ['sleep_in_nest', 'sniff_nest']
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
      background: 'balcony_bg',
      interactiveObjects: [
        {
          type: 'InteractiveObject',
          id: 'balcony_chair',
          name: '阳台椅子',
          x: 150,
          y: 244,
          width: 150,
          height: 100,
          imageKey: 'balcony_chair',
          actions: ['sit_on_chair', 'jump_on_chair']
        },
        {
          type: 'InteractiveObject',
          id: 'balcony_coat_hanger',
          name: '衣架',
          x: 110,
          y: 550,
          width: 100,
          height: 80,
          imageKey: 'balcony_coat_hanger',
          actions: ['climb_hanger', 'play_with_clothes']
        },
        {
          type: 'InteractiveObjectWithSprite',
          id: 'balcony_robot_cleaner',
          name: '扫地机器人',
          x: 900,
          y: 550,
          width: 120,
          height: 80,
          spriteConstructor: (scene, x, y) => {
            return new RobotCleaner(scene, x, y);
          },
          actions: []
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
      
      background: 'living_room_door_bg',
      interactiveObjects: [
        {
          type: 'InteractiveObject',
          id: 'front_door',
          name: '前门',
          
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
      
      background: 'doorway_bg',
      interactiveObjects: [
        {
          type: 'InteractiveObject',
          id: 'freedom',
          name: '自由',
          
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