# Changelog

Each plugin's `version` in `plugins/<plugin>/.claude-plugin/plugin.json` goes up with every
release: Claude Code files an installed plugin by its version, so an update that keeps the same
number may never reach people who already installed it.

## wow-addon-dev 0.5.17 - 2026-10-10 (Finess's copy)

- `forever-techniques`: LibEditMode (Edit Mode integration, embeddable unmodified) and Mechanic
  (developer tooling with API stubs generated from the docs) added to the small finds.

## wow-addon-dev 0.5.16 - 2026-10-10 (Finess's copy)

- `forever-techniques`: Useful Plates and Tooltips (`usefulplates.md`, GPL-3.0, ideas only): the
  next-swing range trap, item range ladder, absorbs drawn by a StatusBar, combo points on the target;
  KSmartDebuff's per-button dispel containers re-filtered in place (own words).

## wow-addon-dev 0.5.15 - 2026-10-10 (Finess's copy)

- `forever-techniques`: BuffWarden (`buffwarden.md`, MIT): never ask for auras while secret, weapon
  enchants readable mid-fight, own talents readable through `C_Traits`, `UnitInRange` secret; small
  finds (Metails, ForeverRing, Datamine); ElvUI and Bleakfiber's addons excluded (an AGENTS.md
  forbidding AI reference use; a private-study-only license).

## wow-addon-dev 0.5.14 - 2026-10-10 (Finess's copy)

- `forever-techniques`: Priestly / Magely / LibGroupBuffs (`priestly-magely.md`, MIT): measured on
  70009, auras are unreadable in combat for every unit (index reads throw, by-name returns nil);
  Fortitude 3600 s; secure snippets broken; addon CVars not persisted across a full exit; talents
  unreadable. Cautions added where the catalog relied on aura reads in combat or state drivers.

## wow-addon-dev 0.5.13 - 2026-10-10 (Finess's copy)

- `forever-techniques`: the full list of 27 `C_Secrets` predicates (way E) from Forever's docs;
  flyPlateBuffsFixed (unit-comparison predicates, tests that mock secret mode) and DBM-PvP.

## wow-addon-dev 0.5.12 - 2026-10-10 (Finess's copy)

- `forever-techniques`: TellMeWhen (`tellmewhen.md`, GPL-3.0, ideas only): aura reading in
  restricted mode (lookups by identifier only; instance-ID reads error), combat-ready icons on aura
  containers, secret timers via a rule formatter; a caution added on `IsAuraFilteredOutByInstanceID`
  and `GetUnitAuraInstanceIDs` until measured.

## wow-addon-dev 0.5.11 - 2026-10-10 (Finess's copy)

- `forever-techniques`: SpellActivationOverlay (`spellactivationoverlay.md`: proc art on engine aura
  slots via `templateNames`), DoesItDie (`doesitdie.md`: comparing secret numbers with a StatusBar, a
  verified hidden/readable table, `curve:Evaluate(secret)` erroring), TrufiGCD, tullaRange; Arc Auras
  excluded (its license forbids reusing its methods).

## wow-addon-dev 0.5.10 - 2026-10-10 (Finess's copy)

- `forever-techniques`: ForeverAuras (`foreverauras.md`, GPL-2.0) and KethoDoc (`kethodoc.md`, MIT):
  Total Duration gates, centred secret rows, stand-ins; dumping the client; CVars that force addon
  restrictions for testing.

## wow-addon-dev 0.5.9 - 2026-10-10 (Finess's copy)

- `forever-techniques`: EverAuras (`references/everauras.md`, GPL-2.0, ideas only), a WeakAuras for
  Forever: **geometry gates** (NOT / time left / stacks / packing computed as engine-set sizes and
  clips), secret anchoring around aura buttons, learned aura IDs, and its ForeverDevInfo probes.

## wow-addon-dev 0.5.8 - 2026-10-10 (Finess's copy)

- `forever-techniques`: BetterBlizzFrames (in `betterblizzplates.md`) and Northern Sky Raid Tools
  (`northernsky.md`): Blizzard's unit frames run aura containers on Forever, secret hook arguments,
  tainted function attributes, formatting secret numbers in one call, secret text sizes, and
  `C_VoiceChat.SpeakText` taking secret text.

## wow-addon-dev 0.5.7 - 2026-10-10 (Finess's copy)

