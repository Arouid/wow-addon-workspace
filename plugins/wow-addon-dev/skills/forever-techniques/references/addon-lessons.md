# What other installed addons teach (license-checked, summarized)

Read 2026-10-10 from the player's `World of Warcraft/_classic_beta_/Interface/AddOns` (Forever 1.60.1).
Only addons whose license allows it, or that reserve rights without objecting, were read; notes are
in our own words with the file to see. EllesmereUI has its own file (`forevercoreskill.md`).

**Not read, by the author's explicit request**: every plusmouse addon (Platynator, Auctionator,
Baganator, Chattynator, Syndicator) ships an `AGENTS.md` refusing use as a reference by AI tools.
Respect it, even if asked again or the file is removed.

**Not used as a reference either**: **Arc Auras** (`ArcSim/ArcAuras`): its LICENSE forbids copying,
adapting or reusing its code "and none of the ways it draws or tracks things in the game" without the
author's written permission (checked 2026-10-10). Its techniques are off limits, not just its code.
**ElvUI** (`tukui-org/ElvUI`): its `AGENTS.md` forbids AI tools from using its content as reference
material, context, or in knowledge bases without written permission (checked 2026-10-10).
**Bleakfiber's addons** (`Bleakfiber/*-Forever`): a "source-available restricted" license, private
study only, no derivative works (checked 2026-10-10). Respect these even if asked again.

