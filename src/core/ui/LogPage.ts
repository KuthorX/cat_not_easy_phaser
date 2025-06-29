import { IUIComponent } from './IUIComponent';
import { AchievementRegistry } from '../../data/AchievementRegistry';

export class LogPage implements IUIComponent {
  private scene: Phaser.Scene | null = null;
  private container: any = null;
  private background: Phaser.GameObjects.Rectangle | null = null;
  private title: Phaser.GameObjects.Text | null = null;
  private closeButton: Phaser.GameObjects.Text | null = null;
  private scrollContainer: any = null;
  private achievementRegistry: AchievementRegistry | null = null;
  private gameState: any = null;
  private currentPage = 0;
  private totalPagesData: any[][] = [];
  private pageText: Phaser.GameObjects.Text | null = null;
  private prevButton: Phaser.GameObjects.Text | null = null;
  private nextButton: Phaser.GameObjects.Text | null = null;
  private visibile : boolean = false;

  // 文本映射
  private actionTextMap: Map<string, string> = new Map([
    // 玩耍相关动作
    ['chew_rope', '咬绳子'],
    ['chase_ball', '追球'],
    ['play_with_mouse', '和玩具老鼠玩耍'],
    ['carry_mouse', '叼走玩具老鼠'],
    ['play_in_house', '在猫别墅里玩耍'],
    ['sunbathing', '晒太阳'],
    ['sleep_on_bed', '床上睡觉'],
    ['eat_fish_treat', '吃鱼干'],
    
    // 破坏相关动作
    ['sweep_table', '推倒桌子'],
    ['attack_tv', '攻击电视'],
    ['destroy_screen', '破坏显示屏'],
    ['attack_cage', '攻击笼子'],
    
    // 其他动作
    ['sleep_on_sofa', '沙发上睡觉'],
    ['eat_food_water', '吃食物喝水'],
    ['rummage', '翻找'],
    ['rummage_water', '翻找水'],
    ['pounce', '扑击'],
    ['unlock', '解锁'],
    ['enter', '进入'],
    ['jump_on', '跳上'],
    ['jump_on_big', '跳上高处'],
    ['eat', '进食'],
    ['poop', '拉屎'],
    ['house_parkour', '全屋跑酷'],
    ['bites_rope', '叼走绳子'],
    ['bites_air', '叼走空气'],
    ['carry_mouse', '叼走玩具老鼠'],
    ['climb_wardrobe', '钻进衣柜'],
    ['sleep_hammock', '睡猫吊床'],
    ['escape', '逃跑'],
    ['reinforce', '加固'],
    ['inspect', '检阅'],
    ['interact', '互动'],
    ['revenge', '报复'],
    ['ride', '骑上'],
    ['play', '玩耍'],
    ['carry', '叼走'],
    ['drink_carry', '叼走饮料'],
    ['destroy', '破坏'],
    ['hide', '钻进去'],
    ['pee', '尿床']
  ]);

  private roomTextMap: Map<string, string> = new Map([
    ['living_room_north', '客厅 - 向北看'],
    ['living_room_east', '客厅 - 向东看'],
    ['living_room_west_low', '客厅 - 向西看（低处）'],
    ['living_room_west_high', '客厅 - 向西看（高处）'],
    ['living_room_door', '客厅门口'],
    ['hallway', '过道'],
    ['room_b', '主人房间'],
    ['balcony', '阳台'],
    ['doorway', '门口 - 通向自由']
  ]);

  private itemTextMap: Map<string, string> = new Map([
    ['cat_food', '猫粮'],
    ['fish_treat', '鱼干'],
    ['milk', '牛奶'],
    ['toy_mouse', '玩具老鼠'],
    ['rope_toy', '咬绳'],
    ['ball', '小球'],
    ['key', '钥匙'],
    ['defense_materials', '防御材料'],
    ['neighbor_cat_fur', '邻居猫的毛'],
    ['owner_scent', '主人的气味']
  ]);

  private storyFlagTextMap: Map<string, string> = new Map([
    ['no_destruction', '没有进行破坏'],
    ['greet_owner', '门口迎接主人'],
    ['escaped_through_balcony', '从阳台逃跑'],
    ['fought_neighbor_cat', '与邻居猫战斗'],
    ['escaped_through_neighbor', '通过邻居家逃跑'],
    ['prepared_defense', '准备防御'],
    ['placed_toy_mouse_trap', '放置玩具老鼠陷阱'],
    ['placed_other_traps', '放置其他陷阱'],
    ['play_time', '玩耍时光'],
    ['screen_destroyed', '显示屏被破坏'],
    ['wardrobe_explored', '探索衣柜'],
    ['escaped', '成功逃跑'],
    ['parkour_completed', '完成跑酷'],
    ['mouse_carried', '叼走玩具老鼠'],
    ['has_toy_mouse', '拥有玩具老鼠'],
    ['has_rope_toy', '拥有咬绳'],
    ['has_ball', '拥有小球'],
    ['defeated_neighbor_cat', '击败邻居猫'],
    ['has_owner_scent', '拥有主人的气味']
  ]);

