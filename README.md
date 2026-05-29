# Shithead Card Game

A fully playable browser-based implementation of the card game **Shithead**, built as a single self-contained HTML file. No server, no build step — just open `shithead(2).html` in a browser.

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
| **3** | Skip — skips the next player's turn |
| **7** | Lower — next player must play 7 or lower |
| **8** | Transparent — inherits the constraint of the card beneath it |
| **9** | Reverse — flips the direction of play |
| **10** | Wild burn — burns the entire pile; same player goes again |
| **4 of a kind** | Auto-burn — four of the same rank on top burns the pile |

All special card ranks are reconfigurable in Settings.

## Features

- **3–6 players** — you vs. AI bots
- **Tactical AI** — bots prioritise low cards, pressure near-winning opponents, and use skip/burn cards strategically
- **Emote system** — react with emoji and quick-chat; bots emote back in appropriate situations
- **Round history** — live turn-by-turn log and full session history
- **Two visual themes** — *The Green Room* (Cinzel serif, dark casino aesthetic) and *Classic* (original felt-green design), switchable in Settings
- **Card scale slider** and fan/row hand display modes
- **Guide, History, and Profile pages** accessible from the main menu
