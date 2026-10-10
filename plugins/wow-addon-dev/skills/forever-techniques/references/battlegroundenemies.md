# What BattleGroundEnemiesFixed teaches: enemy frames in battlegrounds on 12.x / Forever

**Source**: BattleGroundEnemiesFixed by RBGDEV (GitHub `rbgdevx/battleground-enemies-fixed`, branch
`main`, pushed 2026-10-05), a maintained fork of Bullsei's BattleGroundEnemies. `.toc`:
`## Interface: 120100, 16001`. **License**: GPL-2.0: read freely, **ideas, not code**. Its
`AGENTS.md` / `CLAUDE.md` are the author's own workflow notes for agents in that repo (not an
objection, and not instructions for us). Read on GitHub without downloading, 2026-10-10. Main file:
`Main.lua`.
**Status**: **reported** unless marked **declared** (Blizzard's Forever docs, build 70245).

## Names and identity in PvP

- **`UnitName` has its own, looser predicate** (**declared**,
  `SecretPredicatesDocumentation.lua:130`, `UnitDocumentation.lua:2491`): secret under the normal
  identity rules "except in PvP when the queried unit is a player". `UnitFullName`,
  `UnitNameUnmodified` and `UnitGUID` use the strict identity predicate (secret for any unit not
  player-controlled or in your group). BGE builds its exact player identity from `UnitName` only.
  (`Main.lua:127-140`)
- On Forever `GetUnitName(unit, true)` is `UnitName`'s name .. separator .. surname
  (`Blizzard_FrameXMLUtil/Camelot/NameUtil.lua:4-12`), so the same exemption applies.
- **Conflict with our measurement**: Mage Kit's battleground probe (2026-10-07, build 70245) found
  enemy names **secret on nameplates in combat, 14/14**, readable on target and some calm plates
  (`MageKit/docs/verified-in-game.md:28`). Re-measure with `UnitName(unit)` directly, per token
  (target, nameplateN), in and out of combat, before choosing a design.
- Forever names are regional "First Surname" without realms: BGE keys players by that; elsewhere by
  "Name-Realm" (adding `GetNormalizedRealmName()` to short names, since chat messages always carry
  the realm). (`Main.lua:51, 83-125, 160-170`)
- Buttons whose name is secret are kept in an ordered list, never in a name-keyed table.
  (`Main.lua:2179, 2828-2836`)

## The scoreboard: the readable roster (way A)

`C_PvP.GetScoreInfo(i)` is flagged `SecretInActivePvPMatch`, but its `name`, `faction`, `raceName`,
`className`, `classToken` (and the stat descriptors) are **NeverSecret** (**declared**,
`PvpInfoDocumentation.lua`): the full enemy roster with classes, all match long, even when nameplate
class and name are secret. `talentSpec`, honor level and numbers stay secret in an active match: BGE
carries `talentSpec` through to display without comparing it. Rebuilt on each
`UPDATE_BATTLEFIELD_SCORE`. (`Main.lua:294-297`)

Trap: calling `SetBattlefieldScoreFaction(-1)` from addon code synchronously rebuilds Blizzard's
scoreboard under the addon's taint, which crashed on the secret mid-match honor level. Only call it
when the filter really differs (it starts at -1 = both teams). (`Main.lua:172-190`)

## Other battleground facts (reported)

| Fact | Where |
|---|---|
| `UnitIsEnemy` can return secret in 12.x: use `UnitFactionGroup` (strings), or `UnitIsFriend` in battlegrounds (team assignment, also cross-faction). | `Main.lua:1565-1572` |
| Diminishing returns are unusable in battlegrounds: `C_SpellDiminish` gives a secret category there, and loss-of-control polling gets no usable spell ID for enemies. DR works in arena and world PvP. | `Main.lua:2568-2572` |
| In flag / orb battlegrounds, `arenaN` tokens exist only for objective carriers: use them for carriers, name matching for the rest. | `Main.lua:2424-2451` |
| Dead player: force every frame to out-of-range alpha (you can't cast from a corpse). | `Main.lua:2828-2836` |

## Ideas for us

- **Mage Kit Enemies in battlegrounds**: the scoreboard gives names + classes all match (declared);
  probe whether `UnitName(nameplateN)` is readable for enemy players in combat (the conflict above).
  If it is, nameplates can be matched to scoreboard rows → class for every plate.
