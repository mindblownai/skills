---
name: mindblown-build-review
description: Use after every build of a game, new or changed, before telling the person it's done. A review in four passes (regression checks, one full game as a new guest, phone sizes, the busiest moment), a self-test the game carries inside itself, findings sorted into broken / wrong number / polish, a bug report shape that gets fixed in one go, and when to roll back. Includes a script that screenshots the game at phone sizes, flags text that doesn't fit, buttons and labels that land on each other or under Mindblown's own controls, and runs the game's self-test at every size.
---

# Build review

A feature can pass every check and still make the game worse. Review the whole game after every build.

## Four passes
1. **Run the regression list.** That's every acceptance check from earlier features (see `mindblown-feature-spec`), plus the game's self-test if it has one (below). It's the fastest way to catch old behavior that changed.
2. **Play one whole game as a new guest,** on the live link, signed out, in a private window, from the first screen to a win or a loss without skipping anything. Note where you hesitate. A village builder's own test once put its stand-in world in place at once and never took the signed-out path. New guests saw an empty map for 30 seconds, and only a fresh guest on the live link showed it.
3. **Look at it at phone sizes.** Run the phone sweep (below) and look at every screenshot the way a strict player would: someone who has never seen the game and notices every misplaced pixel.
   - Open each screenshot at full size and zoom into the top and bottom strips. In the village builder, a missing button label was in a whole night of screenshots and nobody saw it at 60% scale.
   - Does every piece of text fit inside its panel, button or screen?
   - Does any popup, panel or picker cover the score, lives or money?
   - Are buttons that do the same thing the same size, shape and style?
   - Is the retry button, or anything else important, in the bottom strip or the bottom right corner? Mindblown's page puts its own controls there (see `mindblown-platform-notes`).
   - Is anything cut off at the edges, in portrait or landscape?
   - Check a late state too, not only the first screen. In the village builder everything fitted at the start, but later four resources showing "23.4k" and a long building name pushed a button off a 390 px screen. The sweep sees the first screen; the self-test can put the game in a late state.
4. **The busiest moment.** Put the most action the game can have on screen at once and watch for stutter. On 3D, check a phone and Safari too.

A review can't tell you whether the game is fun. A mechanic can work exactly as specified and still be dull. For that, two or three people play it while you watch without explaining anything (Mindblown Academy, course 1, lesson 5). Three more things need a person with a real phone: whether something important is easy to notice (the size and contrast of a progress bar), sound, and notices on an iPhone. Tell the person that these steps are theirs.

## A self-test inside the game
A game can carry its own checks and run them when it's opened with `?selftest=1`. Then anyone can run them on the exact build that is live. Mindblown's builder, Mindy, can run them on the build just published and send you the number, and you can run them yourself at every phone size with `phone-sweep.mjs --selftest`.

A self-test has three parts:
1. **The rules,** checked as plain code with no page. This works when the rules live in a module that the page imports.
2. **The page,** played with real events: pointer events on the canvas at an object's screen position, clicks on page elements. It plays in a state of its own and never touches the player's save.
3. **Mindblown:** one read that changes nothing. A signed-out refusal passes if the game handles it.

The result goes to `window.__selftest` and into a box on top of the page. `scripts/selftest-skeleton.js` is a starting point with the two checks below.

Two checks fit almost any game. Run each one in several states: the start, a late state (long numbers, everything unlocked) and a busy one (queues full, storage full, nothing ready).
- **A button that's on works.** The test tries each enabled button's action against the rules on a copy of the state. If the rules would refuse it, the button should have been off. In the village builder, "Make" stayed on while the kitchen queue was full, and a tap only brought a small message at the top. The person found it on a phone, and this check now finds it too.
- **The HUD fits.** Nothing is off the screen, nothing covers anything, each label sits under its own button, and nothing is in Mindblown's handle corner (64×44 px at the bottom right of a phone screen, see `mindblown-platform-notes`). A copy of the game running outside Mindblown has no handle, so the test has to know the corner. The village builder's self-test passed 104 of 104 at all five phone sizes while the phone sweep showed the handle lying over its BUILD label; the corner rule was added after that.

Four rules keep a self-test honest:
- **Wait for a state, never for a fixed time.** A test that waited 3.2 seconds for a cutscene failed now and then, and waiting until the cutscene ended fixed it.
- **A stand-in world or save must not skip a path real players take,** like the signed-out path above.
- **Every bug the test missed gets a check.** Run the new check on the old build where the bug was, and see it fail. In the village builder, the new checks failed 15 of 103 on the older build and caught almost everything the person had found on an iPhone.
- **Don't stop at the builder's number.** Run the self-test on the live link yourself, at phone sizes. A passing self-test proves the logic and the taps work, not that the game is comfortable to play.

## Sort what you found
Each finding goes into exactly one of three piles.
- **Broken:** the game does something the spec says it shouldn't. Fix it with a bug report (below).
- **Wrong number:** the game does what was asked, but the number doesn't work. If it lives in `tune.json`, the person can change it in the studio's Tune panel with no rebuild. Tell them which entry and what value to try.
- **Polish:** would be nicer. Put it in the build order for later.