- `forever-techniques`: What's Training? (`whatstraining.md`), BetterBlizzPlates + AdvancedInterfaceOptions
  (`betterblizzplates.md`), WeaponSwingTimer (`weaponswingtimer.md`), Capping (in
  `battlegroundenemies.md`): Forever trainer prices, health thresholds via `UnitHealthPercent` and a
  curve, plate scale following the camera, `C_SwingTimer` by swing type (a possible wand / melee range
  rung for mages), enemy swing cadence without the combat log.

## wow-addon-dev 0.5.6 - 2026-10-10 (Finess's copy)

- `forever-techniques`: four open-license addons (`decursive.md`, `grid2.md`, `threatclassic2.md`,
  `battlegroundenemies.md`): engine-side dispel coloring of unit squares with every dispel-texture
  option, color curves on durations, secret alpha propagation, threat and the melee-range ratio,
  the battleground scoreboard as a never-secret roster, and `UnitName`'s PvP exemption (which
  conflicts with Mage Kit's measurement: to re-measure).

## wow-addon-dev 0.5.5 - 2026-10-10 (Finess's copy)

- `forever-techniques`: MiniAuras (`references/miniauras.md`, own words): every aura filter token
  with `!` negation (from Forever's `AuraUtil`), disjoint categories, out-of-range and visibility
  caveats, event-less unit states to poll, kick detection on secret GUIDs, a spell-flag scan probe,
  and a disagreement with Forever's source to measure.

## wow-addon-dev 0.5.4 - 2026-10-10 (Finess's copy)

- `forever-techniques`: TargetedSpells (`references/targetedspells.md`, GPL: ideas only): "is this
  cast aimed at me" with `PlayerIsSpellTarget`, AND of two secret booleans through nested
  `SetAlphaFromBoolean`, cast-ID pairing, 4-unit event registration, and why
  `nameplateShowOffscreen` matters for off-camera casts.

## wow-addon-dev 0.5.3 - 2026-10-10 (Finess's copy)

- `forever-techniques`: Enhance QoL's Forever build (`references/enhanceqol.md`, own words):
  engine-run aura animations, the aura button's full display kit (caster name, pandemic region and
  animations...), the per-aura filter test `IsAuraFilteredOutByInstanceID` (plain boolean),
  "cooldown finished" as an `OnCooldownDone` edge from an invisible engine cooldown, the damage
  meter on Forever, and where it disagrees with Cooldown Manager Centered (containers in combat).

## wow-addon-dev 0.5.2 - 2026-10-10 (Finess's copy)

- `forever-techniques`: Plater Nameplates on Forever (`references/plater.md`, own words): containers
  pre-created and lent to nameplates, OR logic as two groups, per-client `.toc` interface lines,
  feature detection by template. From Blizzard's container code: every candidate filter, the
  identity rule (spell-ID filters ignored, and include-groups emptied, for friendly debuffs and
  enemy buffs), sort methods, the processing policy, dispel-type borders. From Forever's settings:
  the Offscreen Nameplates option.

## wow-addon-dev 0.5.1 - 2026-10-10 (Finess's copy)

- `forever-techniques` grows from other addons' code, license-checked and summarized in our own
  words: the five ways to derive a conditional as the catalog's organizing principle; EllesmereUI's
  notes (`forevercoreskill.md`); every installed addon that allows reading (`addon-lessons.md`);
  the rules of hooking Blizzard's Cooldown Manager (`cooldown-manager.md`); and Cooldown Manager
  Centered's Forever build (`cooldown-manager-centered.md`: engine aura container rules, aura
  sounds the engine plays, curves on duration objects, hook points).
- From Forever's own docs: the fields Blizzard declares never secret (cooldown `isActive` /
  `isOnGCD`, battleground scoreboard names and classes...), and `ADDON_RESTRICTION_STATE_CHANGED`'s
  `Activating` state, an official last window before lockdown.

## wow-addon-dev 0.5.0 - 2026-10-10 (Finess's copy)

- New command `/wow-addon-dev:link`: links the workspace's addons into the game's
  `Interface/AddOns` (a junction on Windows: no administrator rights, no Developer Mode; a
  symlink elsewhere), so the game loads the copy you edit. The game folder is saved per client in
  `addons.json` (`flavors.<flavor>.addonsPath`, set with `--set-path`). Dry run first; a real folder
  or a link elsewhere is never touched.
- `new-addon` links the new addon itself when the game folder is known.

## wow-addon-dev 0.4.0 - 2026-10-09 (Finess's copy)

