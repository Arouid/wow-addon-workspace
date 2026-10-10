#!/usr/bin/env node
'use strict';
// Links the workspace's addons into the game's Interface/AddOns (scripts/lib/link.js).
// Dry run by default: --write makes the links.
//   node link.js [addon ...] [--root <workspace>] [--write]
//   node link.js --set-path "<game>/Interface/AddOns" --flavor <flavor> [--root <workspace>]
// Without names: every active addon (kind addon or tool; libraries live inside an addon).

const fs = require('fs');
const path = require('path');
const { readManifest, serialize, FILE } = require('./lib/manifest');
const { planLink, applyLink, addonsPathsFor, SAY } = require('./lib/link');

const USAGE = 'Usage: link.js [addon ...] [--root <workspace>] [--write] | --set-path <AddOns folder> --flavor <flavor>';

function parseArgs(argv) {
  const opts = { root: process.cwd(), names: [], write: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--write') opts.write = true;
    else if (a === '--root' || a === '--set-path' || a === '--flavor') {
      if (argv[i + 1] === undefined) throw new Error(`${a} needs a value. ${USAGE}`);
      opts[a.slice(2).replace('-p', 'P')] = argv[++i];
    } else if (a.startsWith('--')) throw new Error(`Unknown option ${a}. ${USAGE}`);
    else opts.names.push(a);
  }
  opts.root = path.resolve(opts.root);
  return opts;
}

// --set-path: writes flavors.<flavor>.addonsPath, the only change this script makes to addons.json.
function setPath(opts, manifest) {
  if (!opts.flavor) throw new Error(`--set-path needs --flavor (one of: ${Object.keys(manifest.flavors || {}).join(', ')}).`);
  if (!manifest.flavors || !manifest.flavors[opts.flavor]) throw new Error(`No flavor "${opts.flavor}" in ${FILE}.`);
  if (!fs.existsSync(opts.setPath)) throw new Error(`${opts.setPath} doesn't exist. Point at the game's Interface/AddOns folder.`);
  manifest.flavors[opts.flavor].addonsPath = path.resolve(opts.setPath).replace(/\\/g, '/');
  fs.writeFileSync(path.join(opts.root, FILE), serialize(manifest));
  return `${FILE}: ${opts.flavor} -> ${manifest.flavors[opts.flavor].addonsPath}`;
}

// One line per addon and AddOns folder; makes the links when write is true.
function run(opts) {
  const manifest = readManifest(opts.root);
  if (!manifest) throw new Error(`No ${FILE} in ${opts.root}. Run /wow-addon-dev:init there first.`);
  if (opts.setPath) return { code: 0, text: setPath(opts, manifest) };
  const addons = manifest.addons || {};
  const names = opts.names.length ? opts.names
    : Object.keys(addons).filter((n) => addons[n].active !== false && addons[n].kind !== 'lib');
  const lines = [];
  let code = 0;
  for (const name of names) {
    const entry = addons[name];
    if (!entry) { lines.push(`${name}: not declared in ${FILE}`); code = 1; continue; }
    const { flavors, paths } = addonsPathsFor(manifest, entry);
    if (paths.length === 0) {
      lines.push(`${name}: no game folder for ${flavors.join(', ') || 'its flavor'}: run link.js --set-path "<game>/Interface/AddOns" --flavor ${flavors[0] || '<flavor>'}`);
      continue;
    }
    for (const p of paths) {
      const plan = planLink(opts.root, name, p);
      if (plan.state === 'create' && opts.write) {
        try { applyLink(plan); lines.push(`${name}: linked ${plan.link} -> ${plan.target}`); }
        catch (err) { lines.push(`${name}: couldn't link (${err.message})`); code = 1; }
      } else {
        lines.push(`${name}: ${SAY[plan.state](plan)}`);
      }
    }
  }
  if (!opts.write && lines.some((l) => l.includes(' -> ') && !l.includes('linked '))) {
    lines.push('', 'Dry run, nothing linked. Run again with --write.');
  }
  return { code, text: lines.join('\n') || 'No active addon to link.' };
}

function main(argv) {
  try {
    const r = run(parseArgs(argv));
    console.log(r.text);
    return r.code;
  } catch (err) {
    console.error(err.message);
    return 1;
  }
}

module.exports = { run, parseArgs };
if (require.main === module) process.exitCode = main(process.argv.slice(2));
