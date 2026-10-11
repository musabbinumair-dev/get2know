# Final Results Screen Implementation Plan

Build the final end-of-game results screen for Duo (`/game-final`) when players finish all rounds. The page synthesizes the pastel aesthetic, player blobs, and emoji reaction mechanics of **RevealScreen** with the metrics display, shape badges, and bar chart of **ScoresScreen**.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product behaviors were confirmed during clarification and will be strictly respected:

- **Confirmed Decision 1 (Round-by-Round Chart Scope)**: The bar chart will render columns dynamically matching the completed rounds of the game session (1 to $N$), rather than rendering empty placeholder columns for future rounds.
- **Confirmed Decision 2 (Save to Memory Wall Feedback)**: Tapping "Save to memory wall" writes the session highlight and chosen reaction to the local memory wall collection, flashes a confirmation toast, and stays on the Results page so users can still review stats or rematch.
- **Confirmed Decision 3 (Tied Game Player Sizing)**: In the event of a tied score, both player blobs remain standard equal size with the starburst in the center reading "Tie!" (or "In sync!" in Know Me mode). When there is a clear winner, the winner's blob is slightly enlarged (`scale-105`).
- **Data Integrity Rule**: No synthetic/faked numbers. If a stat (such as per-question millisecond speed) was not tracked during gameplay, that badge is cleanly omitted so every displayed metric is 100% authentic.

---

## 1. Overview & Core Concept

- **What It Does**: Presents a celebratory, definitive summary of a finished Duo session (Trivia or Know Me). Shows who won (or sync degree), the head-to-head score, key game statistics, a round-by-round bar graph, Instagram-style emoji reactions, and direct actions to Rematch, Save to Memory Wall, or return Home.
- **Target Audience**: Two friends completing a daily question session or quick round play on mobile devices.
- **Key Value**: Delivers emotional closure and mutual celebration at the end of a game, seamlessly fitting the established visual language of the app without layout shifting or page scrollbars.

---

## 2. User Experience & Visual Design

### Visual Identity & Theme
- **Background**: Soft pastel pink canvas (`#F5CCE2`), identical to RevealScreen.
- **Typography**: Nunito system (Font weights 900 for headlines and scores, 800/700 for labels and pills).
- **Zero AI-Slop & Anti-Clutter Compliance**: No new gradients, glows, shadows, blur effects, sparkles, pulse dots, or faux telemetry. All assets are existing WebP graphics from `/assets/reveal/` and `/assets/scores/`.

### Layout Anatomy (Top to Bottom)
1. **TopBar**:
   - Left: Dashed circular back button (`w-[38px] h-[38px]` with left chevron).
   - Center: Title `"Results"` (`text-[22px] font-black text-[#17181B]`).
   - Right: Balance spacer (`w-[38px]`).
2. **Game Mode Tag Pill**:
   - Soft yellow capsule (`bg-[#FED982] text-[#1B1D20] font-extrabold text-[13px] sm:text-[14px] px-3.5 py-1 rounded-full`).
   - Format: `"Trivia · {totalRounds} rounds"` or `"Know Me · {totalRounds} rounds"`.
3. **Player Blobs & Winner Starburst**:
   - Left: Player 1 pink blob (`/assets/reveal/card-blob-pink.webp`) with avatar, name, and total score / correct rounds.
   - Right: Player 2 blue blob (`/assets/reveal/card-blob-blue.webp`) with friend avatar, name, and score.
   - Center: Reveal Starburst (`/assets/reveal/match-starburst.webp`) displaying `"You won!"`, `"They won!"`, or `"Tie!"` (Know Me: `"In sync!"`).
4. **Final Score Block**:
   - Styled after the Scores screen sync block:
   - Label: `"Final score"` (Trivia) or `"Sync score"` (Know Me).
   - Large Score: `"80 - 65"` or `"86%"`.
   - Quiet caption: `"Great game, you two"` or `"You matched {matches} of {totalRounds}"`.
5. **Three Stat Shape Blobs**:
   - Reusing Scores screen WebP badges:
     - Starburst (`/assets/scores/stat-starburst-yellow-streak.webp`): Streak count.
     - Teardrop (`/assets/scores/stat-teardrop-blue-matches.webp`): Correct count (`7/10`) or Matches.
     - Olive Cross (`/assets/scores/stat-cross-olive-guess-wins.webp`): Guess wins / Best category.
6. **Round-by-Round Bar Chart**:
   - Reusing Scores "This week" bar component:
   - Header with player color dots (Pink = Me, Blue = Friend).
   - Side-by-side rounded bar pairs for completed rounds ($R_1, R_2, \dots, R_N$).
7. **Emoji Reaction Row**:
   - 6 dashed circle buttons from RevealScreen (Smile, Heart, Laugh, Surprised, Smirk, Cry).
   - Instagram-style floating reaction particles on tap/hold with haptic feedback.
8. **Action Buttons**:
   - Primary: Black pill `"Rematch"` (`h-[48px] sm:h-[52px] bg-[#1B1D20] text-white font-extrabold rounded-full`).
   - Secondary: Black pill with bookmark icon `"Save to memory wall"` (`h-[48px] sm:h-[52px] bg-[#1B1D20] text-white font-extrabold rounded-full`).
   - Tertiary: Underlined text link `"Back to home"` (`text-[14px] font-bold underline text-[#17181B]/70 hover:text-[#17181B]`).
