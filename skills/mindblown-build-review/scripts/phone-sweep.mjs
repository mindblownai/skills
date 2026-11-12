#!/usr/bin/env node
// Phone sweep for a game page: screenshots at phone sizes plus a list of text
// that doesn't fit its box, its container or the screen, buttons and labels
// that land on each other, and buttons that stick out of the screen.
//
//   node phone-sweep.mjs <url> [outDir] [--wait seconds] [--selftest [seconds]]
//
// For each of five sizes it opens the page in a fresh headless Chrome as a
// touch phone, starting from a clean browser, and waits. If Mindblown's cookie
// banner is open, it checks the game and saves <outDir>/<size>-cookie-banner.png
// (a new visitor sees the game in a shorter frame above the banner), then
// closes the banner with "Reject". It checks again, saves <outDir>/<size>.png
// and finally <outDir>/report.json. Analytics calls are blocked, so test runs don't count
// as visits or show up in the game's error list. Only the game's own frames are
// checked (same host as <url>); of Mindblown's page around the game only its
// controls are used, to see which of them lie over the game. Text drawn on a
// canvas can't be measured: look at the screenshots too.
//
// With --selftest it runs the game's own self-test instead of the layout checks:
// it opens <url> with ?selftest=1 at each size and waits (180 s by default) for
// the result in window.__selftest, { pass, total, list: [{ name, pass, detail }] }
// (see selftest-skeleton.js). Failed checks are listed as problems.
//
// Exit code: 0 no problems found, 1 problems found, 2 could not run.
// Needs Node 22+ (built-in WebSocket and fetch) and Google Chrome or Chromium.
// Set CHROME=/path/to/chrome if it isn't found.

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const fail = (msg) => { console.error(msg); process.exit(2); };

// ---- arguments ----
const argv = process.argv.slice(2);
let url, outDir, waitSec = 8, selftestSec = 0;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--wait") {
    const n = Number(argv[++i]);
    if (!Number.isFinite(n) || n < 0) fail("--wait needs a number of seconds, like --wait 8");
    waitSec = n;
  } else if (a === "--selftest") {
    const n = Number(argv[i + 1]);
    if (Number.isFinite(n) && n > 0) { selftestSec = n; i++; } else selftestSec = 180;
  } else if (!url && /^(https?|file):/.test(a)) url = a;
  else if (!outDir && !a.startsWith("--")) outDir = a;
  else fail(`unexpected argument: ${a}`);
}
if (!url) fail("usage: node phone-sweep.mjs <url> [outDir] [--wait seconds] [--selftest [seconds]]");
outDir ||= "phone-sweep";
fs.mkdirSync(outDir, { recursive: true });
const target = new URL(url);

const SIZES = [
  { name: "portrait-360", width: 360, height: 780, angle: 0 },
  { name: "portrait-390", width: 390, height: 844, angle: 0 },
  { name: "portrait-430", width: 430, height: 932, angle: 0 },
  { name: "landscape-844", width: 844, height: 390, angle: 90 },
  { name: "landscape-932", width: 932, height: 430, angle: 90 },  // Mindblown's handle becomes a strip on the right edge here
];
const BLOCK = ["*api.mindblown.ai/events*", "*google-analytics.com*", "*googletagmanager.com*", "*facebook.net*"];
const PHONE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";

// ---- Chrome ----
function findChrome() {
  if (process.env.CHROME) {
    if (!fs.existsSync(process.env.CHROME)) fail(`CHROME is set to ${process.env.CHROME}, but there is no file there`);
    return process.env.CHROME;
  }
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/opt/google/chrome/chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) fail("Chrome not found. Set CHROME=/path/to/chrome");
  return found;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chromePath = findChrome();
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "phone-sweep-"));
let chrome = null;
let chromeExited = null;
let stderrTail = "";

const killGroup = (sig) => { try { process.kill(process.platform === "win32" ? chrome.pid : -chrome.pid, sig); } catch {} };
async function cleanup() {
  if (chrome && chrome.exitCode === null && chrome.signalCode === null) {
    killGroup("SIGTERM");
    await Promise.race([chromeExited, sleep(3000)]);
    if (chrome.exitCode === null && chrome.signalCode === null) killGroup("SIGKILL");
    killGroup("SIGKILL");          // helper processes can outlive the main one and keep writing to the profile
  }
  // Chrome's helpers may still be flushing files for a moment: retry until the profile is gone
  for (let i = 0; i < 15 && fs.existsSync(profile); i++) {
    await sleep(200);
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  }
}
let exiting = false;
async function finish(code) {
  if (exiting) return;
  exiting = true;
  await cleanup();
  process.exit(code);
}
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => finish(2));

