const express = require('express');
const path = require('path');
const Jimp = require('jimp');
const fs = require('fs');
const {exec} = require('child_process') ;

const index = express();
const tilesDirectory = path.join(__dirname, 'tiles'); // Путь к папке с тайлами

index.use(express.static(tilesDirectory)); // Делаем папку с тайлами доступной как статическое содержимое

index.get('/tiles/:zoom/:x/:y', (req, res) => {
    const { zoom, x, y } = req.params;
    const tilePath = path.join(tilesDirectory, zoom, x, `${y}.png`); // Путь к запрошенному тайлу

    res.sendFile(tilePath);
});

async function splitImageIntoTiles() {
    const pythonScriptPath = 'main.py';

    exec(`python ${pythonScriptPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Ошибка при выполнении Python-скрипта: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Ошибка вывода Python-скрипта: ${stderr}`);
            return;
        }
        console.log(`Результат выполнения Python-скрипта: ${stdout}`);
    });
}

splitImageIntoTiles()
    .then(() => {
        const port = 8000;
        index.listen(port, () => {
            console.log(`Сервер запущен на порту ${port}`);
        });
    })
    .catch((error) => {
        console.error('Ошибка при разбивке картинки на тайлы:', error);
    });
