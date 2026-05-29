# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Three self-contained single-file HTML card games. No build system, no dependencies, no server — open directly in a browser. All CSS, HTML, and JS live inside one file per version.

| File | Purpose |
|---|---|
| `shithead(1).html` | Original working reference. Do not edit unless explicitly asked. |
| `shithead(2).html` | **Active development file.** Full feature set, "Green Room" aesthetic. |
| `shithead-pro.html` | Stitch-design port (separate experiment, less maintained). |

To run: `open "shithead(2).html"` or drag into any browser.

---

## shithead(2).html — architecture

### Screens and navigation

The app is a single-page multi-screen layout. Screens are toggled via `.hidden` class:

- `#start-screen` — main menu (Cinzel / dark speakeasy aesthetic)
- `#game-board` — play area
- `#page-guide`, `#page-history`, `#page-profile` — full-screen page overlays that slide up; navigated via `showPage(name)` / `hidePage(name)`
- `#history-panel` — in-game history slide-in (independent of page overlays)
- `#settings-panel` — modal overlay
- `#go-screen` — game over modal
- `#emote-panel` — emote/quick-chat popup (positioned by JS above `#human-area`)

### Game state

```
G = {
  ps: Player[],    // index 0 = human "You", 1..n = bots
  deck: Card[],
  pile: Card[],
  dir: 1 | -1,     // clockwise / counter-clockwise
  cur: number,     // index into ps of current player
  phase: 'swap' | 'play' | 'gameover',
  b7: boolean,     // true when lower-card (default 7) was last played
  eff: Card|null,  // effective top of pile (ignores transparent/8 cards)
  fo: number[],    // finish order (player ids)
  log: string,
  dc: number,      // deck count (1 for ≤4 players, 2 for 5-6)
}

Card = { id: string, r: number, s: 's'|'h'|'d'|'c', up: boolean }
// Ranks: 2–14 (J=11, Q=12, K=13, A=14)

Player = { id, name, human, hand:Card[], fu:Card[], bl:Card[], out, pos }
```

`SESSION.rounds` accumulates completed rounds; `currentRoundEvents` tracks the in-progress round and is flushed into `SESSION.rounds` on `endGame()`.

### Card legality

`canPlay(card, G)` is the single source of truth:
- Wilds (`isWild(r)`) always playable — default wilds are reset(2), transparent(8), burn10(10)
- Empty pile: any card
- `b7` mode: must play ≤ lower-card rank (default 7)
- Otherwise: must play ≥ `G.eff.r`

`updEff(G)` recalculates `G.eff` by scanning from pile top, skipping transparent cards.

### Special card effects (`CFG.fx`)

All effects are rank-configurable in Settings. The defaults are:

| Effect key | Default rank | Behaviour |
|---|---|---|
| `reset` | 2 | Wild; clears pile constraint |
| `skip` | 3 | Wild-playable; skips N players (N = cards played) |
| `lower` | 7 | Next player must play ≤ this rank |
| `transparent` | 8 | Wild; pile constraint passes through to card below |
| `reverse` | 9 | Flips `G.dir`; multiple 9s cancel |
| `burn10` | 10 | Wild; burns pile, same player goes again |

Four-of-a-kind on top of pile also triggers a burn. `check4(G)` detects this.

### Rendering pipeline

`renderAll()` calls three functions:
1. `renderCenter()` — pile, deck, direction arrow, turn strip, log text
2. `renderAI()` — bot player areas (top/left/right slots depending on count)
3. `renderHuman()` — player's three table stacks + hand, button visibility

Card DOM is rebuilt from scratch each render via `mkCard(card, opts)`. Never mutate existing card elements — always call `renderAll()` or the appropriate sub-renderer.

Bot positions: 1–3 bots go in `#ai-top`; with 4+ bots, the last two go in `#ai-left` / `#ai-right` and the rest in `#ai-top`. Mini cards (`opts.mini=true`) used for side bots.

### AI logic (`aiPick`)

