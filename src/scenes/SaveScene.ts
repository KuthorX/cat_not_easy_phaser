import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { SaveInfo } from '../types/index';

export default class SaveScene extends Phaser.Scene {
    private saveSystem: SaveSystem;
    private saves: SaveInfo[] = [];
    private saveListContainer!: Phaser.GameObjects.Container;
    private background!: Phaser.GameObjects.Rectangle;
    private title!: Phaser.GameObjects.Text;
    private backButton!: Phaser.GameObjects.Text;
    private newSaveButton!: Phaser.GameObjects.Text;
    private saveSlots: Phaser.GameObjects.Container[] = [];

    constructor() {
        super({ key: 'SaveScene' });
        this.saveSystem = new SaveSystem();
    }

    create() {
        this.createBackground();
        this.createUI();
        this.loadSaveList();
    }

    private createBackground() {
        // 创建半透明背景
        this.background = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.8);
        this.background.setOrigin(0, 0);

        // 创建标题背景
        const titleBg = this.add.rectangle(640, 60, 600, 80, 0x4a4a4a, 0.9);
        titleBg.setStrokeStyle(2, 0xffffff);
    }

    private createUI() {
        // 标题
        this.title = this.add.text(640, 60, '存档管理', {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // 返回按钮
        this.backButton = this.add.text(100, 60, '← 返回', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#666666',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        this.backButton.setInteractive({ useHandCursor: true });
        this.backButton.on('pointerdown', () => {
            this.scene.resume('GameScene');
            this.scene.stop();
        });

        // 新建存档按钮
        this.newSaveButton = this.add.text(1180, 60, '+ 新建', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        this.newSaveButton.setInteractive({ useHandCursor: true });
        this.newSaveButton.on('pointerdown', () => {
            this.createNewSave();
        });

        // 创建存档列表容器
        this.saveListContainer = this.add.container(640, 400);
    }

    private async loadSaveList() {
        try {
            const result = await this.saveSystem.getSaveList();
            if (result.success) {
                this.saves = result.saves;
                this.renderSaveList();
            } else {
                console.error('加载存档列表失败:', result.message);
            }
        } catch (error) {
            console.error('加载存档列表失败:', error);
        }
    }

    private renderSaveList() {
        // 清除现有存档槽
        this.saveSlots.forEach(slot => slot.destroy());
        this.saveSlots = [];

        if (this.saves.length === 0) {
            // 显示空状态
            const emptyText = this.add.text(0, 0, '暂无存档\n点击"新建"创建第一个存档', {
                fontSize: '24px',
                color: '#888888',
                align: 'center'
            }).setOrigin(0.5);
            this.saveListContainer.add(emptyText);
            return;
        }

        // 创建存档槽
        this.saves.forEach((save, index) => {
            const slot = this.createSaveSlot(save, index);
            this.saveSlots.push(slot);
            this.saveListContainer.add(slot);
        });
    }

    private createSaveSlot(save: SaveInfo, index: number): Phaser.GameObjects.Container {
        const container = this.add.container(0, index * 120);

        // 存档槽背景
        const slotBg = this.add.rectangle(0, 0, 800, 100, 0x333333, 0.8);
        slotBg.setStrokeStyle(2, 0x666666);
        container.add(slotBg);

        // 存档信息
        const saveName = this.add.text(-350, -30, save.name, {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        container.add(saveName);

        const saveDesc = this.add.text(-350, 0, save.description || '无描述', {
            fontSize: '16px',
            color: '#cccccc',
            fontFamily: 'Arial'
        });
        container.add(saveDesc);

        const saveInfo = this.add.text(-350, 20, 
            `位置: ${save.currentLocation} | 成就: ${save.achievements} | 游戏时间: ${save.playTime}分钟`, {
            fontSize: '14px',
            color: '#999999',
            fontFamily: 'Arial'
        });
        container.add(saveInfo);

        const lastPlayed = this.add.text(-350, 35, 
            `最后游玩: ${new Date(save.lastPlayed).toLocaleString()}`, {
            fontSize: '12px',
            color: '#888888',
            fontFamily: 'Arial'
        });
        container.add(lastPlayed);

        // 猫咪性格标签
        if (save.catPersonality) {
            const personalityTag = this.add.text(200, -30, 
                this.getPersonalityDisplayName(save.catPersonality.type), {
                fontSize: '14px',
                color: '#ffffff',
                backgroundColor: this.getPersonalityColor(save.catPersonality.type),
                padding: { x: 10, y: 5 }
            });
            container.add(personalityTag);
        }

        // 操作按钮
        const loadButton = this.add.text(250, -20, '加载', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#2196F3',
            padding: { x: 15, y: 8 }
        });
        loadButton.setInteractive({ useHandCursor: true });
        loadButton.on('pointerdown', () => {
            this.loadSave(save.id);
        });
        container.add(loadButton);

        const deleteButton = this.add.text(250, 10, '删除', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#f44336',
            padding: { x: 15, y: 8 }
        });
        deleteButton.setInteractive({ useHandCursor: true });
        deleteButton.on('pointerdown', () => {
            this.deleteSave(save.id);
        });
        container.add(deleteButton);

        const exportButton = this.add.text(250, 40, '导出', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#FF9800',
            padding: { x: 15, y: 8 }
        });
        exportButton.setInteractive({ useHandCursor: true });
        exportButton.on('pointerdown', () => {
            this.exportSave(save.id);
        });
        container.add(exportButton);

        return container;
    }

    private getPersonalityDisplayName(type: string): string {
        const names: Record<string, string> = {
            'curious': '好奇宝宝',
            'playful': '爱玩猫',
            'territorial': '领地守护者',
            'social': '社交达人',
            'independent': '独立猫',
            'lazy': '懒猫',
            'adventurous': '冒险家',
            'mischievous': '调皮鬼'
        };
        return names[type] || type;
    }

    private getPersonalityColor(type: string): string {
        const colors: Record<string, string> = {
            'curious': '#9C27B0',
            'playful': '#FF9800',
            'territorial': '#F44336',
            'social': '#2196F3',
            'independent': '#607D8B',
            'lazy': '#795548',
            'adventurous': '#4CAF50',
            'mischievous': '#E91E63'
        };
        return colors[type] || '#666666';
    }

    private async createNewSave() {
        const gameScene = this.scene.get('GameScene');
        const gameState = (gameScene as any).gameState;
        
        if (!gameState) {
            console.error('无法获取游戏状态');
            return;
        }

        // 这里可以弹出一个输入框让用户输入存档名称
        const saveName = `猫咪存档_${new Date().toLocaleDateString()}`;
        const description = `创建于 ${new Date().toLocaleString()}`;

        try {
            const result = await this.saveSystem.createSave(gameState, saveName, description);
            if (result.success) {
                console.log('新建存档成功');
                this.loadSaveList(); // 重新加载存档列表
            } else {
                console.error('新建存档失败:', result.message);
            }
        } catch (error) {
            console.error('新建存档失败:', error);
        }
    }

    private async loadSave(saveId: string) {
        try {
            const result = await this.saveSystem.loadSave(saveId);
            if (result.success && result.data) {
                // 恢复游戏状态
                const gameScene = this.scene.get('GameScene');
                (gameScene as any).restoreGameState(result.data);
                
                // 返回游戏场景
                this.scene.resume('GameScene');
                this.scene.stop();
            } else {
                console.error('加载存档失败:', result.message);
            }
        } catch (error) {
            console.error('加载存档失败:', error);
        }
    }

    private async deleteSave(saveId: string) {
        if (confirm('确定要删除这个存档吗？此操作不可撤销。')) {
            try {
                const result = await this.saveSystem.deleteSave(saveId);
                if (result.success) {
                    console.log('删除存档成功');
                    this.loadSaveList(); // 重新加载存档列表
                } else {
                    console.error('删除存档失败:', result.message);
                }
            } catch (error) {
                console.error('删除存档失败:', error);
            }
        }
    }

    private async exportSave(saveId: string) {
        try {
            const saveData = await this.saveSystem.exportSave(saveId);
            const blob = new Blob([saveData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cat_save_${saveId}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('导出存档失败:', error);
        }
    }
} 