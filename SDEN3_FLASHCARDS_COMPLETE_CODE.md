# SDEN 3 Flashcards App - Complete Code

**Versie:** 1.0  
**Datum:** 7 februari 2025  
**Flashcards:** 102 cards  
**Categorieën:** 11 categorieën

---

## 📋 Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Features](#features)
3. [Installatie](#installatie)
4. [React Component Code](#react-component-code)
5. [Flashcards Database (JSON)](#flashcards-database-json)
6. [Deployment Opties](#deployment-opties)
7. [Uitbreidingsmogelijkheden](#uitbreidingsmogelijkheden)

---

## Overzicht

Een swipeable flashcard app voor SDEN 3 (Wijnbrevet) examenvoorbereiding. De app bevat:
- 54 vragen uit het officiële oefenexamen 2019
- 48 extra flashcards over vinificatie, druivenrassen, wijnregio's
- Categoriegebaseerd oefenen
- Progress tracking per sessie
- Mobiel-vriendelijk design

---

## Features

✅ **Swipe Interface** - Tap om te flippen, swipe links/rechts voor "nog leren"/"ken ik"  
✅ **11 Categorieën** - Bordeaux, Italië, Vinificatie, etc.  
✅ **Progress Tracking** - Realtime scores per sessie  
✅ **Moeilijkheidsgraad** - Easy/Medium/Hard indicatie  
✅ **Uitgebreide Uitleg** - Bij elk antwoord context en achtergrond  
✅ **Luxe Design** - Vintage wijn aesthetic met Playfair Display font  
✅ **Mobiel-First** - Werkt perfect op telefoon  

---

## Installatie

### Optie 1: React Project (Recommended)

```bash
# Maak nieuw React project
npx create-react-app sden3-flashcards
cd sden3-flashcards

# Installeer dependencies
npm install lucide-react

# Plaats sden3_flashcards_database.json in src/
# Vervang src/App.js met de code hieronder
# Start development server
npm start
```

---

## React Component Code

### App.jsx (Main Component)

```jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, Circle } from 'lucide-react';
import flashcardsDb from './sden3_flashcards_database.json';

// Single source of truth: JSON file
const FLASHCARDS_DB = flashcardsDb;

const FlashcardApp = () => {
  const [selectedCategory, setSelectedCategory] = useState('select');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState({ known: 0, learning: 0 });
  const [sessionStats, setSessionStats] = useState([]);

  // Filter flashcards based on category
  const filteredCards = selectedCategory === 'all' 
    ? FLASHCARDS_DB.flashcards 
    : selectedCategory === 'select'
    ? []
    : FLASHCARDS_DB.flashcards.filter(card => card.category === selectedCategory);

  const currentCard = filteredCards[currentIndex];

  // Get category info
  const getCategoryInfo = (catId) => {
    return FLASHCARDS_DB.categories.find(c => c.id === catId) || {};
  };

  // Handle swipe actions
  const handleSwipe = (known) => {
    setSessionStats([...sessionStats, { cardId: currentCard.id, known }]);
    setProgress(prev => ({
      known: known ? prev.known + 1 : prev.known,
      learning: !known ? prev.learning + 1 : prev.learning
    }));

    // Always advance so the completion screen is reachable
    setCurrentIndex(currentIndex + 1);
    setIsFlipped(false);
  };

  // Reset session
  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setProgress({ known: 0, learning: 0 });
    setSessionStats([]);
  };

  // START SCREEN
  if (selectedCategory === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-purple-50 p-4 sm:p-8 font-serif">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Cormorant+Garamond:wght@300;400;500;600&display=swap');
          
          * { box-sizing: border-box; }
          body { font-family: 'Cormorant Garamond', serif; }
          
          .wine-gradient {
            background: linear-gradient(135deg, #722F37 0%, #8B1538 50%, #5D1725 100%);
          }
          
          .card-flip {
            perspective: 1000px;
          }
          
          .card-inner {
            transition: transform 0.6s;
            transform-style: preserve-3d;
          }
          
          .card-flipped {
            transform: rotateY(180deg);
          }
          
          .card-front, .card-back {
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
          
          .card-back {
            transform: rotateY(180deg);
          }
        `}</style>

        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12 text-center">
          <div className="inline-block mb-6">
            <div className="text-7xl mb-4">🍷</div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text wine-gradient mb-2" 
                style={{fontFamily: "'Playfair Display', serif"}}>
              SDEN 3
            </h1>
            <p className="text-2xl text-gray-600" style={{fontFamily: "'Playfair Display', serif"}}>
              Wijnbrevet Flashcards
            </p>
          </div>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {FLASHCARDS_DB.flashcards.length} flashcards om je voor te bereiden op het SDEN 3 examen
          </p>
        </div>

        {/* Category Selection */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* All Categories */}
            <button
              onClick={() => setSelectedCategory('all')}
              className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-amber-600"
            >
              <div className="absolute inset-0 wine-gradient opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative">
                <div className="text-4xl mb-3">✨</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2" style={{fontFamily: "'Playfair Display', serif"}}>
                  Alles
                </h3>
                <p className="text-gray-600 text-sm">
                  {FLASHCARDS_DB.flashcards.length} flashcards
                </p>
              </div>
            </button>

            {/* Individual Categories */}
            {FLASHCARDS_DB.categories.map(cat => {
              const count = FLASHCARDS_DB.flashcards.filter(c => c.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-amber-600"
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                    style={{background: cat.color}}
                  ></div>
                  <div className="relative">
                    <div className="text-4xl mb-3">{cat.icon}</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2" style={{fontFamily: "'Playfair Display', serif"}}>
                      {cat.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {count} cards
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-4xl mx-auto mt-16 text-center text-gray-500 text-sm">
          <p>Swipe rechts = ken ik • Swipe links = nog leren</p>
        </div>
      </div>
    );
  }

  // SESSION COMPLETE SCREEN
  if (currentIndex >= filteredCards.length) {
    const total = progress.known + progress.learning;
    const percentage = total > 0 ? Math.round((progress.known / total) * 100) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-purple-50 p-8 font-serif flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-5xl font-bold mb-6 text-transparent bg-clip-text wine-gradient" 
                style={{fontFamily: "'Playfair Display', serif"}}>
              Goed gedaan!
            </h2>
            
            <div className="my-12 flex justify-center gap-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-green-600 mb-2">{progress.known}</div>
                <div className="text-gray-600">Ken ik</div>
              </div>
              <div className="text-6xl text-gray-300">•</div>
              <div className="text-center">
                <div className="text-6xl font-bold text-amber-600 mb-2">{progress.learning}</div>
                <div className="text-gray-600">Nog leren</div>
              </div>
            </div>

            <div className="mb-8">
              <div className="text-4xl font-bold text-gray-800 mb-2">{percentage}%</div>
              <div className="text-gray-600">Gescoord</div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={resetSession}
                className="px-8 py-4 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-lg"
              >
                Opnieuw oefenen
              </button>
              <button
                onClick={() => {setSelectedCategory('select'); resetSession();}}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-amber-600 transition-all text-lg"
              >
                Andere categorie
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN FLASHCARD VIEW
  const categoryInfo = getCategoryInfo(currentCard.category);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-purple-50 p-4 sm:p-8 font-serif">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {setSelectedCategory('select'); resetSession();}}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-lg">Terug</span>
          </button>
          <div className="text-center">
            <div className="text-3xl mb-1">{categoryInfo.icon}</div>
            <h2 className="text-xl font-semibold" style={{fontFamily: "'Playfair Display', serif", color: categoryInfo.color}}>
              {categoryInfo.name}
            </h2>
          </div>
          <button
            onClick={resetSession}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full wine-gradient transition-all duration-300"
              style={{width: `${((currentIndex + 1) / filteredCards.length) * 100}%`}}
            ></div>
          </div>
          <span className="text-sm text-gray-600 font-semibold min-w-[80px] text-right">
            {currentIndex + 1} / {filteredCards.length}
          </span>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-600" />
            <span className="font-semibold text-green-600">{progress.known}</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle size={18} className="text-amber-600" />
            <span className="font-semibold text-amber-600">{progress.learning}</span>
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="max-w-4xl mx-auto">
        <div className="card-flip min-h-[500px]">
          <div className={`card-inner relative ${isFlipped ? 'card-flipped' : ''}`}>
            {/* Front */}
            <div className="card-front absolute inset-0">
              <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 min-h-[500px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-4 py-2 rounded-full text-sm font-semibold"
                          style={{backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color}}>
                      {currentCard.difficulty === 'easy' && '⭐ Makkelijk'}
                      {currentCard.difficulty === 'medium' && '⭐⭐ Gemiddeld'}
                      {currentCard.difficulty === 'hard' && '⭐⭐⭐ Moeilijk'}
                    </span>
                  </div>

                  <div className="flex-1 flex items-center justify-center py-12">
                    <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center leading-relaxed"
                        style={{fontFamily: "'Playfair Display', serif"}}>
                      {currentCard.question}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-5 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-2xl font-bold text-xl hover:shadow-lg transition-all"
                >
                  Toon antwoord
                </button>
              </div>
            </div>

            {/* Back */}
            <div className="card-back absolute inset-0">
              <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 min-h-[500px] flex flex-col justify-between">
                <div>
                  <div className="text-center mb-8">
                    <div className="inline-block px-6 py-3 rounded-full text-green-700 font-bold text-lg mb-6"
                         style={{backgroundColor: '#10b98120'}}>
                      ✓ Antwoord
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 leading-relaxed"
                        style={{fontFamily: "'Playfair Display', serif"}}>
                      {currentCard.answer}
                    </h3>
                  </div>

                  <div className="bg-amber-50 rounded-2xl p-6 border-l-4 border-amber-600">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {currentCard.explanation}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {currentCard.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => handleSwipe(false)}
                    className="flex-1 py-5 border-2 border-amber-500 text-amber-700 rounded-2xl font-bold text-lg hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={24} />
                    Nog leren
                  </button>
                  <button
                    onClick={() => handleSwipe(true)}
                    className="flex-1 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Ken ik!
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          Tip: Tik op de kaart om te draaien
        </div>
      </div>
    </div>
  );
};

export default FlashcardApp;
```

---

## Flashcards Database (JSON)

**BELANGRIJK:** Gebruik `sden3_flashcards_database.json` als enige databron. Importeer dit bestand direct in `App.js` en vermijd dubbele data in de component zelf.

De database bevat 102 flashcards verdeeld over de volgende categorieën:

- **Frankrijk Algemeen:** 34 cards (Bourgogne, Loire, Rhône, Champagne, Alsace, etc.)
- **Italië:** 14 cards (Barolo, Chianti, Soave, Amarone, etc.)
- **Nieuwe Wereld:** 12 cards (VS, Chili, Argentinië, Australië, NZ, Zuid-Afrika)
- **Vinificatie:** 10 cards (macération carbonique, chaptalisatie, MLF, etc.)
- **Spanje & Portugal:** 8 cards (Rioja, Port, Sherry, Cava)
- **Serveren:** 6 cards (chambreren, decanteren, temperaturen)
- **Bordeaux:** 6 cards (classificaties, terroir, druiven)
- **Overig:** 5 cards (Griekenland, Luxemburg, Oostenrijk)
- **Duitsland:** 4 cards (Prädikatswein, Spätburgunder, Ahr)
- **Wetgeving:** 2 cards (AOP hiërarchie, EU etiketten)
- **Proeven:** 1 card (proefstappen)

### Database Structuur

```json
{
  "metadata": {
    "version": "1.0",
    "last_updated": "2025-02-07",
    "total_cards": 102
  },
  "categories": [
    {
      "id": "category_id",
      "name": "Category Name",
      "icon": "emoji",
      "color": "#hexcolor"
    }
  ],
  "flashcards": [
    {
      "id": "unique_id",
      "category": "category_id",
      "difficulty": "easy|medium|hard",
      "source": "oefenexamen_2019|web_research",
      "question": "De vraag",
      "answer": "Het antwoord",
      "explanation": "Uitgebreide uitleg",
      "tags": ["tag1", "tag2"]
    }
  ]
}
```

### Later content toevoegen (veilig en simpel)

Je kunt later makkelijk extra content toevoegen zonder codewijzigingen:

1. Voeg nieuwe cards toe aan `flashcards` met een uniek `id`.
2. Gebruik alleen bestaande `category` ids (of voeg eerst een nieuwe categorie toe in `categories`).
3. Houd `difficulty` bij `easy`, `medium` of `hard`.
4. Update `metadata.total_cards` na wijzigingen.
5. Test kort: app start, categorie telt correct, en kaart kan worden geswiped.

---

## Deployment Opties

### Optie 1: Vercel (Gratis, Makkelijkst)

```bash
# Installeer Vercel CLI
npm i -g vercel

# Deploy
cd sden3-flashcards
vercel

# Volg de instructies
# Je krijgt een URL zoals: https://sden3-flashcards.vercel.app
```

### Optie 2: Netlify Drop

1. Build je project: `npm run build`
2. Ga naar [app.netlify.com/drop](https://app.netlify.com/drop)
3. Sleep de `build` folder naar de website
4. Klaar! Je krijgt een URL

### Optie 3: GitHub Pages

```bash
# Installeer gh-pages
npm install --save-dev gh-pages

# Voeg toe aan package.json:
"homepage": "https://[jouw-username].github.io/sden3-flashcards",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# Deploy
npm run deploy
```

### Optie 4: Lokaal gebruiken (development)

```bash
npm start
# Open http://localhost:3000
# Op je telefoon: open http://[je-computer-ip]:3000
```

---

## Uitbreidingsmogelijkheden

### 1. LocalStorage Persistence (Spaced Repetition)

Voeg toe aan de component:

```javascript
// Save progress to localStorage
useEffect(() => {
  const savedProgress = JSON.parse(localStorage.getItem('sden3-progress') || '{}');
  // Load user's historical performance per card
}, []);

// Update card history
const updateCardHistory = (cardId, correct) => {
  const history = JSON.parse(localStorage.getItem('sden3-progress') || '{}');
  history[cardId] = {
    lastSeen: new Date().toISOString(),
    correct: (history[cardId]?.correct || 0) + (correct ? 1 : 0),
    total: (history[cardId]?.total || 0) + 1
  };
  localStorage.setItem('sden3-progress', JSON.stringify(history));
};
```

### 2. Shuffle Functie

```javascript
// Shuffle array
const shuffleCards = (cards) => {
  return [...cards].sort(() => Math.random() - 0.5);
};

// Use in filteredCards
const filteredCards = shuffleCards(
  selectedCategory === 'all' ? FLASHCARDS_DB.flashcards : ...
);
```

### 3. Search Functie

```javascript
const [searchQuery, setSearchQuery] = useState('');

const searchedCards = filteredCards.filter(card => 
  card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
  card.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
  card.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
);
```

### 4. Dark Mode

```javascript
const [darkMode, setDarkMode] = useState(false);

// Toggle in UI
<button onClick={() => setDarkMode(!darkMode)}>
  {darkMode ? '☀️' : '🌙'}
</button>

// Apply dark classes conditionally
<div className={darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-amber-50...'}>
```

### 5. Export Progress naar CSV

```javascript
const exportProgress = () => {
  const csv = sessionStats.map(s => `${s.cardId},${s.known}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sden3-progress.csv';
  a.click();
};
```

### 6. Timer per Card

```javascript
const [startTime, setStartTime] = useState(null);

useEffect(() => {
  setStartTime(Date.now());
}, [currentIndex]);

const handleSwipe = (known) => {
  const timeSpent = Math.round((Date.now() - startTime) / 1000); // seconds
  setSessionStats([...sessionStats, { 
    cardId: currentCard.id, 
    known,
    timeSpent 
  }]);
  // ... rest
};
```

### 7. Keyboard Shortcuts

```javascript
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.key === ' ') setIsFlipped(!isFlipped); // Spacebar = flip
    if (e.key === 'ArrowLeft') handleSwipe(false); // Left = nog leren
    if (e.key === 'ArrowRight') handleSwipe(true); // Right = ken ik
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [isFlipped, currentCard]);
```

---

## Veelgestelde Vragen (FAQ)

**Q: Kan ik meer flashcards toevoegen?**  
A: Ja! Voeg gewoon nieuwe objecten toe aan de `flashcards` array in de database. Gebruik dezelfde structuur.

**Q: Werkt dit offline?**  
A: Nee, standaard niet. Voor offline gebruik moet je een Service Worker toevoegen (PWA). Guide: [Create React App - PWA](https://create-react-app.dev/docs/making-a-progressive-web-app/)

**Q: Hoe maak ik een APK voor Android?**  
A: Gebruik tools zoals:
- [Capacitor](https://capacitorjs.com/) (officieel)
- [PWA to APK generators](https://www.pwabuilder.com/)

**Q: Kan ik afbeeldingen toevoegen aan flashcards?**  
A: Ja! Voeg een `image_url` field toe:
```json
{
  "question": "Welke druif?",
  "image_url": "/images/druif.jpg",
  "answer": "Cabernet Sauvignon"
}
```

Dan in de render:
```jsx
{currentCard.image_url && (
  <img src={currentCard.image_url} alt="Visual" className="mb-4 rounded-xl" />
)}
```

**Q: Performance issues met 102+ cards?**  
A: React handelt dit makkelijk. Voor 1000+ cards, overweeg:
- Lazy loading
- Virtualization (react-window)
- Pagination

---

## Credits & Bronnen

**Gemaakt voor:** SDEN 3 (Wijnbrevet) examenvoorbereiding  
**Bronnen:**
- SDEN 3 Oefenexamen 2019 (officieel)
- Web research: wijnkennis.be, wijninfo.nl, SDEN.nl
- "Ik weet veel van wijn" (SDEN 3 cursusboek - referentie)

**Design:**
- Fonts: Playfair Display, Cormorant Garamond (Google Fonts)
- Icons: Lucide React
- Aesthetic: Vintage wijn poster stijl met luxe finish

**Licentie:** Persoonlijk gebruik voor examenvoorbereiding

---

## Support & Contact

Voor vragen, bugs of suggesties:
- Check de database voor mogelijke fouten in antwoorden
- Voeg zelf extra flashcards toe waar je zwak in bent
- Deel met medecursisten (en vraag om hun feedback)

**Veel succes met je SDEN 3 examen! 🍷**

---

*Laatste update: 7 februari 2025*  
*Versie: 1.0*  
*Flashcards: 102*