Decision tree in priority order:
1. **Skip** — play skip card unless the player 2 steps ahead has ≤1 card (would hand them the win)
2. **High-card pressure** — if next player has ≤3 cards, play highest available regular card
3. **Default** — play lowest regular (non-special) card
4. **Fallback specials** (only when no regular cards) — burn large pile, skip weak opponent
5. **Last resort** — sort by `aiPriority()` and play lowest

`aiPriority(r)` returns `r` for regular cards (lower = played sooner) and 70–99 for special-effect cards, ensuring regular cards are always shed first.

### Sort hand

`sortHand()` sorts player's hand: non-wilds ascending by rank, then wilds (2/8/10 — `isWild()`) at the end. This mirrors the "can always play" status of wilds.

### Theme system

`data-theme="classic"` on `<html>` activates the Classic theme via a CSS cascade block at the bottom of `<style>`. The attribute is set/cleared by `applyTheme(theme)` and persisted to `localStorage` under key `shithead-theme`.

Classic theme restores: Segoe UI fonts, blue card backs (`#2c5aa0→#1a3a70`), flat buttons, original glass panel backgrounds, original border radii.

New theme (default): Cinzel/Cinzel Decorative fonts, dark-forest card backs with gold border, 3D squishy buttons, sharp 3px radii.

### Emote system

`spawnEmoteBubble(content, isText, fromName, fromBot)` creates a fixed-position floating bubble that animates upward (human) or downward (bot).

`botSituationEmote(bot, situation, chance)` is called throughout `runAI()`, `humanPickup()`, and `endGame()` with situation keys: `pickup`, `burn`, `quad`, `skip`, `reverse`, `finish`, `taunt_pickup`, `human_shithead`, `bot_shithead`. Each key maps to emote + chat pools in `EMOTE_SITUATIONS`.

---

## Key constraints to respect

