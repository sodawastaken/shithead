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
