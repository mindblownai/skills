// A self-test a game carries inside itself. Copy this file next to the game as selftest.js
// and fill in the options. The game runs it when opened with ?selftest=1:
//
//   if (new URLSearchParams(location.search).has("selftest"))
//     import("./selftest.js").then((t) => t.run(G, { /* options below */ }));
//
// On Mindblown, query parameters reach the game on its own subdomain address
// (https://your-game.mindblown.ai/?selftest=1). The builder can run it on the build it
// published and send the number; phone-sweep.mjs --selftest runs it at five phone sizes.
//
// The result goes to window.__selftest as { pass, fail, total, list: [{ name, pass, detail }] }
// and into a box on top of the page.
//
// G is what the game hands the test:
//   G.act(input)     does what a button does, the same way the button does it
//   G.state()        the current state, as plain data
//   G.dryRun(input)  optional: what the rules (or the server) would answer, with no effect.
//                    Without it, the button check acts for real and looks for a change,
//                    so only use it on a state of the test's own (see options.isolate).
//
// Options (all optional):
//   ruleTests(ok)         pure checks of the rules, no page
//   isolate()             swap the save, storage or world for one in memory; returns a function that
//                         puts the real one back. The test must never touch the player's progress.
//   pageSteps(tools)      play the page with real events: tools = { ok, sleep, until, click, tap }
//   states                [{ name, enter: async () => {} }] - put the game in each state, then check it.
//                         Use the start, a late state (long numbers, everything unlocked) and a busy one
//                         (queues full, storage full, nothing ready).
//   hud                   CSS selectors of what must stay on screen, e.g. ["#top > *", ".round", "#hint"]
//   clear                 areas the HUD must keep free, [{ name, rect: (vw, vh) => [left, top, right, bottom] | null }].
//                         Default: Mindblown's handle corner on phones (MINDBLOWN_CORNER below). A local copy of
//                         the game has no handle, so without this rule the test can't see what it covers.
//   panels                [{ name, open: async () => {}, root: "#panel" }] - every panel with buttons
//   platformLook()        one read from Mindblown that changes nothing; a signed-out refusal passes
//
// Rules that made this work in a real game:
// - Real events: PointerEvent on the canvas at the object's screen position, click() on page elements.
// - Wait for a state with until(), never a fixed sleep: a fixed wait made a test flicker on a cutscene.
// - A stand-in world or save must not skip a path real players take. A test that put its own world in
//   at once never took the signed-out path, and missed an empty map that new guests saw for 30 seconds.
// - Every bug the test missed gets a check. Run the new check on the old build to see it fail.

export async function run(G, opts = {}) {
  const list = [];
  const ok = (name, pass, detail) => list.push({ name, pass: !!pass, detail: pass ? "" : JSON.stringify(detail ?? "").slice(0, 160) });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const until = async (fn, ms = 4000) => {
    const t = Date.now();
    while (Date.now() - t < ms) { try { if (fn()) return true; } catch {} await sleep(60); }
    return false;
  };
  const click = async (el) => {
    if (!el) return false;
    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    el.click();
    await sleep(200);
    return true;
  };
  const tap = async (canvas, x, y) => {   // x, y in screen pixels
    const o = { bubbles: true, clientX: x, clientY: y, pointerId: 7, pointerType: "touch", isPrimary: true };
    canvas.dispatchEvent(new PointerEvent("pointerdown", o));
    await sleep(40);
    canvas.dispatchEvent(new PointerEvent("pointerup", o));
    await sleep(200);
  };

  // 1. The rules, if the game has them as a module
  if (opts.ruleTests) { try { opts.ruleTests(ok); } catch (e) { ok("rule tests ran to the end", false, e.message); } }

  // 2. The page with real events, in a state of its own
  let restore = () => {};
  try {
    if (opts.isolate) restore = opts.isolate() || restore;
    if (opts.pageSteps) await opts.pageSteps({ ok, sleep, until, click, tap });
    for (const s of opts.states || []) {
      await s.enter();
      await sleep(100);
      layout(ok, s.name, opts.hud || [], opts.clear ?? [MINDBLOWN_CORNER]);
      await honest(ok, s.name, G, opts.panels || []);
    }
  } catch (e) {
    ok("page steps ran to the end", false, e.message);
  } finally {
    try { restore(); } catch (e) { ok("the real save was put back", false, e.message); }
  }

  // 3. Mindblown: one read, nothing changed
  if (opts.platformLook) {
    try { ok("Mindblown answers", await opts.platformLook()); }
    catch (e) { ok("Mindblown answers (signed out is fine if the game handles it)", /ACCOUNT_REQUIRED/.test(e.reason || e.message), e.reason || e.message); }
  }

  const fail = list.filter((x) => !x.pass);
  window.__selftest = { pass: list.length - fail.length, fail: fail.length, total: list.length, list };
  const box = document.createElement("div");
  box.style.cssText = "position:fixed;z-index:2147483647;left:8px;top:8px;max-width:60%;max-height:80%;overflow:auto;white-space:pre-wrap;background:rgba(0,0,0,.85);color:#fff;font:12px monospace;padding:8px;border-radius:8px";
  box.textContent = `self-test: ${list.length - fail.length} / ${list.length}` + fail.map((f) => "\n✗ " + f.name + " " + f.detail).join("");
  document.body.appendChild(box);
  return window.__selftest;
}

