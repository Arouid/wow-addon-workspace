# What ThreatClassic2 teaches about threat on Forever

**Source**: ThreatClassic2 by dfherr, GitHub `dfherr/ThreatClassic2`, branch `master` (pushed
2026-10-04). `.toc`: `## Interface: 11509, 16001, 20506, 50504, 120100`, `## X-License: MIT`.
**License**: MIT (`license/ThreatClassic2`): code may be reused **with its copyright notice**. Read
on GitHub without downloading, 2026-10-10. File: `core/core.lua`.
**Status**: **reported** unless marked **declared** (Blizzard's Forever docs, build 70245).

| Idea | Summary | Where |
|---|---|---|
| Detecting Forever | `WOW_PROJECT_ID == WOW_PROJECT_CAMELOT`; Forever = the Mainline API, but **dual spec instead of specializations** (the spec role always reads "damager"). | `core.lua:71-74` |
| **Threat on your target is readable** | `UnitDetailedThreatSituation(unit, "target")` → isTanking, status, scaled %, raw %, threat value: ThreatClassic2 does arithmetic on them on Forever. The docs flag them `SecretWhenUnitThreatValuesRestricted` (**declared**): readable unless that restriction is on. | `core.lua:646-700` |
| `targettarget` is hidden | On Mainline / Forever the threat values against `targettarget` come back secret: only use `"target"`. | `core.lua:709-713` |
| 1 damage = 1 threat | The 12.x engine reports threat unscaled (Classic divided by 100). | `core.lua:670-673` |
| **Melee range from threat (way C)** | Pull thresholds are 110 % in melee and 130 % at range, so `rawPercent / scaledPercent > 1.2` means "this unit is OUT of the mob's melee range". A distance signal for any group member on the threat table, including yourself. | `core.lua:656` |
| Threat per second | A smoothed TPS from successive threat values per (mob GUID, unit GUID), kept 4 s across target swaps. | `core.lua:65-66, 579-645, 679, 700-706` |
| Names are secret | Unit names on Forever can be secret, so a "only these mobs" filter matches the **encounter name** from `ENCOUNTER_START` instead, guarded with `IsEncounterInProgress()` against a missed `ENCOUNTER_END`. A secret name still goes into `..` and `SetText`. | `core.lua:219-228, 755-758` |
| Auras in combat | Righteous Fury (tank stance for paladins) is read only out of combat on Forever and remembered, since aura data is restricted in combat. | `core.lua:775-797` |

## Ideas for us

- **Mage Kit**: the threat-ratio melee test is a free "am I in this mob's melee range" signal while
  on its threat table, a check for the locator's short range; keep threat reads on `"target"`.
- **Context**: encounter-name filters when unit names are secret; remember out-of-combat aura reads.
