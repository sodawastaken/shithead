# Shithead Card Game

A fully playable browser-based implementation of the card game **Shithead**, built as a single self-contained HTML file. No server, no build step — just open `game/shithead(2).html` in a browser.

Also available as a native **iOS app** via Capacitor.

## How to play

Be the first player to empty your hand, face-up cards, and blind cards. The last player holding cards is the **Shithead**.

**Card phases (in order):**
1. Hand cards — draw back up to 3 while the deck lasts
2. Face-up cards — visible to all players
3. Blind cards — flipped unknown; if unplayable you pick up the pile

**Core rule:** Play a card equal to or higher than the top of the discard pile. Can't play? Pick up the whole pile.

## Special cards

| Card | Effect |
|---|---|
| **2** | Wild reset — can be played on anything |
| **3** | Skip — skips the next player's turn (stack multiples to skip further) |
| **7** | Lower — next player must play 7 or lower |
| **8** | Transparent — inherits the constraint of the card beneath it |
| **9** | Reverse — flips the direction of play |
| **10** | Wild burn — burns the entire pile; same player goes again |
| **4 of a kind** | Auto-burn — four of the same rank on top burns the pile |

All special card ranks are reconfigurable in Settings.

## Features

- **3–6 players** — you vs. AI bots
- **Tactical AI** — bots prioritise low cards, pressure near-winning opponents, and use skip/burn cards strategically
- **Sound FX** — synthesized audio for every game event (card play, flip, pickup, burn, quad, skip, reverse, deal, win, lose) via the Web Audio API — no audio files required. Toggle on/off in Settings.
- **Emote system** — react with emoji and quick-chat; bots emote back situationally (taunts, celebrations, reactions to burns and skips)
- **Round history** — live turn-by-turn log and full session history across rounds
- **Two visual themes** — *The Green Room* (Cinzel serif, dark speakeasy aesthetic) and *Classic* (original felt-green design), switchable in Settings
- **Card scale slider** and fan/row hand display modes
- **Landscape mode** — layout adapts for landscape phones
- **Guide, History, and Profile pages** accessible from the main menu

## iOS app

The game is ported to iOS using [Capacitor](https://capacitorjs.com/). The `www/` folder contains a patched build of the game with iOS-specific fixes applied automatically by `scripts/sync-www.js`.

**iOS patches applied:**
- `viewport-fit=cover` + safe area insets (notch / home bar)
- `100svh` game board height (avoids browser chrome)
- Local font bundling (offline support — no CDN)
- Touch responsiveness (`-webkit-tap-highlight-color`, `touch-action`)
- Landscape-aware card scaling

**To sync and build:**
```bash
npm run sync      # patches shithead(2).html → www/index.html, then npx cap sync ios
npx cap open ios  # open in Xcode
```

## Project structure

```
shithead/
├── game/
│   └── shithead(2).html    ← active development file
├── scripts/
│   ├── sync-www.js         ← applies iOS patches, writes www/index.html
│   └── gen-icon.js         ← generates assets/icon.png via sharp
├── www/                    ← patched iOS build (do not edit directly)
├── ios/                    ← Capacitor iOS project
├── assets/                 ← app icon + splash screen source files
└── capacitor.config.json
```
