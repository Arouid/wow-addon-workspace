# What DoesItDie teaches: comparing two secret numbers with a StatusBar (+ TrufiGCD, tullaRange)

**Source**: DoesItDie by Swirllyman, GitHub `swirllyman/DoesItDie`, branch `main` (pushed 2026-09-29),
Forever-only (`## Interface: 16001`), plus its diagnostic addon **WillItDieProbe**. **License**: MIT
(`LICENSE`); its `CLAUDE.md` is a project guide (no objection). Code reusable in Context and Mage
Kit with its notice. Read on GitHub without downloading, 2026-10-10. Its `CLAUDE.md` holds a table of
facts the author **verified in game on the 1.60.1 beta**.
**Status**: **reported** (the author's measurements; dated where noted).

## The author's verified table (1.60.1 beta)

| Hidden (secret or erroring) | Readable |
|---|---|
| Target health / max health — **even out of combat** | your own casts (`UNIT_SPELLCAST_SUCCEEDED / SENT`, with the cast GUID) |
| your spell power and attack power (in combat) | spell descriptions (`C_Spell.GetSpellDescription`: damage, school, duration) |
| auras on the target (reading them errors) | **`UNIT_COMBAT` damage amounts, school, crit flag, dodge / miss...** |
| **combo points** | enemy GUIDs |
| some Blizzard frames' strata / level | your stats out of combat |

- Registering `COMBAT_LOG_EVENT_UNFILTERED` is forbidden: a "blocked action" popup **even under
  pcall**.
- **`curve:Evaluate(secret)` ERRORS from addon code**, even out of combat ("Secret values are only
  allowed during untainted execution"), tested 2026-09-24. Secrets reach a curve only through
  Blizzard functions that take the curve (`UnitHealthPercent(unit, false, curve)`,
  `duration:EvaluateRemainingDuration(curve)`, `GetAuraDispelTypeColor(unit, id, curve)`).
  (`CLAUDE.md`, `DoesItDie/Execute.lua:1-16`)

## Comparing A ≥ B when both are secret (way D, geometry)

A `StatusBar` accepts secret min / max / value, so the WIDGET does the comparison:
- **Damage marker**: a bar with max = the target's max health and value = the remaining DoT damage,
  laid over the health bar: if the health ends inside the marker, the DoTs will kill.
- **Kill icon**: a **10,000 px StatusBar** (max = current health, value = remaining damage) inside a
  small clipping frame on the portrait; the icon rides the end of the fill and enters the clip only
  when the fill reaches 100 %, i.e. **damage ≥ health**. No Lua ever compares.
- Execute range (fixed %): either the same geometry, or `UnitHealthPercent` + a step curve; the
  probe `/did exec` compares them (with the caveat that `UnitHealthPercent` may answer 0-1 or 0-100:
  calibrate on the player's own readable percent).
(`CLAUDE.md` "Consequences for the design"; `DoesItDie/Execute.lua:1-16, 125-195`)

## Numbers from events instead of auras (way B)

- On your cast: parse the spell description for damage, school and duration; the target is the mob
  targeted at `UNIT_SPELLCAST_SENT` (matched by cast GUID), since tab-dotting players have moved on by
  the time the instant's success event arrives.
- Ticks: `UNIT_COMBAT` damage on the target, matched to DoTs by school, timing (first tick within
  ~0.1 s; projectile DoTs start on impact) and size; a crit is 1.5-2× a tick; the observed tick size
  replaces the description's number (descriptions leave out spell power). Uneven DoTs (Agony) use per-
  tick factors measured in game.
- **Combo points are secret, so they're COUNTED** from builders ("Awards N combo point"), minus dodges
  and misses, reset on finishers and target changes.
- The same hit arrives for `target`, `nameplateN` and `softenemy`, not all with readable GUIDs.
(`DoesItDie/DoesItDie.lua:1-64, 194`; `CLAUDE.md` "How the tracking works")

Data and tests worth copying as ideas: a scraper of Forever's class spellbooks (from
foreverchanges.pro) and Python tests that run the real Lua parser (via `lupa`) on every tooltip,
plus scripted-fight replays of real in-game logs (`tools/`).

## TrufiGCD and tullaRange (MIT, `.toc` 16001)

- **TrufiGCD** (`Trufi/TrufiGCD`): on restricted clients it registers cast events for `"player"` only
  (other units' cast data is restricted), and skips events whose unit, cast ID or spell ID is secret:
  "even player casts can have spell-specific secrecy overrides". (`TrufiGCD.lua:55-90`)
- **tullaRange** (`tullamods/tullaRange`): action-button range colouring from plain data:
  `IsActionInRange`, `C_Spell.IsSpellUsable`, a post-hook on `ActionButton_UpdateRangeIndicator`,
  and hooks on each button's `UpdateUsable` / `StartFlash`. No secret handling needed.

## Ideas for us

- **Context / Mage Kit**: "A ≥ B" between two secret numbers = a long StatusBar + a clip. E.g.
  "target health below my Fire Blast damage" (a finisher cue) with the damage known from the spell
  description and `UNIT_COMBAT` hits.
- **Mage Kit probe**: confirm `curve:Evaluate(secret)` errors (then drop it from the candidates).
