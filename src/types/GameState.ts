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
}

export interface Action {
  id: string;
  name: string;
  description: string;
  timeCost: number;
  hungerCost?: number;
  energyCost?: number;
  hungerRequirement?: number;
  energyRequirement?: number;
  roomRequirement?: string;
  itemRequirement?: string;
  effects: ActionEffect[];
  conditions: ActionCondition[];
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
  description: string;
  background: string;
  interactiveObjects: InteractiveObject[];
  exits: RoomExit[];
  requirements?: RoomRequirement[];
}

export interface InteractiveObject {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sprite?: string;
  actions: string[];
  state?: any;
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