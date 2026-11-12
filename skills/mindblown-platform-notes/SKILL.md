---
name: mindblown-platform-notes
description: Use whenever you write code for a game that will run on Mindblown. The SDK rules a game depends on (run, tune, measure, saves, leaderboards, sound, notices, links), what loads when on a published page, what Mindblown's page around the game covers (its handle, the cookie banner, Up next), the libraries Mindblown hosts, multiplayer and shared-world basics, and testing without polluting the game's numbers. Complements Mindblown's own skill.md, sdk.md and multiplayer.md, which stay the reference.
---

# Mindblown platform notes

Mindblown's own documents are the contract: [skill.md](https://mindblown.ai/skill.md) for signing in and publishing, [sdk.md](https://mindblown.ai/sdk.md) for `window.mindblown`, [multiplayer.md](https://mindblown.ai/multiplayer.md) for playing together. skill.md carries a `version`; sdk.md marks members like `load`, `save`, `measure`, `tune` and `shareUrl` as new, so their shape may still change. Re-read them before relying on a detail. These notes collect what a game needs from them, plus what we learned shipping games there.

Words used across these skills: the **person** is who you build for and who owns the page (Mindblown's docs say "maker"). A **player** is anyone who opens the game.

## Every game
```js
const mb = window.mindblown;   // exists only on Mindblown; may be undefined while you build from a file
mb?.run?.start();              // optional chaining on every call
```
- **Send run start and end** (`mb.run.start()`, `mb.run.end({ seconds, level })`). sdk.md says a publish is refused without them; skill.md calls them optional. Send them either way. Add `pause()` and `resume()` only if the game really pauses, and then both.
- **What exists when.** `run`, `event`, `measure`, `load`/`save`/`remove`, `sound` and `build` work from the page's first line: calls made early wait or queue. `tune`, `leaderboard`, `viewer`, `live`/`room` and `shareUrl` arrive with Mindblown's script, the last thing in the body. Call those from a `<script type="module">` or after `DOMContentLoaded`.
- **Libraries.** Mindblown refuses CDNs and font hosts on a published page, so ship your libraries and font files with the page. Three libraries are hosted and load by URL: three.js r185 (`https://mindblown.ai/lib/three-0.185.1/three.min.js`, sets `window.THREE`), Phaser 3.90.0 (`https://mindblown.ai/lib/phaser-3.90.0/phaser.min.js`) and Spark 2.1.0 (`https://mindblown.ai/lib/spark-2.1.0/spark.module.min.js`).
- **One `<meta name="description">`** in the head: one plain sentence about what the player does.

## `tune.json`: values the person can change without a new build
```json
{
  "beetle_speed": { "value": 24, "min": 5, "max": 60, "step": 1, "label": "Seconds to walk the path" },
  "shake_on":     { "value": true, "label": "Screen shake" },
  "accent":       { "value": "#ff8a5c", "kind": "color" }
}
```
- At most 40 entries, single values only, so a table becomes one entry per cell (`wave2_spawn`, `wave2_speed`). When you have more than 40 numbers, put in the ones a person would tune first: difficulty, speed, prices, effect strengths.
- Names are lowercase, start with a letter and have at most 40 characters. Numbers need `min` and `max` (out-of-range values are clamped). Colors are `#rrggbb`, text is at most 200 characters. An entry that breaks a rule is left out without an error.
- Read `mb.tune()` once at start and follow `mb.tune.on()` to apply changes live. When the page opens without Mindblown, read the file itself (sdk.md shows how).
- **Keep a fallback in code for each value**, used only when `mb.tune()` doesn't return that name. A new name reaches the live page only with a new build.
- The person changes values in the **Tune** panel of the Mindblown studio. Each change makes a new version without a rebuild.

## `measure`: the person's numbers
- **One call per page load, at most 5 entries.** Only the first `measure()` call counts, so gather the entries from every system (first minute, difficulty, progression) into one list.
- Kinds: `count` (how many times), `value` (the median of `props.value`), `step` (how many visits reached it at least once).
- **The kind is pinned the first time a name is declared.** A later declaration with another kind is refused.
```js
mb?.measure?.([
  { name: "first_action", kind: "value", label: "Seconds to first action" },
  { name: "death_time", kind: "value", label: "Median death time (s)" },
  { name: "reached_wave_2", kind: "step", label: "Reached wave 2" },
]);
```

## Saves and boards
- Progress goes in `mb.load` / `mb.save`, never in `localStorage`. Signed-in players get it on every device. Signed-out players get browser storage, which isn't moved to their account when they sign in.
- Load a key before saving it (`LOAD_FIRST`). A save can be refused with `REVISION_CONFLICT` (merge `e.current`, save again), `AUTH_CHANGED` (load again) or `RATE_LIMITED` (at most 60 changes a minute). One load can take up to 8 seconds, so don't start a second one while it's open, and don't hold the first run on it.
- A leaderboard's direction (`lower: true` or not) is pinned by the first submission. Give every board a plain `label`, and link names to `profile_url`. Boards never reset, so a daily board needs a new name per day (use the UTC date). `submit` can reject, so offer a retry.
- Code for both is in `mindblown-progression-and-return`.

## Links
Build every link you hand a person with `mb.shareUrl()`, for example `mb.shareUrl({ seed: 42 })`. A link built from `location.href` opens the game without Mindblown's frame. Query parameters reach the game on its own subdomain address (`https://your-game.mindblown.ai/?seed=42`).

## The page around your game
- **Mindblown shows the game in a frame inside its own page and puts its controls at the edges.** We measured it in November 2026 on a headless Android phone. The handle that opens the page's controls is 52×36 px in the bottom right corner on a phone held upright and on an 844×390 phone in landscape. On a wider landscape screen (932×430) it becomes a strip 24 px wide along the right edge. Keep buttons and labels out of that corner and that edge, with a margin: a free corner of 64×44 px is a good rule for a self-test. A copy of the game running outside Mindblown has no handle, so only a rule like that, or a test on the live link, shows what it covers. In a village builder, the handle lay over the BUILD label. `mindblown-build-review/scripts/phone-sweep.mjs` checks for this.
- **A new visitor first sees Mindblown's cookie banner under the game.** Until they answer it, the game's frame is about 130 px shorter: 258 px tall on an 844×390 phone in landscape, 654 px on a 390×844 phone held upright. Make sure the first screen works at that height, and lay the game out again when the frame grows (on `resize`). In one game, only the top edge of the lobby's "Play alone" button showed above the bottom of the frame until the visitor answered the banner.
- Currently, after about 12 seconds without touches, and soon after the first `run.end`, the page may show an "Up next" panel over the bottom of the game. Keep the retry button and anything else important out of the bottom strip.
- **A game without rounds,** like a village or a sandbox, starts a run when it loads and starts the next run right after each `run.end()`. Otherwise "This run is over" and "Up next" can cover the game. A village builder that does this showed no "Up next" after 22 seconds without touches.
- The clipboard only works in response to a tap inside the game.

## Sound
Read `mb.sound.on` and follow `mb.sound.onchange`. If the game has its own sound button, use `mb.sound.set()` or `mb.sound.toggle()` so the two never disagree. Mobile browsers play no sound before the first tap, so start audio on an input. A game's own Web Audio engine works as it is: Mindblown takes over the audio output (`AudioContext.destination`), and a village builder's hand-written engine needed no changes.

## Notices (`push`)
- Ask with `mb.push.enable()` after a tap, at a moment the player understands, such as after their first raid or a building they started. Never ask as the page opens. It needs a signed-in player.
- On an iPhone, Safari can't show notices. `enable()` is refused with `UNSUPPORTED` until the player adds the page to the Home Screen and opens it from there. So in Safari on an iPhone, show those steps (Share, then Add to Home Screen, then turn notices on from there) instead of a button that fails.
- `DENIED` means the player said no, now or before, and only their browser settings can change it. Say that in plain words rather than showing the error.
- Notices are sent from the shared world with `world.notify` (see sdk.md).

## Multiplayer (see multiplayer.md)
- A room outlives a match. Starting a new round in the same room is normal.
- `leave()` is a control the player presses, never something to call on `pagehide` or unload. After `leave()`, give it a few seconds before `play()` if you want a different room.
- A closed tab can keep its seat for up to about a minute.
- Guests can take public seats and join existing named rooms. Opening a named room needs an account, and invitation-only rooms refuse guests. Mindblown's panel handles sign-in, and the page only draws the refusal.
- **A shared world (`world`)** needs a signed-in player too. Plan what a guest does instead: in a village builder, guests keep a village in their browser and raid only computer-made villages. One act took about 0.4 seconds to answer in our tests, so put a bulk action (plant every field) into one act instead of twelve. `world.sample` found a neighbour to raid even with only two players in the world.
- **If the page shows a fight that the server replays to settle it, test that both give the same result,** including when the player ends the fight early. The first time a raid in the village builder ended early, the screen showed 11% destroyed and the server recorded 16%. A test now replays 40 raids and compares them.

## Testing without polluting the numbers
- Headless browser runs on a live link count as visits, and their failures show up in the game's error list. In automated tests, block `*api.mindblown.ai/events*`, `*google-analytics.com*` and `*googletagmanager.com*`. The game still plays. (`mindblown-build-review/scripts/phone-sweep.mjs` does this.)
- A headless browser can stop animation frames when it thinks its window is hidden. Start Chrome with `--disable-backgrounding-occluded-windows --disable-renderer-backgrounding --disable-background-timer-throttling`.
- A test that writes to `mb.save` under a real account changes that person's progress. Keep a copy of `mb.load(...)` first and restore it afterwards.

## 3D
Heavy three.js scenes can stutter on phones and in Safari. Offer a lighter mode that switches on when the frame rate drops.