  constructor() {
    console.log('LogPage constructor');
  }

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    this.createLogPage();
  }

  private createLogPage(): void {
    console.log('createLogPage with ', this.scene);
    if (!this.scene) return;

    // 背景
    this.background = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, 800, 600, 0x000000, 0.8);
    this.background.setStrokeStyle(2, 0xffffff);

    // 标题
    this.title = this.scene.make.text({
      text: '日志页 - 成就路线提示',
      style: {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    }, false)
    this.title.setPosition(0, -250);
    this.title.setOrigin(0.5);

    // 关闭按钮

    this.closeButton = this.scene.make.text({
      text: '✕',
      style: {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#ff0000',
        padding: { x: 8, y: 4 }
      }
    }, false);
    this.closeButton.setPosition(350, -250);
    
    this.closeButton.setOrigin(0.5);
    this.closeButton.setInteractive();
    this.closeButton.on('pointerdown', () => this.hide());
    this.closeButton.on('pointerover', () => this.closeButton?.setStyle({ backgroundColor: '#cc0000' }));
    this.closeButton.on('pointerout', () => this.closeButton?.setStyle({ backgroundColor: '#ff0000' }));

    // 滚动容器
    this.scrollContainer = this.scene.make.container({}, false);
    this.scrollContainer.setPosition(0, -200);

    // 分页控件
    this.prevButton = this.scene.make.text({
      text: '< 上一页',
      style: {
        fontSize: '18px',
        color: '#ffffff'
      }
    }, false);
    this.prevButton.setPosition(-150, 250);
    
    this.nextButton = this.scene.make.text({
      text: '下一页 >',
      style: {
        fontSize: '18px',
        color: '#ffffff'
      }
    }, false);
    this.nextButton.setPosition(50, 250);

    this.pageText = this.scene.make.text({
      text: '',
      style: {
        fontSize: '18px',
        color: '#ffffff'
      }
    }, false);
    this.pageText.setPosition(-70, 250);

    this.prevButton.on('pointerdown', () => this.changePage(-1));
    this.nextButton.on('pointerdown', () => this.changePage(1));
    this.prevButton.setInteractive();
    this.nextButton.setInteractive(); 

    this.container = this.scene.make.container({
      children : [
        this.background, this.title, this.closeButton, this.scrollContainer, this.prevButton, this.nextButton, this.pageText
      ]
    }, false);


    this.container.setDepth(2000);
  }

  setAchievementRegistry(registry: AchievementRegistry): void {
    this.achievementRegistry = registry;
  }

  setGameState(gameState: any): void {
    this.gameState = gameState;
  }

  private createAchievementItems(): void {
    console.log('createAchievementItems with ', this.scene);
    if (!this.scrollContainer || !this.achievementRegistry || !this.gameState || !this.scene) return;

    this.generateAndPaginateData();

    this.currentPage = 0;
    this.updatePageContent();
  }

  private generateAndPaginateData() {
    const achievements = this.achievementRegistry!.getAllAchievements();
    const achievementData = achievements.map(achievement => {
      const progress = this.achievementRegistry!.getAchievementProgress(achievement.id, this.gameState);
      const conditions = achievement.conditions.map(condition => ({
        description: this.getConditionDescription(condition),
        completed: this.checkConditionCompleted(condition)
      }));
      const itemHeight = 70 + conditions.length * 15 + 10;
      return {
        name: achievement.name,
        description: achievement.description,
        progress: `进度: ${progress.current}/${progress.total}`,
        conditions: conditions,
        height: itemHeight
      };
    });

    const pageHeight = 400;
    this.totalPagesData = [];
    let currentPageData: any[] = [];
    let currentHeight = 0;
    achievementData.forEach(data => {
      if (currentHeight + data.height > pageHeight && currentPageData.length > 0) {
        this.totalPagesData.push(currentPageData);
        currentPageData = [];
        currentHeight = 0;
      }
      currentPageData.push(data);
      currentHeight += data.height;
    });

    if (currentPageData.length > 0) {
      this.totalPagesData.push(currentPageData);
    }
  }

  private updatePageContent(): void {
    if (!this.scrollContainer || !this.scene) return;

    this.scrollContainer.removeAll(true);
    let yOffset = 0;

    if (this.totalPagesData.length > 0) {
      const currentPageData = this.totalPagesData[this.currentPage];
      currentPageData.forEach(data => {
        const itemContainer = this.createItemContainer(data);
        itemContainer.setY(yOffset);
        this.scrollContainer!.add(itemContainer);
        yOffset += data.height;
      });
    }

    this.updatePaginationControls();
  }

  private createItemContainer(data: any): any {
    const itemContainer = this.scene!.make.container({}, false);
    const title = this.scene!.make.text({ x: -350, y: 0, text: data.name, style: { fontSize: '18px', color: '#ffff00', fontStyle: 'bold', padding: { x: 0, y: 5 } }}).setOrigin(0, 0);
    const description = this.scene!.make.text({ x: -350, y: 25, text: data.description, style: { fontSize: '14px', color: '#ffffff', wordWrap: { width: 650 }, padding: { x: 0, y: 5 } }}).setOrigin(0, 0);
    const progressText = this.scene!.make.text({ x: -350, y: 50, text: data.progress, style: { fontSize: '12px', color: '#cccccc' }, padding: { x: 0, y: 5 }}).setOrigin(0, 0);

    let conditionY = 70;
    data.conditions.forEach((condition: any) => {
      const conditionText = this.scene!.make.text({ x: -330, y: conditionY, text: `• ${condition.description}`, style: { fontSize: '12px', color: condition.completed ? '#00ff00' : '#ff6666', padding: { x: 0, y: 5 } }}).setOrigin(0, 0);
      itemContainer.add(conditionText);
      conditionY += 15;
    });

    const separator = new Phaser.GameObjects.Rectangle(this.scene!, 0, data.height - 5, 700, 1, 0x666666).setOrigin(0.5);
    itemContainer.add([title, description, progressText, separator]);
    return itemContainer;
  }

  private changePage(delta: number): void {
    const newPage = this.currentPage + delta;
    console.log('change to page ', newPage)
    if (newPage >= 0 && newPage < this.totalPagesData.length) {
      this.currentPage = newPage;
      this.updatePageContent(); 
    }
  }

  private updatePaginationControls(): void {
    if (!this.pageText || !this.prevButton || !this.nextButton) return;

    this.pageText.setText(`第 ${this.currentPage + 1} / ${this.totalPagesData.length} 页`);
    this.prevButton.setVisible(this.currentPage > 0);
    this.nextButton.setVisible(this.currentPage < this.totalPagesData.length - 1);
  }

  private checkConditionCompleted(condition: any): boolean {
    if (!this.gameState) return false;

    switch (condition.type) {
      case 'action_completed':
        return this.gameState.completedActions.has(condition.value);
      case 'item_destroyed':
        return this.gameState.destroyedItems.has(condition.value);
      case 'room_visited':
        return this.gameState.visitedRooms.has(condition.value);
      case 'inventory_has':
        return this.gameState.inventory.includes(condition.value);
      case 'story_flag':
        return this.gameState.storyFlags.get(condition.value) === condition.value;
      default:
        return false;
    }
  }

  private getConditionDescription(condition: any): string {
    switch (condition.type) {
      case 'action_completed':
        const actionText = this.actionTextMap.get(condition.value) || `未知动作: ${condition.value}`;
        return `完成动作: ${actionText}`;
      case 'item_destroyed':
        const destroyedItemText = this.itemTextMap.get(condition.value) || `未知物品: ${condition.value}`;
        return `破坏物品: ${destroyedItemText}`;
      case 'room_visited':
        const roomText = this.roomTextMap.get(condition.value) || `未知房间: ${condition.value}`;
        return `访问房间: ${roomText}`;
      case 'inventory_has':
        const inventoryItemText = this.itemTextMap.get(condition.value) || `未知物品: ${condition.value}`;
        return `拥有物品: ${inventoryItemText}`;
      case 'story_flag':
        const storyFlagText = this.storyFlagTextMap.get(condition.value) || `未知故事标记: ${condition.value}`;
        return `故事标记: ${storyFlagText}`;
      default:
        return `未知条件: ${condition.value}`;
    }
  }

  show(): void {
    console.log(this, 'LogPage show');
    if (this.container) {
      if (this.visibile) {
        console.log('LogPage already visible');
        return;
      }
      this.visibile = true;
      this.scene?.add.existing(this.container);
      this.container.setPosition(640, 360);
      this.createAchievementItems();
    }
  }

  hide(): void {
    console.log(this, 'LogPage onhide');
    this.visibile = false;
    if (this.container) {
      this.scene?.children.remove(this.container);
    }
  }

  destroy(): void {
    console.log(this, 'LogPage destroy');
    if (this.container) {
      this.container.destroy();
      this.container = null;
      this.background = null;
      this.title = null;
      this.closeButton = null;
      this.scrollContainer = null;
    }
  }
}