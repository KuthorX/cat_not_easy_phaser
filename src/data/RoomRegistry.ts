import { RoomData } from '../types/GameState';
import { RoomKeys } from '../constants/SceneKeys';
import { RobotCleaner } from '@/objects/RobotCleaner';

export class RoomRegistry {
  private rooms: Map<string, RoomData> = new Map();

  constructor() {
    this.initializeRooms();
  }

  private initializeRooms(): void {
    // 客厅-向西看（低处）
    this.registerRoom({
      id: RoomKeys.LIVING_ROOM_WEST_LOW,
      name: '客厅-向西看（低处）',
      background: 'living_room_west_down_bg',
      interactiveObjects: [
        {
          type: 'InteractiveObject',
          id: 'table_over_cat_toilet',
          name: '猫厕所上的桌子',
          thought: '桌子。两脚兽喜欢在上面放东西。',
          x: 520,
          y: 600,
          width: 979,
          height: 790,
          scale: 0.7,
          imageKey: 'living_room_west_down_table',
          actions: [],
        },
        {
          type: 'InteractiveObject',
          id: 'cat_litter_box',
          name: '猫厕所',
          thought: '我的排泄处。沙土的质感和野外不太一样，但掩盖气味的能力优秀。毕竟从来没有天敌循着气味来攻击我。',
          x: 450,
          y: 680,
          width: 507,
          height: 518,
          scale: 0.7,
          imageKey: 'living_room_west_down_cat_toilet',
          actions: ['use_litter_box']
        },
        {
          type: 'InteractiveObject',
          id: 'cat_house',
          name: '猫别墅',
          thought: '自从门坏了之后，就变成我的游乐园了。',
          x: 1100,
          y: 250,
          width: 653,
          height: 934,
          imageKey: 'living_room_west_down_cat_villa',
          actions: ['play_in_house']
        },

        {
          type: 'InteractiveObject',
          id: 'cat_cage',
          name: '笼子',
          thought: '一个恶毒的陷阱，两脚兽有时会用这个囚禁我，带我去到钢铁巨兽腹中。无论最后是见到白袍祭司，还是暴雨之女，都是不好的回忆。',
          x: 1000,
          y: 650,
          width: 502,
          height: 448,
          imageKey: 'living_room_west_down_cage',
          actions: ['attack_cage', 'jump_on_cage']
        }
      ],
      exits: [
        {
          id: 'exit_to_high',
          name: '跳上高处',
          targetRoom: RoomKeys.LIVING_ROOM_WEST_HIGH,
          x: 300,
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
        },
        {
          id: 'exit_to_bedroom',
          name: '向过道',
          targetRoom: RoomKeys.HALLWAY,
          x: 75,
          y: 360,
          width: 150,
          height: 50
        },
        {
          id: 'exit_to_living_room_east',
          name: '向东看',
          targetRoom: RoomKeys.LIVING_ROOM_EAST,
          x: 800,
          y: 700,
          width: 120,
          height: 40
        }
      ]
    });

    // 客厅-向西看（高处）
    this.registerRoom({
      id: RoomKeys.LIVING_ROOM_WEST_HIGH,
      name: '客厅-向西看（高处）',
      background: 'living_room_west_up_bg',
      interactiveObjects: [
        {
          type: 'InteractiveObject',
          id: 'fish_treat',
          name: '长条硬皮鱼',
          thought: '皮特别坚韧，但肉是浆糊状，非常美味。两脚兽隔很久才会给我吃一条，但很多第一次见的两脚兽会慷慨地多给我几根。',
          scale: 0.5,
          imageKey: 'living_room_west_down_food',
          x: 150,
          y: 200,
          width: 60,
          height: 30,
          actions: ['eat_fish_treat'],
          outline: {
            color: '#FF6B35', // 橙色外框
            offset_x: -5,
            offset_y: -5,
            offset_width: 10, // 宽度增加10像素
            offset_height: 10, // 高度增加10像素
            offset_scale: 1.05 // 额外缩放1.05倍
          }
        },
        {
          type: 'InteractiveObject',
          id: 'cat_bites_rope',
          name: '猫咬绳',
          thought: '长条粗麻绳，摇晃起来有声音，总感觉在挑衅我。',
          imageKey: 'living_room_west_up_cord',
          x: 80,
          y: 550,
          width: 100,
          height: 50,
          actions: ['bites_rope'],
          outline: {
            color: '#FF6B35', // 橙色外框
            offset_x: -10,
            offset_y: -10,
            offset_width: 20, // 宽度增加20像素
            offset_height: 20, // 高度增加20像素
            offset_scale: 1.1 // 额外缩放1.1倍
          }
        },
        {
          type: 'InteractiveObject',
          id: 'cat_bites_air',
          name: '咬空气',
          thought: '神秘的小黑盒子，两脚兽有时候会拿起来摩擦两下就放下。',
          imageKey: 'living_room_west_up_handset',
          x: 1100,
          y: 200,
          width: 70,
          height: 35,
          actions: ['bites_air'],
          outline: {
            color: '#FF6B35', // 橙色外框
            offset_x: -8,
            offset_y: -8,
            offset_width: 16, // 宽度增加16像素
            offset_height: 16, // 高度增加16像素
            offset_scale: 1.08 // 额外缩放1.08倍
          }
        },
        {
          type: 'InteractiveObject',
          id: 'west_table',
          name: '桌子',
          imageKey: 'living_room_west_up_table',
          x: 100,
          y: 650,
          width: 120,
          height: 80,
          actions: [],
        },
        {
          type: 'InteractiveObject',
          id: 'umbrella',
          name: '雨伞',
          imageKey: 'living_room_west_up_umbrella',
          x: 500,
          y: 150,
          scale: 0.5,
          width: 60,
          height: 200,
          actions: []
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
      background: 'room_b_bg',
      interactiveObjects: [
        {
          type: 'InteractiveObject',
          id: 'squeaky_toy_mouse',
          name: '发声玩具老鼠',
          thought: '我的劲敌。一只怎么也咬不死，叫声尖锐的老鼠。\n某次夜里我们殊死搏斗后，它就被两脚兽带走了。原来躲藏在这里。',
          x: 150,
          y: 250,
          width: 30,
          height: 30,
          actions: ['play', 'carry']
        },
        {
          type: 'InteractiveObject',
          id: 'display',
          name: '显示屏',
          thought: '大又扁的光滑抓板。\n有时候黑漆漆，有时候亮闪闪。\n两脚兽每天都会盯着它看很久，\n可能是某种捕猎训练。',
          x: 350,
          y: 450,
          width: 300,
          height: 300,
          actions: ['destroy'],
          imageKey: 'room_b_computer_screen',
        },
        {
          type: 'InteractiveObject',
          id: 'room_b_kettle',
          name: '饮料',
          thought: '花花绿绿的水源，\n两脚兽喜欢饮用。\n唉，两脚兽真是愚蠢的生物。\n不知道这种水往往有毒吗？',
          x: 490,
          y: 550,
          width: 127,
          height: 235,
          scale: 0.8,
          imageKey: 'room_b_kettle',
          actions: ['drink_carry'],
          conditions: [
            {
              type: 'story_flag',
              value: 'kettle_carried',
              operator: 'not_has'
            }
          ]
        },
        {
          type: 'InteractiveObject',
          id: 'room_b_bed',
          name: '两脚兽的窝（床）',
          thought: '两脚兽每次睡觉都睡很久，\n有时候我会以为它已经死掉了。',
          x: 850,
          y: 400,
          width: 300,
          height: 300,
          scale: 0.8,
          imageKey: 'room_b_bed',
          actions: ['pee']
        },
        {
          type: 'InteractiveObject',
          id: 'room_b_chair',
          name: '椅子',
          x: 700,
          y: 450,
          width: 300,
          height: 300,
          imageKey: 'room_b_chair',
          disableInteractive: true,
        },

        {
          type: 'InteractiveObject',
          id: 'room_b_side_wall',
          name: '衣柜',
          thought: '很多质感和气味都不正常的草叶。\n两脚兽每天都会穿在身上。',
          x: 1100,
          y: 350,
          width: 300,
          height: 300,
          imageKey: 'room_b_side_wall',
          actions: ['hide']
        },
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
      background: 'hallway_bg_open',
      interactiveObjects: [
        {
          type: 'InteractiveObject',
          id: 'small_shelf',
          name: '小架子',
          thought: '放了几个形态各异的小两脚兽雕像。也许是某种祭祀用具。',
          x: 150,
          y: 250,
          width: 60,
          height: 30,
          actions: ['jump_on']
        },
        {
          type: 'InteractiveObject',
          id: 'book_shelf',
          name: '书架',
          thought: '大架子，小册子。两脚兽会往上放很多东西，但很少再拿下来。真奇怪。',
          x: 100,
          y: 200,
          width: 864,
          height: 1231,
          scale: 0.5,
          imageKey: 'hallway_book_shelf', 
          actions: ['jump_on_big']
        },
        {
          type: 'InteractiveObject',
          id: 'sealed_cat_food',
          name: '封口猫粮',
          thought: '好像有食物的气味。不过懒得管了。',
          x: 100,
          y: 500,
          width: 687,
          height: 776,
          scale: 0.3,
          imageKey: 'hallway_food',
          actions: []
        },
        {
          type: 'InteractiveObject',
          id: 'robot',
          name: '小圆（扫地机器人）',
          thought: '小圆好像不喜欢这个架子，撞了它几下后就继续冬眠了。',
          x: 400,
          y: 400,
          width: 562,
          height: 313,
          scale: 0.4,
          imageKey: 'hallway_robot',
          actions: []
        },
        {
          type: 'InteractiveObject',
          id: 'food_bowl',
          name: '粮盆与水碗',
          thought: '定时涌现食物和净水的神奇地带。感谢大自然的馈赠！',
          x: 1200,
          y: 400,
          width: 602,
          height: 776,
          scale: 0.4,
          imageKey: 'hallway_eat',
          actions: ['eat']
        },
        {
          type: 'InteractiveObject',
          id: 'water_bowl',
          name: '粮盆与水碗',
          thought: '定时涌现食物和净水的神奇地带。感谢大自然的馈赠！',
          x: 1200,
          y: 550,
          width: 587,
          height: 469,
          scale: 0.4,
          imageKey: 'hallway_water',
          actions: ['eat']
        },
      ],
      exits: [
        {
          id: 'exit_to_room_b',
          name: '主人房间',
          targetRoom: RoomKeys.ROOM_B,
          x: 650,
          y: 100,
          width: 120,
          height: 40
        },
        {
          id: 'exit_to_living_room',
          name: '客厅',
          targetRoom: RoomKeys.LIVING_ROOM_WEST_LOW,
          x: 500,
          y: 700,
          width: 120,
          height: 40
        }
      ]
    });

    // 客厅-向东看
    this.registerRoom({
      id: RoomKeys.LIVING_ROOM_EAST,
      name: '客厅-向东看',
      background: 'living_room_east_bg',
      background_target_width: 1280,
      background_target_height: 720,
      interactiveObjects: [
        {
          type: 'InteractiveObject',
          id: 'living_room_east_sofa',
          name: '沙发',
          x: 150,
          y: 500,
          width: 846,
          height: 1288,
          scale: 0.5,
          imageKey: 'living_room_east_sofa',
          actions: ['sleeping', 'jumping'],
          outline: {
            color: '#FD6B35',
          },
          thought: "哦，沙发，我最喜欢的地方"
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_table',
          name: '茶几',
          x: 450,
          y: 500,
          width: 302,
          height: 291,
          scale: 0.5,
          imageKey: 'living_room_east_table',
          actions: ['sweep_table'],
          outline: {
            color: '#FC6B35',
            offset_x: 30,
            offset_y: -45,
            offset_width: 100,
            offset_height: 250,
          }
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_dustbin',
          name: '垃圾桶',
          x: 500,
          y: 650,
          width: 302,
          height: 291,
          scale: 0.5,
          imageKey: 'living_room_east_dustbin',
          actions: ['search_dustbin', 'knock_over_dustbin'],
          outline: {
            color: '#FA6B35',
          }
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_cord',
          name: '电线',
          x: 1030,
          y: 500,
          width: 144,
          height: 107,
          scale: 0.5,
          imageKey: 'living_room_east_cord',
          actions: ['play_cord', 'bite_cord'],
          outline: {
            color: '#FF6C35',
          }
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_tvtable',
          name: '电视柜',
          x: 1150,
          y: 500,
          width: 743,
          height: 940,
          scale: 0.5,
          imageKey: 'living_room_east_tvtable',
          actions: ['jump_on_tvtable', 'hide_in_tvtable'],
          outline: {
            color: '#FF6A35',
          }
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_cat_nest',
          name: '猫窝',
          x: 1050,
          y: 650,
          width: 574,
          height: 356,
          scale: 0.5,
          imageKey: 'living_room_east_cat_nest',
          actions: ['sleep_in_nest', 'sniff_nest'],
          outline: {
            color: '#FF6B30',
          }
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_tv',
          name: '电视',
          x: 1200,
          y: 300,
          width: 541,
          height: 1088,
          scale: 0.5,
          imageKey: 'living_room_east_tv',
          actions: ['push_tv'],
          conditions: [
            {
              type: 'story_flag',
              value: 'tv_pushed',
              operator: 'not_has'
            }
          ],
          outline: {
            color: '#FF5A30',
          }
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_tv_down',
          name: '掉落的电视',
          x: 900,
          y: 300,
          width: 300,
          height: 300,
          scale: 0.5,
          imageKey: 'living_room_east_tv_down',
          disableInteractive: true,
          conditions: [
            {
              type: 'story_flag',
              value: 'tv_pushed',
              operator: 'has'
            }
          ]
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_cat_tree',
          name: '猫爬架',
          x: 800,
          y: 400,
          width: 302,
          height: 483,
          scale: 0.5,
          imageKey: 'living_room_east_cat_tree',
          actions: ['climb_cat_tree', 'play_cat_tree'],
          outline: {
            color: '#FF6B35', // 橙色外框
            offset_x: 0,
            offset_y: 0,
            offset_width: 20, // 宽度增加20像素
            offset_height: 40, // 高度增加40像素
            offset_scale: 1.1 // 额外缩放1.1倍
          }
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_ball',
          name: '球',
          x: 930,
          y: 550,
          width: 120,
          height: 117,
          scale: 0.5,
          imageKey: 'living_room_east_ball',
          actions: ['play_ball', 'paw_ball']
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_glass',
          name: '眼镜盒',
          x: 450,
          y: 500,
          width: 190,
          height: 150,
          scale: 0.5,
          imageKey: 'living_room_east_glass',
          disableInteractive: true,
          conditions: [
            {
              type: 'story_flag',
              value: 'table_swept',
              operator: 'not_has'
            }
          ]
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_paper',
          name: '纸团',
          x: 520,
          y: 500,
          width: 177,
          height: 228,
          scale: 0.5,
          imageKey: 'living_room_east_paper',
          disableInteractive: true,
          conditions: [
            {
              type: 'story_flag',
              value: 'table_swept',
              operator: 'not_has'
            }
          ]
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_cola',
          name: '可乐罐',
          x: 440,
          y: 380,
          width: 144,
          height: 176,
          scale: 0.5,
          imageKey: 'living_room_east_cola',
          disableInteractive: true,
          conditions: [
            {
              type: 'story_flag',
              value: 'table_swept',
              operator: 'not_has'
            }
          ]
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_milk',
          name: '牛奶',
          x: 460,
          y: 410,
          width: 112,
          height: 192,
          scale: 0.5,
          imageKey: 'living_room_east_milk',
          disableInteractive: true,
          conditions: [
            {
              type: 'story_flag',
              value: 'table_swept',
              operator: 'not_has'
            }
          ]
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_pot',
          name: '茶壶',
          x: 510,
          y: 380,
          width: 213,
          height: 202,
          scale: 0.5,
          imageKey: 'living_room_east_pot',
          disableInteractive: true,
          conditions: [
            {
              type: 'story_flag',
              value: 'table_swept',
              operator: 'not_has'
            }
          ]
        },
        {
          type: 'InteractiveObject',
          id: 'living_room_east_sundries_down',
          name: '掉落的杂物',
          x: 481,
          y: 475,
          width: 925,
          height: 629,
          scale: 0.5,
          imageKey: 'living_room_east_sundries_down',
          disableInteractive: true,
          conditions: [
            {
              type: 'story_flag',
              value: 'table_swept',
              operator: 'has'
            }
          ]
        },
      ],
      exits: [
        {
          id: 'exit_to_balcony',
          name: '阳台',
          targetRoom: RoomKeys.BALCONY,
          x: 640,
          y: 15,
          width: 120,
          height: 30
        },
        {
          id: 'exit_to_west',
          name: '向西',
          targetRoom: RoomKeys.LIVING_ROOM_WEST_LOW,
          x: 800,
          y: 705,
          width: 120,
          height: 30
        },
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
          id: 'fortress',
          name: '堡垒',
          thought: '两脚兽搭建的防御设施，封印着隔壁的敌猫。最近有些年久失修，希望别出什么问题。',
          x: 200,
          y: 300,
          width: 314,
          height: 487,
          imageKey: 'balcony_chair',
          actions: ['reinforce', 'inspect']
        },
        {
          type: 'InteractiveObject',
          id: 'black_hand',
          name: '黑手',
          thought: '通过堡垒缝隙出现的劲敌！它动作灵敏，我赢不过。可恶，看来必须要想办法让两脚兽意识到它得加固堡垒防线了。',
          x: 250,
          y: 350,
          width: 172,
          height: 160,
          imageKey: 'balcony_coat_hanger',
          actions: ['interact']
        },
        {
          type: 'InteractiveObject',
          id: 'robot',
          name: '扫地机器人',
          thought: '这是小圆，家里的恶霸。它一直在冬眠，睡醒就会张牙舞爪横冲直撞，经过的地方都湿乎乎的。是令人恐惧的对手！',
          x: 800,
          y: 600,
          width: 341,
          height: 232,
          scale: 0.8,
          imageKey: 'balcony_robot_cleaner',
          actions: ['revenge', 'ride']
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