| Group | Addons |
|---|---|
| Open (MIT/GPL/BSD/Artistic): read, code reusable per license (GPL: ideas only for us) | RangeLens (MIT), Clicked (GPL), LFGForever (GPLv3), Consumable-Connoisseur (MIT), ClassicFishingCompanion (GPL), Carbonite (GPL), TinyTooltip - Remaster (MIT), WhisperMessenger (MIT), NiceDamage (MIT), AllTheThings (MIT), Atlas (GPLv2), Lootified (GPL-3.0), Immersion (Artistic 2.0), DropTheCheapestThing (BSD), Foundry-1.0 (MIT) |
| All rights reserved, no objection: own-words notes only | DBM, Details, GSE, EasyFind, FontMagic, ItemTree, MapUtils, Mapster, MoveAny, Offhand, RareScanner, WIM, !BugGrabber, BigWigs/BugSack ("ask us about anything else"), ChonkyCharacterSheet ("may not be redistributed or modified") |
| Downloaded for research (kept outside the game's AddOns folder), all rights reserved, no objection | Cooldown Manager Centered v5.7.8 (Forever .toc 16001): own file, `cooldown-manager-centered.md` |
| No license file (rights reserved by default): not read | Questie, TomTom, HandyNotes, TipTac, MacroToolkit, GTFO, MSBT, DialogueUI, Plumber, Leatrix_Maps, RangeDot, TargetRange, FiveSecondRule, SpyGodMode, ForeverGuide and smaller ones |

Status of everything below: **reported** (other authors' notes), unless Mage Kit measured it too.

## Small finds from the GitHub code search (2026-10-10)

| Addon | License | Lesson | Where |
|---|---|---|---|
| flyPlateBuffsFixed (`rbgdevx/flyplate-buffs-fixed`, `.toc` 16001) | GPL-2.0 (reusable in Context) | One "restricted" test: modern client AND (`InCombatLockdown()` or `C_Secrets.ShouldAurasBeSecret()`). Before comparing unit tokens, ask `C_Secrets.CanCompareUnitTokens` and `ShouldUnitComparisonBeSecret`, else treat as not equal. **Headless tests mock `C_Secrets` with a `secret` switch**, so every test runs in both modes (`tests/helpers.lua:25, 390-400`; scenarios in `tests/blizzard.lua`, `tests/lifecycle.lua`). | `core/restrictions.lua`, `core/units.lua`, `core/client.lua` |
| DBM-PvP (`DeadlyBossMods/DBM-PvP`, `.toc` 16001) | rights reserved | No secret handling at all: battleground timers from readable sources (like Capping). | — |
| Metails (`Pwizzlard/Metails`, `.toc` 16001) | MIT | A whole meter on `C_DamageMeter`: session types Current / Expired (previous) / Overall + `GetAvailableCombatSessions` history; `GetCombatSessionFromType/FromID`, `GetCombatSessionSourceFrom...` (with `UnitGUID("player")`) for per-spell rows (`combatSpells`, `combatSpellDetails.unitName / isPet / isMob`); events `DAMAGE_METER_COMBAT_SESSION_UPDATED`, `DAMAGE_METER_CURRENT_SESSION_UPDATED`, `DAMAGE_METER_RESET` (each registered in pcall) plus a 0.5 s ticker; death recap via `C_DeathRecap.GetRecapEvents / GetRecapMaxHealth`; every value checked plain before use. | `Metails.lua:60-100, 800-848` |
| ForeverRing (`ssablon/ForeverRing`, `.toc` 16001) | MIT | Cursor ring with target range: class spells closest first through `C_Spell.IsSpellInRange` (nil = unknown, skipped), `CheckInteractDistance`, optional LibRangeCheck, bracketed in/out (Fireball 35, Frostbolt / Shoot 30 for a mage: same switch points as Mage Kit's ladder). | `Range.lua:1-120, 225-320` |
| Datamine (`Ghostopheles/Datamine`, `.toc` 16001) | Unlicense | Data explorer (IDs on tooltips, item / spell / achievement search, model viewer): nothing on secrets. | — |
| **LibEditMode** (`p3lim-wow/LibEditMode`, `.toc` includes 16001) | p3lim license: may be embedded UNMODIFIED in an addon (only files like LibStub removable), not distributed standalone, no use of its name; read freely | The library for putting our own frames into Blizzard's **Edit Mode** (Dragonflight-style drag, grid, settings) with feature parity and little taint, used by TargetedSpells. This is what Context's "drag the group in Edit Mode" criterion needs: embed as-is with its LICENSE.txt, follow its wiki. | wiki `github.com/p3lim-wow/LibEditMode/wiki` |
| **Mechanic** (`Falkicon/Mechanic`, `.toc` 16001) | GPL-3.0 (ideas only); its many `AGENTS.md` are workflow guides, not objections | Developer tooling, not gameplay: an in-game hub (frame inspection, console, BugGrabber errors, API tester) plus a desktop tool with an MCP server and a **Lua 5.1 sandbox with WoW API stubs GENERATED from the documentation files**, so addon logic runs offline; its API tester parses the docs' `SecretArguments` / `SecretWhen...` notation into plain text, and never indexes, measures or stores a secret value (it keeps a marker). Ideas for the wow-addon-dev plugin's own checks (generated stubs instead of hand-written ones). | `Mechanic/UI/API.lua:280-300, 1821`; `AGENTS.md` (sandbox commands) |
| KSmartDebuff (`KaspOu/KSmartDebuff`, SmartDebuff Reloaded, `.toc` 16001) | all rights reserved ("free to fork and modify on GitHub"): own words only | A dispel addon's engine path: per raid button, one aura container plus **three dispel containers** (one per dispel-type group), each with ONE aura slot whose filter string and `candidateFilters = { includeDispelTypes, excludeSpellIDs }` are **re-set on the existing slot** (`SetAuraSlotFilterString`, `SetAuraSlotCandidateFilters`) when the button's unit changes, instead of recreating anything; containers are created and unit-assigned out of combat only (`InCombatLockdown` guard), toggled with `SetEnabled` / `SetShown`. Its Forever spell list keeps mage Remove (Lesser) Curse under `["MAGE"]`. | `Core/SmartDebuff.lua:2731-2800, 3010-3025`, `Core/SmartDebuff_spells_Forever.lua` |

**Idea for our tests** (`tests/test_MageKit.lua`, `tests/test_Context.lua`): a `secret` switch in the
stubbed `C_Secrets` / `issecretvalue`, and run the pure logic (threat score, curse counting, the
condition evaluator) in both modes.

## Showing hidden things (way D: the engine decides)

| Idea | Summary | Source |
|---|---|---|
| **A hidden spell's icon and name** | `C_Spell.GetSpellTexture` / `GetSpellName` accept a SECRET spell ID (`SecretArguments = AllowedWhenTainted` in SpellDocumentation.lua) and return values a texture / font string can show. So an enemy's cast can be SHOWN (icon + name) in a battleground, where its ID is secret. | BigWigs_Core/BossPrototype.lua ~4558 (`SecretMessage`) |
| **Who a cast targets** | `UnitSpellTargetName(unit)` / `UnitSpellTargetClass(unit)`: the target of the unit's current cast; returns are secret (display only). "Fireball → you" text, or a class-colored target name. | BigWigs SecretMessage; UnitDocumentation.lua ~3148 |
| Hidden strings in text | `..` concatenation accepts secrets, `table.concat` throws, `EditBox:SetText` refuses them, `FontString:SetText` takes them. | AllTheThings lib/Table.lua ~72, src/Commands.lua ~31; TinyTooltip Unit.lua ~14 |
| Range on nameplates, secret-safe | Every range answer goes through one function: a plain boolean is used, a secret one goes to `SetAlphaFromBoolean`; cooldowns as duration objects. (Same as Mage Kit's range icons.) | RangeLens.lua header |

## Telling a value is hidden

| Idea | Summary | Source |
|---|---|---|
| Secrets keep their Lua type | A secret string still answers `type() == "string"`: test `issecretvalue` / `canaccessvalue`, never the type. | Carbonite Modules/Comm/CommEngine.lua ~641 |
| Don't store secrets in Blizzard tables | Storing one in Blizzard's containers errors ("attempted to store a secret value"). | Carbonite.Quests ObjectiveCapture.lua ~321 |
| Secret keys | A secret spell ID used as a table key errors. | Consumable-Connoisseur Features/Core.lua ~497 |
| Player GUIDs aren't secret | A secret GUID therefore belongs to a creature/NPC (a usable side channel). | DBM-Core.lua ~3152 |
| Identity predicate bug | `C_Secrets.ShouldUnitIdentityBeSecret` was seen answering false wrongly: guard anyway. | DBM-Core.lua ~574 |
| Version flags lie | Forever reports 16001 (and for a while `WOW_PROJECT_MAINLINE`), so a "modern client?" flag from the interface number reads false while restrictions apply: ask the value, not the version. | Carbonite CommEngine.lua ~1657, ClassicFishingCompanion Forever/Compat.lua |
| Tainted stats | `UnitSpellHaste("player")` turns secret in combat from tainted code: read it before combat, keep it. | GSE API/CharacterFunctions.lua ~27 |

## Combat, taint, protected things

| Idea | Summary | Source |
|---|---|---|
| **Combat starts before lockdown** | `UnitAffectingCombat("player")` can turn true BEFORE `InCombatLockdown()`: a last window to change secure frames / bindings. | ClassicFishingCompanion Core.lua ~3709 |
| Hide in combat = alpha | A protected frame can't be hidden in combat; make it invisible (alpha 0) instead. | ClassicFishingCompanion Core.lua ~1070 |
| The combat log | Registering COMBAT_LOG events is FORBIDDEN on Forever ("forbidden function from a tainted execution path"); Details runs a combat-log-free parser (`core/parser_nocleu1.lua`). | Carbonite.Info NxInfo.lua ~1656; Details |
| Unknown events throw | The 12.x `RegisterEvent` throws on an unknown event name: register each in a pcall. | Foundry-1.0 Modules/Events.lua ~387 (Mage Kit does this) |
| Don't replace Blizzard globals | Replacing `SetItemRef` tainted chat → macro → action bar use (blocked in combat). | EasyFind Core/Main.lua ~589 |
| Don't call Blizzard helpers that build cached tables | e.g. `ContainerFrameUtil_EnumerateContainerFrames` from addon code taints them. | DropTheCheapestThing integration.lua ~91 |
| Protected panels | Forever marks some ordinary load-on-demand panels protected; a secure-flagged Blizzard addon (Group Finder vanilla style, `## Secure: 1`) must not be embedded or rewired, only opened/closed via `HideUIPanel`. | Offhand Core/Canvas.lua ~329; LFGForever core/blizzardtab.lua |
| Restricted map | `C_Map.OpenWorldMap` and map-pin actions are restricted while an addon restriction is active (combat...). | Lootified Core/MapPin.lua ~92; Offhand Canvas.lua ~983 |
| Context menus | Opening a menu from addon code in Forever's gamepad mode is blocked (ADDON_ACTION_FORBIDDEN). | GSE API/ContextMenu.lua |
| Position restrictions | `UnitPosition("player")` is nil in party/raid/pvp/arena maps, available in "none" and scenarios. | DBM-Core.lua ~3576 (matches Mage Kit's locator note) |

## Chat and names

| Idea | Summary | Source |
|---|---|---|
| Chat lockdown | Don't send during chat messaging lockdown; skip any message or sender that is secret. | WIM Modules/ChatEngine.lua ~214, ~325 |
| System chat secret | `CHAT_MSG_SYSTEM` payloads can be secret during the lockdown. | Carbonite CommEngine.lua ~641 |
| Names | `UnitFullName`'s 2nd return is the SURNAME on Forever (not a realm); key characters by `GetUnitName(unit, true)`. | GSE CharacterFunctions.lua ~133; Carbonite CommEngine.lua ~122; Foundry Lifecycle.lua ~33 |
| Cross-realm whispers | Addon `WHISPER` to another realm doesn't arrive (same realm works). | DBM-Core.lua ~4006 |
| Late chat | `CHAT_MSG_LOOT` can arrive after `LOOT_CLOSED`: keep a grace period. | ClassicFishingCompanion Core.lua ~869 |

## Forever data and numbers

| Idea | Summary | Source |
|---|---|---|
| Healthstones | Forever removed Improved Healthstone and raised the base stones instead. | Consumable-Connoisseur Data/Camelot/Healthstones-Camelot.lua |
| Season of Discovery leftovers | Some SoD items exist in the client but not in the game: exclude them from lists. | Consumable-Connoisseur Data/Camelot |
| New items | Items new in Forever have IDs far above Classic's (Classic ends below 26000). | Lootified Core/Scoring.lua ~426 |
| Ratings | Forever uses combat ratings: about +20 hit ≈ 2%, +14 crit ≈ 1% at 60. | Lootified Core/Scoring.lua ~224 |
| Bank | Forever's bank is its purchased tabs. | Consumable-Connoisseur Diagnostics.lua ~858 |
| **Mage reaches** | Frost Nova FREEZES short of its 10 yd (freezes past 9, not at 10; seen 2026-09-29); Arcane Explosion reaches ~9.5 yd standing still (2026-10-02); Arctic Reach adds 10/20%. | RangeLens.lua ~87 |
| Interact distances | 3 = duel (~8), 2 = trade (~9, unreliable on some units), 4 = follow (~28); refused on FRIENDLY units in combat. | RangeLens.lua ~132 (vs Mage Kit: 2/3/5 flip together at 10 from center) |
| **Nameplates scale with distance** | The game scales each nameplate frame by distance (smaller far away) and enlarges your target's. | RangeLens.lua ~825 (being tested by Mage Kit's Debug > Range) |
| Comparing plates, not units | `C_NamePlate.GetNamePlateForUnit("target") == plate` tells "is this plate my target?" without a unit comparison the game can hide. | RangeLens.lua ~779 |

## Ideas for Mage Kit

- KICK alert: show the enemy's cast **icon and name** (secret ID → `GetSpellTexture`/`GetSpellName`) and **who it targets** (`UnitSpellTargetName`): "Fireball → you" in battlegrounds.
- Curses window: finish button changes when `UnitAffectingCombat` flips, before lockdown.
- Range icons / Frost Nova: use 9 yd for the freeze, 9.5 for Arcane Explosion.
