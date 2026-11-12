---
name: mindblown-store-page
description: Use before a game's first publish on Mindblown, when changing its title, description or pictures, or when a public game gets few taps from the feed. Sets the title, the one-sentence description, a cover, card and icon that show the verb, and first seconds of play that match the picture.
---

# Store page

A player decides from a card in a feed, in a second or two. Show what they'll do (the **verb**: hop, steer, plant) before they tap.

## Title
Two or three words that hint at the verb, like Lantern Hop, Comet Sweeper or Burrow Guard. Avoid a name that needs the description to make sense, and names of other people's games or brands.

## Description
One plain sentence that says what a person does, in the page's `<meta name="description">`. Search results and shared links show it.
- Good: "Tap to hop across drifting lanterns before they burn out."
- Weak: "An exciting adventure full of challenges."

## Cover, card and icon
On a page's first publish, Mindblown makes cover art from a screenshot and the title. To use your own, send `cover` (16:9, published at 1200×675, at least 600×338), `card` (square, 1000×1000, at least 500×500) and `icon` (square, 256×256, at least 128×128) with a publish, as PNG, JPEG or WebP up to 10 MB each. A new version keeps the pictures the page has, so send one again only to change it. See "Your own cover, card and icon" in Mindblown's skill.md.

Look at Mindblown's own cover right after the first publish. For one village builder it drew characters that looked like they came from a famous mobile strategy game, which no game should show as its own. Send your own cover then if it borrows from anyone. The game's subdomain showed the new one after about a minute.
- **Show the verb in action,** like the hero mid-hop, a shot leaving the ship or a tower firing. Avoid the menu and a still title screen.
- **One subject, big, against a calm background.** The card is small in the feed.
- **No text in the picture.** The title is shown next to it anyway.
- **Each picture is scaled to fill its own size and cropped from the centre,** so make each one in its own shape, with the subject in the middle.

## Private and public
A new page starts private. It opens for anyone with the link, but it isn't in the feed, on the person's profile or in search. Making it public is the person's choice. Ask them first, every time (skill.md, "Private and public").

## The first seconds
The player who tapped the card should see the same thing in play within seconds: the same hero, the same action, no long intro. See `mindblown-core-loop-and-first-minute`.

## Check
- [ ] The title hints at the verb and is your own.
- [ ] The description is one sentence about what the player does.
- [ ] Cover, card and icon show the verb, have no text, are made in their own shapes and keep the subject centred.
- [ ] The person decided whether the game goes public.
- [ ] What the card promises appears in play within seconds.

## Learn more
Mindblown Academy, course 1, Game Design for AI Builders: lesson 8, First impression. Case game: Comet Sweeper v3.
