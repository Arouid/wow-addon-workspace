# What Plater Nameplates teaches on Forever (+ Blizzard's aura container rules)

**Source**: Plater Nameplates by Tercioo, GitHub `Tercioo/Plater-Nameplates`, branch `master`, commit
`51ae34f` (2026-10-10). Its `.toc` carries `## Interface-Camelot: 16001`, so this code loads on
Forever. **License**: no LICENSE file in the repo; CurseForge declares **All Rights Reserved**; no AI
objection anywhere. So: notes in our own words with file:line references, **no code copied**. Read
on GitHub without downloading, 2026-10-10.
**Status**: **reported** (Plater's code) unless marked **declared** (also in Blizzard's Forever
source). The second half of this file is Blizzard's own aura container code, read because Plater
pointed at it: all **declared**.

## Forever specifics

| Idea | Summary | Where |
|---|---|---|
| **Per-client .toc lines** | `## Interface-Camelot: 16001` beside `## Interface-Mainline`, `-Vanilla`, `-TBC`...: one .toc, a number per client. (Cooldown Manager Centered does the same job with per-file `[AllowLoadGameType camelot]` tags.) | `Plater.toc:1-7` |
| Detecting Forever | DetailsFramework: interface 16001-19999 = Forever; Forever counts as "restricted API" (`IsAddonApocalypseWow`) but **not** as Mainline (`WOW_PROJECT_ID ~= WOW_PROJECT_MAINLINE`). Note: Classic flavors 1.15.9+, 2.5.6+, 5.5.4+ also run the 12.x API. | `libs/DF/fw.lua:260-275` |
| **Detect a feature, not a version** | Aura container support = `C_XMLUtil.GetTemplateInfo("CustomAuraContainerTemplate")` returns something (**declared**, `XMLUtilDocumentation.lua`). | `Plater.lua:90`, `Plater_Auras.lua:13` |
| Nameplate settings that exist on the new plate system | On the 12.x plate system Plater manages `nameplateShowOffscreen`, `nameplateStackingTypes`, `nameplateSimplifiedTypes`, `nameplateShowFriendlyPlayers` and friends, and leaves the old scale / motion / inset CVars alone; the UI-scale correction is 1 there. | `Plater.lua:1514-1598` |
| Combo points | On Forever, Plater shows combo points on the target like the old clients. | `Plater_Resources.lua:1196` |

