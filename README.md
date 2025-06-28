# 🐱 猫咪的一天 - 游戏架构

基于Phaser 3的高度工程化猫咪主题策略解密游戏。

## 🚀 快速开始

### 环境要求
- Node.js >= 20.10.0
- npm >= 8.0.0

### 安装和启动

1. **克隆项目**
```bash
git clone <repository-url>
cd cat_not_easy_phaser
```

2. **安装依赖**
```bash
npm install
```

3. **启动游戏**
```bash
# 方法1：使用启动脚本（推荐）
./start.sh

# 方法2：手动启动
npm run dev:full
```

### 访问游戏
- 🎮 游戏客户端：http://localhost:5173
- 📡 游戏服务器：http://localhost:3000

## 🎯 游戏特色

### 成就系统
游戏包含4条主要成就线路，每条线路都有独特的游戏体验：

1. **🚨 完美拆家王** - 制造混乱，成为破坏之王
2. **😺 温顺的乖猫** - 讨好主人，做一只乖猫咪
3. **🗺️ 大冒险家** - 探索房屋，发现所有秘密
4. **🛡️ 阴谋家** - 设置陷阱，保护领地

### 游戏机制
- **动作系统**：喝水、睡觉、磨爪、探索等
- **物品系统**：收集小鱼干、钥匙等物品
- **进度系统**：跟踪饥饿、如厕需求、主人回家进度
- **成就系统**：解锁各种有趣的成就

## 🛠️ 开发

### 项目结构
```
cat_not_easy_phaser/
├── src/                    # 源代码
│   ├── scenes/            # 游戏场景
│   ├── systems/           # 游戏系统
│   ├── types/             # TypeScript类型定义
│   └── utils/             # 工具函数
├── public/                # 静态资源
│   └── assets/            # 游戏资源
│       ├── data/          # 游戏数据
│       └── images/        # 图片资源
├── server/                # 服务器代码
└── doc/                   # 文档
```

### 开发命令
```bash
# 开发模式（同时启动客户端和服务器）
npm run dev:full

# 仅启动客户端
npm run dev

# 仅启动服务器
npm run server

# 类型检查
npm run type-check

# 构建项目
npm run build
```

### 技术栈
- **前端**：Phaser.js 3.60.0 + TypeScript + Vite
- **后端**：Express.js + TypeScript
- **构建工具**：npm + tsx + concurrently

## 🎮 游戏玩法

### 基础操作
- 点击物品进行交互
- 使用背包中的物品
- 在不同房间之间移动
- 完成各种动作来触发成就

### 成就解锁
- 执行特定动作达到一定次数
- 探索特定区域
- 完成特定的物品收集任务
- 根据行为选择获得不同的游戏结局

## 📝 更新日志

### v1.0.0
- ✅ 实现完整的成就系统
- ✅ 添加4条主要成就线路
- ✅ 实现16个子成就
- ✅ 集成成就UI和弹窗
- ✅ 移除bun构建工具链，改用npm和Node.js
- ✅ 优化开发体验和启动流程

## 🤝 贡献

欢迎提交Issue和Pull Request来改进游戏！

## 🎮 游戏架构

基于Phaser 3的高度工程化猫咪主题策略解密游戏。

## 项目概述

这是一个以猫咪为主角的点击式策略解密游戏，玩家需要在12小时内探索房间、执行各种动作，收集多个结局。游戏采用模块化架构设计，具有高度的可扩展性和维护性。

## 技术栈

- **游戏引擎**: Phaser 3.60.0
- **开发语言**: TypeScript
- **构建工具**: Vite
- **包管理**: npm

## 项目结构

```
src/
├── main.ts                 # 游戏主入口
├── config/
│   └── GameConfig.ts       # 游戏配置和常量
├── constants/
│   ├── SceneKeys.ts        # 场景键值常量
│   └── GameEvents.ts       # 游戏事件常量
├── core/                   # 核心管理器
│   ├── GameManager.ts      # 游戏状态管理
│   ├── SceneManager.ts     # 场景管理
│   ├── AudioManager.ts     # 音频管理
│   ├── UIManager.ts        # UI管理
│   └── SaveManager.ts      # 存档管理
├── data/                   # 数据层
│   ├── RoomRegistry.ts     # 房间数据注册
│   ├── ActionRegistry.ts   # 动作数据注册
│   └── AchievementRegistry.ts # 成就数据注册
├── scenes/                 # 场景层
│   ├── BaseScene.ts        # 基础场景类
│   ├── BootScene.ts        # 启动场景
│   ├── PreloadScene.ts     # 预加载场景
│   ├── MenuScene.ts        # 菜单场景
│   └── LivingRoomNorthScene.ts # 客厅北向场景
├── types/                  # 类型定义
│   └── GameState.ts        # 游戏状态类型
└── utils/                  # 工具类
    └── EventEmitter.ts     # 事件发射器
```

