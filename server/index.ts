import express, { Request, Response } from 'express';
import cors from 'cors';
import { readFile, writeFile, mkdir, readdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { GameState, SaveResponse, SaveInfo, SaveListResponse } from '../src/types/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // 服务静态文件

// 存档文件路径
const SAVE_DIR = './temp/saves';
const SAVE_FILE = path.join(SAVE_DIR, 'game_save.json');

// 确保存档目录存在
async function ensureSaveDir(): Promise<void> {
    if (!existsSync(SAVE_DIR)) {
        await mkdir(SAVE_DIR, { recursive: true });
    }
}

// 生成存档ID
function generateSaveId(): string {
    return `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 获取存档信息
function getSaveInfo(gameState: GameState, saveId: string): SaveInfo {
    return {
        id: saveId,
        name: gameState.saveInfo?.name || '未命名存档',
        description: gameState.saveInfo?.description || '',
        playTime: gameState.saveInfo?.playTime || 0,
        lastPlayed: gameState.saveInfo?.lastPlayed || new Date().toISOString(),
        catPersonality: gameState.saveInfo?.catPersonality,
        achievements: Object.keys(gameState.achievements || {}).length,
        currentLocation: gameState.currentLocation,
        thumbnail: gameState.saveInfo?.thumbnail
    };
}

// 获取存档列表
app.get('/api/saves', async (req: Request, res: Response<SaveListResponse>) => {
    try {
        await ensureSaveDir();
        const files = await readdir(SAVE_DIR);
        const saves: SaveInfo[] = [];

        for (const file of files) {
            if (file.endsWith('.json') && file !== 'game_save.json') {
                const saveId = file.replace('.json', '');
                const filePath = path.join(SAVE_DIR, file);
                const saveData = await readFile(filePath, 'utf-8');
                const gameState: GameState = JSON.parse(saveData);
                saves.push(getSaveInfo(gameState, saveId));
            }
        }

        // 按最后游玩时间排序
        saves.sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime());

        res.json({ success: true, saves });
    } catch (error) {
        console.error('获取存档列表失败:', error);
        res.status(500).json({ success: false, saves: [], message: '获取存档列表失败' });
    }
});

// 创建新存档
app.post('/api/saves', async (req: Request, res: Response<SaveResponse>) => {
    try {
        await ensureSaveDir();
        const gameState: GameState = req.body;
        const saveId = generateSaveId();
        const saveFile = path.join(SAVE_DIR, `${saveId}.json`);
        
        const saveData = {
            ...gameState,
            savedAt: new Date().toISOString()
        };
        
        await writeFile(saveFile, JSON.stringify(saveData, null, 2));
        res.json({ success: true, message: '存档创建成功', data: gameState });
    } catch (error) {
        console.error('创建存档失败:', error);
        res.status(500).json({ success: false, message: '创建存档失败' });
    }
});

// 获取指定存档
app.get('/api/saves/:saveId', async (req: Request, res: Response<SaveResponse>) => {
    try {
        const { saveId } = req.params;
        const saveFile = path.join(SAVE_DIR, `${saveId}.json`);
        
        if (!existsSync(saveFile)) {
            return res.status(404).json({ success: false, message: '存档不存在' });
        }
        
        const saveData = await readFile(saveFile, 'utf-8');
        const gameState: GameState = JSON.parse(saveData);
        res.json({ success: true, data: gameState });
    } catch (error) {
        console.error('加载存档失败:', error);
        res.status(500).json({ success: false, message: '加载存档失败' });
    }
});

// 更新指定存档
app.put('/api/saves/:saveId', async (req: Request, res: Response<SaveResponse>) => {
    try {
        const { saveId } = req.params;
        const gameState: GameState = req.body;
        const saveFile = path.join(SAVE_DIR, `${saveId}.json`);
        
        const saveData = {
            ...gameState,
            savedAt: new Date().toISOString()
        };
        
        await writeFile(saveFile, JSON.stringify(saveData, null, 2));
        res.json({ success: true, message: '存档更新成功' });
    } catch (error) {
        console.error('更新存档失败:', error);
        res.status(500).json({ success: false, message: '更新存档失败' });
    }
});

// 删除指定存档
app.delete('/api/saves/:saveId', async (req: Request, res: Response<SaveResponse>) => {
    try {
        const { saveId } = req.params;
        const saveFile = path.join(SAVE_DIR, `${saveId}.json`);
        
        if (existsSync(saveFile)) {
            await unlink(saveFile);
            res.json({ success: true, message: '存档删除成功' });
        } else {
            res.status(404).json({ success: false, message: '存档不存在' });
        }
    } catch (error) {
        console.error('删除存档失败:', error);
        res.status(500).json({ success: false, message: '删除存档失败' });
    }
});

// 导出存档
app.get('/api/saves/:saveId/export', async (req: Request, res: Response) => {
    try {
        const { saveId } = req.params;
        const saveFile = path.join(SAVE_DIR, `${saveId}.json`);
        
        if (!existsSync(saveFile)) {
            return res.status(404).json({ success: false, message: '存档不存在' });
        }
        
        const saveData = await readFile(saveFile, 'utf-8');
        const gameState: GameState = JSON.parse(saveData);
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="cat_save_${saveId}.json"`);
        res.json(gameState);
    } catch (error) {
        console.error('导出存档失败:', error);
        res.status(500).json({ success: false, message: '导出存档失败' });
    }
});