Our own find, prompted by this: **Offscreen Nameplates is a player option on Forever**:
`Blizzard_SettingsDefinitions_Frame/Nameplates.lua:525` adds the `nameplateShowOffscreen` checkbox
through `InterfaceOverrides.RunSettingsCallback`, and on Forever the toc loads BOTH the Mainline
override file (`[Family]`, which runs the callback unless Plunderstorm) and the Camelot one
(`[Game]`, which doesn't replace it) → **declared**. If it keeps units' plates at the screen edge,
plates would stop vanishing when the camera turns (Mage Kit's stealth check guards against exactly
that). To measure.

## Secret handling patterns

| Pattern | Summary | Where |
|---|---|---|
| Secret flag → safe default | "Is this my target / focus / mouseover / soft-interact?" answers that come back secret are treated as false rather than compared. | `Plater.lua:7362, 8023, 8039, 8115, 10344` |
| A second copy of the GUID | When one frame's GUID is secret, Plater reads the same GUID from the other frame of the pair, else skips. | `Plater.lua:2774-2818, 9161-9163` |
| Tooltip text turns secret | `C_TooltipInfo.GetHyperlink("unit:"..guid)` hands back secret line text for restricted units; comparing it throws. | `Plater.lua:11312-11318` |
| Threat of others | `UnitThreatSituation(tank, unit)` can be secret: fall back to "not tanking". | `Plater.lua:7690-7697` |
| **Color from a secret boolean** | `C_CurveUtil.EvaluateColorValueFromBoolean(state, ifTrue, ifFalse)` per channel (r, g, b, a) → `SetVertexColor` (**declared**, `CurveUtilDocumentation.lua`, takes secrets). | `Plater.lua:6579-6584` |
| Cast bars | `StatusBar:SetTimerDuration(durationObject, Enum.StatusBarInterpolation.Immediate, Enum.StatusBarTimerDirection.RemainingTime / ElapsedTime)` | `Plater.lua:5437-5439` |
| Layout away from secrets | Font size / face of a text that will receive secrets is set in a separate function, not in the code path that handles the secret value. | `Plater.lua:8644-8650` |

## Engine aura containers on nameplates (Plater's way)

1. **Pre-create, then lend**: at load, Plater creates container sets (up to 121), configures their
   groups and layout, and leaves them **disabled**. When a plate appears it takes a set from the
   cache and `SetParent`s it to the plate; when the plate goes, the set is reset and returned. No
   container is ever created in combat. (`Plater_Auras.lua:1928-1990`, `Plater.lua:4638`)
2. **OR without duplicates, engine-side**: a "main" group (filter string + `excludeSpellIDs`) and an
   "additional include" group (`includeSpellIDs`); everything the second group shows is excluded
   from the first. (`Plater_Auras.lua:810-920`)
3. Layout calls: `SetAuraGroupLayout(group, layout)`, `SetFlowLayoutAnchorPoint`,
   `SetFlowLayoutGrowthDirection(AnchorUtil.FlowDirection.Left/Right, Up/Down)`,
   `SetFlowLayoutMaximumLineSize`; sort `AuraContainerSortMethod.Expiration` or `Default`.
   (`Plater_Auras.lua:1340-1360, 1825-1840, 1960-1968`)
4. **Border colored by dispel type**: `auraButton:AddDispelTypeTexture(texture, { colors per
   "Magic" / "Curse" / "Disease" / "Poison" / "Bleed" / "Enrage" / "None" })`. Retail's
   `SetAuraBorder` doesn't exist on Forever (Plater falls back). (`Plater_Auras.lua:1590-1610`)

## Blizzard's aura container code on Forever (declared, `Interface/AddOns/Blizzard_AuraContainer`)

**Candidate filters** (`Blizzard_AuraContainerUtil.lua:88-170`), all optional, all must pass:
`includeSpellIDs` / `excludeSpellIDs` (sets keyed by spell ID; see the identity rule below),
`processedAuraType`, `includeDispelTypes` / `excludeDispelTypes` (keyed by dispel name: "Magic",
"Curse"...), `canApplyAura`, `isBossAura`, `isBossOrRoleAura`, `isFromPlayerOrPlayerPet`,
`isRoleAura`, `isPriorityAura`, `isStealable`, `maxDuration` (**also hides every permanent aura**),
`nameplateShowAll`, `nameplateShowPersonal`.

**The identity rule** (`Blizzard_AuraContainerUtil.lua:51-86`): filtering by exact spell ID is
refused when it could single out a debuff on a friendly unit (Blizzard's example: an encounter
debuff saying "Move now!"). Spell-ID filters apply only to:
- auras whose spell is flagged never-secret (`C_Secrets.GetSpellAuraSecrecy(id) == NeverSecret`);
- helpful auras on you, your group members, or pets;
- harmful auras on units you can't assist (enemies), helpful auras on units you can assist.
Otherwise (a debuff on a friend, a buff on an enemy) spell IDs are ignored, and **a group with
`includeSpellIDs` then shows nothing at all**. Dispel-type filters aren't identity filters: they
still work there. Spell-ID filters re-check on `UNIT_FLAGS` / `UNIT_FACTION` (`:40-48`).

**Sort methods** (`:172-182`): Default, BigDefensive, UnitFrameDebuff, ImportantOnly, Expiration,
ExpirationOnly, Name, NameOnly, AuraInstanceIDOnly; direction Normal / Reverse.

**Processing policy** (`Blizzard_AuraContainerShared.lua:191-208`, set with
`SetAuraProcessingPolicy(policy, options)`, `Blizzard_CustomAuraContainer.lua:555`): `ProcessAura`
classifies each aura (the unit-frame "buff / debuff / dispellable" logic) before candidate filters
run, enabling the `processedAuraType` filter; options `ignoreBuffs`, `ignoreDebuffs`,
`ignoreDispelDebuffs`, `displayOnlyDispellableDebuffs`.

**Dispel-type display** (`Blizzard_CustomAuraButton.lua:112-140`): `AddDispelTypeTexture(texture,
options)` gives the texture's alpha, vertex color, texture coordinates and shown state to the engine
(secret aspects): it shows and colors itself by the aura's dispel type, Lua never learns it.
`SetDispelTypeText(fontString, options)` does the same for a text.

## Ideas for us

- **Mage Kit / Curses**: an engine container on each party/raid member with filter `HARMFUL|RAID`
  (or `includeDispelTypes = { Curse = true }`) and `AddDispelTypeTexture` borders: curse icons with
  timers, colored by type, readable in instances, no Lua reading. Never use `includeSpellIDs` for
  friendly debuffs (the identity rule empties the group).
- **Mage Kit / Enemies**: measure the Offscreen Nameplates option; if plates stay at the screen edge,
  the stealth check's "inside the screen" guard can relax.
- **Context**: pre-create every container out of combat and lend them (rule 1); OR conditions as
  two groups with exclusions (rule 2); `maxDuration` hides permanent auras.
