import PIL.Image
from PIL import Image
import os


def split_into_tiles(path, zoom_level):
    image = Image.open(path)
    width, height = image.size
    image = image.resize((height//2**(6-zoom_level), height//2**(6-zoom_level)))
    width, height = image.size
    tile_size = 256
    print()
    print(tile_size)
    tiles_dir = f"tiles/{zoom_level}"

    os.makedirs(tiles_dir, exist_ok=True)

    for x in range(0, width, tile_size):
        for y in range(0, height, tile_size):
            tile = image.crop((x, y, x + tile_size, y + tile_size))
            tile_dir = f"{tiles_dir}/{x // tile_size}"
            os.makedirs(tile_dir, exist_ok=True)
            tile_path = f"{tile_dir}/{y // tile_size}.png"
            tile.save(tile_path)


PIL.Image.MAX_IMAGE_PIXELS = 1173741824
for i in range(0, 7):
    split_into_tiles("C:\map.png", i)