## 核心架构

### 1. 管理器模式 (Manager Pattern)

游戏采用管理器模式，将不同功能模块分离：

- **GameManager**: 管理游戏状态、时间、饥饿值、精力值等核心数据
- **SceneManager**: 管理场景切换和房间访问逻辑
- **AudioManager**: 管理音效和背景音乐
- **UIManager**: 管理用户界面元素
- **SaveManager**: 管理游戏存档和读档

### 2. 事件驱动架构

使用自定义事件发射器实现松耦合的组件通信：

```typescript
// 监听游戏事件
gameManager.on(GameEvents.TIME_CHANGED, (data) => {
  // 处理时间变化
});

// 触发事件
gameManager.emit(GameEvents.ACHIEVEMENT_UNLOCKED, { achievement: 'play_time' });
```

### 3. 数据驱动设计

游戏内容通过配置文件定义，便于扩展和修改：

- **房间数据**: 在`RoomRegistry`中定义房间布局和交互对象
- **动作数据**: 在`ActionRegistry`中定义所有可执行动作
- **成就数据**: 在`AchievementRegistry`中定义成就条件

### 4. 场景系统

采用Phaser场景系统，每个房间对应一个场景：

```typescript
// 基础场景类提供通用功能
export abstract class BaseScene extends Phaser.Scene {
  protected abstract initializeScene(): void;
  protected executeAction(actionId: string): boolean;
  protected switchToRoom(roomKey: string): void;
}
```

## 游戏机制

### 时间系统
- 游戏从早上8点开始，到晚上8点结束
- 每次交互消耗30分钟或60分钟
- 时间推进触发特殊事件

### 状态系统
- **饥饿值**: 影响某些动作的执行条件
- **精力值**: 限制高级动作的执行
- **物品栏**: 收集和使用各种道具

### 成就系统
- 多种成就类型：玩耍时光、猫中哈士奇、探索者等
- 基于条件的解锁机制
- 进度跟踪和显示

## 开发指南

### 添加新房间

1. 在`RoomRegistry`中定义房间数据
2. 创建对应的场景类继承`BaseScene`
3. 在`main.ts`中注册场景

### 添加新动作

1. 在`ActionRegistry`中定义动作数据
2. 设置时间消耗、状态要求、效果等
3. 在房间数据中关联动作

### 添加新成就

1. 在`AchievementRegistry`中定义成就
2. 设置解锁条件
3. 在相关动作中触发成就检查

## 运行项目

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 游戏特色

1. **高度工程化**: 模块化设计，易于维护和扩展
2. **数据驱动**: 游戏内容通过配置文件管理
3. **事件驱动**: 松耦合的组件通信
4. **类型安全**: 完整的TypeScript类型定义
5. **存档系统**: 完整的游戏存档和读档功能
6. **成就系统**: 丰富的成就和进度跟踪

## 扩展计划

- [ ] 添加更多房间和交互对象
- [ ] 实现更复杂的剧情分支
- [ ] 添加音效和背景音乐
- [ ] 优化UI界面
- [ ] 添加更多成就类型
- [ ] 实现多人游戏功能

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 🎮 游戏玩法

### 基础操作
- 点击物品进行交互
- 使用背包中的物品
- 在不同房间之间移动
- 完成各种动作来触发成就

### 成就解锁
- 执行特定动作达到一定次数
- 探索特定区域
- 完成特定的物品收集任务
- 根据行为选择获得不同的游戏结局

## 📝 更新日志

### v1.0.0
- ✅ 实现完整的成就系统
- ✅ 添加4条主要成就线路
- ✅ 实现16个子成就
- ✅ 集成成就UI和弹窗
- ✅ 移除bun构建工具链，改用npm和Node.js
- ✅ 优化开发体验和启动流程

## 🤝 贡献

欢迎提交Issue和Pull Request来改进游戏！

## �� 许可证

MIT License 