A real wrong number from Burrow Guard: the spec gave a slowing tower a range of 18% of the screen width, and it placed the tower spots "never touching the path". Both rules were followed, and together they meant the tower reached the path from only 4 of 8 spots. One game on a phone showed it, and one Tune value fixes it.

## A bug report that gets fixed in one go
Five lines, one bug per report, with a screenshot when you have one. Add the build (`mb.build`, its first 8 characters) so everyone knows which version it was.
```
Where: the win panel at the end of wave 3.
Steps: play on a phone in portrait, about 390 px wide, and win.
Saw: "Burrow saved! Hearts left: 10" is wider than the panel; its first and last letters are cut off.
Expected: the whole line fits inside the panel on any phone width (smaller text, or two lines).
How often: every win. Build: 1645e826.
```
Say what you saw and what you expected, and leave out your guess about the cause. After the fix, run the steps again and then the regression list. If the self-test missed the bug, add a check for it.

## When Mindblown's builder published your code
Sometimes you write the game and the person asks Mindy to put it live. Then compare the live files with yours byte for byte after every version. The main address serves Mindblown's page around the game. The game itself is in a frame at `https://your-game.mindblown.ai/v/<build>/`, and its files sit next to it, for example `/v/<build>/game.js`.
- **Bring the builder's edits into your copy,** or your next upload will undo them. In one game the edits were small and were needed to pass publishing: optional chaining on the `run` calls and a meta tag.
- **An edit nobody asked for gets discussed.** In the same game the builder changed a panel's height without being asked. The person and the builder agreed on a different fix, and the builder was told why.

## When to roll back
If a build made things worse in several places, or each fix breaks something new, go back to the last good build and redo the change in smaller packs. Mindblown keeps every build:
- `GET https://api.mindblown.ai/me/games/GAME_ID/versions` lists them;
- `POST https://api.mindblown.ai/me/games/GAME_ID/release` with `{"sha": "<build>"}` puts one back, and leaving `sha` out goes back to the newest.

`GAME_ID` is the publish result's `game_id`, which is a different field from `page_id`. Whoever opens the page gets the build you name, so **ask the person first.** Details are in Mindblown's skill.md ("Putting an older build back").

## The phone sweep script
`scripts/phone-sweep.mjs` opens the game in a fresh headless Chrome as a touch phone at five sizes: 360, 390 and 430 px in portrait, 844×390 and 932×430 in landscape. Each size starts from a clean browser, so it sees what a new guest sees.

A new guest first sees Mindblown's cookie banner, and while it's open the game's frame is about 130 px shorter (258 px tall on an 844×390 phone in landscape). So the sweep checks the game twice. It first checks with the banner open and saves `<size>-cookie-banner.png`. Then it closes the banner with "Reject", checks again and saves `<size>.png`. It lists:
- text cut by its own box or a clipping container, text spilling out of its box, text sticking out of the screen, and a page wider than the screen;
- a button or label hidden under another button or label, and two that overlap at their edges (panels without text don't count, since they cover things on purpose);
- a button that sticks out of the screen;
- a button or label of the game under a control of Mindblown's page around it, such as the handle in the bottom right corner.

It blocks analytics calls, so test runs don't show up as visits or errors in the game's numbers.

The overlap checks came from the village builder. On a phone, its ATTACK label was hidden under the BUILD label: the round buttons lacked `position: relative`, so both labels were placed against the centre of the button group. The person found it on an iPhone. The sweep finds it at every size, and it also found Mindblown's handle lying over the BUILD label, which nobody had noticed. On another game it found the round Play button cut off at the bottom of the screen in landscape.
```bash
node ~/.claude/skills/mindblown-build-review/scripts/phone-sweep.mjs https://your-game.mindblown.ai/ ./review --wait 8
node ~/.claude/skills/mindblown-build-review/scripts/phone-sweep.mjs https://your-game.mindblown.ai/ ./review --selftest
```
- Use the game's own subdomain address, or a `file://` path for a build that isn't published yet. A game that loads modules needs a local web server instead of `file://`.
- With `--selftest` it opens the game with `?selftest=1` at each size instead and waits up to 180 seconds (or the number you give after the flag) for `window.__selftest`. Every failed check is listed.
- It needs Node 22 or newer and Google Chrome or Chromium (set `CHROME` to its path if it isn't found). A layout run takes about a minute with `--wait 8`. A self-test run takes as long as the self-test, five times.
- It exits with 1 when it found problems, 0 when it found none, and 2 when it couldn't run.
- Text and buttons drawn on a canvas can't be measured. Look at the screenshots too.

## Check
- [ ] All four passes done, including a fresh guest on the live link and a late state at phone sizes.
- [ ] The self-test, if the game has one, passed on the live build at every phone size.
- [ ] Every finding is one line, in exactly one pile.
- [ ] Broken things have a five-line report, each fix passed its steps and the regression list, and the self-test has a check for each bug it missed.
- [ ] Wrong numbers are named, with the `tune.json` entry and a value to try.
- [ ] The person heard about anything left broken, and that the fun test, sound and iPhone notices are theirs to check.

## Learn more
Mindblown Academy, course 2, From Spec to Game: lesson 6 (reviewing a build) and lesson 7 (bug reports). Case games: Burrow Guard v5 and v6, and a village builder made for a Mindblown creator.
