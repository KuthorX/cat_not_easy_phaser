import express, { Request, Response } from 'express';
import cors from 'cors';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { GameState, SaveResponse } from '../src/types/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // 服务静态文件

// 存档文件路径
const SAVE_DIR = './saves';
const SAVE_FILE = path.join(SAVE_DIR, 'game_save.json');

// 确保存档目录存在
async function ensureSaveDir(): Promise<void> {
    if (!existsSync(SAVE_DIR)) {
        await mkdir(SAVE_DIR, { recursive: true });
    }
}

// 保存游戏状态
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

// 加载游戏状态
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

// 删除存档
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
}); 