---
name: mindblown-game-brief
description: Use when a person asks for a new game, especially in one line ("make a tower defense game about a hedgehog"). Before writing any code, turn the request into a one-page concept, a list of decisions with answers, and a build order that starts with a small playable slice.
---

# Game brief

Every decision a request leaves open still gets made, by whoever builds the game. "Tower defense" alone covers games as different as Plants vs. Zombies (lanes on a grid), Kingdom Rush (fixed build spots on a road) and Bloons TD 6 (towers almost anywhere off the track). Find the open decisions before the first line of code, while they cost nothing.

## 1. List the decisions
Write down every decision the game needs, in four groups.
- **How it works:** the one input (tap, drag, swipe, hold), what the player controls, what ends a run, how you win and lose.
- **Numbers:** sizes, speeds, counts, costs, timers, how long a run lasts.
- **What the player sees:** screen orientation, what's on screen at the start, how score and lives show.
- **Unusual cases:** not enough money, two things at once, the edge of the screen, a menu open while the game runs.

## 2. Ask, then assume
Ask the person the three to five answers that change the game the most. Orientation, the core action and how a run ends are usually among them. Answer the rest yourself and write each answer down as an assumption the person can change. Don't leave an answer as "whatever looks good".

## 3. The one-page concept
| Line | What it says |
|---|---|
| One line | What the player does and why it's fun, in one sentence |
| Player | Device, orientation, one thumb or two, session length |
| Core loop | The cycle the player repeats, as 3–4 steps with arrows |
| Lose / win | What ends a run, both ways |
| Not in this game | Two or three things you won't add, like a story, a map screen or real money |

Keep a first game small. One verb, one screen or one lane, and a run under three minutes. Small games get finished.

## 4. The build order
Plan four to six steps, each small enough to explain in a minute.
1. **A vertical slice.** It's thin but complete, with one of everything the core loop needs working end to end. The player can win and lose it.
2. Then one step per feature, each landing on a game that already works.

## 5. The first build
Turn the concept and the slice into the build: every number from step 1, written as numbers. Sizes go in as shares of the screen's shorter side ("12% of the shorter side"), so the game looks the same on every phone and in either orientation. Put the numbers a person would tune in `tune.json`, up to its 40 entries, and send run start and end (both in `mindblown-platform-notes`).

## Check before you build
- [ ] Every decision has an answer, with a number where one fits.
- [ ] The person answered the three to five that matter most.
- [ ] The concept fits on one screen, with "Not in this game" filled in.
- [ ] Step 1 of the build order is a slice you can win and lose.

## Learn more
Mindblown Academy, course 2, From Spec to Game: lessons 1–2 (Why prompts fail; Concept to build order). Course 1, Game Design for AI Builders: lesson 1 (Think like a designer). Case game: Burrow Guard, where two games came from the same one-line request and a third from a written slice.
