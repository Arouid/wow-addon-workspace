# What MiniAuras teaches: CC, kicks and aura filters on Forever

**Source**: MiniAuras (formerly MiniCC) by Verz / Verubato, GitHub `Verubato/mini-auras`, branch
`main` (pushed 2026-10-08), v5.43.1. Its `.toc` says `## Interface: 120100, 16001`: it loads on
Forever. **License**: no license file (only bundled libraries have one); CurseForge declares
**All Rights Reserved**; no AI objection anywhere. Notes in our own words with file:line references,
**no code copied**. Read on GitHub without downloading, 2026-10-10.
**Status**: **reported** unless marked **declared** (in Blizzard's Forever source / docs, build 70245).

## Aura filter strings: the full vocabulary (declared)

From Forever's `Blizzard_FrameXMLUtil/AuraUtil.lua:270-296`: `HELPFUL`, `HARMFUL`, `PLAYER` (cast by
you or your pet / vehicle), `RAID` (buffs you can give, debuffs you can dispel), `CANCELABLE`,
`INCLUDE_NAME_PLATE_ONLY`, `MAW`, `EXTERNAL_DEFENSIVE`, `CROWD_CONTROL`, `RAID_IN_COMBAT`,
`RAID_PLAYER_DISPELLABLE` (someone in your group can dispel it), `BIG_DEFENSIVE`, `IMPORTANT`,
`DISPELLABLE` (dispellable by anyone). A leading **`!` negates** a token (`!PLAYER` = not yours;
`NOT_CANCELABLE` became `!CANCELABLE`); `INCLUDE_NAME_PLATE_ONLY` and `MAW` can't be negated.
`AuraUtil.IsValidFilterString(s)` checks a string.

MiniAuras' rules for using them (`src/Core/Auras/AuraFilters.lua`):
- **Tokens combine with AND, never OR**: each category needs its own group; several groups on one
  container render as one continuous row. (`AuraFilters.lua:70-71`)
- **Make categories disjoint with `!`**: CC = `HARMFUL|CROWD_CONTROL`; external defensives =
  `HELPFUL|EXTERNAL_DEFENSIVE|!BIG_DEFENSIVE`; important = `HELPFUL|IMPORTANT|!BIG_DEFENSIVE|!EXTERNAL_DEFENSIVE`,
  so an aura is drawn exactly once, in priority order. (`AuraFilters.lua:76-88`)
- **Disarms have no flag** at all: no token and no scan finds them; only a hand-made spell-ID list
  can, which makes that category enemy-only (identity rule). (`AuraFilters.lua:44-46, 78-83`)
- **Out-of-range units break the flag tokens**: for a unit out of range, tokens like CROWD_CONTROL
  stop being evaluated correctly and the group fills with unrelated buffs; an `includeSpellIDs` list
  fixes it where the identity rule allows. (`AuraFilters.lua:12-16`)
- **`PLAYER` / `isFromPlayerOrPlayerPet` need the unit visible**: for a group member outside your
  visible world the engine can't attribute the caster, and the check is silently skipped: gate on
  `UnitIsVisible(unit)`. (`AuraFilters.lua:91-94`)
- Candidate-filter tables are kept read-only and shared: the engine keeps the reference it's given.

**Disagreement to measure**: MiniAuras says that where the identity rule blocks spell-ID maps
(debuffs on friends, buffs on enemies) "the map is skipped and every aura passes"
(`AuraFilters.lua:24-26`). Forever's source (build 70245, `Blizzard_AuraContainerUtil.lua:105-110`)
REJECTS every aura of a group whose `includeSpellIDs` can't apply, and only skips `excludeSpellIDs`.
Either the client changed or one reading is wrong: probe it before relying on either.

## States with no event (way C: poll)

Four unit states change what the engine does with a filter, and no event announces them: a friendly
unit turning attackable (duel), a unit leaving / re-entering the visible world, a unit becoming
charmed (mind control), and whether you can assist it. MiniAuras polls them per watched token
(shared baselines, one read per token per tick) and rebuilds the containers on a flip; unrelated
events only bring the next poll forward. (`src/Core/Events/UnitStatePoller.lua:1-37`)

## Kicks (ways A and B)

- One interrupted cast arrives as several stop events, with the interrupter at a different argument
  position per event; `UNIT_SPELLCAST_INTERRUPTED` and `..._CHANNEL_STOP` can both fire for one kick:
  the first claims it, the rest are ignored until the unit starts casting again.
  (`src/Core/Kicks/KickEvents.lua:4-56`, `src/Modules/EnemyKickTracker/Observer.lua:21-23`)
- **The interrupter GUID is secret in instances, but nil vs not-nil is readable**: nil = the cast
  simply ended; present = it was kicked. Then `UnitNameFromGUID(guid)` and `UnitClassFromGUID(guid)`
  take the secret GUID and return secret name / class for display only (**declared**,
  `UnitDocumentation.lua`). (`KickEvents.lua:8-9, 23-24, 43-48`; `Observer.lua:52-63`)
- Your own kick: remember when you cast one; the first interrupt within a short tolerance is yours.
  An ally's: inferred from the party's known interrupt spells (by spec / class), snapshotted.
  (`src/Core/Kicks/KickTracker.lua:15-58`)
- Nameplate tokens churn as the camera turns; frames can't be freed, so keep one event frame per
  token and reuse it. (`KickTracker.lua:21-23`)

## A probe pattern: scan the game's own spell flags (way E at scale)

`C_Spell.IsSpellCrowdControl(id)` and `C_Spell.IsSpellImportant(id)` (**declared**) flag spells.
MiniAuras' dev tool walks every spell ID (up to 1,400,000, 20,000 per frame, `DoesSpellExist` first),
out of combat in the open world (the flags can be secret in combat or instances: a non-zero
"secret" count means the list is incomplete), and writes the hits to a SavedVariable, read back after
`/reload`; an offline Lua script then turns them into curated lists, matching by the name of the
aura that LANDS (not the button or the talent). (`scripts/ScanSpellFlags.lua:1-19, 20-110`,
`scripts/GenerateAuraCategoryIds.lua:1-18`)

## Ideas for us

- **Mage Kit PlateAuras**: our CC / DEF badges use `HARMFUL|CROWD_CONTROL` and `HELPFUL|BIG_DEFENSIVE`
  on nameplates: check them on far plates (the out-of-range token problem); add
  `HELPFUL|EXTERNAL_DEFENSIVE|!BIG_DEFENSIVE` (BoP / Pain Suppression style) as its own badge.
- **Mage Kit Curses**: `HARMFUL|RAID` (yours to dispel) vs `HARMFUL|RAID_PLAYER_DISPELLABLE` (someone
  in the group can) vs `HARMFUL|DISPELLABLE`; gate `PLAYER`-based checks on `UnitIsVisible`.
- **Mage Kit KICK**: "kicked vs ended" from the interrupter's nil-ness; show the kicker's name/class.
- **Mage Kit probe**: a spell-flag scan for Forever's IDs (CC / important), out of combat, to
  SavedVariables; and a probe for the include-filter disagreement above.
