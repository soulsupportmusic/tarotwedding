# The Wedding Tarot 🎴✨

Eine einzigartige Tarot-Kartensammlung für die Hochzeitsplanung – Reflexion statt Wahrsagung.

## 📖 Über das Projekt

The Wedding Tarot ist ein inspirierendes Kartenset, das die emotionale Reise der Hochzeitsplanung einfängt. Jede Karte repräsentiert einen wichtigen Moment oder ein Gefühl auf diesem Weg – von der ersten Vision bis zum großen Tag selbst.

## ✨ Features

- 🎨 **Bildintegration**: Füge eigene handillustrierte Karten hinzu
- 🔄 **Card Flip Animation**: Interaktive Karten mit Flip-Effekt
- 📱 **Responsive Design**: Optimiert für alle Bildschirmgrößen
- 🌐 **Deutsche Website**: Vollständig auf Deutsch gestaltet
- 📚 **Umfassende Dokumentation**: Anleitungen in Deutsch und Englisch

## 🚀 Schnellstart

1. **Repository klonen**
   ```bash
   git clone https://github.com/soulsupportmusic/tarotwedding.git
   cd tarotwedding
   ```

2. **Website öffnen**
   - Einfach `index.html` im Browser öffnen
   - Oder mit einem lokalen Server:
     ```bash
     python3 -m http.server 8080
     ```
     Dann öffne `http://localhost:8080`

3. **Eigene Bilder hinzufügen**
   - Siehe [BILDER_ANLEITUNG.md](BILDER_ANLEITUNG.md) für eine detaillierte Anleitung
   - Siehe [IMAGE_GUIDE.md](IMAGE_GUIDE.md) für die englische Version

## 📁 Projektstruktur

```
tarotwedding/
├── index.html                    # Hauptwebsite
├── BILDER_ANLEITUNG.md          # Deutsche Anleitung für Bildintegration
├── IMAGE_GUIDE.md               # Englische Anleitung für Bildintegration
├── images/
│   ├── README.md                # Kurzanleitung für Bilder
│   └── cards/
│       ├── placeholder.svg      # Standard-Platzhalter
│       ├── example-die-liebe.svg        # Beispiel: Die Liebe
│       └── example-erste-treffen.svg    # Beispiel: Das erste Treffen
└── wedding_tarot_site-6.html    # Alternative Version
```

## 🎨 Bilder hinzufügen

### Einfache Methode

1. Platziere deine Bilder im `images/cards/` Ordner
2. Öffne `index.html` und finde die gewünschte Karte
3. Füge das `style`-Attribut hinzu:
   ```html
   <div class="card-back" style="background-image: url('images/cards/dein-bild.jpg')">
   ```

### Bildanforderungen

- **Format**: PNG, JPG oder SVG
- **Größe**: 300x500 Pixel empfohlen (Seitenverhältnis 2.5:3.85)
- **Dateigröße**: Unter 500KB für optimale Performance

## 📚 Dokumentation

- **[BILDER_ANLEITUNG.md](BILDER_ANLEITUNG.md)** - Vollständige Anleitung auf Deutsch
- **[IMAGE_GUIDE.md](IMAGE_GUIDE.md)** - Complete guide in English
- **[images/README.md](images/README.md)** - Quick reference

## 🎯 Beispiele

Das Projekt enthält drei Beispielbilder:

1. **placeholder.svg** - Einfacher Platzhalter mit Text
2. **example-die-liebe.svg** - Beispiel mit Symbol und rosa Farbschema
3. **example-erste-treffen.svg** - Beispiel mit Doppelsymbol und blauem Farbschema

## 🛠️ Technologien

- HTML5
- CSS3 (mit Flexbox und Grid)
- Vanilla JavaScript
- SVG für Beispielbilder
- Google Fonts (Cormorant Garamond, Lora)

## 💡 Verwendung

Die Website ist perfekt für:

- **Hochzeitspaare**: Zur Reflexion über die Planung
- **Wedding Planner**: Als kreatives Tool für Workshops
- **Gäste**: Zum besseren Verständnis der Hochzeitsreise
- **Illustratoren**: Als Vorlage für eigene Tarot-Karten

## 🤝 Beitragen

Möchtest du das Projekt verbessern? Pull Requests sind willkommen!

1. Forke das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit deine Änderungen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Öffne einen Pull Request

## 📝 Lizenz

Dieses Projekt steht unter der MIT-Lizenz - siehe LICENSE für Details.

## 🙏 Danksagungen

- Inspiriert vom HR Tarot
- Design im Stil klassischer Tarot-Karten
- Mit Liebe für alle Hochzeitspaare gestaltet

## 📧 Kontakt

Hast du Fragen oder Feedback? Öffne ein Issue auf GitHub!

---

**Made with ❤️ for wedding couples everywhere** 🎊
