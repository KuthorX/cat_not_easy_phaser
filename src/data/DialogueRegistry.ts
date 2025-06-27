import { Dialogue } from '../types/GameState';
import { GameConstants } from '../config/GameConfig';

export class DialogueRegistry {
  private dialogues: Map<string, Dialogue> = new Map();

  constructor() {
    this.initializeDialogues();
  }

  private initializeDialogues(): void {
    // 沙发对话
    this.registerDialogue({
      id: 'sofa_conversation',
      objectId: 'sofa_north',
      objectName: '沙发',
      steps: [
        {
          id: 'sofa_greeting',
          speaker: 'object',
          text: '嘿，小猫咪！我是沙发，你的老朋友。',
          autoNext: true,
          nextStep: 'cat_response'
        },
        {
          id: 'cat_response',
          speaker: 'cat',
          text: '喵~ 沙发，我想在你身上睡觉！',
          choices: [
            {
              id: 'sleep_choice',
              text: '睡觉',
              nextStep: 'sofa_sleep_offer',
              effects: [
                { type: 'energy', value: 2, operation: 'add' }
              ]
            },
            {
              id: 'scratch_choice',
              text: '抓沙发',
              nextStep: 'sofa_scratch_reaction',
              effects: [
                { type: 'story_flag', value: 'sofa_damaged', operation: 'set' }
              ]
            }
          ]
        },
        {
          id: 'sofa_sleep_offer',
          speaker: 'object',
          text: '当然可以！我的怀抱永远为你敞开。',
          autoNext: true,
          nextStep: 'cat_sleep_response'
        },
        {
          id: 'cat_sleep_response',
          speaker: 'cat',
          text: '谢谢沙发！我要好好睡一觉~',
          autoNext: true,
          nextStep: 'end'
        },
        {
          id: 'sofa_scratch_reaction',
          speaker: 'object',
          text: '哎呀！你这个小调皮，又抓我了！',
          autoNext: true,
          nextStep: 'cat_scratch_response'
        },
        {
          id: 'cat_scratch_response',
          speaker: 'cat',
          text: '嘿嘿，抓沙发的感觉太爽了！',
          autoNext: true,
          nextStep: 'end'
        }
      ]
    });

    // 笼子对话
    this.registerDialogue({
      id: 'cage_conversation',
      objectId: 'cat_cage',
      objectName: '笼子',
      steps: [
        {
          id: 'cage_greeting',
          speaker: 'object',
          text: '哼！我是笼子，你休想破坏我！',
          autoNext: true,
          nextStep: 'cat_cage_response'
        },
        {
          id: 'cat_cage_response',
          speaker: 'cat',
          text: '我要自由！我要破坏你！',
          choices: [
            {
              id: 'attack_choice',
              text: '攻击笼子',
              nextStep: 'cage_damaged',
              effects: [
                { type: 'story_flag', value: 'cage_damaged', operation: 'set' },
                { type: 'energy', value: 1, operation: 'remove' }
              ]
            },
            {
              id: 'jump_choice',
              text: '跳到笼子上',
              nextStep: 'cage_jump',
              conditions: [
                { type: 'story_flag', operator: 'eq', value: 'cage_damaged' }
              ]
            }
          ]
        },
        {
          id: 'cage_damaged',
          speaker: 'object',
          text: '啊！你这个小恶魔！我受伤了！',
          autoNext: true,
          nextStep: 'cat_victory'
        },
        {
          id: 'cat_victory',
          speaker: 'cat',
          text: '哈哈！我成功了！',
          autoNext: true,
          nextStep: 'end'
        },
        {
          id: 'cage_jump',
          speaker: 'object',
          text: '哼！就算我受伤了，你也不能这样对我！',
          autoNext: true,
          nextStep: 'cat_jump_response'
        },
        {
          id: 'cat_jump_response',
          speaker: 'cat',
          text: '我就是要跳！',
          autoNext: true,
          nextStep: 'end'
        }
      ]
    });

    // 猫厕所对话
    this.registerDialogue({
      id: 'litter_box_conversation',
      objectId: 'cat_litter_box',
      objectName: '猫厕所',
      steps: [
        {
          id: 'litter_greeting',
          speaker: 'object',
          text: '我是猫厕所，你的私人空间。',
          autoNext: true,
          nextStep: 'cat_litter_response'
        },
        {
          id: 'cat_litter_response',
          speaker: 'cat',
          text: '我需要方便一下...',
          choices: [
            {
              id: 'use_choice',
              text: '使用厕所',
              nextStep: 'litter_use',
              conditions: [
                { type: 'hunger', operator: 'gte', value: 4 }
              ],
              effects: [
                { type: 'energy', value: 1, operation: 'add' }
              ]
            },
            {
              id: 'refuse_choice',
              text: '拒绝',
              nextStep: 'litter_refuse'
            }
          ]
        },
        {
          id: 'litter_use',
          speaker: 'object',
          text: '好的，请便。我会保持清洁的。',
          autoNext: true,
          nextStep: 'cat_thanks'
        },
        {
          id: 'cat_thanks',
          speaker: 'cat',
          text: '谢谢！感觉好多了~',
          autoNext: true,
          nextStep: 'end'
        },
        {
          id: 'litter_refuse',
          speaker: 'object',
          text: '没关系，什么时候需要都可以。',
          autoNext: true,
          nextStep: 'end'
        }
      ]
    });

    // 窗户对话
    this.registerDialogue({
      id: 'window_conversation',
      objectId: 'window',
      objectName: '窗户',
      steps: [
        {
          id: 'window_greeting',
          speaker: 'object',
          text: '我是窗户，连接室内和室外的桥梁。',
          autoNext: true,
          nextStep: 'cat_window_response'
        },
        {
          id: 'cat_window_response',
          speaker: 'cat',
          text: '窗户，我想和你互动！',
          choices: [
            {
              id: 'sunbathing_choice',
              text: '晒太阳',
              nextStep: 'window_sunbathing',
              effects: [
                { type: 'energy', value: GameConstants.BASIC_ENERGY_RESTORE, operation: 'add' }
              ]
            },
            {
              id: 'look_outside_choice',
              text: '看外面',
              nextStep: 'window_look_outside',
              effects: [
                { type: 'story_flag', value: 'door_opened', operation: 'set' }
              ]
            }
          ]
        },
        {
          id: 'window_sunbathing',
          speaker: 'object',
          text: '阳光透过我洒在你身上，温暖而舒适。',
          autoNext: true,
          nextStep: 'cat_sunbathing_response'
        },
        {
          id: 'cat_sunbathing_response',
          speaker: 'cat',
          text: '喵~ 阳光真舒服，我感觉精力充沛了！',
          autoNext: true,
          nextStep: 'end'
        },
        {
          id: 'window_look_outside',
          speaker: 'object',
          text: '透过我，你可以看到外面的世界。',
          autoNext: true,
          nextStep: 'cat_look_response'
        },
        {
          id: 'cat_look_response',
          speaker: 'cat',
          text: '外面的世界真精彩，我看到了自由！',
          autoNext: true,
          nextStep: 'end'
        }
      ]
    });
  }

  public registerDialogue(dialogue: Dialogue): void {
    this.dialogues.set(dialogue.id, dialogue);
  }

  public getDialogue(dialogueId: string): Dialogue | null {
    return this.dialogues.get(dialogueId) || null;
  }

  public getAllDialogues(): Dialogue[] {
    return Array.from(this.dialogues.values());
  }

  public getDialogueIds(): string[] {
    return Array.from(this.dialogues.keys());
  }
} 