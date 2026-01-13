# 🎯 Test Checklist - Scroll Snap Implementation

## ✅ Test Veloce (5 minuti)

### 1️⃣ **Scroll Behavior** - Smooth Motion
- [ ] Apri `http://localhost:3000`
- [ ] Scorri lentamente verso il basso
- **Expected**: Lo scroll deve essere **fluido**, non scattoso
- **Note**: Osserva se la motion è "cinematic" e dolce

### 2️⃣ **Scroll Snap** - Section Snapping
- [ ] Scrollando velocemente, ogni sezione deve **snappare** al top
- [ ] Prova a fermare lo scroll a metà di una sezione: **impossibile**
- **Expected**: Sempre all'inizio di una sezione, mai nel mezzo
- **Reason**: `scroll-snap-stop: always` previene di stare tra le sezioni

### 3️⃣ **Header Behavior** - Dynamic Show/Hide
- [ ] All'inizio (landing section): header **nascosto** (translateY -100%)
- [ ] Scrollando giù: header rimane nascosto
- [ ] Scrollando su: header **riappare** con transizione smooth
- **Expected**: Transizione fluida in 0.8s (configurable)
- **Smooth check**: Non deve essere "scattoso", deve essere elegante

### 4️⃣ **Landing Grid** - Text & Photo
- [ ] Desktop (>1024px): 2 colonne (testo sinistra, foto destra)
- [ ] Tablet (768-1024px): Spacing ridotto ma ancora 2 colonne
- [ ] Mobile (<768px): Stacked (1 colonna)
- **Expected**: Layout responsive per tutti i viewport

### 5️⃣ **Photo Section** - Fullscreen Image
- [ ] Photo section deve occupare 100% viewport (fullscreen)
- [ ] No scroll extra né "cut-off" images
- **Mobile test**: Su mobile con barre dinamiche, immagine non deve fuoriuscire
- **Reason**: Usiamo `100svh` (Small Viewport Height) non `100vh`

### 6️⃣ **Scroll Padding** - No Content Hidden
- [ ] Clicca su un link che va a un anchor (ad es. se implementato)
- [ ] Il contenuto **non deve essere coperto** dall'header fisso
- **Expected**: Spacing di 80px (--header-height) tra header e contenuto
- **Fail**: Se contenuto è nascosto dietro l'header

### 7️⃣ **Mobile Bounce** - Overscroll Behavior
- [ ] Testa su dispositivo iOS/Android
- [ ] Scrollando al limite (top/bottom), non deve avere "rubberbanding" (bounce elastico)
- **Expected**: Smooth stop senza rimbalzo
- **Reason**: `overscroll-behavior-y: none` disabilita il bounce nativo

### 8️⃣ **Fast Scroll Test** - No Section Skip
- [ ] Con mouse wheel o trackpad, scorri **molto velocemente** dalla landing
- [ ] Ogni sezione deve essere passata (niente skip)
- **Expected**: Il browser forza lo snap anche con fast scroll
- **Reason**: `scroll-snap-stop: always` è obbligatorio

### 9️⃣ **Theme Toggle** - Smooth Transition
- [ ] Clicca tema light/dark nel footer
- [ ] Background/text cambiano smooth
- **Expected**: Transition di 0.3s senza "flash"
- **Reason**: CSS variables per tema supportano transitions

### 🔟 **Performance Check** - 60 FPS
- [ ] Apri DevTools (F12) → Performance
- [ ] Registra uno scroll smooth dalla landing al footer
- [ ] Osserva FPS (dovrebbe essere 60 costante)
- **Expected**: 60 FPS means smooth per l'occhio umano
- **Fail**: <30 FPS = laggy

---

## 🔧 **Debug Checklist** - Se Qualcosa Non Funziona

### ❌ "Scroll snap non funziona (non snappa)"
```css
/* Check: */
.page-container { scroll-snap-type: y mandatory; } /* Must be present */
.landing-section { scroll-snap-align: start; } /* Must be present */
```

### ❌ "Contenuto coperto dall'header"
```css
/* Check: */
html { scroll-padding-top: var(--header-height); } /* Must be 80px */
.page-container { scroll-padding-top: var(--header-height); } /* Fallback */
```

### ❌ "Mobile: contenuto fuori viewport"
```css
/* Change from: */
height: 90vh;  /* WRONG su mobile */
/* Change to: */
height: 90svh; /* RIGHT - Small Viewport Height */
```

### ❌ "Header transition è scattosa"
```css
/* Check easing: */
transition: ... cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.8s;
/* If still rough, increase duration to 1s */
--scroll-snap-duration: 1s;
```

### ❌ "Rubberbanding su iOS nonostante overscroll-behavior"
```css
/* Check if applied to html: */
html { overscroll-behavior-y: none; }
/* Not on body! Must be html root */
```

---

## 📊 **Performance Metrics to Check**

```
Smooth Scroll Duration: 0.8s (±0.2s acceptable)
Header Transition: 0.8s smooth easing
FPS during scroll: 60fps constant (mobile might be 45-60 acceptable)
First Contentful Paint: <2s (unrelated but good to check)
Time to Interactive: <3s
```

---

## 🎬 **Demo Scenario - Full Experience**

1. Open `http://localhost:3000`
2. **Wait 1s** for page load
3. **Scroll down slowly** (observe smooth motion)
4. **Reach photo section** (snap should activate)
5. **Scroll down faster** (snap should still work, no skip)
6. **Reach albums section** (scroll snap should align)
7. **Scroll back up** (header should reappear)
8. **Toggle theme** (should be smooth)
9. **Test on mobile** (responsive grid + svh handling)

**Expected Time**: 2-3 minutes  
**Result**: Cinematica, fluidissima experience senza librerie esterne ✨

---

## 🚀 **Victory Conditions**

✅ Scroll è sempre smooth (0.3s-1s transition time)  
✅ Snap funziona in tutti i browser (Firefox, Chrome, Safari, mobile)  
✅ Niente contenuto coperto dall'header  
✅ Mobile layout responsivo (svh handling)  
✅ Performance costante a 60fps  
✅ Niente librerie esterne (CSS puro!)  

Tutto ciò = **Senior Frontend Engineering** 🎓