const flags = [
  "--headless=new",
  "--remote-debugging-port=0",
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-backgrounding-occluded-windows",
  "--disable-renderer-backgrounding",
  "--disable-background-timer-throttling",
  "--hide-scrollbars",
  "--mute-audio",
];
if (process.platform === "linux" && process.getuid?.() === 0) flags.push("--no-sandbox");
chrome = spawn(chromePath, [...flags, "about:blank"], { stdio: ["ignore", "ignore", "pipe"], detached: process.platform !== "win32" });
chromeExited = new Promise((r) => chrome.once("exit", r));
chrome.stderr.on("data", (d) => { stderrTail = (stderrTail + d.toString()).slice(-2000); });

// Chrome writes the port it picked to DevToolsActivePort in the profile
let port;
for (let i = 0; i < 100 && !port; i++) {
  await sleep(100);
  if (chrome.exitCode !== null) break;
  try { port = Number(fs.readFileSync(path.join(profile, "DevToolsActivePort"), "utf8").split("\n")[0]); } catch {}
}
if (!port) { console.error("Chrome did not start.\n" + stderrTail); await finish(2); }

let page;
for (let i = 0; i < 50 && !page; i++) {
  try { page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page"); } catch {}
  if (!page) await sleep(100);
}
if (!page) { console.error("No page in Chrome.\n" + stderrTail); await finish(2); }

// ---- CDP ----
const ws = new WebSocket(page.webSocketDebuggerUrl);
try {
  await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = () => no(new Error("could not connect to Chrome")); });
} catch (e) { console.error(e.message); await finish(2); }
let nextId = 0;
const pending = new Map();
const pageWorld = new Map();   // frameId -> the page's own JavaScript context (for window.__selftest)
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
  if (d.method === "Runtime.executionContextCreated" && d.params.context.auxData?.isDefault) pageWorld.set(d.params.context.auxData.frameId, d.params.context.id);
  if (d.method === "Runtime.executionContextDestroyed") for (const [f, c] of pageWorld) if (c === d.params.executionContextId) pageWorld.delete(f);
  if (d.method === "Runtime.executionContextsCleared") pageWorld.clear();
};
function send(method, params = {}, timeoutMs = 30000) {
  return new Promise((ok, no) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); no(new Error(`${method} timed out`)); }, timeoutMs);
    pending.set(id, (d) => { clearTimeout(timer); d.error ? no(new Error(`${method}: ${d.error.message}`)) : ok(d.result); });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function framesOf() {
  const { frameTree } = await send("Page.getFrameTree");
  const list = [];
  const walk = (n, depth) => { list.push({ id: n.frame.id, url: n.frame.url, top: depth === 0, depth }); (n.childFrames || []).forEach((c) => walk(c, depth + 1)); };
  walk(frameTree, 0);
  return list;
}
async function evalIn(frameId, expression) {
  const { executionContextId } = await send("Page.createIsolatedWorld", { frameId, worldName: "phone-sweep" });
  const r = await send("Runtime.evaluate", { expression, contextId: executionContextId, returnByValue: true });
  return r?.result?.value;
}

// Clicks Reject in Mindblown's cookie frame. Run only in that frame.
const DISMISS = `(() => {
  const b = document.querySelector(".mb-cookie-reject")
    || [...document.querySelectorAll("button")].find((x) => /^reject( all)?$/i.test((x.textContent || "").trim()));
  if (b) b.click();
  return !!b;
})()`;

