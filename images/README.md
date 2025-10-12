# Tarot Card Images

This directory contains the images for the tarot cards.

## Image Requirements

- **Format**: PNG, JPG, or SVG
- **Dimensions**: Recommended 300x500 pixels (aspect ratio 2.5:3.85)
- **File naming**: Use descriptive names matching the card names (e.g., `planners-vision.jpg`, `erste-treffen.png`)

## Directory Structure

```
images/
  └── cards/
      ├── placeholder.svg          # Default placeholder
      ├── card-01.jpg             # Individual card images
      ├── card-02.jpg
      └── ...
```

## Adding Your Card Images

1. Place your card images in the `images/cards/` directory
2. Update the `data-image` attribute in the HTML for each card to point to your image
3. The images will automatically appear on the back of the cards when flipped

## Example

```html
<div class="card-back" style="background-image: url('images/cards/your-card.jpg')">
```

Replace the placeholder images with your own hand-illustrated tarot cards!
