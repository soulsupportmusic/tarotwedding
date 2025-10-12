# Adding Images to The Wedding Tarot

This guide shows you how to add your own illustrations to the tarot cards.

## 🎨 Image Requirements

### Format
- **Supported formats**: PNG, JPG, SVG
- **Recommended resolution**: 300x500 pixels (aspect ratio 2.5:3.85)
- **File size**: Under 500KB for optimal loading times

### Design Tips
- Use vertical layouts (portrait orientation)
- Keep important elements in the center area
- Remember that text will be displayed over the image
- Light to medium backgrounds work best

## 📁 Directory Structure

```
tarotwedding/
├── index.html
└── images/
    ├── README.md
    └── cards/
        ├── placeholder.svg          # Default placeholder
        ├── example-die-liebe.svg    # Example: Love card
        ├── example-erste-treffen.svg # Example: First meeting
        └── [your-cards].jpg         # Your own images
```

## 🖼️ Adding Images

### Step 1: Prepare Images
1. Create or edit your card illustrations
2. Name them meaningfully (e.g., `love.jpg`, `budget.png`)
3. Place them in the `images/cards/` folder

### Step 2: Update HTML
Open `index.html` and find the card you want to edit. Add the `style` attribute to the `card-back` div:

**Before:**
```html
<div class="card-back">
    <div class="card-number">XIV</div>
    <div class="card-name">Die Liebe</div>
</div>
```

**After:**
```html
<div class="card-back" style="background-image: url('images/cards/love.jpg')">
    <div class="card-number">XIV</div>
    <div class="card-name">Die Liebe</div>
</div>
```

### Step 3: Test
1. Open `index.html` in your browser
2. Click on the card to flip it
3. Check if the image displays correctly

## 🎯 Examples

### With SVG (recommended for vector graphics)
```html
<div class="card-back" style="background-image: url('images/cards/planner-vision.svg')">
```

### With PNG/JPG
```html
<div class="card-back" style="background-image: url('images/cards/wedding-dream.jpg')">
```

### With External URL
```html
<div class="card-back" style="background-image: url('https://your-domain.com/images/card.png')">
```

## 🔧 Advanced Customizations

### Adjust Image Position
If the image isn't optimally positioned:
```html
<div class="card-back" style="background-image: url('images/cards/card.jpg'); background-position: top center;">
```

### Change Image Scaling
```html
<div class="card-back" style="background-image: url('images/cards/card.jpg'); background-size: contain;">
```

### Background Color as Fallback
```html
<div class="card-back" style="background: linear-gradient(135deg, #e8d5c4 0%, #dcc9b8 100%), url('images/cards/card.jpg'); background-size: cover;">
```

## ✨ Best Practices

1. **File names**: Use descriptive names without spaces (e.g., `first-meeting.jpg`)
2. **Consistency**: Keep all images in the same format and style
3. **Optimization**: Compress images before uploading
4. **Backup**: Save your original illustrations
5. **Testing**: Test display on different screen sizes

## 🚀 Batch Edit All Cards

If you want to edit many cards at once, you can use JavaScript:

```javascript
// Add this at the end of index.html
const cardImages = {
    'The Planner\'s Vision': 'planner-vision.jpg',
    'Das erste Treffen': 'first-meeting.jpg',
    'Die Liebe': 'love.jpg',
    // ... more cards
};

document.querySelectorAll('.card-wrapper').forEach(card => {
    const cardName = card.querySelector('.card-name').textContent;
    const cardBack = card.querySelector('.card-back');
    if (cardImages[cardName]) {
        cardBack.style.backgroundImage = `url('images/cards/${cardImages[cardName]}')`;
    }
});
```

## 💡 Tips for Illustrators

- The example images (`example-*.svg`) show different approaches
- The placeholder (`placeholder.svg`) shows the basic structure
- Use gradients for visual depth
- Keep symbols and text readable
- Test on both light and dark screens

## 🆘 Troubleshooting

**Image not showing?**
- Check the file path (case-sensitive!)
- Make sure the file is in the correct folder
- Open browser developer tools (F12) and check for errors

**Image is distorted?**
- Use the correct aspect ratio (2.5:3.85)
- Use `background-size: cover` for automatic adjustment

**Text is not readable?**
- Choose lighter background colors
- Add a shadow to the text (already done automatically)

---

Have fun creating your own Wedding Tarot cards! 🎴✨
