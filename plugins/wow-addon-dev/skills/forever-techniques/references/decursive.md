# What Decursive teaches: dispelling when debuffs are secret

**Source**: Decursive by Archarodim (John Wellesz), GitHub `2072/Decursive`, branch `master` (pushed
2026-10-04). `.toc`: `## Interface-Forever: 16001` (with Retail, Classic, bcc, Titan, Mists lines),
`## X-License: GNU GPL V3`. **License**: GPL-3.0: read freely, **take ideas, not code**, unless our
addon becomes GPL. Read on GitHub without downloading, 2026-10-10.
**Status**: **reported** unless marked **declared** (Blizzard's Forever source / docs, build 70245).

## Color a unit's square by its worst dispellable debuff, engine-side (way D)

This is the "color the unit frame when cursed" feature, done with no Lua reading:
1. One engine container per unit square (`CreateFrame("AuraContainer", nil, square,
   "CustomAuraContainerTemplate")`, `SetAllPoints`). (`Dcr_DebuffsFrame.lua:1124-1128`)
2. **One aura slot per cure priority** (up to 7), each `"HARMFUL"` with
   `candidateFilters = { includeDispelTypes = {...} }` for the dispel types that priority covers (empty
   = unused). Dispel-type filters aren't identity-gated, so they work on friendly units. Slots are
   added in reverse order AND given higher frame levels for higher priority, so the most important
   type sits on top. Then `SetUnit`, `SetShown(true)`, `SetEnabled(true)`. (`:1228-1257`)
3. Inside `initializeFrame` (the button is locked afterwards while auras are secret): a plain white
   texture covering the button, handed over with `ab:AddDispelTypeTexture(texture, options)` using
   `style = PreserveAsset`, `showIcon = false`, `showWhenHarmful = true`, `showWithoutDispelType =
   false`, and `customDispelColorCurve` = a **step color curve** keyed by dispel type
   (`C_CurveUtil.CreateColorCurve()` + `SetType(Enum.LuaCurveType.Step)`). The engine shows and
   colors it; Lua never knows the debuff. (`:1166-1212`; curve in `DCR_init.lua:2590-2600`)
4. Same trick for stealth: a `"HELPFUL"` slot with `includeSpellIDs` = stealth buffs (helpful on an
   assistable unit: identity filters allowed) and `showWithoutDispelType = true`. (`:1205-1224`)

**The dispel-texture options** (**declared**, `AuraContainerUtilDocumentation.lua:270-305`): `style`
(0 Border, 1 BorderWithIcon, 2 Icon, 3 PreserveAsset), `showAlways`, `showWhenHarmful`,
`showWhenHelpful`, `showWithoutDispelType`, `stealableFilter`, `texCoords`, and the colors:
`customDispelColorMap` (dispel name → color: simpler than a curve), `customDispelColorCurve`,
`customDispelAssetMap` (dispel name → texture).

## Reading what can still be read

| Idea | Summary | Where |
|---|---|---|
| "Secret mode" per debuff | When the debuff's type comes back secret (`not canaccessvalue(TypeName)`), the entry is flagged and only display paths use it; name / type / spell ID are never stored when secret. | `Decursive.lua:352, 466-591, 649` |
| Color when allowed | `C_UnitAuras.GetAuraDispelTypeColor(unit, auraInstanceID, curve)` while auras aren't restricted. | `Decursive.lua:588` |
| No false "nothing to cure" | With secret auras the addon's own status can stay NORMAL while Blizzard's aura button still handles a valid dispel click: it can't tell a real cure from an empty click, so it stops printing "nothing to cure" in that state. | `Dcr_DebuffsFrame.lua:1003-1010` |
| Stealth from UNIT_AURA | `UNIT_AURA`'s `addedAuras` can be walked when the table is accessible; secret names become "*secret*". | `Dcr_Events.lua:631-640` |
| **A secret image through text** | A raid-target icon whose index may be secret is drawn by a FontString with a `|T...|t` escape: a secret string is refused as a texture path, but `SetText` takes it. | `Dcr_DebuffsFrame.lua:1268-1274` |
| Secret class | A secret class token falls back to a default (WARRIOR) for logic. | `Dcr_utils.lua:106-107` |
| Debug printing | A table printer that writes "secret K" / "secret V" instead of touching secret keys / values. | `Dcr_utils.lua:329-352` |

## Engine aura sounds (way D)

`C_UnitAuras.AddAuraSound` needs an **exact public spell ID** (Decursive registers a curated list of
actionable dispels); Blizzard detects and plays, Lua never reads the aura. When refreshing,
**register the replacement first, then remove the old one**, so a failed refresh never leaves no
sound; both calls in `pcall`. (`Dcr_12_1_Sounds.lua:53-60, 205-226`)

## Ideas for us

- **Mage Kit Curses** (Finess asked for "color the unit frame" at the start): one container per
  party/raid member, a `"HARMFUL"` slot with `includeDispelTypes = { Curse = true }` and a white
  texture through `AddDispelTypeTexture` with `customDispelColorMap = { Curse = purple }`: the square
  lights up exactly while that member has a curse, in instances too.
- Never print "no curse to remove" while auras are secret (we can't know).
- Secret raid icons on our rows: the `|T` text trick.
