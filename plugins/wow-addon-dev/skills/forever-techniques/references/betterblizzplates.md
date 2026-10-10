# What BetterBlizzPlates teaches on Forever (+ AdvancedInterfaceOptions on CVars)

## BetterBlizzPlates

**Source**: BetterBlizzPlates by Bodify, GitHub `Bodify/BetterBlizzPlates`, branch `main` (pushed
2026-10-05). It ships a separate Forever code tree (`forever/`) loaded by
`BetterBlizzPlates_Camelot.toc` (`## Interface: 16001`). **License**: "All Rights Reserved,
Copyright (c) 2023-2026 Bodify" (`LICENSE`), no AI objection: own-words notes with file:line
references, **no code copied**. Read on GitHub without downloading, 2026-10-10.
**Status**: **reported** unless marked **declared**.

| Idea | Summary | Where (`forever/...`) |
|---|---|---|
| Client-named .toc files | `<Addon>_Camelot.toc` loads on Forever, `_Mists.toc` on MoP, plain `.toc` on Retail: each points at its own code folder. | repo root |
| **Health thresholds without reading health (way D)** | `UnitHealthPercent(unit, usePredicted, curve)` evaluates the unit's health through a curve and returns the result (secret: **declared**, `UnitDocumentation.lua`; unit type is PvP-restricted for addons). An execute indicator: a linear curve 0→1 up to the threshold, 0 from threshold + 0.001: `hpTexture:SetAlpha(UnitHealthPercent(unit, true, curve))` shows only below the threshold. A step curve (0 → 1, 1 → 0) gives "not at full health". `CurveConstants.ScaleTo100` gives a 0-100 number for `SetFormattedText`. | `modules/execute.lua:1-70, 150-154`; `modules/classIcon.lua:939` |
| Remember the last good size | Plate / bar sizes can come back secret: keep `lastKnownHpWidth / Height` from the last plain read and fall back to it. | `modules/execute.lua:177-234`, `modules/auras.lua:2305-2306` |
| Containers on Blizzard frames | Engine aura containers parented to the personal resource display and to a nameplate's class icon; disabled + hidden when off (`SetEnabled(false)`, `Hide`). Sorts used: Default, ExpirationOnly (Normal / Reverse), AuraInstanceIDOnly Reverse (newest first). | `modules/auras.lua:139-141, 2010, 2895-2931`; `modules/classIcon.lua:263-274` |
| Color curve on durations | A color curve (`CreateColorCurve`) for aura timers. | `modules/auras.lua:755` |
| Secret guards | GUIDs, names, threat status of other tanks, text and alpha read back from plates can all be secret: test before comparing. Blizzard's own health-color check "now secret" (can't compare old vs new colors any more). | `BetterBlizzPlates.lua:2331, 2343, 4207, 4644, 4979-4992` |

## AdvancedInterfaceOptions (CVars)

**Source**: AdvancedInterfaceOptions by Stanzilla, GitHub `Stanzilla/AdvancedInterfaceOptions`,
branch `master` (pushed 2026-10-05), `.toc` includes `16001`. **License**: no license file;
CurseForge declares **All Rights Reserved**; no objection: own words only.

| Idea | Summary | Where |
|---|---|---|
| Listing every CVar | `C_Console.GetAllCommands()` doesn't return the complete list at login: rebuild the list when the browser opens. | `browser.lua:6-7` |
| **Who set a CVar** | Post-hook `C_CVar.SetCVar` and read `debugstack(2)` to blame the addon that set it (skip your own and Blizzard's `CvarUtil.lua` frames). `debugstack` can return a **secret** string: test `canaccessvalue` first. | `browser.lua:23-107` |
| CVars locked in combat | A list of CVars that can't be changed in combat (nameplate scale / alpha / distance / inset / motion CVars among them). | `cvars.lua:4-30` |
| **Plate scale follows the CAMERA** | `nameplateMaxScaleDistance` = distance from the **camera** at which plates reach max scale; `nameplateMinScaleDistance` = distance from the max distance at which they reach min scale. So a plate's scale tracks camera-to-unit distance, not player-to-unit (and Plater leaves these old scale CVars alone on the 12.x plate system). | `cvars.lua:130-145` |

## Ideas for us

- **Mage Kit / Context**: "target below X % health" conditions as visuals via `UnitHealthPercent` +
  curve (not on players in PvP); a "low health" glow costs nothing to read.
- **Mage Kit PlateGeometry**: plate scale measures CAMERA distance (if the 12.x plates scale at all):
  the scale-based distance idea needs the camera's distance too; test before investing.
- **Mage Kit Debug**: a "who changed this CVar" trace (SetCVar hook + `debugstack`, secret-guarded).
