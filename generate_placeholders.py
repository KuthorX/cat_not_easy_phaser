import os
import json
from PIL import Image, ImageDraw, ImageFont
import re

# Configuration
DATA_FILE = 'assets/data/gameData.json'
OUTPUT_DIR = 'assets/images'
DEFAULT_FONT_SIZE = 32
FONT_COLOR = (255, 255, 255)
BG_COLOR = (20, 20, 20)
BORDER_COLOR = (255, 255, 0)
BORDER_WIDTH = 5

def create_placeholder_image(width, height, text, filename):
    """Generates and saves a placeholder image with a border and text."""
    
    # Create a new image with the specified background color
    img = Image.new('RGB', (width, height), color=BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Draw border
    draw.rectangle(
        [(0, 0), (width - 1, height - 1)], 
        outline=BORDER_COLOR, 
        width=BORDER_WIDTH
    )

    # Load a font (try to use a common one, otherwise use default)
    try:
        font = ImageFont.truetype("arial.ttf", DEFAULT_FONT_SIZE)
    except IOError:
        print("Arial font not found. Using default PIL font.")
        font = ImageFont.load_default()

    # Calculate text size and position
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    text_x = (width - text_width) / 2
    text_y = (height - text_height) / 2

    # Draw the text on the image
    draw.text((text_x, text_y), text, font=font, fill=FONT_COLOR)

    # Add .png extension if it's missing for the output file, as Pillow needs it
    if not filename.lower().endswith('.png'):
        filename += '.png'

    # Save the image
    filepath = os.path.join(OUTPUT_DIR, filename)
    img.save(filepath)
    print(f"Generated: {filepath}")

def extract_dimensions_from_filename(filename):
    """Extracts dimensions like 1280x720 from a filename."""
    match = re.search(r'(\d+)[xX](\d+)', filename)
    if match:
        return int(match.group(1)), int(match.group(2))
    return None, None

def main():
    """Main function to generate all placeholder images."""
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created directory: {OUTPUT_DIR}")

    if not os.path.exists(DATA_FILE):
        print(f"Error: Data file not found at {DATA_FILE}")
        return

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    image_filenames = set()

    # Collect all unique image filenames from scenes and objects
    for scene_id, scene_data in data.get('scenes', {}).items():
        if scene_data.get('background'):
            image_filenames.add(scene_data['background'])
    
    for obj_id, obj_data in data.get('objects', {}).items():
        if obj_data.get('image'):
            image_filenames.add(obj_data['image'])

    print(f"Found {len(image_filenames)} unique images to generate.")

    # Generate each image
    for filename in image_filenames:
        width, height = extract_dimensions_from_filename(filename)
        if width and height:
            text = f"{width}x{height}"
            create_placeholder_image(width, height, text, filename)
        else:
            print(f"Warning: Could not extract dimensions from '{filename}'. Skipping.")

if __name__ == '__main__':
    main() 