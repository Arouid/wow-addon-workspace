# What WeaponSwingTimer (SixxFix) teaches: swings on Forever

**Source**: WeaponSwingTimer SixxFix by WatchYourSixx, GitHub `watchyoursixx/WeaponSwingTimer-SixxFix`,
branch **`forever`** (`## Interface: 16001`, pushed 2026-09-26; the default branch is TBC).
**License**: GPL per CurseForge (no license file in the repo): read freely, **ideas, not code**.
Read on GitHub without downloading, 2026-10-10.
**Status**: **reported** unless marked **declared** (Forever docs, build 70245).

## C_SwingTimer, Forever's native swing API (declared, `SwingTimerDocumentation.lua`)

| Member | What it gives |
|---|---|
| `PLAYER_SWING (swingDuration, swingType)` | your own swing just happened, with the duration of the NEW swing (haste included) |
| `C_SwingTimer.IsTargetWithinSwingRange(swingType)` | is the target within auto-attack range for that swing type; **nil** when no check could be made (no target, can't attack it, **no weapon equipped for that swing type**) |
| `C_SwingTimer.EnableRangeCheck(swingType, true)` + `PLAYER_SWING_RANGE_UPDATE (swingType, isInRange, checksRange)` | the same, event-driven: fires when the target goes in / out of range |
| `Enum.PlayerSwingType` | 0 MainHand, 1 OffHand, **2 Ranged** |

WeaponSwingTimer uses `PLAYER_SWING` as the authoritative player timer on Forever and keeps speed
polling only as a fallback (`WeaponSwingTimer_Player.lua:79-112`).

**For a mage** (to measure): Mage Kit recorded `IsTargetWithinSwingRange` as nil; the docs say nil
means "no weapon for that swing type". With swing type **Ranged** and a **wand**, this would be an
event-driven wand-range rung (30 yd); with **MainHand** and a staff, a melee-range rung (the
locator's short range). Probe each swing type explicitly.

## Enemy swings without the combat log (ways B + C)

The combat log can't be registered on Forever, so the target's swing cadence is **estimated from
`UNIT_COMBAT` on yourself**: it doesn't name the attacker, so only melee-like outcomes are accepted,
and only while the target targets you (when that test is secret, skip the check rather than
branch on it); once two hits are seen, their interval is the swing speed.
(`WeaponSwingTimer_Target.lua:57-135, 195`)

Other notes: `UnitAttackSpeed`, `UnitClass`, `UnitCanAttack`, `UnitIsUnit` can come back secret in
restricted instance content (`WeaponSwingTimer_Player.lua:227-247`, `_Target.lua:88, 116-130`); a
whitelist of spells that reset the swing timer replaces the combat log (`_Core.lua:26-53`).

## Ideas for us

- **Mage Kit RangeLadder / Locator**: probe `IsTargetWithinSwingRange` and the range event for
  Ranged (wand) and MainHand (staff): two more event-driven rungs, no items needed.
- **Mage Kit Enemies**: "a melee enemy is hitting you every N s" from `UNIT_COMBAT` intervals.