// Runs in one frame. Lists visible elements with their own text whose text is cut
// by its own box or a clipping ancestor, spills out of its box, or leaves the screen.
const PROBE = (screenW, isTop, label) => `(() => {
  const SCREEN_W = ${screenW}, out = [];
  const vw = ${isTop} ? SCREEN_W : innerWidth, vh = innerHeight;
  if (${isTop}) {
    const pageW = document.documentElement.scrollWidth;
    if (pageW > SCREEN_W + 1) out.push({ frame: ${JSON.stringify(label)}, text: "(whole page)", tag: "html", problem: "page is wider than the screen", right: pageW, viewport: SCREEN_W });
  }
  if (!document.body) return out;
  const clips = (cs) => /hidden|clip|auto|scroll/.test(cs.overflowX + " " + cs.overflow);
  const reported = new Set();
  for (const el of document.body.querySelectorAll("*")) {
    const nodes = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    if (!nodes.length) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) continue;
    const box = el.getBoundingClientRect();
    if (box.width === 0 || box.height === 0 || box.bottom < 0 || box.top > vh) continue;
    let tl = Infinity, tr = -Infinity;
    for (const n of nodes) { const range = document.createRange(); range.selectNodeContents(n); const r = range.getBoundingClientRect(); if (r.width) { tl = Math.min(tl, r.left); tr = Math.max(tr, r.right); } }
    if (!Number.isFinite(tl)) continue;
    let problem = null;
    if (clips(cs) && el.scrollWidth > el.clientWidth + 1) problem = "text wider than its box (cut off)";
    if (!problem) {
      for (let a = el.parentElement; a && a !== document.documentElement && a !== document.body; a = a.parentElement) {
        if (!clips(getComputedStyle(a))) continue;
        const ar = a.getBoundingClientRect();
        if (tl < ar.left - 1 || tr > ar.right + 1) problem = "text cut by its container";
        break;
      }
    }
    if (!problem && !clips(cs) && (tr > box.right + 1 || tl < box.left - 1)) problem = "text spills out of its box";
    if (!problem && (tl < -1 || tr > vw + 1)) problem = "text sticks out of the screen";
    if (problem) reported.add(el);
    if (problem) out.push({ frame: ${JSON.stringify(label)}, text: nodes.map((n) => n.textContent.trim()).join(" ").slice(0, 80), tag: el.tagName.toLowerCase(), problem, left: Math.round(tl), right: Math.round(tr), viewport: vw });
  }

  // Buttons and labels that land on each other, and buttons that leave the screen.
  // Hit tests use what is drawn, so labels with pointer-events: none count too.
  const shown = (el) => el.checkVisibility ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : getComputedStyle(el).display !== "none";
  const ownText = (el) => [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
  const textRect = (el) => {
    let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
    for (const n of ownText(el)) { const range = document.createRange(); range.selectNodeContents(n); const x = range.getBoundingClientRect(); if (x.width && x.height) { l = Math.min(l, x.left); t = Math.min(t, x.top); r = Math.max(r, x.right); b = Math.max(b, x.bottom); } }
    return Number.isFinite(l) ? { left: l, top: t, right: r, bottom: b } : null;
  };
  const CONTROL = "button, a[href], input:not([type=hidden]), select, textarea, [role=button]";
  const isControl = (el) => el.matches(CONTROL);
  const items = [];
  for (const el of document.body.querySelectorAll("*")) {
    if (!shown(el)) continue;
    const control = isControl(el), tr = textRect(el);
    if (!control && !tr) continue;
    const box = el.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) continue;
    // A control's area is its box; a label's area is its text.
    items.push({ el, control, rect: control ? box : tr, name: (ownText(el).map((n) => n.textContent.trim()).join(" ") || el.getAttribute("aria-label") || el.title || el.id || el.tagName.toLowerCase()).slice(0, 40) });
  }
  // Controls inside other controls (an icon in a button) are part of it
  const outer = items.filter((it) => !(it.control && items.some((o) => o !== it && o.control && o.el.contains(it.el))));
  const related = (a, b) => a.contains(b) || b.contains(a);
  const scrollsDown = document.documentElement.scrollHeight > innerHeight + 1;
  const style = document.createElement("style");
  style.textContent = "*{pointer-events:auto!important}";
  (document.head || document.documentElement).appendChild(style);
  try {
    for (const it of outer) {
      const r = it.rect;
      if (it.control && (r.left < -1 || r.right > vw + 1 || (!scrollsDown && (r.top < -1 || r.bottom > vh + 1)))) {
        if (!reported.has(it.el)) out.push({ frame: ${JSON.stringify(label)}, text: it.name, tag: it.el.tagName.toLowerCase(), problem: "button sticks out of the screen", left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom), viewport: vw, viewportHeight: vh });
        continue;
      }
      const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
      if (cx < 0 || cy < 0 || cx > vw || cy > vh) continue;
      // What is drawn above this item at its centre? Panels without text don't count: they are layers on
      // purpose. An item that isn't drawn there at all (scrolled away, clipped) is skipped.
      const stack = document.elementsFromPoint(cx, cy);
      const at = stack.findIndex((e) => e === it.el || it.el.contains(e));
      it.onTop = false;
      if (at < 0) continue;
      const hit = stack.slice(0, at).map((above) => related(above, it.el) ? null : (outer.find((o) => o.el === above) || outer.find((o) => o.control && o.el.contains(above)))).find(Boolean);
      if (!hit) { it.onTop = true; continue; }
      out.push({ frame: ${JSON.stringify(label)}, text: it.name, tag: it.el.tagName.toLowerCase(), problem: (it.control ? "button" : "text") + " hidden under " + (hit.control ? "a button" : "other text") + ' ("' + hit.name + '")', left: Math.round(r.left), right: Math.round(r.right), viewport: vw });
    }
    // Two things that are both in view but overlap at their edges
    const seen = outer.filter((it) => it.onTop);
    for (let i = 0; i < seen.length; i++) for (let j = i + 1; j < seen.length; j++) {
      const a = seen[i], b = seen[j];
      if (related(a.el, b.el)) continue;
      const w = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left);
      const h = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top);
      if (w > 3 && h > 3) out.push({ frame: ${JSON.stringify(label)}, text: a.name, tag: a.el.tagName.toLowerCase(), problem: "overlaps " + (b.control ? "a button" : "other text") + ' ("' + b.name + '")', left: Math.round(a.rect.left), right: Math.round(a.rect.right), viewport: vw });
    }
  } finally { style.remove(); }
  const boxes = outer.filter((it) => it.onTop).map((it) => ({ name: it.name, control: it.control, tag: it.el.tagName.toLowerCase(), left: it.rect.left, top: it.rect.top, right: it.rect.right, bottom: it.rect.bottom }));
  return { out, boxes };
})()`;

