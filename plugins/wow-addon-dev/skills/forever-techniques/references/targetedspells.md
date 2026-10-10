# What TargetedSpells teaches: enemy casts and who they target, on secret values

**Source**: TargetedSpells by Xepheris (GitHub `ljosberinn/TargetedSpells`, branch `main`, pushed
2026-09-17). Its `.toc` says `## Interface: 120007, 120100, 16001`, so it loads on Forever (its
`AGENTS.md` still calls it Retail-only). **License**: GPL-3.0 (`License.txt`); its `AGENTS.md` is a
contributor guide for AI agents, not an objection. GPL: read freely, but **take ideas, not code**,
unless our addon becomes GPL. Read on GitHub without downloading, 2026-10-10.
**Status**: **reported** unless marked **declared** (in Blizzard's Forever source / docs, build 70245).

## The cast pipeline

| Step | How | Where |
|---|---|---|
| Events per nameplate | `UNIT_SPELLCAST_START / STOP / INTERRUPTED / CHANNEL_START / CHANNEL_STOP / EMPOWER_*`, `UNIT_TARGET` (retarget), `UNIT_SPELLCAST_(NOT_)INTERRUPTIBLE` only when needed | `Driver.lua:59-74` |
| **4 units per registration** | `RegisterUnitEvent` takes at most `MAX_UNIT_TOKENS_IN_EVENT` = **4** units (**declared**, `UnitSharedDocumentation.lua:382`): one listener frame ("shard") per 4 nameplate tokens, created as plates appear. | `Driver.lua:78-118` |
| Cast info | `UnitCastingInfo` → spell ID (may be secret) and **castBarID** (never-secret, **declared**), `UnitCastingDuration(unit)` → duration object; channels the same with `UnitChannelInfo` / `UnitChannelDuration`. | `Driver.lua:323-337` |
| Pair start and stop | The stop / interrupt events carry the cast ID (4th argument; 5th for empower stop) and the interrupter: release only the frame whose cast ID matches. | `Driver.lua:550-570` |
| Cast end without reading the clock | The display's cooldown gets the cast duration (`SetCooldownFromDurationObject`) and its `OnCooldownDone` closes it. | `TargetedSpellsIconDurationMixin.lua:211-246` |
| **Offscreen units** | Without the `nameplateShowOffscreen` CVar, a unit the camera can't see gives a cast with **no duration at all**; the addon asks the player to enable it (popup with Enable). | `Driver.lua:519-532, 585-590` |

## Who a cast targets (ways A and D)

- **"Has a target" is readable**: `UnitSpellTargetName(unit)` is nil when the cast has no target, and a
  (secret) string otherwise; a secret is never nil, so `== nil` is a safe test (**declared**: the
  doc says "Returns nil if ... the spell has no target"). (`Driver.lua:183-199`)
- **"Targets me" is engine-side**: `PlayerIsSpellTarget(unit)` returns a SECRET boolean, "is this
  cast aimed at the player" (**declared**, `UnitDocumentation.lua:510`; it replaced
  `UnitIsSpellTarget`, `Deprecated_12_0_1.lua:67-69`; Blizzard's cast bar highlights with it,
  `CastingBarFrame.lua:1005`). Fed to `SetAlphaFromBoolean`: shown for "targets me", or inverted
  for "targets a party member". (`TargetedSpellsMixin.lua:379-386`)
- **Important casts**: `C_Spell.IsSpellImportant(spellID)` (Blizzard: e.g. lethal if not
  interrupted; **declared**) is secret here (the spell ID is), so it only drives alpha / glows.
  (`TargetedSpellsMixin.lua:175-184, 229, 294`)

## AND of two secret booleans, engine-side (way D)

`SetAlphaFromBoolean(boolA, alphaIfTrue, alphaIfFalse)` accepts a **secret alpha**, so conditions
nest: first `shown = C_CurveUtil.EvaluateColorValueFromBoolean(isImportant, 0, visibleAlpha)` (a
secret number), then `frame:SetAlphaFromBoolean(PlayerIsSpellTarget(unit), shown, 0)`: the frame
shows only for an important cast aimed at you, and Lua never learns either fact.
(`TargetedSpellsMixin.lua:366-390`) `secretwrap(value)` (**declared**, `FrameScriptDocumentation`)
makes a plain value secret so one code path serves both cases (`TargetedSpellsMixin.lua:175-181`,
`TargetedSpellsBarMixin.lua:266, 308`).

Also: a curve on the cast's duration (`EvaluateRemainingDuration(curve)`) sets alpha and bar value
in one call (`TargetedSpellsMixin.lua:358-363`); target names and class colors that may be secret go
straight to `SetText` / `SetTextColor` (`Utils.lua:41-46`); layout math uses known sizes, never
`GetWidth()` of a frame that may hold secrets (`Utils.lua:190`).

## Ideas for us

- **Mage Kit KICK alert**: show only casts aimed at you with `PlayerIsSpellTarget` →
  `SetAlphaFromBoolean`; AND it with `IsSpellImportant` for a "kick THIS" mark; pair start/stop by
  cast ID; register nameplate units 4 per frame.
- **Mage Kit Enemies**: recommend / probe `nameplateShowOffscreen` (casts of off-camera enemies have
  no duration without it).
- **Context conditions**: nested `SetAlphaFromBoolean` with secret alphas is a general AND for
  secret conditions (OR = two frames, or the inverted form).