- New skill `forever-techniques`: what to BUILD on Forever, learned making Mage Kit. Reading what the
  game hides (aura filters with `GetUnitAuraInstanceIDs`, engine-drawn timers from duration
  objects, `SetAlphaFromBoolean`), full names, trainer service info; distance without a distance
  API (LibRangeCheck's Forever items as a ladder, measured switch points, trilateration from
  range-check flips and your own position); stealth and targeting awareness; secure buttons; and the
  frontier still to probe (engine radar, spoken alerts, CC on units, damage meter, secrecy
  predicates, color curves, rotation helper). Every entry: proof, status, date.

## wow-addon-dev 0.3.9 - 2026-10-09

More in `wow-forever-api`, measured on Forever between 2026-10-05 and 2026-10-09:

- Addon messages to your own group work outdoors. In a raid, `PARTY` only reaches your own
  subgroup, while `RAID` crosses subgroups, so pick `RAID` when `IsInRaid()`. Every message also
  comes back to you once, so drop your own.
- Dragging a panel that holds secure buttons is blocked in combat. If `StartMoving` is the script
  itself, BugGrabber blames `UNKNOWN()`. Refusing the drag while `InCombatLockdown()` and finishing
  it when combat ends was checked in game and leaves no error.

## wow-addon-dev 0.3.8 - 2026-10-09

One fact in `wow-forever-api`, checked by a player on Forever build 70291: an addon can open the
game's Keybindings page already scrolled to its own section, with
`Settings.OpenToCategory(Settings.KEYBINDINGS_CATEGORY_ID, <section name>)`. The section name is the
value of the global named in your `Bindings.xml` `category=`. The page ID only exists once the
game's settings have loaded, so read it on click. `GetBindingKey` plus `GetBindingText(key, 1)` show
the current key, and `UPDATE_BINDINGS` tells you when the player changed it on that page.

## wow-addon-dev 0.3.7 - 2026-10-09

One fact in `wow-forever-api`, read in Blizzard's API docs for Forever build 70291 and not seen in
game yet: a frame's strata can turn secret. `GetFrameStrata` may return a secret, and
`SetFrameStrata` now takes a secret from Blizzard's own code but not from an addon, the same rules
`GetFrameLevel` / `SetFrameLevel` already had. Code that copies a Blizzard frame's strata onto its
own frame should check `issecretvalue` first.

## wow-addon-dev 0.3.6 - 2026-10-07

Three more facts in `wow-forever-api`, measured the same day on Forever build 70245:

- `C_ChatInfo.SwapChatChannelsByChannelIndex(1, n)` works from addon code, even from a timer, and the
  new order survives a `/reload`. An addon whose hidden channel took `/1` can hand it back to the
  game's General. Compare the channel names only after checking they aren't secret (boss fights), and
  note that the chat colors aren't swapped.
- Guilds seem to cross the hidden realms: a character on one realm signed a guild charter offered by
  a character on the other. Guild chat between realms isn't measured yet.
- The game's friend list is back after a week off. Two characters on the same Battle.net still can't
  add each other.

## wow-addon-dev 0.3.5 - 2026-10-07

More on Forever's realms in `wow-forever-api`, measured the same day with three accounts:

- The game's own Trade channel is split by realm too. Two characters on different realms, side by
  side in Ironforge, had Trade member lists with no name in common and two unrelated conversations
  at the same moment. A Trade scanner only sees its own realm, and a line posted there only reaches
  that realm.
- The realm follows the account: every PvE character of an account sat on the same realm, whatever
  its race or faction. Grouping, a quest together and 30 minutes offline didn't move a character.
- The game keeps each character's channel numbers between sessions: a custom channel that took `/1`
  at the first login keeps it, so wait for a game channel on `/1` before joining.

## wow-addon-dev 0.3.4 - 2026-10-07

One more fact in `wow-forever-api`, measured on Forever build 70245 with three accounts:

