---
name: mindblown-progression-and-return
description: Use when giving players a reason to play again - a goal for this session, a reason to come back tomorrow and one for the week. Covers saved progress with mindblown load/save (with conflict handling), leaderboards, daily boards and unlocks earned through play.
---

# Progression and return

A player keeps playing while there's a next goal in sight. Give the game one goal per **horizon**:
- **Session:** the next run. Beat your best, or finish the run.
- **Day:** a reason to open the game tomorrow, like a daily challenge with a streak.
- **Week:** a reason to still be playing in seven days, like unlocks and a leaderboard.

## Two rules
- **Show the goal and the gap.** "180 to beat your best" on the loss screen gives a reason to retry. "10 runs: 4/10" under a locked item says what to do next.
- **Reach every goal through the core loop.** If a goal needs a screen the player never visits, cut it.

Unlocks come from goals the player reaches, never from a random draw. Mindblown's community guidelines don't allow gambling or simulated gambling, and a lucky draw can't be shown as progress anyway.

## Saved progress
Progress lives in `mb.load` / `mb.save`, never in `localStorage`. Signed-in players get it on every device. Signed-out players get it in this browser only.

Start play at once and apply saved progress when it arrives. One load can take up to 8 seconds, and the first action should come within 5.
```html
<script type="module">
const mb = window.mindblown;
let progress = { schemaVersion: 1, best: 0, runs: 0 };
let loaded = false;

mb?.load?.("progress").then((r) => {
  if (r?.value) progress = r.value;
  loaded = true;
  showBest(progress.best);
}).catch(() => { loaded = true; });   // play on with a fresh start

async function saveProgress() {          // at checkpoints: a run ended, an unlock
  if (!loaded || !mb?.save) return;      // never save before the load answered
  try {
    await mb.save("progress", progress);
  } catch (e) {
    if (e.reason === "REVISION_CONFLICT") {        // changed in another tab or device
      const theirs = e.current?.value ?? e.current ?? {};   // sdk.md: error.current holds the newer value
      progress = { ...theirs, best: Math.max(theirs.best ?? 0, progress.best),
                   runs: Math.max(theirs.runs ?? 0, progress.runs) };
      await mb.save("progress", progress);
    } else if (e.reason === "AUTH_CHANGED" || e.reason === "LOAD_FIRST") {
      const r = await mb.load("progress");        // load again, then merge on the next checkpoint
      if (r?.value) progress = { ...r.value, best: Math.max(r.value.best, progress.best) };
    }                                              // RATE_LIMITED: save again at the next checkpoint
  }
}
</script>
```

## Leaderboards
Each person keeps their best for as long as the page exists, and boards never reset.
```js
const mb = window.mindblown;
async function submitScore(score) {
  if (!mb?.leaderboard) return;
  try {
    await mb.leaderboard.submit("score", score, { label: "Best score" });
  } catch {
    showRetryButton();                       // sdk.md: a failed submit should offer a retry
  }
}
const mine = await mb?.leaderboard?.mine("score");          // the player's own best, for the gap
const top = await mb?.leaderboard?.top("score", { limit: 10 });
```
- The direction is pinned by the first submission. For times, pass `{ lower: true }` from the very first one.
- Link each name to `profile_url`, and show players with no account as "guest".
- **A daily board** needs a new metric name each day, built from the UTC date (`daily_20261109`), so every player shares one board.
- **A daily challenge** that's the same for everyone takes its random seed from the UTC date, so two phones get the same run.

## Test a long progression before anyone plays it
A game that grows over days can't be checked by playing it once. Keep the rules in one module with no page, clock or network in it, and let the page import it. Then three steps catch most problems.
- **Simulate a month of play in Node,** on the same rules file. A simple player acts a few times a day, and the script prints where the village or account stands each day. In a village builder, the simulation found two dead ends before the first build. At the start there was no way to get wood, and the second age needed gold to build the buildings that make gold. It also helped tune the numbers so that the four ages arrive around days 1, 4, 9 and 16.
- **Add a fast clock and an auto-play switch to an admin panel,** so you can watch the same progression on the live game in minutes. In the village builder, an hour per second and Auto-build took a new village from a straw hut to the second age in 45 seconds. Show the admin panel only to the person's account before the game goes public.
- **Reset test saves and test worlds before real players come,** so the first player doesn't meet your test villages.

## Check
- [ ] A progression longer than one session was simulated on the rules file before the build.
- [ ] One goal per horizon, and each one is visible with its gap.
- [ ] Every goal is reached by playing.
- [ ] The game starts at once, and saved progress is applied when the load answers.
- [ ] Saves handle `REVISION_CONFLICT` and `AUTH_CHANGED`.
- [ ] Boards have plain-word labels and the right direction. Daily boards get a new UTC-date name.

## Learn more
Mindblown Academy, course 1, Game Design for AI Builders: lesson 7, Progression. Case games: Comet Sweeper v2, and a village builder made for a Mindblown creator (the month simulation).
