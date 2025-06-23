import { GameState, SaveResponse, SaveInfo, SaveListResponse } from '../types/index.js';

export class SaveSystem {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
    }

    /**
     * 保存游戏状态（单存档模式）
     */
    async saveGame(gameState: GameState): Promise<SaveResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(gameState),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('保存游戏失败:', error);
            return {
                success: false,
                message: '保存失败: ' + (error instanceof Error ? error.message : '未知错误')
            };
        }
    }

    /**
     * 创建新存档
     */
    async createSave(gameState: GameState, saveName: string, description: string = ''): Promise<SaveResponse> {
        try {
            const saveData = {
                ...gameState,
                saveInfo: {
                    name: saveName,
                    description,
                    playTime: 0,
                    lastPlayed: new Date().toISOString(),
                    catPersonality: this.generateCatPersonality()
                },
                savedAt: new Date().toISOString()
            };

            const response = await fetch(`${this.baseUrl}/api/saves`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(saveData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('创建存档失败:', error);
            return {
                success: false,
                message: '创建存档失败: ' + (error instanceof Error ? error.message : '未知错误')
            };
        }
    }

    /**
     * 更新现有存档
     */
    async updateSave(saveId: string, gameState: GameState): Promise<SaveResponse> {
        try {
            const saveData = {
                ...gameState,
                saveInfo: {
                    ...gameState.saveInfo,
                    lastPlayed: new Date().toISOString(),
                    playTime: (gameState.saveInfo?.playTime || 0) + 1 // 增加游戏时间
                },
                savedAt: new Date().toISOString()
            };

            const response = await fetch(`${this.baseUrl}/api/saves/${saveId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(saveData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('更新存档失败:', error);
            return {
                success: false,
                message: '更新存档失败: ' + (error instanceof Error ? error.message : '未知错误')
            };
        }
    }

    /**
     * 获取存档列表
     */
    async getSaveList(): Promise<SaveListResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/saves`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('获取存档列表失败:', error);
            return {
                success: false,
                saves: [],
                message: '获取存档列表失败: ' + (error instanceof Error ? error.message : '未知错误')
            };
        }
    }

    /**
     * 加载指定存档
     */
    async loadSave(saveId: string): Promise<SaveResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/saves/${saveId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    return {
                        success: false,
                        message: '没有找到指定的存档文件'
                    };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('加载存档失败:', error);
            return {
                success: false,
                message: '加载存档失败: ' + (error instanceof Error ? error.message : '未知错误')
            };
        }
    }

    /**
     * 删除指定存档
     */
    async deleteSave(saveId: string): Promise<SaveResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/saves/${saveId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('删除存档失败:', error);
            return {
                success: false,
                message: '删除存档失败: ' + (error instanceof Error ? error.message : '未知错误')
            };
        }
    }

    /**
     * 加载游戏状态（单存档模式）
     */
    async loadSingleSave(): Promise<SaveResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/load`);

            if (!response.ok) {
                if (response.status === 404) {
                    return {
                        success: false,
                        message: '没有找到存档文件'
                    };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('加载游戏失败:', error);
            return {
                success: false,
                message: '加载失败: ' + (error instanceof Error ? error.message : '未知错误')
            };
        }
    }

    /**
     * 删除存档（单存档模式）
     */
    async deleteSingleSave(): Promise<SaveResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/save`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('删除存档失败:', error);
            return {
                success: false,
                message: '删除失败: ' + (error instanceof Error ? error.message : '未知错误')
            };
        }
    }

    /**
     * 检查存档是否存在
     */
    async checkSaveExists(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/save/exists`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.success && result.exists;
        } catch (error) {
            console.error('检查存档失败:', error);
            return false;
        }
    }

    /**
     * 自动保存游戏
     */
    async autoSave(gameState: GameState): Promise<void> {
        const result = await this.saveGame(gameState);
        if (result.success) {
            console.log('自动保存成功');
        } else {
            console.warn('自动保存失败:', result.message);
        }
    }

    /**
     * 生成猫咪性格
     */
    private generateCatPersonality() {
        const personalityTypes = ['curious', 'playful', 'territorial', 'social', 'independent', 'lazy', 'adventurous', 'mischievous'];
        const type = personalityTypes[Math.floor(Math.random() * personalityTypes.length)];
        
        return {
            type,
            traits: {
                curiosity: Math.floor(Math.random() * 100),
                playfulness: Math.floor(Math.random() * 100),
                territorial: Math.floor(Math.random() * 100),
                social: Math.floor(Math.random() * 100),
                independence: Math.floor(Math.random() * 100),
                mischief: Math.floor(Math.random() * 100)
            },
            preferences: {
                favoriteSleepSpot: ['沙发', '猫窝', '阳台', '高处', '纸箱'][Math.floor(Math.random() * 5)],
                favoriteToy: ['逗猫棒', '毛线球', '激光笔', '纸团', '羽毛'][Math.floor(Math.random() * 5)],
                favoriteFood: ['鱼', '猫粮', '罐头', '零食', '生肉'][Math.floor(Math.random() * 5)],
                leastFavoriteActivity: ['洗澡', '剪指甲', '看医生', '被抱', '穿衣服'][Math.floor(Math.random() * 5)]
            }
        };
    }

    /**
     * 导出存档数据
     */
    async exportSave(saveId: string): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/api/saves/${saveId}/export`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('导出存档失败:', error);
            throw error;
        }
    }

    /**
     * 导入存档数据
     */
    async importSave(saveData: string): Promise<SaveResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/saves/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: saveData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('导入存档失败:', error);
            return {
                success: false,
                message: '导入存档失败: ' + (error instanceof Error ? error.message : '未知错误')
            };
        }
    }
} 