const express = require('express');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const index = express();
const tilesDirectory = path.join(__dirname, 'tiles'); // Путь к папке с тайлами

index.use(express.static(tilesDirectory)); // Делаем папку с тайлами доступной как статическое содержимое

index.get('/tiles/:zoom/:x/:y', (req, res) => {
    const { zoom, x, y } = req.params;
    const tilePath = path.join(tilesDirectory, zoom, x, `${y}.png`); // Путь к запрошенному тайлу

    res.sendFile(tilePath);
});

async function splitImageIntoTiles(imagePath) {
    const image = sharp(imagePath, { limitInputPixels: false });
    const metadata = await image.metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const tileWidth = 256;
    const tileHeight = 256;
    const zoomLevels = 7;

    for (let zoom = 0; zoom < zoomLevels; zoom++) {
        console.log(`${zoom} - уровень генерируется`);
        const resizedWidth = Math.floor(width / 2 ** (zoomLevels - zoom - 1));
        const resizedHeight = Math.floor(height / 2 ** (zoomLevels - zoom - 1));
        const resizedImage = await image.resize(resizedWidth, resizedHeight);

        const zoomDir = path.join(tilesDirectory, String(zoom));
        fs.mkdirSync(zoomDir, { recursive: true });

        for (let x = 0; x < resizedWidth; x += tileWidth) {
            const xDir = path.join(zoomDir, String(Math.floor(x / tileWidth)));
            fs.mkdirSync(xDir, { recursive: true });

            for (let y = 0; y < resizedHeight; y += tileHeight) {
                const tile = resizedImage.extract({
                    left: x,
                    top: y,
                    width: tileWidth,
                    height: tileHeight,
                });

                const tilePath = path.join(xDir, `${Math.floor(y / tileHeight)}.png`);
                await tile.toFile(tilePath);
            }
        }
    }
}

const imagePath = 'map.png';
splitImageIntoTiles(imagePath)
    .then(() => {
        const port = 8000;
        index.listen(port, () => {
            console.log(`Сервер запущен на порту ${port}`);
        });
    })
    .catch((error) => {
        console.error('Ошибка при разбивке картинки на тайлы:', error);
    });
