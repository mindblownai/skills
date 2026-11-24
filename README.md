# Mindblown game skills

Skills for coding agents that make games and publish them on [Mindblown](https://mindblown.ai): Claude Code, Codex, Cursor and anything else that reads a `SKILL.md`. People can read them too.

Mindblown's own skill, [mindblown.ai/skill.md](https://mindblown.ai/skill.md), covers signing in, publishing, pictures and rollback, and by design it doesn't judge the content. These skills add the game-design side: how to plan a game, what makes it feel good, how to change it without breaking it, and how to check a build before a person sees it. They come from the two courses of Mindblown Academy, from case games built step by step for those courses, and from what we learned shipping games on Mindblown.

> Version 0.3, November 2026. Built by the Mindblown Academy team. Version 0.3 adds what we learned testing a village builder on real phones: a self-test the game carries inside itself, overlap checks in the phone sweep, phone rules for game UI, and facts about Mindblown's page around the game.

## Why
A one-line request leaves most decisions to whoever builds the game, and the result is a game that runs. What players notice first is usually small: text that doesn't fit, a button in the wrong place, a rule that breaks in a corner case, a first minute that teaches nothing. Most of those details can be written down before the build and checked after it. That's what these skills do.

What they can't do is decide whether the game is fun. That takes people playing it, and the skills say so where it matters.

## Words
- **Person:** who you build the game for. They own the page (Mindblown's docs call them the maker).
- **Player:** anyone who opens the game.
- **Build:** one published version of the game.

## The skills
| Skill | Use it when |
|---|---|
| [`mindblown-game-brief`](skills/mindblown-game-brief/SKILL.md) | a person asks for a new game, often in one line |
| [`mindblown-core-loop-and-first-minute`](skills/mindblown-core-loop-and-first-minute/SKILL.md) | building the first playable version |
| [`mindblown-game-feel`](skills/mindblown-game-feel/SKILL.md) | the game works but feels flat |
| [`mindblown-difficulty-and-retry`](skills/mindblown-difficulty-and-retry/SKILL.md) | setting how hard the game gets, and what happens when the player loses |
| [`mindblown-progression-and-return`](skills/mindblown-progression-and-return/SKILL.md) | giving players a reason to come back |
| [`mindblown-feature-spec`](skills/mindblown-feature-spec/SKILL.md) | adding a feature to a game that already works |
| [`mindblown-build-review`](skills/mindblown-build-review/SKILL.md) | after every build, before telling the person it's done |
| [`mindblown-art-style-rules`](skills/mindblown-art-style-rules/SKILL.md) | the game needs a look, or new art must match the old |
| [`mindblown-store-page`](skills/mindblown-store-page/SKILL.md) | the first publish, or changing the title, description or pictures |
| [`mindblown-platform-notes`](skills/mindblown-platform-notes/SKILL.md) | any time you write code that runs on Mindblown |

## How they fit together
**A new game:** `game-brief`, then `core-loop-and-first-minute` for the first build. Then `game-feel`, `difficulty-and-retry`, `progression-and-return` and `store-page`.

**A change to an existing game:** `feature-spec` before writing code.

**After every build, new game or change:** `build-review`.

**Always:** `platform-notes` while writing code, and `art-style-rules` whenever you draw.

## Install
- **Claude Code:** copy the folders from `skills/` into `~/.claude/skills/` (for all projects) or `.claude/skills/` (for one project).
- **Other agents:** point the agent at the `SKILL.md` files, or paste the one you need into its instructions.
- Keep Mindblown's own [skill.md](https://mindblown.ai/skill.md) alongside. These skills point to it for signing in and publishing rather than repeat it.
- `build-review` has two scripts: `phone-sweep.mjs`, which needs Node 22+ and Chrome or Chromium, and `selftest-skeleton.js`, which you copy into a game.

## License
MIT, see [LICENSE](LICENSE). You can use, change and share these skills, in your own projects and in commercial ones.

## Learn it with playable examples
Every skill names the Mindblown Academy lesson that explains it, with a game you can play and the exact prompt that built each step.
- Course 1, **Game Design for AI Builders**: one-line idea, core loop, the first minute, feel, playtesting, difficulty, progression, store page.
- Course 2, **From Spec to Game**: decisions before the build, a one-page concept and build order, specs, checks, feature packs, reviews, bug reports, style rules.

## Questions people ask

### What are Mindblown game skills?
They are ten short instruction files for AI coding agents that build browser games. Each file covers one part of the work: planning a game, the first minute of play, game feel, difficulty, progression, specs for new features, reviewing a build, art style, the store page, and the Mindblown platform. An agent reads the skill that fits the task and follows it, the same way a new team member would follow a team's checklist.

### Can an AI coding agent make a good game?
An agent can turn a one-line request into a game that runs. The gap between that and a good game is mostly small decisions and details: what the player does in the first five seconds, how hard the third wave is, whether the text fits on a phone. These skills make the agent settle those decisions before it writes code and check them after every build. Whether the game is fun still takes people playing it, and the skills say so.

### How do I make a game with Claude Code and publish it on Mindblown?
Put these skills and Mindblown's own [skill.md](https://mindblown.ai/skill.md) where Claude Code can read them (see Install above), then ask for a game in one line. With the skills, the agent first writes a one-page concept and a list of open decisions, then builds a small playable version, reviews it at phone sizes, and publishes it through Mindblown's API as skill.md describes. After that, each change starts with a short spec and ends with a review.

### Which agents can use them?
Any agent that reads `SKILL.md` files can use them, including Claude Code, Codex and Cursor. For an agent without skill support, paste the skill you need into its instructions. People can read them as plain guides too.

### How are they different from Mindblown's skill.md?
Mindblown's skill.md teaches an agent how to sign in, publish a game, add pictures and roll back to an older build. It doesn't judge the game itself. These skills cover the game: how to plan it, make it feel good, change it without breaking it and check it before a person sees it. They point to skill.md for publishing instead of repeating it.

### Do I need a Mindblown account?
You don't need an account to read or use the skills. Publishing a game on Mindblown needs an account, and skill.md explains how an agent signs in.

### Do they work for games that are not on Mindblown?
Most of the advice works for any web game: the brief, the first minute, game feel, difficulty, feature specs, build reviews and art style. The platform notes and the store page are about Mindblown. The phone sweep script opens any web address or local file, and it also checks Mindblown's own controls and cookie banner when the game runs there.

### Why does my AI-made game look broken on a phone?
The usual causes are small. Text is wider than its panel. Two button labels land on the same spot because the buttons lack `position: relative`. A late-game number like "23.4k" pushes a button off a 390 px screen. On Mindblown, the platform's handle covers the bottom right corner, and the game's frame is about 130 px shorter while a new visitor's cookie banner is open. In one game, only the top edge of the lobby's "Play alone" button showed above the bottom of the frame in that state. The `build-review` skill lists what to look for, and its phone sweep script finds most of these.

### How can an agent test a game on phone screens?
The `build-review` skill includes `phone-sweep.mjs`. It opens the game in headless Chrome as a touch phone at five sizes, three held upright and two in landscape, and saves a screenshot of each. It lists text that doesn't fit, buttons and labels that overlap, buttons that stick out of the screen, and game controls that lie under the controls of Mindblown's page. A run takes about a minute and needs Node 22 or newer and Chrome or Chromium. Text drawn on a canvas can't be measured, so someone still has to look at the screenshots.

### What is a self-test inside a game?
It is a set of checks that the game carries with it and runs when it's opened with `?selftest=1`. It checks the rules as plain code, plays the page with real taps in a state of its own, and makes one read from Mindblown that changes nothing. Because it runs on the live build, anyone can run it on exactly what players see. A village builder's self-test has 104 checks and takes under a minute at each of the five phone sizes. The `build-review` skill explains it, and `selftest-skeleton.js` is a starting point.

### Can the person change numbers without a new build?
Yes. If the game reads its numbers from `tune.json`, the person can change them in the Tune panel of the Mindblown studio, and each change makes a new version without a rebuild. A file holds up to 40 values, such as enemy speed, prices or the strength of screen shake. The `platform-notes` skill has the rules.

### How do I ask for a new feature so it gets built right the first time?
Write a short spec before any code. It says what the feature does, gives every number, lists the states and the edge cases, and says what must stay the same. Then write checks that each name one action and one exact result, and ship the feature in three small packs that are each playable. The `feature-spec` skill shows this with a real message that added a second tower to a tower defense game.

### Do the skills cover multiplayer games?
They cover the basics that games most often get wrong: rooms, leaving and rejoining, what guests can and can't do, and a shared world for signed-in players. Mindblown's own [multiplayer.md](https://mindblown.ai/multiplayer.md) stays the reference.

### Can these skills tell whether my game is fun?
No. A mechanic can work exactly as the spec says and still be dull. To find out, two or three people play the game while you watch without explaining anything. Mindblown Academy, course 1, lesson 5 shows how to run that test.

### Where can I learn this in more depth?
Every skill names the [Mindblown Academy](https://academy.mindblown.ai/) lesson behind it. The lessons show each step on a game you can play, with the exact prompt that built it.