9. **Fixed Corner Decorations**:
   - Positioned in viewport corners (`fixed pointer-events-none select-none z-0`):
     - Top-Right: `heart-pink-small.webp`
     - Top-Left: `crescent-yellow.webp`
     - Bottom-Left: `deco-bottom-left.webp`
     - Bottom-Right: `cross-olive.webp`

### Responsive & Viewport Constraint Budget (Zero Scrolling Guaranteed)
The container uses `h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col justify-between`:
- **Tall Phones ($H/W \ge 1.9$, e.g., 390x844, 412x915, 430x932)**:
  - All 9 elements visible with generous clamp spacing (`gap-2` to `gap-3`).
- **Normal Phones ($1.75 \le H/W < 1.9$, e.g., 375x667)**:
  - All elements visible with tighter clamp spacing; player blobs and chart scaled down to fit within viewport.
- **Short Phones ($H/W < 1.75$ or $H < 700\text{px}$, e.g., 360x640)**:
  - The bar chart (Item 6) is automatically hidden via responsive height queries (`@media (max-height: 700px)` or CSS clamp classes).
  - Stat and player blobs shrink while keeping action buttons at full accessible tap height ($\ge 44\text{px}$).
- **Ultra-Compact Phones**:
  - The emoji reaction row is hidden if viewport height $< 620\text{px}$, guaranteeing zero overflow and zero clipping.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Screen Fixed Viewport vs. Scrollable Page**
  - *Chosen Approach*: Strictly bounded 100dvh flex column with progressive element pruning (hide chart on short screens).
  - *Why*: The brief explicitly commands "The page must fit one screen on short, normal and tall phones... Never scroll, never overlap, never cut anything off."
  - *Alternative Considered*: Scrollable page with `overflow-y-auto`. Rejected per prompt constraint.
- **Decision 2: Authentic Real-Game Data vs. Mock Fallbacks**
  - *Chosen Approach*: Pull all data directly from `useGameSession()` and `useSession()`. If user navigates directly to `/game-final` without an active session, compute statistics gracefully from session history or saved cards, omitting any unrecorded stats.
  - *Why*: Strictly adheres to "All numbers come from the game that was just played. If a stat is not tracked, hide that stat instead of faking it."

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FinalResultScreen (/game-final)                 │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ TopBar (Back Button, Title "Results")                        │     │
│   └──────────────────────────────────────────────────────────────┘     │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ Mode Tag Pill ("Trivia · 10 rounds" / "Know Me · 10 rounds") │     │
│   └──────────────────────────────────────────────────────────────┘     │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ Player Blobs (Pink vs Blue) + Center Starburst Badge         │     │
│   └──────────────────────────────────────────────────────────────┘     │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ Final Score / Sync Score Card                                │     │
│   └──────────────────────────────────────────────────────────────┘     │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ 3 Stat Badges (Streak / Matches / Wins)                      │     │
│   └──────────────────────────────────────────────────────────────┘     │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ Round-by-Round Bar Chart (Auto-hidden on short viewports)   │     │
│   └──────────────────────────────────────────────────────────────┘     │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ Emoji Reaction Row + Floating Particle Canvas                │     │
│   └──────────────────────────────────────────────────────────────┘     │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ Actions: Rematch Pill | Save Memory Wall Pill | Back to Home │     │
│   └──────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

### State & Handler Mapping
- **Game Session Hooks**:
  - `myScore`, `friendScore`, `totalRounds`, `matchesCount`, `history`, `mode`: Fed directly into blobs, score block, badges, and chart.
  - `restartGame()`: Triggered on Rematch. Restarts game with identical settings and navigates to the first round.
  - `exitGame()`: Triggered on "Back to home" or TopBar back button. Cleans up active game and routes to `/home`.
- **Memory Wall Integration**:
  - `handleSaveToMemoryWall`: Builds memory card record with game score, sync score, and chosen emoji reaction, prepends to `localStorage.getItem('game_memory_cards')`, and triggers confirmation toast.
- **Emoji & Haptics**:
  - Reuses `triggerHaptic('medium')`, `triggerHaptic('success')`, and the existing particle animation CSS keyframes from `index.css`.

---

## 5. Viewport Verification Matrix

| Viewport Resolution | Aspect Ratio ($H/W$) | Classification | Layout Behavior |
| :--- | :--- | :--- | :--- |
| **360 x 640** | 1.78 (< 700px H) | Short Screen | Chart hidden, compact blobs, buttons full height, zero scroll |
| **375 x 667** | 1.78 (< 700px H) | Short Screen | Chart hidden, compact blobs, buttons full height, zero scroll |
| **390 x 844** | 2.16 (> 1.9) | Tall Screen | All items visible, standard spacing, zero scroll |
| **412 x 915** | 2.22 (> 1.9) | Tall Screen | All items visible, roomy spacing, zero scroll |
| **430 x 932** | 2.17 (> 1.9) | Tall Screen | All items visible, roomy spacing, zero scroll |

---

## 6. Execution Steps (Post-Approval)

1. Rewrite `src/screens/FinalResultScreen.tsx` with the unified, responsive layout and components.
2. Verify route and props in `src/App.tsx`.
3. Run `compile_applet` and `lint_applet` to ensure error-free compilation.
4. Test and verify all 5 mobile viewport configurations.
