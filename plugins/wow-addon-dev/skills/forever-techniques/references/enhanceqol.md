# What Enhance QoL teaches (its Forever build) + the aura button toolkit

**Source**: Enhance QoL by R41Z0R (CurseForge project 1076354), the Forever-only file
`EnhanceQoL-13.9.0-forever.zip` (file 9107092, 2026-10-09; 16 addons, every `.toc`
`## Interface: 16001`, with `<Name>_Camelot.toc` client files). The author's GitHub repo (linked from
CurseForge) is gone; a third-party copy from 2025 predates Forever and was not used. Downloaded with
Finess's OK, kept in `Documentation/research/` (not in the game's AddOns folder).
**License**: CurseForge "All Rights Reserved"; no license file, no AI objection in the code. Notes in
our own words with file:line references, **no code copied**. Read 2026-10-10.
**Status**: **reported** unless marked **declared** (checked in Blizzard's Forever source, build
70245).

Paths are inside the zip (`EnhanceQoL/...`, `EnhanceQoLCooldownPulse/...`).

## Engine-run aura animations (way D) — and the full aura button toolkit

EnhanceQoL builds its own glow frames (pixel lines, marching ants, flash, pulse, shine, Blizzard's
proc glow textures...) as **animation groups**, then **hands them to the aura button**: from then on
Blizzard plays them when the aura is shown, or while it's in its pandemic window. Lua never knows
when. (`EnhanceQoL/Core/AuraCompat.lua:273-289` support check, `:336-845` glow styles, `:847-870`
the hand-off.) Its rules:
- **Hand over only fully configured groups**; afterwards never query their progress or retarget
  them: Blizzard owns playback. (`AuraCompat.lua:847-848`)
- **Handed-over objects stay restricted even after removal**: never reuse them, build new ones.
  (`AuraCompat.lua:869`)
- Detect support by the methods existing on a probe `CreateFrame("AuraButton", nil, UIParent,
  "CustomAuraButtonTemplate")`, not by the build number alone. (`AuraCompat.lua:273-289`)

**Everything an aura button accepts on Forever** (**declared**,
`Blizzard_AuraContainer/Blizzard_CustomAuraButton.lua`, `Blizzard_AuraButton.lua`); each piece is
driven by the engine from the (possibly secret) aura, through "secret aspects" (shown, alpha, text,
color, bar value, texture coordinates, cooldown):
| Method | The engine... |
|---|---|
| `SetIcon(texture)` | shows the aura's icon |
| `SetDurationCooldown(cooldown)` / `SetDurationText(fontString)` / `SetDurationBar(statusBar)` | runs its timer as a swipe / text / bar |
| `SetApplicationCount(fontString)` / `SetApplicationBar(statusBar)` | shows its stacks as text / bar |
| `AddDispelTypeTexture(texture, colors)` / `SetDispelTypeText(fontString)` | colors / names it by dispel type |
| `SetSpellName(fontString)` / **`SetCasterName(fontString)`** | writes the aura's name / **who cast it** |
| **`AddPandemicRegion(region)`** | shows the region only during the pandemic (refresh) window |
| `AddPandemicEnterAnimation` / `AddPandemicActiveAnimation` / `AddPandemicLeaveAnimation` | plays your animation group entering / during / leaving the pandemic window |
| `AddAuraAssignedAnimation` / `AddAuraShownAnimation` | plays it when the button gets an aura / is shown |
| `SetCancelAuraButtons(...)`, `SetHideTooltipInCombat(bool)`, `SetTooltipAnchorPoint(...)` | right-click cancel, tooltip policy |

## Readable side channels and predicates (ways A and E)

| Idea | Summary | Where |
|---|---|---|
| **Test one aura against any filter** | `C_UnitAuras.IsAuraFilteredOutByInstanceID(unit, auraInstanceID, filter)` → plain boolean; **no secrecy flag** in the docs (**declared**, `UnitAuraDocumentation.lua`; unit type is "restricted for addons", so not every unit). EnhanceQoL asks "is this aura mine?" with `HELPFUL\|PLAYER`. Any filter string works: `HARMFUL\|RAID`, `HARMFUL\|CROWD_CONTROL`, `HELPFUL\|BIG_DEFENSIVE`... | `EnhanceQoLUnitFrames/UF_GroupFrames_HealerBuffs_Camelot.lua:1789-1790`, `UF_Helper.lua:95-96` |
| Restriction state | `C_RestrictedActions.GetAddOnRestrictionState(type)` → 0 Inactive / 1 Activating / 2 Active (**declared**, no secrecy flag). "Any restriction on" = some type at 2; the chat window checks the **Chat** type before sending. | `EnhanceQoL/General/functions.lua:2790-2793`, `EnhanceQoLChatSocial/ChatIM/UI.lua:226-232`, `DamageMeter_Camelot.lua:6701-6706` |
| Per-spell secrecy | `C_Secrets.ShouldSpellAuraBeSecret(spellID)`: would this spell, as an aura, be secret? (**declared**; called inside `pcall`) | `ClassBuffReminder_Camelot.lua:1145-1149` |
| Restricted aura seen | Event `UNIT_AURA_BLOCKED (unit, auraInstanceID)` (the ID is secret): an aura on that unit was withheld. Way B: "something hidden happened here". (**declared**) | `AuraCompat.lua:1132-1165` |
| Tables you may read | `canaccesstable(t)`: a damage-meter session table can be walked even when the numbers in it are secret. | `EnhanceQoLDamageMeter/DamageMeter_Camelot.lua:2427-2440` |
| Forever ranks | Retail's list of "auras addons may query" says nothing about Forever's ranked spells: EnhanceQoL re-checks group buffs on a 5 s cadence when restricted. | `ClassBuffReminder_Camelot.lua:510-512` |

