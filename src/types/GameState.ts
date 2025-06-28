export interface GameState {
  currentTime: number;
  hunger: number;
  energy: number;
  inventory: string[];
  achievements: string[];
  visitedRooms: Set<string>;
  completedActions: Set<string>;
  destroyedItems: Set<string>;
  storyFlags: Map<string, any>;
  currentRoom: string;
  gameEnded: boolean;
  endingType: string | null;
  currentDialogue?: DialogueState;
  dialogueHistory: DialogueHistoryEntry[];
}

export interface DialogueState {
  objectId: string;
  objectName: string;
  objectPosition: { x: number; y: number };
  lastBubblePosition?: DialogueBubblePosition;
  currentDialogue: Dialogue;
  currentStep: number;
  isActive: boolean;
}

export interface DialogueHistoryEntry {
  timestamp: number;
  objectId: string;
  objectName: string;
  dialogueText: string;
  speaker: 'object' | 'cat';
}

export interface Dialogue {
  id: string;
  objectId: string;
  objectName: string;
  steps: DialogueStep[];
  conditions?: DialogueCondition[];
  effects?: DialogueEffect[];
}

export interface DialogueStep {
  id: string;
  speaker: 'object' | 'cat';
  text: string;
  choices?: DialogueChoice[];
  autoNext?: boolean;
  nextStep?: string;
  effects?: DialogueEffect[];
}

export interface DialogueChoice {
  id: string;
  text: string;
  nextStep: string;
  conditions?: DialogueCondition[];
  effects?: DialogueEffect[];
}

export interface DialogueCondition {
  type: 'hunger' | 'energy' | 'inventory' | 'story_flag' | 'room_visited' | 'action_completed' | 'object_state';
  operator: 'gte' | 'lte' | 'eq' | 'ne' | 'has' | 'not_has';
  value: any;
  objectId?: string;
}

export interface DialogueEffect {
  type: 'hunger' | 'energy' | 'inventory' | 'story_flag' | 'achievement' | 'room_access' | 'object_state';
  value: any;
  operation: 'add' | 'remove' | 'set' | 'modify';
  objectId?: string;
}

export interface DialogueBubblePosition {
  x: number;
  y: number;
  anchor: 'left' | 'right' | 'center';
  direction: 'up' | 'down' | 'left' | 'right';
}

export interface Action {
  id: string;
  name: string;
  timeCost?: number;
  hungerCost?: number;
  energyCost?: number;
  hungerRequirement?: number;
  energyRequirement?: number;
  roomRequirement?: string;
  itemRequirement?: string;
  effects: ActionEffect[];
  conditions: ActionCondition[];
  dialogueId?: string;
  triggerDialogue?: boolean;
  specialCondition?: {
    type: string;
    value: any;
    failureMessage: string;
  };
}

export interface ActionEffect {
  type: 'hunger' | 'energy' | 'inventory' | 'story_flag' | 'achievement' | 'room_access';
  value: any;
  operation: 'add' | 'remove' | 'set' | 'modify';
}

export interface ActionCondition {
  type: 'hunger' | 'energy' | 'inventory' | 'story_flag' | 'room_visited' | 'action_completed';
  operator: 'gte' | 'lte' | 'eq' | 'ne' | 'has' | 'not_has';
  value: any;
}

export interface RoomData {
  id: string;
  name: string;
  background: string;
  interactiveObjects: InteractiveObject[];
  exits: RoomExit[];
  requirements?: RoomRequirement[];
}

export interface InteractiveObject {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sprite?: string;
  imageKey?: string;
  actions: string[];
  state?: any;
  thought?: string;
}

export interface RoomExit {
  id: string;
  name: string;
  targetRoom: string;
  x: number;
  y: number;
  width: number;
  height: number;
  requirements?: RoomRequirement[];
}

export interface RoomRequirement {
  type: 'story_flag' | 'inventory' | 'achievement' | 'action_completed';
  value: any;
  operator: 'eq' | 'ne' | 'has' | 'not_has';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  conditions: AchievementCondition[];
  reward?: any;
}

export interface AchievementCondition {
  type: 'action_completed' | 'item_destroyed' | 'room_visited' | 'inventory_has' | 'story_flag';
  value: any;
  count?: number;
} 