// 导入存档
app.post('/api/saves/import', async (req: Request, res: Response<SaveResponse>) => {
    try {
        await ensureSaveDir();
        const gameState: GameState = req.body;
        const saveId = generateSaveId();
        const saveFile = path.join(SAVE_DIR, `${saveId}.json`);
        
        const saveData = {
            ...gameState,
            savedAt: new Date().toISOString()
        };
        
        await writeFile(saveFile, JSON.stringify(saveData, null, 2));
        res.json({ success: true, message: '存档导入成功', data: gameState });
    } catch (error) {
        console.error('导入存档失败:', error);
        res.status(500).json({ success: false, message: '导入存档失败' });
    }
});

// 保存游戏状态（单存档模式）
app.post('/api/save', async (req: Request, res: Response<SaveResponse>) => {
    try {
        await ensureSaveDir();
        const gameState: GameState = req.body;
        const saveData = {
            ...gameState,
            savedAt: new Date().toISOString()
        };
        await writeFile(SAVE_FILE, JSON.stringify(saveData, null, 2));
        res.json({ success: true, message: '游戏已保存' });
    } catch (error) {
        console.error('保存失败:', error);
        res.status(500).json({ success: false, message: '保存失败' });
    }
});

// 加载游戏状态（单存档模式）
app.get('/api/load', async (req: Request, res: Response<SaveResponse>) => {
    try {
        if (!existsSync(SAVE_FILE)) {
            return res.status(404).json({ success: false, message: '没有找到存档文件' });
        }
        const saveData = await readFile(SAVE_FILE, 'utf-8');
        const gameState: GameState = JSON.parse(saveData);
        res.json({ success: true, data: gameState });
    } catch (error) {
        console.error('加载失败:', error);
        res.status(500).json({ success: false, message: '加载失败' });
    }
});

// 删除存档（单存档模式）
app.delete('/api/save', async (req: Request, res: Response<SaveResponse>) => {
    try {
        if (existsSync(SAVE_FILE)) {
            await writeFile(SAVE_FILE, '');
            res.json({ success: true, message: '存档已删除' });
        } else {
            res.status(404).json({ success: false, message: '没有找到存档文件' });
        }
    } catch (error) {
        console.error('删除失败:', error);
        res.status(500).json({ success: false, message: '删除失败' });
    }
});

// 检查存档是否存在
app.get('/api/save/exists', async (req: Request, res: Response<SaveResponse>) => {
    try {
        const exists = existsSync(SAVE_FILE);
        res.json({ success: true, exists });
    } catch (error) {
        console.error('检查存档失败:', error);
        res.status(500).json({ success: false, message: '检查失败' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📁 静态文件服务: http://localhost:${PORT}`);
    console.log(`💾 存档API: http://localhost:${PORT}/api/save`);
    console.log(`📋 多存档API: http://localhost:${PORT}/api/saves`);
}); 