- **Never modify `shithead(1).html`** directly; it's the preserved original. Duplicate to a new file first.
- `G.eff` must always be recalculated via `updEff(G)` after any pile mutation.
- The `position:absolute;inset:0` on `.cface,.cback` (shared rule) must not be overridden with `position:relative` in `.cback` — this was a bug that collapsed card backs. CSS cascade order matters here.
- `#specials-toggle` and `#specials-body` must exist in the DOM (they're in a hidden stub) because the boot script attaches listeners to them unconditionally.
- All special card ranks go through `getRankFX(key)` — never hardcode rank numbers like `2`, `10`, etc. in logic code.

---

## iOS Port Task (Capacitor)

## Project goal

Port `shithead(2).html` — a fully functional single-file HTML card game — to a native iOS app using Capacitor. The game logic must not change. Only infrastructure, config, and iOS-specific CSS/JS tweaks are needed.

---

## Source file

| File | Role |
|---|---|
| `shithead(2).html` | The game. Do not rewrite logic. Patch in-place where needed. |

The game is ~3000 lines, single-file HTML/CSS/JS. No build system, no framework, no server. It uses `localStorage` for persistence, Google Fonts via CDN, and `100vw/100vh` CSS layouts.

---

## Target stack

- **Capacitor 6** (latest stable)
- **iOS deployment target:** 15.0+
- **Node:** 18+
- Xcode required for final build (user has a Mac)

---

## Step-by-step task list

Work through these in order. Commit after each step.

### Step 1 — Scaffold the Capacitor project

```bash
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init "Shithead" "com.yourname.shithead" --web-dir www
npx cap add ios
```

Create `www/` directory and copy `shithead(2).html` into it as `www/index.html`.

### Step 2 — Write `capacitor.config.json`

```json
{
  "appId": "com.yourname.shithead",
  "appName": "Shithead",
  "webDir": "www",
  "server": {
    "allowNavigation": []
  },
  "ios": {
    "contentInset": "always"
  }
}
```

### Step 3 — Patch `www/index.html` for iOS

Apply these changes to the copied `index.html`. Do NOT touch the original `shithead(2).html`.

#### 3a — Add safe area CSS variables to `:root`

In the `:root` block, add:

```css
--sat: env(safe-area-inset-top);
--sab: env(safe-area-inset-bottom);
--sal: env(safe-area-inset-left);
--sar: env(safe-area-inset-right);
```

#### 3b — Patch viewport meta tag

Replace:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
With:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

#### 3c — Patch `#human-area` bottom padding

The bottom player area must clear the iPhone home bar. Find `#human-area` in the CSS and add:

```css
padding-bottom: calc(8px + env(safe-area-inset-bottom));
```

#### 3d — Patch `#game-board` height

Replace `height:100vh` on `#game-board` with:

```css
height: 100svh; /* small viewport height — avoids iOS browser chrome */
```

#### 3e — Bundle Google Fonts (offline support)

The game loads Cinzel from Google Fonts CDN. This fails with no network. Do one of:
- **Option A (quick):** Download the two font files (`Cinzel` and `Cinzel Decorative` in woff2), place in `www/fonts/`, and replace the `<link>` tag with a `<style>@font-face{...}</style>` block pointing to local paths.
- **Option B (fallback only):** Add `serif` as fallback in all `font-family` declarations so the game is still usable offline. Only do this if Option A proves complex.

#### 3f — Improve touch responsiveness

Find any `click` event listeners on card elements (look for `addEventListener('click'` on card-related code). Where cards or buttons are tapped repeatedly, add:

```css
* { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
```

Add this to the global `*` rule at the top of the CSS.

### Step 4 — iOS project config

In `ios/App/App/Info.plist`, ensure these keys are set:
- `UIRequiresFullScreen` → `true` (prevents slide-over / split view)
- `UISupportedInterfaceOrientations` → portrait only (`UIInterfaceOrientationPortrait`) unless the game supports landscape

### Step 5 — App icon and splash screen

Install the assets plugin:
```bash
npm install @capacitor/assets --save-dev
```

Place a 1024×1024 `icon.png` and a `splash.png` (2732×2732) in `assets/`. Then run:
```bash
npx capacitor-assets generate --ios
```

If the user doesn't have assets yet, create a simple placeholder using a dark green (`#1a4a2e`) background with gold (`#f0c040`) text "SH" centred — matching the game's felt aesthetic.

### Step 6 — Sync and open in Xcode

```bash
npx cap sync ios
npx cap open ios
```

In Xcode:
- Set the development team under Signing & Capabilities
- Set deployment target to iOS 15.0
- Build to a simulator first (`Cmd+R`)
- Then build to a physical device

---

## Key constraints

- **Never modify `shithead(2).html`** (the original). Always patch `www/index.html` (the copy).
- `G.eff` must always be recalculated via `updEff(G)` after any pile mutation — don't touch game logic.
- Do not change any card rendering, AI logic, or game state management.
- `getRankFX(key)` must remain the single source of truth for special card ranks — never hardcode rank numbers.
- `#specials-toggle` and `#specials-body` must remain in the DOM.

---

## Game architecture (quick reference)

- **Screens:** toggled via `.hidden` class — `#start-screen`, `#game-board`, `#go-screen`, page overlays
- **State object:** `G` — see original CLAUDE.md for full schema
- **Rendering:** `renderAll()` → `renderCenter()` + `renderAI()` + `renderHuman()` — always call `renderAll()`, never mutate DOM directly
- **Special effects:** all configurable via `CFG.fx`, accessed through `getRankFX(key)`
- **Theme:** `data-theme="classic"` on `<html>`, persisted to `localStorage` under `shithead-theme`
- **Persistence:** `localStorage` — works natively in Capacitor WebView, no changes needed

---

## Expected file structure when done

```
project/
├── www/
│   ├── index.html          ← patched copy of shithead(2).html
│   └── fonts/              ← (if Option A chosen for fonts)
│       ├── cinzel.woff2
│       └── cinzel-decorative.woff2
├── ios/                    ← generated by Capacitor
├── assets/
│   ├── icon.png
│   └── splash.png
├── capacitor.config.json
├── package.json
└── CLAUDE.md               ← this file
```

---

## Done when

- [ ] Game loads in iOS Simulator without errors
- [ ] No content hidden behind notch or home bar
- [ ] Cards are tappable without lag
- [ ] Game works fully offline (fonts load without network)
- [ ] App builds to a physical device in Xcode
