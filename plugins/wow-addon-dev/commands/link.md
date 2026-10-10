---
description: "Link the workspace's addons into the game's Interface/AddOns folder, so the game loads the copy you edit (no copying, /reload to see changes). Junctions on Windows (no admin needed), symlinks elsewhere. Remembers the game folder per client in addons.json. Dry run first; --write makes the links."
argument-hint: "[addon ...] [--write] | --set-path \"<game>/Interface/AddOns\" --flavor <flavor>"
allowed-tools: Bash(node:*)
---

# Link addons into the game

Run, from the workspace folder (the one holding `addons.json`):

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/link.js" $ARGUMENTS
```

1. If an addon says **no game folder** for its client: ask the player where the game is, find its
   `Interface/AddOns` for that client (WoW: Forever's beta: `<World of Warcraft>/_classic_beta_/`,
   retail `_retail_`, Classic Era `_classic_era_`), then run with
   `--set-path "<that folder>" --flavor <flavor>`. It's saved in `addons.json`
   (`flavors.<flavor>.addonsPath`) for every later link.
2. Relay the plan in one line per addon: already linked, will link, or left alone (a real folder or
   a link elsewhere is never touched: say what to do about it).
3. On the player's go, run again with `--write`.
4. A brand-new addon needs a **game restart** (the game lists its addons at startup); after that,
   `/reload` picks up every edit.

`/wow-addon-dev:new-addon` links the new addon itself when the game folder is known.