// Mindblown's page puts a handle over the game's bottom right corner: 52x36 px on phones (measured
// November 2026), 64x44 with a margin. On a wide landscape phone it is a 24 px strip on the right edge.
export const MINDBLOWN_CORNER = { name: "Mindblown's handle corner", rect: (vw, vh) => vw < 1000 ? [vw - 64, vh - 44, vw, vh] : null };

// The HUD fits: nothing off the screen, nothing on top of something else, nothing in an area that
// must stay clear, and each label (an element with data-label-of="<selector of its button>") centred over its button.
export function layout(ok, label, hud, clear = []) {
  const vw = innerWidth, vh = innerHeight, bad = [];
  const vis = (el) => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden";
  const els = hud.flatMap((q) => [...document.querySelectorAll(q)]).filter(vis);
  const nm = (el) => el.id || (typeof el.className === "string" && el.className) || el.tagName;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1) bad.push(nm(el) + " off the screen");
  }
  for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
    if (els[i].contains(els[j]) || els[j].contains(els[i])) continue;
    const a = els[i].getBoundingClientRect(), b = els[j].getBoundingClientRect();
    if (a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2) bad.push(nm(els[i]) + " covers " + nm(els[j]));
  }
  for (const c of clear) {
    const z = c.rect(vw, vh);
    if (!z) continue;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.left < z[2] - 1 && z[0] < r.right - 1 && r.top < z[3] - 1 && z[1] < r.bottom - 1) bad.push(nm(el) + " is in " + c.name);
    }
  }
  for (const l of document.querySelectorAll("[data-label-of]")) {
    const p = document.querySelector(l.dataset.labelOf);
    if (!p || !vis(l)) continue;
    const r = l.getBoundingClientRect(), q = p.getBoundingClientRect(), cx = (r.left + r.right) / 2;
    if (cx < q.left || cx > q.right) bad.push("label " + l.textContent.trim() + " is not under its button");
  }
  ok(`${label}: the HUD fits ${vw}x${vh}`, !bad.length, bad.slice(0, 4));
}

// A button that is on must work. Buttons carry their action as JSON in data-act.
export async function honest(ok, label, G, panels) {
  const bad = [];
  let n = 0;
  for (const p of panels) {
    await p.open();
    await new Promise((r) => setTimeout(r, 30));
    const root = (p.root && document.querySelector(p.root)) || document;
    for (const b of [...root.querySelectorAll("[data-act]")].filter((x) => !x.disabled)) {
      const input = JSON.parse(b.dataset.act);
      n++;
      if (G.dryRun) {
        const r = await G.dryRun(input);
        if (r && r.refused) bad.push(`${p.name} "${b.textContent.trim()}": ${r.refused}`);
      } else {
        const before = JSON.stringify(G.state());
        await G.act(input);
        if (JSON.stringify(G.state()) === before) bad.push(`${p.name} "${b.textContent.trim()}": nothing changed`);
      }
    }
  }
  ok(`${label}: every button that is on works (${n} checked)`, !bad.length, bad.slice(0, 4));
}
