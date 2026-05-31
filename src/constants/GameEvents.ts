export enum GameEvents {
  // 时间相关
  TIME_CHANGED = 'time_changed',
  
  // 状态相关
  HUNGER_CHANGED = 'hunger_changed',
  ENERGY_CHANGED = 'energy_changed',
  
  // 物品相关
  INVENTORY_CHANGED = 'inventory_changed',
  ITEM_DESTROYED = 'item_destroyed',
  
  // 成就相关
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  
  // 房间相关
  ROOM_VISITED = 'room_visited',
  ROOM_CHANGED = 'room_changed',
  
  // 动作相关
  ACTION_COMPLETED = 'action_completed',
  ACTION_FAILED = 'action_failed',
  
  // 故事相关
  STORY_FLAG_SET = 'story_flag_set',
  DIALOGUE_STARTED = 'dialogue_started',
  DIALOGUE_ENDED = 'dialogue_ended',
  
  // 事件相关
  EVENT_TRIGGERED = 'event_triggered',
  EVENT_COMPLETED = 'event_completed',
  
  // 统计相关
  STATISTICS_UPDATED = 'statistics_updated',
  STATISTICS_RESET = 'statistics_reset',
  
  // 特殊事件
  OWNER_RETURN = 'owner_return',
  NEIGHBOR_CAT_FIGHT = 'neighbor_cat_fight',
  
  // 游戏状态
  GAME_STARTED = 'game_started',
  GAME_ENDED = 'game_ended',
  GAME_RESET = 'game_reset',
  GAME_PAUSED = 'game_paused',
  GAME_RESUMED = 'game_resumed',
  
  // UI相关
  UI_SHOW = 'ui_show',
  UI_HIDE = 'ui_hide',
  UI_UPDATE = 'ui_update',
  
  // 音频相关
  AUDIO_PLAY = 'audio_play',
  AUDIO_STOP = 'audio_stop',
  AUDIO_VOLUME_CHANGED = 'audio_volume_changed',
  
  // 保存相关
  SAVE_GAME = 'save_game',
  LOAD_GAME = 'load_game',
  SAVE_SUCCESS = 'save_success',
  SAVE_FAILED = 'save_failed',
  LOAD_SUCCESS = 'load_success',
  LOAD_FAILED = 'load_failed',
  
  // 战斗相关
  BATTLE_START = 'battle_start',
  BATTLE_END = 'battle_end',
  BATTLE_ACTION_SELECTED = 'battle_action_selected',
  BATTLE_RESULT = 'battle_result'
} 