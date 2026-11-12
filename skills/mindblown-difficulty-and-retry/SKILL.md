---
name: mindblown-difficulty-and-retry
description: Use when setting how hard a game gets over a run and what happens when the player loses. Builds a difficulty ramp in waves with rest beats, read from tune.json; deaths that feel fair; a retry under 2 seconds; and measure events that show where players lose.
---

# Difficulty and retry

Fair is when players blame themselves.

## The ramp
A straight climb tires players out. Waves work better: pressure builds, then a **rest beat** gives a few calm seconds before a harder wave.

Write the ramp as a table, then store every cell as its own number in `tune.json`. The file holds single values only (at most 40), so `wave2_spawn` and `wave2_cross` are separate entries.

This is Comet Sweeper's ramp. "Crosses in" is how long a comet takes to cross the screen, and a rest has no spawns.

| Phase | Starts at | Lasts | Spawn every | Crosses in |
|---|---|---|---|---|
| Wave 1 | 0 s | 20 s | 1.2 s | 4.0 s |
| Rest | 20 s | 6 s | – | – |
| Wave 2 | 26 s | 25 s | 0.9 s | 3.2 s |
| Rest | 51 s | 6 s | – | – |
| Wave 3 | 57 s | 30 s | 0.7 s | 2.6 s |
| Rest | 87 s | 6 s | – | – |
| Wave 4 | 93 s | until the end | 0.5 s, 0.05 s less every 10 s, never below 0.3 s | 2.0 s |

## Fair failure
- **Warn before a threat arrives.** For example, a marker at the edge 0.6 s before something enters.
- **Hitboxes a little smaller than the art,** around 80%. Players never complain about a near miss.
- **Show what ended the run.** Freeze for about 0.4 s with the cause highlighted.
- **Reward near misses** with a flash and a small bonus.

## Retry under 2 seconds
Count from the hit to playing again. No menu, no loading screen and no "Are you sure?". Show time or score, the best, and the gap to the best ("3 seconds short"). Then the game's own action (its **verb**: tap, drag, hop) starts the next run.

## See where players lose
Add these entries to the game's single `measure()` call (only the first call counts, at most 5 entries in all, see `mindblown-platform-notes`):
```js
const mb = window.mindblown;
// in the one measure() list:
//   { name: "death_time", kind: "value", label: "Median death time (s)" },
//   { name: "reached_wave_2", kind: "step", label: "Reached wave 2" },
//   { name: "reached_wave_3", kind: "step", label: "Reached wave 3" },
function onWaveStart(wave) { if (wave >= 2) mb?.event?.(`reached_wave_${wave}`); }
function onLoss(seconds, wave) {
  mb?.event?.("death_time", { value: seconds });
  mb?.run?.end({ seconds, wave });
}
```
If the median death lands just after a wave starts, that wave's first step is too steep. Change one number at a time in the Tune panel and play again. The kind of a measure is pinned the first time its name is declared, so choose `value` or `step` carefully.

## Check
- [ ] The ramp is a table of waves and rests, and every cell is a named number in `tune.json`.
- [ ] Every threat is announced before it can hit.
- [ ] After every loss the player can see what ended the run.
- [ ] Loss to playing again takes under 2 seconds, with no menu in between.
- [ ] `measure` shows where runs end.

## Learn more
Mindblown Academy, course 1, Game Design for AI Builders: lesson 6, Difficulty and pacing. Case game: Comet Sweeper v1.