const isGameFrame = (f) => {
  if (f.top) return true;
  try { const u = new URL(f.url); return u.protocol === "file:" ? target.protocol === "file:" : u.hostname === target.hostname; } catch { return false; }
};

// ---- the sweep ----
const report = { url, mode: selftestSec ? "selftest" : "layout", waitSeconds: waitSec, blocked: BLOCK, sizes: [] };
let openUrl = url;
if (selftestSec) { const u = new URL(url); u.searchParams.set("selftest", "1"); openUrl = u.href; }
let problems = 0, errors = 0;
try {
  await send("Page.enable");
  await send("DOM.enable");
  await send("Runtime.enable");
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });   // the page acts as the tab in front
  await send("Network.enable");
  await send("Network.setBlockedURLs", { urls: BLOCK });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await send("Emulation.setUserAgentOverride", { userAgent: PHONE_UA, platform: "Android" });
} catch (e) { console.error(e.message); await finish(2); }

// One size, self-test mode: wait for the verdict of the game's own self-test
async function runSelftest(s, entry) {
  // Run the game's own self-test: wait for its verdict in any of the game's frames
  const t0 = Date.now();
  let verdict = null;
  while (!verdict && Date.now() - t0 < selftestSec * 1000) {
    await sleep(1000);
    for (const f of await framesOf()) {
      if (f.url.includes("/cookie-preferences") && !entry.cookieBanner) { if (await evalIn(f.id, DISMISS).catch(() => false)) entry.cookieBanner = true; continue; }
      if (!isGameFrame(f) || !pageWorld.has(f.id)) continue;
      const r = await send("Runtime.evaluate", { contextId: pageWorld.get(f.id), returnByValue: true,
        expression: "(() => { try { return JSON.stringify(window.__selftest ?? null); } catch (e) { return null; } })()" }).catch(() => null);
      const v = JSON.parse(r?.result?.value || "null");
      if (v && Number.isFinite(v.total) && Array.isArray(v.list)) { verdict = { ...v, frame: f.top ? "page" : f.url.split("?")[0] }; break; }
    }
  }
  entry.selftest = verdict ? { pass: verdict.pass, total: verdict.total, seconds: Math.round((Date.now() - t0) / 1000) } : null;
  if (!verdict) entry.findings.push({ frame: "page", text: `nothing in window.__selftest after ${selftestSec} s`, tag: "selftest", problem: "no self-test result" });
  else for (const c of verdict.list.filter((x) => !x.pass)) entry.findings.push({ frame: verdict.frame, text: String(c.name).slice(0, 120), tag: "selftest", problem: "self-test check failed", detail: String(c.detail ?? "").slice(0, 200) });
  const shot = await send("Page.captureScreenshot", { format: "png" });
  entry.screenshot = path.join(outDir, `${s.name}-selftest.png`);
  fs.writeFileSync(entry.screenshot, Buffer.from(shot.data, "base64"));
}

