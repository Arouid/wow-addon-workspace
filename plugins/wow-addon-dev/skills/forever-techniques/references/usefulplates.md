# What Useful Plates and Tooltips teaches: range, absorbs and spell damage on Forever

**Source**: Useful Plates and Tooltips by Ironship (`Ironship/UsefulPlatesAndTooltips`, branch
`main`, pushed 2026-10-10, 0.9.46), Forever `.toc` `16001` (a separate `_Mainline.toc` for Retail).
**License**: GPL-3.0-or-later: read freely, **ideas only** for all our addons (not mixable with the
GPL-2.0-only code Context may borrow). Its DoTInfo module is DoesItDie's code ported in (see
`doesitdie.md`). Read on GitHub without downloading, 2026-10-10.
**Status**: **reported** unless marked **declared** (Forever docs, build 70245).

| Idea | Summary | Where (`Modules/...`) |
|---|---|---|
| **Range trap: "next swing" spells lie** | `IsSpellInRange` answered **true for Heroic Strike at 30 yards** while Rend (same reach) answered false: abilities that only change the next swing (Heroic Strike, Cleave, Raptor Strike, Maul) must never measure range. Mage range spells: Fireball 133, Frostbolt 116, asked by NAME so the client answers for the rank known; a druid form changes the spells. | `Range/Range.lua:37-60` |
| Range answers | `C_Spell.IsSpellInRange` → true / false / nil ("cannot say": unknown spell, secret, friendly target with a harmful spell); only a plain yes is a yes; `IsSpellUsable` gates spells like Charge. The action-bar range tint comes from a post-hook on `ActionButton_UpdateRangeIndicator` + each button's `UpdateUsable`. | `Range/Range.lua:5-16, 63-120, 285-295` |
| **Hunter range ladder with items** | Item probes at 10 / 15 / 20 / 25 / 30 / 35 yd (`C_Item.IsItemInRange`, no secrecy flag: **declared**), Wing Clip for melee, Auto Shot's minimum range for the dead zone; one rung is true when any item reaches, false only when one answered false, nil when none can. Auto Shot's real max range from `GetSpellInfo(75)` detects Hawk Eye (> 35 yd) instead of guessing. (Same method as Mage Kit's RangeLadder.) | `HunterRangeFinder/HunterRangeFinder.lua:17-20, 147-215` |
| **Absorbs: secret in combat, drawn by a bar** | `UnitGetTotalAbsorbs(unit)` is `SecretReturns` (**declared**); the value flows raw into `StatusBar:SetMinMaxValues / SetValue` as an overlay on the unit's health bar (player, target, party, nameplates); never compared, saved or read back; style writes never touch the value. | `ShieldsInfo/ShieldsInfo.lua:1-20, 76-135` |
| Spell power secret in combat | Forever hides spell power in combat; Retail descriptions already include it, Forever's don't, so the estimate adds it only on Forever/Era (client version decides). | `SpellDamageInfo/Core.lua:7-9, 165-168` |
| Combo points | On Classic/Forever they live on the TARGET: `GetComboPoints("player", "target")` is the authority (secret when power is restricted: **declared**); Retail reads `UnitPower("player", ComboPoints)`; events hand `"COMBO_POINTS"` as a string, the API takes the enum. | `SpellDamageInfo/Core.lua:178-190`; `ResourceDing/Core.lua:166-194` |
| Secret GUID as key | A secret GUID must never index a table ("cannot be indexed with secret keys"); `issecretvalue` itself is called in `pcall` for clients where it raises. | `ResourceDing/Core.lua:179-189`; `ShieldsInfo.lua:76-82` |
| Which .toc loads | Measured 2026-09-19 with its probe: the Forever client loads the `_Mainline` file when both exist (Forever is 1.60.x, Classic Era 1.15.x). | `ResourceDing/Core.lua:15-24` |

## Ideas for us

- **Mage Kit RangeLadder**: never use a next-swing ability (or a wand "Shoot"?) as a range probe
  without measuring; ask by NAME for ranked spells; Hawk-Eye-style detection = read the spell's real
  `maxRange` instead of assuming 30 for Frostbolt (Arctic Reach).
- **Mage Kit / Context**: Ice Barrier / Mana Shield remaining absorb as an engine-drawn overlay
  (`UnitGetTotalAbsorbs` → StatusBar), secret-safe.
