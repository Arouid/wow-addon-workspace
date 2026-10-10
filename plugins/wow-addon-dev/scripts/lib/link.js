'use strict';
// Links an addon folder of the workspace into the game's Interface/AddOns, so the game loads the
// workspace copy: edit here, /reload there, nothing to copy. The game's folder for each client is
// flavors.<flavor>.addonsPath in addons.json. On Windows the link is a junction (no administrator
// rights, no Developer Mode); elsewhere a directory symlink. A real folder already in AddOns is
// never touched: it's reported, the player decides.

const fs = require('fs');
const path = require('path');

// A path as the system resolves it, for comparing two of them (junction targets come back as
// "\\?\C:\..." on Windows; case doesn't matter there).
function norm(p) {
  let out = path.resolve(String(p).replace(/^\\\\\?\\/, ''));
  try { out = fs.realpathSync(out); } catch { /* a broken link: compare as written */ }
  return process.platform === 'win32' ? out.toLowerCase() : out;
}

// The AddOns folders an addon's entry points to: one per flavor that has an addonsPath.
function addonsPathsFor(manifest, entry) {
  const flavors = Array.isArray(entry && entry.flavor) ? entry.flavor : [entry && entry.flavor];
  const paths = [];
  for (const f of flavors) {
    const p = f && manifest.flavors && manifest.flavors[f] && manifest.flavors[f].addonsPath;
    if (p && !paths.includes(p)) paths.push(p);
  }
  return { flavors: flavors.filter(Boolean), paths };
}

// What to do for one addon and one AddOns folder. state:
//   linked      already a link to this workspace folder
//   create      nothing there yet: a link can be made
//   wrong-link  a link to somewhere else (another copy of the addon?)
//   folder      a real folder (a copy, or a download): left alone
//   no-game-dir the AddOns folder itself doesn't exist (game moved? client renamed?)
function planLink(root, name, addonsPath) {
  const target = path.resolve(root, name);
  const link = path.join(addonsPath, name);
  if (!fs.existsSync(addonsPath)) return { state: 'no-game-dir', link, target };
  let st;
  try { st = fs.lstatSync(link); } catch { return { state: 'create', link, target }; }
  if (st.isSymbolicLink()) {
    let to;
    try { to = path.resolve(path.dirname(link), fs.readlinkSync(link)); } catch { to = '?'; }
    return norm(to) === norm(target) ? { state: 'linked', link, target } : { state: 'wrong-link', link, target, detail: to };
  }
  return { state: 'folder', link, target };
}

function applyLink(plan) {
  fs.symlinkSync(plan.target, plan.link, process.platform === 'win32' ? 'junction' : 'dir');
}

const SAY = {
  linked: (p) => `already linked (${p.link})`,
  create: (p) => `link ${p.link} -> ${p.target}`,
  'wrong-link': (p) => `${p.link} links somewhere else (${p.detail}): left alone, remove it to relink`,
  folder: (p) => `${p.link} is a real folder (a copy?): left alone; move it away to link the workspace one`,
  'no-game-dir': (p) => `the game folder ${path.dirname(p.link)} doesn't exist: fix addonsPath in addons.json`,
};

module.exports = { planLink, applyLink, addonsPathsFor, SAY };