// One size, layout mode: check text, buttons and labels, with and without the cookie banner
async function runLayout(s, entry) {
  await sleep(waitSec * 1000);
  // Checks every game frame; also compares the game's boxes with the controls of the page around it
  const probeAll = async () => {
    const found = [];
    let pageControls = [];  // on Mindblown: its handle and panels, in screen coordinates
    const frames = await framesOf();
    // On Mindblown the top page is its page around the game, and the game is a frame inside it.
    // That page isn't checked (its own drawer hides past the edge on purpose); its controls are kept.
    const wrapped = frames.some((f) => !f.top && isGameFrame(f));
    for (const f of frames) {
      if (!isGameFrame(f)) continue;
      const label = f.top ? "page" : f.url.split("?")[0];
      const res = await evalIn(f.id, PROBE(s.width, f.top, label)).catch(() => null);
      if (!res) continue;
      if (!(f.top && wrapped)) found.push(...res.out);
      if (f.top) { pageControls = res.boxes.filter((b) => b.control); continue; }
      if (f.depth !== 1 || !pageControls.length) continue;
      // The game's frame sits in the page: shift its boxes by the frame's position and compare
      const at = await send("DOM.getFrameOwner", { frameId: f.id })
        .then(({ backendNodeId }) => send("DOM.getBoxModel", { backendNodeId })).then((r) => r.model.content).catch(() => null);
      if (!at) continue;
      for (const b of res.boxes) {
        const box = { left: b.left + at[0], right: b.right + at[0], top: b.top + at[1], bottom: b.bottom + at[1] };
        const c = pageControls.find((p) => Math.min(p.right, box.right) - Math.max(p.left, box.left) > 3 && Math.min(p.bottom, box.bottom) - Math.max(p.top, box.top) > 3);
        if (c) found.push({ frame: label, text: b.name, tag: b.tag, problem: `${b.control ? "button" : "text"} under a control of the page around the game ("${c.name}")`, left: Math.round(box.left), right: Math.round(box.right), viewport: s.width });
      }
    }
    return found;
  };
  const cookieFrames = (await framesOf()).filter((f) => f.url.includes("/cookie-preferences"));
  if (cookieFrames.length) {
    // A new visitor first sees the game above Mindblown's cookie banner, in a frame about 130 px shorter
    const first = await probeAll();
    const shot0 = await send("Page.captureScreenshot", { format: "png" });
    entry.bannerScreenshot = path.join(outDir, `${s.name}-cookie-banner.png`);
    fs.writeFileSync(entry.bannerScreenshot, Buffer.from(shot0.data, "base64"));
    for (const f of cookieFrames) if (await evalIn(f.id, DISMISS).catch(() => false)) entry.cookieBanner = true;
    if (entry.cookieBanner) await sleep(1000);
    entry.findings = await probeAll();
    const key = (x) => `${x.problem}|${x.text}|${x.frame}`;
    const after = new Set(entry.findings.map(key));
    entry.findings.push(...first.filter((x) => !after.has(key(x))).map((x) => ({ ...x, when: "the cookie banner was open" })));
  } else entry.findings = await probeAll();
  const shot = await send("Page.captureScreenshot", { format: "png" });
  entry.screenshot = path.join(outDir, `${s.name}.png`);
  fs.writeFileSync(entry.screenshot, Buffer.from(shot.data, "base64"));
}

for (const s of SIZES) {
  const entry = { ...s, screenshot: null, bannerScreenshot: null, findings: [], error: null, cookieBanner: false };
  try {
    await send("Page.navigate", { url: "about:blank" });
    await send("Network.clearBrowserCookies");
    if (/^https?:$/.test(target.protocol)) await send("Storage.clearDataForOrigin", { origin: target.origin, storageTypes: "all" });
    await send("Emulation.setDeviceMetricsOverride", {
      width: s.width, height: s.height, deviceScaleFactor: 2, mobile: true,
      screenOrientation: { type: s.angle ? "landscapePrimary" : "portraitPrimary", angle: s.angle },
    });
    await send("Page.navigate", { url: openUrl });
    if (selftestSec) await runSelftest(s, entry);
    else await runLayout(s, entry);
  } catch (e) {
    entry.error = e.message;
    errors++;
  }
  problems += entry.findings.length;
  report.sizes.push(entry);
  const head = entry.error ? "ERROR " + entry.error
    : selftestSec ? (entry.selftest ? `self-test ${entry.selftest.pass} / ${entry.selftest.total} in ${entry.selftest.seconds} s` : "no self-test result") + `, screenshot ${entry.screenshot}`
    : `${entry.findings.length} problem(s), screenshot ${entry.screenshot}`;
  console.log(`${s.name}: ${head}`);
  if (entry.bannerScreenshot) console.log(`  first visit, with the cookie banner open: ${entry.bannerScreenshot}`);
  for (const f of entry.findings.slice(0, 10)) console.log(`  - ${f.problem}: "${f.text}"${f.detail ? " " + f.detail : ""} (${f.tag}, ${f.frame})${f.when ? " while " + f.when : ""}`);
}
fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
console.log(`report: ${path.join(outDir, "report.json")}`);
try { ws.close(); } catch {}
await finish(errors === SIZES.length ? 2 : problems ? 1 : 0);
