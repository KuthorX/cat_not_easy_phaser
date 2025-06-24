// 游戏状态类型
export interface GameState {
    currentLocation: string;
    inventory: string[];
    actionLog: string[];
    
    // 时间系统
    currentTime: number; // 当前时间（分钟，从9:00开始计算）
    timeRemaining: number; // 剩余时间（分钟）
    
    // 状态值系统（0-5点）
    hungry: number; // 饥饿值
    energy: number; // 精力值
    
    // 进度系统（保留部分用于特殊事件）
    progress: {
        humanComingHome?: number; // 两脚兽回家进度
    };
    
    // 成就系统
    achievements: Record<string, Achievement>;
    achievementCounters: {
        // 玩耍相关
        toyCollectionCount: number; // 收集的玩具数量
        playInteractionCount: number; // 玩耍交互次数
        
        // 破坏相关
        expensiveItemDestroyCount: number; // 昂贵物品破坏数量
        
        // 探索相关
        balconyVisited: number; // 阳台访问
        neighborEscape: number; // 邻居家逃脱
        
        // 策略相关
        trapSetupCount: number; // 陷阱设置数量
        materialPreparationCount: number; // 材料准备数量
        
        // 其他
        greetingAtDoor: number; // 门口迎接
        noDestructionFlag: boolean; // 无破坏标志
    };
    
    // 标志系统
    flags?: Record<string, boolean>;
    
    // 存档相关
    history?: GameState[];
    savedAt?: string;
    saveInfo?: {
        name: string;
        description: string;
        playTime: number;
        lastPlayed: string;
        catPersonality?: CatPersonality;
    };
    
    // 方法
    addToInventory: (itemId: string) => void;
    removeFromInventory: (itemId: string) => void;
    log: (msg: string) => void;
}

// 猫咪性格类型
export interface CatPersonality {
    type: 'curious' | 'playful' | 'territorial' | 'social' | 'independent' | 'lazy' | 'adventurous' | 'mischievous';
    traits: {
        curiosity: number;
        playfulness: number;
        territorial: number;
        social: number;
        independence: number;
        mischief: number;
    };
    preferences: {
        favoriteSleepSpot: string;
        favoriteToy: string;
        favoriteFood: string;
        leastFavoriteActivity: string;
    };
}

// 存档信息类型
export interface SaveInfo {
    id: string;
    name: string;
    description: string;
    playTime: number;
    lastPlayed: string;
    catPersonality?: CatPersonality;
    achievements: number;
    currentLocation: string;
    thumbnail?: string;
}

// 存档列表响应类型
export interface SaveListResponse {
    success: boolean;
    saves: SaveInfo[];
    message?: string;
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
    // 时间消耗（分钟）
    timeCost?: number;
    
    // 状态值变化
    hungryChange?: number; // 饥饿值变化
    energyChange?: number; // 精力值变化
    
    // 状态值要求
    hungryRequirement?: number; // 需要的最小饥饿值
    energyRequirement?: number; // 需要的最小精力值
    energyCost?: number; // 消耗的精力值
    
    // 原有效果
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
    
    // 动作分类
    category?: 'simple' | 'complex'; // 简单交互30分钟，复杂交互60分钟
    timeCost?: number; // 时间消耗（分钟）
    
    // 状态值要求
    hungryRequirement?: number; // 需要的最小饥饿值
    energyRequirement?: number; // 需要的最小精力值
    energyCost?: number; // 消耗的精力值
    
    // 状态值恢复
    hungryRestore?: number; // 恢复的饥饿值
    energyRestore?: number; // 恢复的精力值
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
    actions?: string[];
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