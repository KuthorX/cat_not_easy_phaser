import Phaser from 'phaser';

export class AssetLoader {
    static preloadImages(scene: Phaser.Scene): void {
        const images = [
            'placeholder_1280x720',
            'placeholder_1280x720_2', 
            'placeholder_1280x720_3',
            'placeholder_80x80',
            'placeholder_arrow_down_64x64',
            'placeholder_arrow_left_64x64',
            'placeholder_arrow_right_64x64',
            'placeholder_arrow_up_64x64',
            'placeholder_door_80x160',
            'placeholder_fish_60x30',
            'placeholder_nest_120x80',
            'placeholder_sofa_250x120',
            'placeholder_tv_150x120',
            'placeholder_villa_150x200'
        ];

        images.forEach(imageName => {
            scene.load.image(imageName, `assets/images/${imageName}.png`);
        });
    }

    static preloadData(scene: Phaser.Scene): void {
        scene.load.json('gameData', 'assets/data/gameData.json');
        scene.load.json('achievements', 'assets/data/achievements.json');
        scene.load.json('itemInteractions', 'assets/data/item_interactions.json');
    }
} 