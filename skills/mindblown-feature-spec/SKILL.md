---
name: mindblown-feature-spec
description: Use before adding a feature to a game that already works, whether you build it yourself or ask another builder. Turns a one-line wish into a spec with numbers, states and edge cases, writes acceptance checks before any code, and splits a bigger feature into three packs that are each playable and checked.
---

# Feature spec

Whatever a request leaves open still gets decided by whoever builds it. A spec decides it first, in writing, so you, the person and the build all agree.

## 1. Find the open decisions
For the feature, list what has to be decided: how it works, the numbers, what the player sees, and unusual cases. Ask the person about the answers that change the feature most, and write the rest as assumptions.

## 2. Write the spec in five parts
1. **What it does,** in one or two lines.
2. **Numbers.** Every amount, size, time and price. Sizes are a share of the screen, best of its shorter side, so they hold in either orientation.
3. **States,** and what moves the feature between them (closed, open, affordable, greyed out, maxed).
4. **Edge cases,** one line each. Not enough money. Two at once. The edge of the screen. A menu open while the game keeps running. What the button shows at the top level.
5. **What stays the same.** "Keep everything else as it is." If the feature changes old behavior on purpose, say exactly how.

Every new number goes into `tune.json`.

## 3. Write the checks before any code
An **acceptance check** is one action and one exact result, so anyone running it would agree on whether it passed.
- Good: "With 29 coins, Upgrade on a level 1 tower is grey, and tapping it changes nothing."
- Bad: "The upgrade panel works."

Write one check per number and one per edge case. Five to eight is usual for a small feature. If you can't write the expected result, the spec doesn't say it yet, so fix the spec. Keep all old checks as a **regression list**. When a spec changes old behavior on purpose, rewrite the old check in the same go.

## 4. Ship it in three packs
A **pack** is a piece small enough to check in a few minutes and playable on its own.
1. The smallest version a player can see and use.
2. The rest of the numbers.
3. The edges.

Each pack carries its own checks. Run them and the regression list before the next pack. After pack 1, play it once and update packs 2 and 3 if it showed you something better.

## Example
The exact message that built Burrow Guard v2, a tower defense made for Mindblown Academy:
```
Add a second tower to Burrow Guard: the Thorn Bush. Keep everything else as it is.

What it does: a Thorn Bush doesn't hurt beetles. It slows every beetle inside its range.

Numbers:
- Cost: 30 coins.
- Range: a circle with a radius of 18% of the screen width.
- A beetle inside the range walks at 50% of its normal speed. As soon as it leaves the range, it walks at normal speed again.
- Ranges don't add up: a beetle inside two Thorn Bush ranges still walks at 50%.

Planting, which now changes for both towers:
- Tap an empty spot. A small picker opens above it with two buttons: "Acorn Tosser 40" and "Thorn Bush 30".
- Tap a button to plant that tower and pay for it. Tap anywhere else to close the picker without planting.
- A button you can't afford is greyed out and does nothing.
- The game keeps running while the picker is open.
- Only one picker is open at a time. Tapping another empty spot moves it there.
- If the picker would stick out of the screen, it moves inside.
- Tapping a spot that already has a tower does nothing for now.

Look: a round green bush with short thorns. A beetle inside a Thorn Bush range has a light purple tint, so you can see the slow.

Put the new numbers in tune.json.
```
The build matched it line by line. In the upgrade feature that came next, pack 1 never said what the Upgrade button shows at the top level, and the build kept showing the old price, greyed out. Playing pack 1 caught it, and pack 2 closed the gap with "MAX".

## Check
- [ ] The spec has all five parts, and every amount is a number.
- [ ] Checks were written before the code, one action and one result each.
- [ ] The regression list passes after every pack.
- [ ] The feature matches the spec, or the spec now says what changed.

## Learn more
Mindblown Academy, course 2, From Spec to Game: lessons 3–5 (The build-ready spec; Acceptance checks; Feature packs). Case game: Burrow Guard v2–v5.
