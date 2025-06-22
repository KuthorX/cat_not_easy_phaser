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
}

// 动作效果类型
export interface ActionEffect {
    progress?: Record<string, number>;
    inventory?: {
        action: 'add' | 'remove';
        item: string;
    };
    updateTarget?: Record<string, any>;
    special?: {
        unlockArea?: string;
        changeSceneState?: Record<string, any>;
        triggerEvent?: string;
    };
}

// 动作类型
export interface Action {
    id: string;
    name: string;
    description: string;
    effects?: ActionEffect;
    log?: string;
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
    actions?: Action[];
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

// 游戏数据类型
export interface GameData {
    initialState: Partial<GameState>;
    items: Record<string, Item>;
    scenes: Record<string, SceneData>;
}

// 存档API响应类型
export interface SaveResponse {
    success: boolean;
    message: string;
    data?: GameState;
    exists?: boolean;
} 