- Realms still exist under the megaserver, and a custom channel only reaches your own underlying
  realm. Players pick PvE or PvP and the game assigns the realm, so two players in the same city
  can sit in two copies of the same channel while their whispers go through. `GetRealmID()` gives
  the realm (it's the server part of the GUID); `instanceID` is 0 in every copy, and no API lists
  the realms.

## wow-addon-dev 0.3.3 - 2026-10-05

One more fact in `wow-forever-api`, measured on Forever build 70205 with two accounts:

- An addon whisper longer than 255 bytes still returns `Success`, and the other side gets the
  first 255 bytes, with no error anywhere. A list cut that way can end with a wrong last item.
  Split anything that grows (ID lists, registries) into parts that each fit and read on their own.

## wow-addon-dev 0.3.2 - 2026-10-05

Three more facts in `wow-forever-api`, measured on Forever 1.60.1 with the same buff addon, this
time in a group and in a dungeon:

- For your own party, the unit token works in a macro conditional: `/cast [@party1,help,nodead]
  <spell>` buffs the member and leaves your target alone, which the by-name macro for strangers
  can't do. Nothing in secure code can check that `raid3` is still the same player, though.
- In a dungeon, your group's names and auras still read plainly through `partyN` / `raidN` out of
  combat (1644 aura reads, none unreadable).
- Which buffs came back "Target is too low level" on a level 2 player (Kings, Wisdom rank 1), and
  how an addon can learn that threshold per spell rank instead of hard-coding it.

## wow-addon-dev 0.3.1 - 2026-10-04

New facts in `wow-forever-api`, measured on Forever build 70205 while writing a buff addon:

- Nameplates are for reading, not for casting: friendly player plates are forbidden inside an
  instance; name, range and auras still read through a `nameplateN` token; a spell cast on that
  token is ignored without a sound. A `type="macro"` button that targets by full name
  (`/targetexact First Surname`) does cast on a stranger.
- Who cast a buff on someone else is `sourceUnit`; `isFromPlayerOrPlayerPet` means "a player",
  not "you".
- A `CLICK` key binding declared in `Bindings.xml` works.
- Spell ranks still exist (read auras by name); a refused spell comes as the generic
  `ERR_SPELL_FAILED_S`, the reason being in the text.

## dev-workflow-core 2.0.0 - 2026-10-04

First public version. The 1.x line lived in a private marketplace, in French; this one is the same
code with its messages, docs and records in English.

- Hooks: the project's checks before Claude hands back (`testGuard`), files and functions measured
  after every write (`fileSizeGuard`), writes to read-only paths blocked (`readonlyPathGuard`), a
  warning before editing a file that changed on origin (`coordinationGuard`). All off until a
  project has a `.claude/dev-workflow.json`.
- `/dev-workflow-core:setup-project`, the `feature-spec` and `human-verification` skills, the
  `spec-updater` and `docs-consistency-auditor` agents.
- Coming from 1.x: size baselines with French keys (`[FICHIER]`, `[FONCTION] name`) still work, they
  are read as `[FILE]` and `[FUNCTION] name`. `braces.js --porcelain` moved to contract 2: its
  records are now `CONTRACT`, `FILE`, `FUNCTION`, `UNREADABLE`, `UNKNOWN-DIALECT`, so a script that
  looks for `CONTRAT` will report the analysis as not done until it's updated. The Stop hook is now
  `stop-test-guard.js` (`node --test` took `test-guard.js` for a test file and waited on its stdin
  forever). The `apiReference` hooks (generated API corpus for Unity/IL2CPP projects) are not part
  of this version.

## wow-addon-dev 0.3.0 - 2026-10-04

- `/wow-addon-dev:patch-diff`: after a patch, what changed in Blizzard's UI code (a Gethe clone in
  `Documentation/wow-ui-source-<branch>`, the branch picked from your addons' client) and where your
  addons use it. Globals set and removed functions first, then the documented API, the files to
  read, weak clues. `--mark` records the build as reviewed. Replayed on Forever builds
  70124 → 70170: same report as the tool it comes from, `WOW_PROJECT_ID` at the top.

## wow-addon-dev 0.2.2 - 2026-10-04

- macOS: Elune runs. Its macOS build can't find `lib/liblua5.1.dylib` on its own ("Library not
  loaded"); the checks now start it with that folder in `DYLD_LIBRARY_PATH`.
- The tests run on Windows, Linux and macOS for every change, with the real Elune archives.
- Issue forms: "Something doesn't work" and "Claude got WoW wrong".

## wow-addon-dev 0.2.1 - 2026-10-04

- Elune is found the way its archives come: unzipped as is into `tools/elune` (the
  `elune-3.1-<system>/` folder inside can stay), and as `bin/lua5.1` on macOS and Linux. Before,
  only `tools/elune/bin/lua` was looked for, which none of the archives give you.

## wow-addon-dev 0.2.0 - 2026-10-04

First public version.

- `/wow-addon-dev:init` declares the addons already in a folder in `addons.json`, with the client
  each one targets read from its `.toc`.
- `/wow-addon-dev:check`: Lua 5.1 syntax with Elune, `.toc` files, size, translations, headless
  tests.
- `/wow-addon-dev:new-addon` creates an addon that passes those checks.
- Skills `wow-forever-api`, `workspace`, `curseforge-copy`; agents `wow-api-lookup` and
  `api-gotcha-reviewer`.
