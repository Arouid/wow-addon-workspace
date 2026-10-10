# What Grid2 teaches: group frames on Forever

**Source**: Grid2 by Michael (michaelnpsp), GitHub `michaelnpsp/Grid2`, branch `main` (pushed
2026-10-05). `.toc`: `## Interface-Retail: 120100`, `## Interface-Forever: 16001`. **License**:
zlib/libpng (`LICENSE.txt`): code may be reused and altered, keeping the notice and not claiming it
as ours. Read on GitHub without downloading, 2026-10-10.
**Status**: **reported** unless marked **declared**.

| Idea | Summary | Where |
|---|---|---|
| Per-client .toc lines, another spelling | `## Interface-Forever: 16001` (Plater writes `## Interface-Camelot: 16001`). Which suffixes the client honors is worth a test with a tiny addon. | `Grid2.toc:2-3` |
| Detecting Forever | interface 16000-19999, like DetailsFramework and Cooldown Manager Centered. | `GridCore.lua:24` |
| **Secrets spread through alpha** | When range is secret, the unit frame's alpha (set from it) is secret, and so is every child's effective alpha: libraries that do math with a frame's alpha (glow libraries reading their own textures' alpha) then fail. Never read back an alpha you set from a secret. | `GridIndicatorEffects.lua:69-70` |
| **Color by remaining time** | `durationObject:EvaluateRemainingDuration(colorCurve)` returns a color (secret when the duration is) → `:GetRGBA()` → `SetTextColor` / `SetStatusBarColor` / border color; refreshed on a 0.2 s timer while visible, the curve's last point when there's no duration. | `GridUtils.lua:414-462` |
| SetAlphaFromBoolean for both kinds | One wrapper: plain values use normal logic, secret ones `SetAlphaFromBoolean` (with an "invert" flag swapping the two alphas). | `GridUtils.lua:49-58` |
| Safe readers | Small "safe" getters return nil (or a default like 'NONE') when a value isn't accessible (`canaccessvalue`), so callers never branch on a secret. | `GridShims.lua:106-133` |
| Roster under secrets | GUIDs, names and realms of group members can come back secret: compare / key only when both sides are plain; otherwise treat as changed. If the first unit's role is secret, assume the whole roster's is. | `GridRoster.lua:83-136`, `modules/StatusRole.lua:79-82` |
| Containers start at unit "none" | A newly created aura container is enabled on unit `"none"`, where (per the author) it collects every unit's auras: assign the unit (or disable it) right away. | `GridIndicatorAuras.lua:75-81` |
| Range per class | One hostile and one friendly spell per class for `C_Spell.IsSpellInRange`, with `CheckInteractDistance` and `UnitPhaseReason` as fallbacks; range values may be secret (compare only when both plain). | `modules/StatusRange.lua:21-60, 144` |

## Ideas for us

- **Mage Kit Curses / Buffs windows**: color the timers with a color curve on the aura's duration
  object (green → red), secret-safe.
- **Any frame with secret alpha** (range-dimmed icons): no glow library that reads alpha on it;
  glow on a sibling frame instead.