## Engine timers that raise an edge (ways D + B)

**"Cooldown finished" without reading it**: an invisible 1×1 `Cooldown` frame (alpha 0, no swipe,
edge, bling or numbers) is fed `C_Spell.GetSpellCooldownDuration(spell, true)` (`true` = ignore the
GCD, **declared**) or `GetSpellChargeDuration`; its **`OnCooldownDone`** script fires when the engine's
timer ends. Keep it shown (alpha 0) so the engine keeps timing. For charges, a duration covers one
recharge: on done, re-check `GetSpellCharges().isActive` (never-secret) and re-arm on the next frame
until all charges are back. The observed duration excludes the GCD, so its end counts even if
`GetSpellCooldown` still reports the GCD. (`EnhanceQoLCooldownPulse/Observers.lua:1-90`; trust
rules in `Runtime.lua:213-225, 280, 361`: only the documented never-secret flags are read,
`isOnGCD` only in `SPELL_UPDATE_COOLDOWN`.)

## Display helpers that take secrets (way D)

| Helper | Use | Status |
|---|---|---|
| `C_UnitAuras.GetAuraDispelTypeColor(unit, auraInstanceID, colorCurve)` | dispel type → color through a color curve (x = dispel type ID) → `SetVertexColor` | **declared** (secret when restricted: display only) |
| `C_UnitAuras.GetAuraApplicationDisplayCount(unit, id, min, max)` | stack text ("" below min, "*" above max) → `SetText` | **declared** |
| `C_UnitAuras.DoesAuraHaveExpirationTime(unit, id)` | permanent or timed (secret when restricted) | **declared** |
| `C_StringUtil.RoundToNearestString`, `FloorToNearestString`, `CreateNumericRuleFormatter`, `AbbreviateNumbers` | numbers to text, secrets accepted | **declared** (Round takes secrets) |
| `StatusBar:SetValue(v, Enum.StatusBarInterpolation.ExponentialEaseOut)` | smooth bars | reported |

## Damage meter on Forever (answers part of our frontier)

`C_DamageMeter` works on Forever: `IsDamageMeterAvailable()`, `GetAvailableCombatSessions()`,
`GetCombatSessionFromType/FromID`, `GetCombatSessionSourceFromType/FromID`,
`GetSessionDurationSeconds`, `ResetAllCombatSessions`; types include DamageDone, Dps, HealingDone,
Absorbs, Interrupts, Dispels, Deaths, DamageTaken, AvoidableDamageTaken, EnemyDamageTaken. Session
data is **secret in combat** (`SecretWhenInCombat`, **declared**) but its tables stay walkable, and
display APIs take the secret fields; after combat the numbers (per source, per spell:
`combatSpells` with spellID, totalAmount, amountPerSecond) can be copied into plain snapshots.
Blizzard's own meter is the `damageMeterEnabled` CVar. (`EnhanceQoLDamageMeter/DamageMeter_Camelot.lua:92,
730-745, 2400-2440`)

## Aura containers: where EnhanceQoL and Cooldown Manager Centered disagree

- EnhanceQoL: on the current build, **creating containers in combat is allowed**; only loading
  `Blizzard_AuraContainer` is deferred out of combat, so it preloads it at `ADDON_LOADED`.
  AuraButtons created at login / reload get their access restrictions only at
  `PLAYER_ENTERING_WORLD`; buttons created later are restricted right after `initializeFrame`.
  (`AuraCompat.lua:121-124, 212-239`)
- Cooldown Manager Centered: never create in combat (a partial init taints later template loads).
- **Until measured, follow the stricter rule** (create out of combat, lend). Both agree:
  configure everything inside `initializeFrame`; load the Blizzard addon out of combat.
- Other notes: `HasAuraSlot` and `ClearAuraGroups` aren't public, so keep your own slot-key cache
  and "clear" = `SetEnabled(false)` (`AuraCompat.lua:1050-1052, 1126-1130`); give
  `SetFlowLayoutMaximumLineSize` one physical pixel of slack, since the flow layout wraps on a
  strict `>` and float steps can break an exact fit (`AuraCompat.lua:65-80`).

## Forever data it derives

Weapon imbues, poisons, item buffs and group-buff families come from the client's DB2 tables
(ItemXItemEffect → ItemEffect → SpellEffect → SpellItemEnchantment; SpellEquippedItems for weapon
types), dated by build (`ForeverBuffs_Camelot.lua:52-53`, `WeaponEnchants_Camelot.lua:5-6`).
Forever's specialization IDs are class-only and don't identify hybrid builds (`:48`). Classic
poisons are weapon enchants, not auras (`ClassBuffReminder_Camelot.lua:505`). Equivalent group
buffs from another player satisfy a reminder (`:938`). This is also where Cooldown Manager
Centered's Forever spell-rank and defensive tables come from.

## Ideas for us

- **Context**: proc / buff displays as aura buttons with `AddAuraShownAnimation` glows and
  `AddPandemicRegion` ("refresh now"), sounds via `AddAuraSound`; "spell ready" as an
  `OnCooldownDone` edge from an invisible cooldown (ignore-GCD duration).
- **Mage Kit Curses**: `SetCasterName` shows who cursed a party member; `IsAuraFilteredOutByInstanceID`
  can tell, per aura, curse vs not (with `HARMFUL|RAID`) even where names are secret: to measure.
- **Mage Kit coach**: after a fight, `C_DamageMeter` per-spell totals → damage per mana per rank.
