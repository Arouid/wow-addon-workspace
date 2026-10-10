'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { planLink, addonsPathsFor } = require('../scripts/lib/link');
const { run } = require('../scripts/link');

// A workspace with one addon, and a fake game AddOns folder.
function setup(flavor = { interface: 16001 }) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'wad-link-'));
  const root = path.join(base, 'ws');
  const game = path.join(base, 'game', 'Interface', 'AddOns');
  fs.mkdirSync(path.join(root, 'MyAddon'), { recursive: true });
  fs.mkdirSync(game, { recursive: true });
  const manifest = { flavors: { forever: { ...flavor } }, addons: { MyAddon: { kind: 'addon', flavor: 'forever', active: true } } };
  fs.writeFileSync(path.join(root, 'addons.json'), JSON.stringify(manifest, null, 2));
  return { root, game };
}

test('addonsPathsFor: one path per flavor that has one', () => {
  const m = { flavors: { a: { addonsPath: '/g/a' }, b: {}, c: { addonsPath: '/g/a' } } };
  assert.deepEqual(addonsPathsFor(m, { flavor: ['a', 'b', 'c'] }).paths, ['/g/a']);
  assert.deepEqual(addonsPathsFor(m, { flavor: 'b' }).paths, []);
});

test('planLink: nothing there -> create; a real folder -> left alone; no game dir', () => {
  const { root, game } = setup();
  assert.equal(planLink(root, 'MyAddon', game).state, 'create');
  fs.mkdirSync(path.join(game, 'MyAddon'));
  assert.equal(planLink(root, 'MyAddon', game).state, 'folder');
  assert.equal(planLink(root, 'MyAddon', path.join(game, 'nope')).state, 'no-game-dir');
});

test('run: without a game folder it says how to set one', () => {
  const { root } = setup();
  const r = run({ root, names: [], write: false });
  assert.match(r.text, /no game folder for forever/);
  assert.equal(r.code, 0);
});

test('run: --set-path saves the folder, --write links, a second run sees it linked', () => {
  const { root, game } = setup();
  run({ root, names: [], setPath: game, flavor: 'forever' });
  const saved = JSON.parse(fs.readFileSync(path.join(root, 'addons.json'), 'utf8'));
  assert.equal(path.resolve(saved.flavors.forever.addonsPath), path.resolve(game));
  assert.match(run({ root, names: [], write: false }).text, /Dry run/);
  const made = run({ root, names: [], write: true });
  assert.equal(made.code, 0, made.text);
  assert.ok(fs.existsSync(path.join(game, 'MyAddon')), 'the link exists');
  assert.match(run({ root, names: [], write: false }).text, /already linked/);
});

test('run: an undeclared addon is an error', () => {
  const { root } = setup();
  assert.equal(run({ root, names: ['Nope'], write: false }).code, 1);
});
