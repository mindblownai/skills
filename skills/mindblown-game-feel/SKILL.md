---
name: mindblown-game-feel
description: Use when a game works but feels flat ("tapping feels like nothing happens"). Adds impact to the core action (shake, freeze, particles, squash and stretch, sound), each effect on its own switch in tune.json so it can be tuned without a new build.
---

# Game feel

Players forget the score and remember the hit. **Juice** is the feedback that makes an action feel physical. Put it on the moment the core action lands, and keep it off everything else.

## The five effects
The starting values below are the ones Lantern Hop v4 used on landing a hop. They're a first guess, so tune them.

| Effect | Starting values | Watch out for |
|---|---|---|
| Screen shake | 6 px for 120 ms, easing out | Shake that hides the next target |
| Freeze (hit stop) | 40 ms on a hit; about 400 ms on a loss | Freezing on every small event |
| Particles | 12 sparks that fade in 0.4 s | Particles that cover what the player has to see |
| Squash and stretch | 70% wide and 130% tall on takeoff, the reverse on landing, back in 0.15 s | Shapes that change the hitbox |
| Sound | A soft pop on takeoff, a chime on landing that goes one note up per combo step | Sound that ignores the visitor's switch |

From a combo of 5 up, Lantern Hop plays shake, sparks and squash at 1.5× strength.

## Rules
- **Every effect gets its own switch and strength in `tune.json`,** so the person can turn each one down without a new build. Five effects use 10 of the 40 entries.
  ```json
  "shake_on": { "value": true, "label": "Screen shake" },
  "shake_px": { "value": 6, "min": 0, "max": 20, "step": 1, "label": "Shake strength (px)" }
  ```
- **Juice never hides the next decision.** If players start missing after you add shake, lower that one effect and keep the rest.
- **Sound follows the player's own sound switch** (`mb.sound`, see `mindblown-platform-notes`).
- **Test with everything off, then turn effects on one by one.** You'll see which one does the work.

## Check
- [ ] The core action has at least three of the five effects.
- [ ] Each effect has a switch and a strength in `tune.json`.
- [ ] With all effects on, the player still sees the next target clearly.
- [ ] Sound follows `mb.sound`.

## Learn more
Mindblown Academy, course 1, Game Design for AI Builders: lesson 4, Game feel. Case game: Lantern Hop v4, where every effect has its own switch in the game.
