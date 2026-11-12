---
name: mindblown-core-loop-and-first-minute
description: Use when building the first playable version of a game, or when a game "works but nobody gets it". Makes every action pay off at once, and gets a new player acting within 5 seconds without tutorial text.
---

# Core loop and the first minute

## The core loop
The **core loop** is the cycle a player repeats: act, see the result, get a reward, act again. If one step is missing, the game feels like nothing happens.

- **Feedback in the same frame as the action.** Every tap, hop or shot gets a visible answer at the moment it lands, like a flash, a pop or a number floating up, and a sound that starts on the same input. (Mobile browsers play no sound before the first tap.)
- **Reward that grows the next action.** Points, combo, a bigger jump, a coin. The player should see why the next try will go better.
- **No dead time.** Between one action and the next there's always something to look at or decide.

## The first 60 seconds
New players owe your game nothing. They skip any box of text, then leave.
- **Teach by layout, not text.** Make the first try impossible to fail, the second one introduce one new thing, and the third one the real game. In Lantern Hop the first lantern is wide and still, the second is wide and slow, and only the third is a normal lantern.
- **The first action within 5 seconds.** No title screen that needs reading, and no menu before play. A single "Tap to start" is the most you need.
- **Show the goal with the screen.** The score sits where the eye already is, and the danger looks dangerous.
- **The first view shows the whole starting area,** not the main building up close. A village builder first opened on its hut up close. After the fix, a new player sees the hut, the plot and the field at once.
- **In a game with many systems, one short line says what to do next** through the first stage, for example "Next: tap BUILD and build a Storage Hut". In the village builder it stays for the whole first age, about a day of play.
- **One new thing at a time.** Each new rule gets its own moment, and the player meets it before it can kill them.

## Measure it
Add these entries to the game's single `measure()` call (only the first call on a page counts, at most 5 entries in all, see `mindblown-platform-notes`):
```js
const mb = window.mindblown;
const loadedAt = performance.now();
// in the one measure() list:
//   { name: "first_action", kind: "value", label: "Seconds to first action" },
//   { name: "reached_row_3", kind: "step", label: "Got past the start" },
function onFirstAction() {
  mb?.event?.("first_action", { value: Math.round((performance.now() - loadedAt) / 100) / 10 });
}
```

## Check
- [ ] Every action has visual feedback in the same frame and a sound on the same input (sound follows `mb.sound`).
- [ ] A new player acts within 5 seconds, with no text to read.
- [ ] The first try can't fail, and the first real failure comes after the player has learned the action.
- [ ] Each new rule appears on its own, before it can end a run.
- [ ] The first view shows the whole starting area, and a game with many systems says what to do next.
- [ ] Run start and end are sent (`mb.run.start()`, `mb.run.end()`).

## Learn more
Mindblown Academy, course 1, Game Design for AI Builders: lessons 2–3 (The core loop; The first 60 seconds). Case game: Lantern Hop v2, v3 and v3b.
