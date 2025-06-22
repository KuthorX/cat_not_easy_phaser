import { GameState, SaveResponse } from '../types/index.js';

export class SaveSystem {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
    }

    /**
     * 保存游戏状态
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
     * 加载游戏状态
     */
    async loadGame(): Promise<SaveResponse> {
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
     * 删除存档
     */
    async deleteSave(): Promise<SaveResponse> {
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
} 