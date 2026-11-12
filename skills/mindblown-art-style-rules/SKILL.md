---
name: mindblown-art-style-rules
description: Use when a game needs a look, when adding new art to an existing game, or when assets start to look like they came from different games. Writes five or six style rules once (mood and material, colors with jobs, readability, light, no text in art) and applies them to every asset; puts the person's own art in without redrawing it.
---

# Art style rules

Without written rules, every new asset is a fresh guess, and by the tenth one the game looks like several games. Write the style once, then use it for everything.

## The rules, five or six lines
- **Mood and material:** what the world is made of and when it takes place ("a papercraft garden at dusk").
- **Colors with jobs.** Give each color a role, like "Beetles dark blue-violet, so they always stand out on the path." A bare palette makes every asset guess who wears which color.
- **Readability first.** Say what the player must tell apart at a glance. Moving things stand out from still things, threats from the background, and the thing you tap looks tappable.
- **Light:** one direction for every object, so nothing looks pasted in.
- **No text inside the art.** Text belongs to the game, where it can change and translate.

Readability comes before beauty. A beautiful enemy that blends into the background makes the game unfair.

## Applying them
- Put the rules at the top of the game's notes and follow them for every new asset, icon and panel.
- **Icons for the same kind of action share one shape, size and style.** Different-looking icons for the same thing are the first detail players notice.
- **Game UI, not web UI.** Panels, buttons and pickers belong to the game's world and follow the same rules. Avoid form-like boxes and default web controls. Touch targets are at least 44 CSS px, and the thing being decided (the tower, the card) stays visible while its panel is open.
- **The person's own art** goes in as given. Place it where they said and don't redraw it. If it doesn't fit the rules, tell them and ask, rather than "improving" it.
- Generated art goes through the same rules. Check each piece against them before it goes in. Art made with Mindblown's asset generation is paid from the person's account, so ask before making a lot of it.
- If the game draws in code (shapes on a canvas), the rules still apply: colors with jobs, one light direction, consistent stroke widths.

## On a phone
These rules come from a village builder that a person played on an iPhone, held upright, after it had passed every test in landscape and on a desktop.
- **Draw indicators at a fixed size on the screen, not at the map's scale.** Progress bars, timers and health bars drawn as part of the map shrank to a few pixels on a phone and blended into the ground. Drawn at a fixed screen size, as a big hammer in a light circle over a bar on a dark plate with the time left, they read at a glance.
- **Place each label from its own button** (`position: relative` on the button). Without it, the labels of two round buttons landed on one spot, and one of them disappeared.
- **On a narrow screen, fold a row.** Five builder icons became one hammer with a count ("3/5"), and the resource pills dropped their limits ("120" instead of "120 /600"). Then the top row fitted on a phone held upright.
- **A button that can't work right now is off, and the reason is written next to it,** for example "Queue full". A button that stays on and answers with a small message at the top of the screen looks broken. Messages that matter appear large, in the middle.
- **Keep the bottom right corner clear.** Mindblown's page puts its own control there (see `mindblown-platform-notes`).
- **Try the longest text the game can show:** late-game numbers ("23.4k"), the longest name, every language you support.

## Example
From Burrow Guard, the style rules that gave a plain game its look:
```
- A papercraft garden at dusk. Every object looks folded from colored paper, with soft shadows, like a pop-up book.
- Colors: the path warm tan, the grass deep green, the burrow dark brown. Towers in warm oranges and greens. Beetles dark blue-violet, so they always stand out on the path.
- Readability comes first. Beetles are always darker than the path, towers are always bigger than beetles, and hearts and coins sit on a dark band at the top so they read on any background.
- The light falls from the top left on every object.
- No text inside the art.
```

## Check
- [ ] The rules cover mood, colors with jobs, readability, light and no text in art.
- [ ] On a phone, every moving thing reads at a glance.
- [ ] On a 360 px phone held upright, in a late game state, the top row fits and every label sits under its own button.
- [ ] Buttons that can't work are off, with the reason next to them.
- [ ] Icons for the same kind of action look alike.
- [ ] The person's own art is in the game as they made it.

## Learn more
Mindblown Academy, course 2, From Spec to Game: lesson 8, Art and assets. Case games: Burrow Guard v7, and a village builder made for a Mindblown creator (the phone rules).
