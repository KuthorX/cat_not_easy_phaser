// 游戏状态类型
export interface GameState {
    currentLocation: string;
    inventory: string[];
    actionLog: string[];
    progress: {
        energy: number;
        happiness: number;
        mischief: number;
        humanComingHome?: number;
        hungry?: number;
        needPoop?: number;
    };
    achievements: Record<string, Achievement>;
    achievementCounters: {
        knockOverCount: number;
        scratchCount: number;
        sleepCount: number;
        fishPickupCount: number;
        drinkCount: number;
        patrolCount: number;
        areaVisitCount: number;
        waterBowlKnockOverCount: number;
        tableItemPushCount: number;
        toiletPaperDestroyCount: number;
        meowCount: number;
        sleepLocationCount: number;
        litterBoxCount: number;
        toyInteractionCount: number;
        keyFindCount: number;
        roomUnlockCount: number;
        fishHideCount: number;
        trapSetCount: number;
        invasionDefendCount: number;
    };
    flags?: Record<string, boolean>;
    history?: GameState[];
    savedAt?: string;
    addToInventory: (itemId: string) => void;
    removeFromInventory: (itemId: string) => void;
    log: (msg: string) => void;
}

// 成就类型
export interface Achievement {
    name: string;
    description: string;
    unlockedAt: string;
    category?: 'destruction' | 'obedient' | 'explorer' | 'strategist';
    isMainAchievement?: boolean;
}

// 成就线路类型
export interface AchievementPath {
    id: string;
    name: string;
    description: string;
    mainAchievement: string;
    subAchievements: string[];
    endCondition: (gameState: GameState) => boolean;
}

// 动作效果类型
export interface ActionEffect {
    progress?: Record<string, number>;
    inventory?: {
        action: 'add' | 'remove';
        item: string;
    };
    object?: {
        action: 'hide' | 'show' | 'change';
        property?: string;
        value?: any;
    };
    scene?: {
        action: 'spawn_item' | 'remove_item' | 'change_state';
        item?: string;
        position?: string;
        state?: any;
    };
    updateTarget?: Record<string, any>;
    special?: {
        unlockArea?: string;
        changeSceneState?: Record<string, any>;
        triggerEvent?: string;
    };
    triggerAchievement?: string;
}

// 动作类型
export interface Action {
    id: string;
    text: string;
    log: string;
    effects?: ActionEffect;
    triggerAchievement?: string;
}

// 动作配置类型
export interface ActionConfig {
    actions: Record<string, Action>;
    item_actions: Record<string, Record<string, Action>>;
    interactions: Record<string, Action>;
}

// 对象数据类型
export interface ObjectData {
    id?: string;
    x: number;
    y: number;
    image: string;
    name: string;
    look?: string;
    navTo?: string;
    interactive?: boolean;
    actions?: string[]; // 改为动作ID数组
}

// 场景数据类型
export interface SceneData {
    name: string;
    background: string;
    objects: Record<string, ObjectData>;
}

// 物品类型
export interface Item {
    id: string;
    name: string;
    description: string;
    image: string;
}

// 物品交互类型
export interface ItemInteraction {
    text: string;
    log: string;
    effects?: ActionEffect;
    triggerAchievement?: string;
}

// 物品交互配置类型
export interface ItemInteractionConfig {
    description: string;
    interactions: Record<string, ItemInteraction>;
}

// 游戏数据类型
export interface GameData {
    initialState: Partial<GameState>;
    items: Record<string, Item>;
    actions: ActionConfig;
    itemInteractions: Record<string, ItemInteractionConfig>;
    scenes: Record<string, SceneData>;
}

// 存档API响应类型
export interface SaveResponse {
    success: boolean;
    message: string;
    data?: GameState;
    exists?: boolean;
} 