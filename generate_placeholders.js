#!/usr/bin/env bun
/**
 * 生成占位符图片的Bun脚本
 * 替代Python版本的generate_placeholders.py
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');

// 配置
const DATA_FILE = 'assets/data/gameData.json';
const OUTPUT_DIR = 'assets/images';
const DEFAULT_FONT_SIZE = 32;
const FONT_COLOR = '#FFFFFF';
const BG_COLOR = '#141414';
const BORDER_COLOR = '#FFFF00';
const BORDER_WIDTH = 5;

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function createPlaceholderImage(width, height, text, filename) {
    return new Promise((resolve, reject) => {
        try {
            // 创建画布
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // 设置背景色
            ctx.fillStyle = BG_COLOR;
            ctx.fillRect(0, 0, width, height);

            // 绘制边框
            ctx.strokeStyle = BORDER_COLOR;
            ctx.lineWidth = BORDER_WIDTH;
            ctx.strokeRect(BORDER_WIDTH/2, BORDER_WIDTH/2, width - BORDER_WIDTH, height - BORDER_WIDTH);

            // 设置字体
            ctx.font = `${DEFAULT_FONT_SIZE}px Arial`;
            ctx.fillStyle = FONT_COLOR;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // 绘制文字
            ctx.fillText(text, width / 2, height / 2);

            // 确保输出目录存在
            if (!fs.existsSync(OUTPUT_DIR)) {
                fs.mkdirSync(OUTPUT_DIR, { recursive: true });
            }

            // 添加.png扩展名
            if (!filename.toLowerCase().endsWith('.png')) {
                filename += '.png';
            }

            // 保存图片
            const filepath = path.join(OUTPUT_DIR, filename);
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(filepath, buffer);

            log(`Generated: ${filepath}`, 'green');
            resolve();
        } catch (error) {
            log(`Error generating ${filename}: ${error.message}`, 'red');
            reject(error);
        }
    });
}

function extractDimensionsFromFilename(filename) {
    const match = filename.match(/(\d+)[xX](\d+)/);
    if (match) {
        return [parseInt(match[1]), parseInt(match[2])];
    }
    return [null, null];
}

async function main() {
    try {
        log('🎨 开始生成占位符图片 (Bun版本)...', 'cyan');

        // 检查数据文件
        if (!fs.existsSync(DATA_FILE)) {
            log(`Error: Data file not found at ${DATA_FILE}`, 'red');
            return;
        }

        // 读取数据文件
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        const imageFilenames = new Set();

        // 收集所有唯一的图片文件名
        for (const [sceneId, sceneData] of Object.entries(data.scenes || {})) {
            if (sceneData.background) {
                imageFilenames.add(sceneData.background);
            }
        }

        for (const [objId, objData] of Object.entries(data.objects || {})) {
            if (objData.image) {
                imageFilenames.add(objData.image);
            }
        }

        log(`Found ${imageFilenames.size} unique images to generate.`, 'cyan');

        // 生成每个图片
        const promises = [];
        for (const filename of imageFilenames) {
            const [width, height] = extractDimensionsFromFilename(filename);
            if (width && height) {
                const text = `${width}x${height}`;
                promises.push(createPlaceholderImage(width, height, text, filename));
            } else {
                log(`Warning: Could not extract dimensions from '${filename}'. Skipping.`, 'yellow');
            }
        }

        // 等待所有图片生成完成
        await Promise.all(promises);
        log('✅ 所有占位符图片生成完成！', 'green');

    } catch (error) {
        log(`❌ 生成失败: ${error.message}`, 'red');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
} 