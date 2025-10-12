# Bilder in The Wedding Tarot einbinden

Diese Anleitung zeigt dir, wie du eigene Illustrationen für die Tarot-Karten hinzufügen kannst.

## 🎨 Bildanforderungen

### Format
- **Unterstützte Formate**: PNG, JPG, SVG
- **Empfohlene Auflösung**: 300x500 Pixel (Seitenverhältnis 2.5:3.85)
- **Dateigröße**: Unter 500KB für optimale Ladezeiten

### Design-Tipps
- Verwende vertikale Layouts (Hochformat)
- Halte wichtige Elemente im mittleren Bereich
- Berücksichtige, dass Text über dem Bild angezeigt wird
- Helle bis mittlere Hintergründe funktionieren am besten

## 📁 Ordnerstruktur

```
tarotwedding/
├── index.html
└── images/
    ├── README.md
    └── cards/
        ├── placeholder.svg          # Standard-Platzhalter
        ├── example-die-liebe.svg    # Beispiel: Die Liebe
        ├── example-erste-treffen.svg # Beispiel: Das erste Treffen
        └── [deine-karten].jpg       # Deine eigenen Bilder
```

## 🖼️ Bilder hinzufügen

### Schritt 1: Bilder vorbereiten
1. Erstelle oder bearbeite deine Kartenillustrationen
2. Benenne sie sinnvoll (z.B. `die-liebe.jpg`, `das-budget.png`)
3. Platziere sie im Ordner `images/cards/`

### Schritt 2: HTML aktualisieren
Öffne `index.html` und finde die Karte, die du bearbeiten möchtest. Füge das `style`-Attribut zur `card-back`-Div hinzu:

**Vorher:**
```html
<div class="card-back">
    <div class="card-number">XIV</div>
    <div class="card-name">Die Liebe</div>
</div>
```

**Nachher:**
```html
<div class="card-back" style="background-image: url('images/cards/die-liebe.jpg')">
    <div class="card-number">XIV</div>
    <div class="card-name">Die Liebe</div>
</div>
```

### Schritt 3: Testen
1. Öffne `index.html` im Browser
2. Klicke auf die Karte, um sie umzudrehen
3. Überprüfe, ob das Bild korrekt angezeigt wird

## 🎯 Beispiele

### Mit SVG (empfohlen für Vektorgrafiken)
```html
<div class="card-back" style="background-image: url('images/cards/planner-vision.svg')">
```

### Mit PNG/JPG
```html
<div class="card-back" style="background-image: url('images/cards/hochzeitstraum.jpg')">
```

### Mit externem Link
```html
<div class="card-back" style="background-image: url('https://deine-domain.de/bilder/karte.png')">
```

## 🔧 Erweiterte Anpassungen

### Bildposition anpassen
Falls das Bild nicht optimal positioniert ist:
```html
<div class="card-back" style="background-image: url('images/cards/karte.jpg'); background-position: top center;">
```

### Bild-Skalierung ändern
```html
<div class="card-back" style="background-image: url('images/cards/karte.jpg'); background-size: contain;">
```

### Hintergrundfarbe als Fallback
```html
<div class="card-back" style="background: linear-gradient(135deg, #e8d5c4 0%, #dcc9b8 100%), url('images/cards/karte.jpg'); background-size: cover;">
```

## ✨ Best Practices

1. **Dateinamen**: Verwende aussagekräftige Namen ohne Leerzeichen (z.B. `das-erste-treffen.jpg`)
2. **Konsistenz**: Halte alle Bilder im gleichen Format und Stil
3. **Optimierung**: Komprimiere Bilder vor dem Hochladen
4. **Backup**: Sichere deine Original-Illustrationen
5. **Testen**: Teste die Darstellung auf verschiedenen Bildschirmgrößen

## 🚀 Alle Karten auf einmal bearbeiten

Falls du viele Karten bearbeiten möchtest, kannst du auch mit JavaScript arbeiten:

```javascript
// Füge dies am Ende von index.html ein
const cardImages = {
    'The Planner\'s Vision': 'planner-vision.jpg',
    'Das erste Treffen': 'erste-treffen.jpg',
    'Die Liebe': 'die-liebe.jpg',
    // ... weitere Karten
};

document.querySelectorAll('.card-wrapper').forEach(card => {
    const cardName = card.querySelector('.card-name').textContent;
    const cardBack = card.querySelector('.card-back');
    if (cardImages[cardName]) {
        cardBack.style.backgroundImage = `url('images/cards/${cardImages[cardName]}')`;
    }
});
```

## 💡 Tipps für Illustratoren

- Die Beispielbilder (`example-*.svg`) zeigen verschiedene Ansätze
- Der Platzhalter (`placeholder.svg`) zeigt die Grundstruktur
- Nutze Farbverläufe für visuelle Tiefe
- Halte Symbole und Text lesbar
- Teste auf hellen und dunklen Bildschirmen

## 🆘 Problembehebung

**Bild wird nicht angezeigt?**
- Prüfe den Dateipfad (Groß-/Kleinschreibung beachten!)
- Stelle sicher, dass die Datei im richtigen Ordner liegt
- Öffne die Entwicklertools im Browser (F12) und prüfe auf Fehler

**Bild ist verzerrt?**
- Verwende das richtige Seitenverhältnis (2.5:3.85)
- Nutze `background-size: cover` für automatische Anpassung

**Text ist nicht lesbar?**
- Wähle hellere Hintergrundfarben
- Füge einen Schatten zum Text hinzu (wird bereits automatisch gemacht)

---

Viel Spaß beim Gestalten deiner eigenen Wedding Tarot Karten! 🎴✨
