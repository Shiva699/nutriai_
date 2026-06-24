from PIL import Image, ImageDraw, ImageFont
import os

base = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'meals')
os.makedirs(base, exist_ok=True)
size = (1200, 780)
images = {
    'breakfast1': ('#fdf1d7', '#c0682a', 'BREAKFAST 1'),
    'breakfast2': ('#f5e5c7', '#8a4f24', 'BREAKFAST 2'),
    'breakfast3': ('#e7f2f8', '#3f6a8d', 'BREAKFAST 3'),
    'lunch1': ('#e9f7e9', '#3f7d45', 'LUNCH 1'),
    'lunch2': ('#eef6fd', '#336a9c', 'LUNCH 2'),
    'lunch3': ('#f7e8d8', '#9c6130', 'LUNCH 3'),
    'dinner1': ('#f6e4da', '#9a4a2c', 'DINNER 1'),
    'dinner2': ('#e7f1d8', '#4c7d40', 'DINNER 2'),
    'dinner3': ('#f7e6d9', '#b06e3d', 'DINNER 3'),
    'snack1': ('#f9e5d9', '#b25e3f', 'SNACK 1'),
    'snack2': ('#f1edd7', '#7d5f30', 'SNACK 2'),
    'snack3': ('#f7d9e0', '#9f3d63', 'SNACK 3'),
}

font = None
try:
    font = ImageFont.truetype('arial.ttf', 120)
except Exception:
    font = ImageFont.load_default()

for name, (bg, fg, label) in images.items():
    img = Image.new('RGB', size, bg)
    draw = ImageDraw.Draw(img)
    draw.rectangle([80, 80, size[0]-80, size[1]-80], outline=fg, width=24)
    draw.text((size[0] // 2, size[1] // 2), label, fill=fg, font=font, anchor='mm')
    path = os.path.join(base, f'{name}.jpg')
    img.save(path, quality=90)
    print('created', path)
