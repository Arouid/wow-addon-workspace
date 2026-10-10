---
name: forever-techniques
description: "A catalog of TECHNIQUES that work (or are expected to) on WoW: Forever 1.60.1, learned building the Mage Kit addon (Finess, 2026-10-07 to 10-09): reading what the game hides (aura filters, engine-drawn timers and colors from secret values), exact distance without a distance API (range ladder, trilateration from range-check flips), enemy awareness (stealth, targeting, threat), secure buttons, and the frontier still to probe. Each entry: the problem, the technique, its proof (Blizzard source file or in-game measurement, dated) and its status (measured / partly / declared / candidate / broken). Use when designing a Forever feature, when an old technique fails on secret values, or before calling something impossible. Complements wow-forever-api (facts) with ways to build on them."
---

# Forever techniques (from Mage Kit)

Facts say what the client does (`wow-forever-api`); this says **what to build with them**. Every
technique has a status, and only `measured` means seen working in game:

| Status | Meaning |
|---|---|
| **measured** | seen working in game; date and build in Mage Kit's `docs/verified-in-game.md` |
| **partly** | seen working in some conditions; the rest untested (said which) |
| **declared** | in Blizzard's Forever source (`Gethe/wow-ui-source`, branch `forever`), not yet tried in game |
| **candidate** | a new system that could carry it; to probe first (Mage Kit: Debug > Probing for secrets) |
| **reported** | another addon's author says it's field-tested (e.g. EllesmereUI's comments); not seen by us yet |
| **broken** | measured NOT to work: don't retry without a reason |

Build 70245 unless said. Mage Kit's files are the working examples (`MageKit/<file>`). Section 6
summarizes what EllesmereUI's source comments teach (`references/forevercoreskill.md`).
Promote an entry only after seeing it, and write the date.

## 1. Reading what the game hides

### Aura filters instead of names or indexes
- **Problem**: in combat (battlegrounds, dungeons) auras are secret. `C_UnitAuras.GetAuraDataBySpellName`
  returns **nil** then (it's flagged `RequiresNonSecretAura`): "missing" and "hidden" look the same.
  Measured: 1230/1230 nil reads on group members in a battleground fight, 82/82 on yourself
  (2026-10-07). Target auras **by index threw** 52/52 in a battleground. → **broken** for combat.
- **Technique**: `C_UnitAuras.GetUnitAuraInstanceIDs(unit, filter)` lists matching auras and carries
  **no** "secret when restricted" flag (`UnitAuraDocumentation.lua`). Let the FILTER do the
  identification (`AuraUtil.AuraFilters`):
  | Filter | Gives | Mage Kit use |
  |---|---|---|
  | `HARMFUL\|RAID` | debuffs **you** can dispel (a mage: curses) | Curses window, CURSED, Still cursed |
  | `HELPFUL\|RAID` | buffs you could give; an empty list = surely missing | Arcane Intellect "Missing" in combat |
  | `HELPFUL\|PLAYER\|RAID` | your own buffs on someone | exact AI timers |
  | `HARMFUL\|PLAYER\|CROWD_CONTROL` | **your** CC (Polymorph) | purple sheep badge, SHEEP ENDED |
  | `HARMFUL\|CROWD_CONTROL` | anyone's CC | orange "CC: don't break it" badge |
  | `HELPFUL\|BIG_DEFENSIVE` | Divine Shield, Ice Block, BoP... | gold DEF badge |
- **Status**: **declared** for all six (the in-game checklist: `MageKit/docs/test-checklist.md` B6,
  B7, B10, C1-C9, D7). Unknown: whether a restricted read returns `{}` (which would make "empty =
  missing" lie) or throws. Pause the reading 3 s after a refusal (calls can THROW).
- Files: `Curses.lua`, `Buffs.lua` (NoGivableBuff), `BuffWindow.lua` (ExactTime), `PlateAuras.lua`.

### Engine-drawn timers (work on secret numbers)
- **Problem**: durations and cooldowns are secret in combat; Lua can't do `expiration - GetTime()`.
- **Technique**: get a **duration object** and hand it to a widget; the engine counts:
  - auras: `C_UnitAuras.GetAuraDuration(unit, auraInstanceID)`;
  - spells: `C_Spell.GetSpellCooldownDuration(spellID)` → **measured** (range icons' swipe, 2026-10-07);
  - casts: `UnitCastingDuration(unit)` / `UnitChannelDuration(unit)` (unit type
    `UnitTokenPvPRestrictedForAddOns`: fails on players in PvP) → **declared** (KICK interrupt bar);
  - widgets: `Cooldown:SetCooldownFromDurationObject(d, clearIfZero)` (clearIfZero only for a new
    aura, as `Blizzard_CustomAuraButton.lua`); `StatusBar:SetTimerDuration(d, 0, direction)`
    (0 Immediate; direction 0 elapsed, 1 remaining); a **text that counts down itself**:
    `b = C_DurationUtil.CreateDurationTextBinding(); b:SetToDefaults(); b:SetFontString(fs);
    b:SetDuration(d); b:SetEnabled(true)` (skip it when `d:IsZero()`).
- Status: cooldown objects **measured**; aura durations, cast durations, text bindings **declared**.

### Visibility and color from a secret boolean
- `region:SetAlphaFromBoolean(secretBool, alphaIfTrue, alphaIfFalse)`: **measured** (range icons
  greying out of range inside a battleground, 2026-10-07). Same trick: the TARGETING YOU mark
  (`UnitIsUnit(nameplateN.."target", "player")` is secret ~85% of the time in a battleground).
- Any color, gradients: `C_CurveUtil.EvaluateColorFromBoolean`, color curves (`CreateColorCurve`,
  `AddPoint`, `Evaluate` on a secret x) → **candidate**.

### Names and identity
- Names are **"First Surname"** (`GetUnitName(unit, true)`); `UnitName` gives the first name only, and
  several players share one. Key lists by the full name, show the first. `/targetexact <full name>`
  targets a stranger → **measured** (Enemies nearby click-to-target, 2026-10-08).
- Open world: enemy players' class and faction **readable** (Ratchet, 2026-10-08); battleground: class
  secret 21/21, names secret on nameplates in combat → **measured**.
- PvP realm territory: Ratchet is in Horde territory: Alliance there are flagged, a Horde player
  isn't; `UnitCanAttack(enemy, "player")` false then (they can't attack you), `UnitCanAttack("player",
  enemy)` true → **measured** 2026-10-08. Re-read it often: either side can flag.

### Trainers
- `GetTrainerServiceInfo(i)` returns **name, status, icon, required level, rank text** (Forever's
  `Blizzard_TrainerUI/Mainline`). The 2nd value is the status, not the rank (cost us a broken
  catalog: **measured** 2026-10-07). `GetTrainerServiceIcon` doesn't exist. File: `Training.lua`.

## 2. Distance without a distance API

- **Broken**: `UnitPosition(unit)` (nil on others), `UnitDistanceSquared` (no answer on a mob, a
  stranger, an enemy player), `C_SwingTimer.IsTargetWithinSwingRange` (nil for a mage) → **measured**
  2026-10-08.
- **Range ladder**: yes/no checks with known reach, short to long. LibRangeCheck-3.0 v38's
  Era/Forever item list (bundled with Platynator) answers on Forever, **every rung**. Switch points
  from the target's CENTER (listed range + 3, hitboxes): 8 (item 8149), 10 (interact 3; 2 and 5
  flip with it), 13 (17626), 18 (4559), 23 (1191, Fire Blast), 28 (interact 4, 13289), 33 (835,
  Frostbolt), 38 (18904), 43 (4945), 48 (221316) → **measured**. Show players edge to edge (−3).
  Items are PROTECTED in combat against a unit you can't attack: gate them. Retail's 6-9 yd items
  don't exist on Forever. File: `RangeLadder.lua`; doc: `MageKit/docs/range-measurement.md`.
- **Locator (trilateration)**: the instant a check flips, the target's center is exactly that
  distance away; with your own position (`UnitPosition("player")`, outdoors, tenths of a yard),
  each flip is a circle; two or three cross at the target. Check every frame against the live
  answers (a disagreement > 0.6 yd = it moved: drop it). Mirror solutions on a straight line: show a
  distance only while both agree → **measured**: read 7.0 exactly at the 10 yd flip, 4.3 in melee
  (2026-10-08). Not in instances (no position). File: `Locator.lua`.
- **Facing**: `GetPlayerFacing()` has no secret flag; its sense and offset in position coordinates
  are learned from running (direction moved vs faced) → **declared** (Blink planning,
  `BlinkPlan.lua`).
- Nameplates reach `nameplateMaxDistance` (60 on this player's client), and disappear when the
  camera turns away from them (reported 2026-10-08).

## 3. Enemy awareness

- **Stealth**: an enemy's nameplate vanishing while CLOSE (a range check, well inside the plate
  distance), ALIVE, and WELL INSIDE THE SCREEN on its last frame (not the outer 10%: the camera) =
  Stealth/Vanish/Prowl/Shadowmeld. Several plates at once, your death, a loading screen, plates
  switched off: ignore → **partly** (a rogue got the STEALTH tag in Ratchet; false alarms untested).
  Enemy cast spell IDs are secret in battlegrounds; the plate check doesn't need them. File:
  `Enemies.lua`.
- Casts: `UNIT_SPELLCAST_*` fire for target and nameplates in a battleground, spell ID secret,
  `UnitCastingInfo` secret while casting → "someone casts" is knowable → **measured** (KICK alert).
- Threat score from readable things only (targeting you, vanished nearby, can stealth, level,
  distance, can attack you, comebacks): `EnemyThreat.lua` (pure, tested).

## 4. Secure buttons and taint

- `SecureActionButtonTemplate`, `type = "macro"`, `macrotext` set **out of combat**; rows keep
  their unit in combat (paint only). Protected frames may still be shown in
  `PLAYER_REGEN_DISABLED`. `CLICK <Button>:LeftButton` key bindings work → **measured**
  (Buff next, 2026-10-04).
- A string from the network never goes into `macrotext` unsanitized (a newline adds a command).
- Blizzard's debug tools from addon code: `securecall(FrameStackTooltip_Toggle, ...)`,
  `securecall(EventTrace.SetShown, EventTrace, true)` after loading them → **declared**.
- `ColorPickerFrame:SetupColorPickerAndShow` works for addons → **measured**. Wand `/cast !Shoot`:
  Forever ignores the `!`, a 2nd press stops the wand → **measured**.

## 5. Frontier (candidates: Mage Kit's Debug > Probing for secrets)

| System | Could give | Probe asks |
|---|---|---|
| `CreateFrame("UnitPositionFrame")` + `AddUnit(token, ...)` | an **engine-drawn radar**: positions the engine knows, addons never get | can an addon create one? does it take enemy nameplate tokens? |
| `C_CombatAudioAlert.SpeakText(text, category, overlap)` | spoken callouts | does it speak (needs the game's combat audio alerts on)? |
| `C_LossOfControl.GetActiveLossOfControlDataCountByUnit/ByUnit/Duration` | CC on ANY unit, with a duration object | readable on a target? in PvP? |
| `C_DamageMeter` | per-fight damage (secret in combat, readable after?) | a mana coach (damage per mana per rank) |
| `C_Secrets.Should...BeSecret` / `Get...Secrecy` | know BEFORE reading if it'll be hidden | the map of what's hidden where |
| `C_CurveUtil` color curves | engine colors from secret numbers | does Evaluate work tainted? |
| `C_AssistedCombat.GetNextCastSpell` | Blizzard's rotation hint | available on Forever? |

Run the probe out of combat, in combat, and near enemy players; move each line to its section with
its status and date.

## 6. Learned from EllesmereUI

EllesmereUI (Ellesmere, v9.4, "all rights reserved") is the most complete Forever UI suite and its
comments explain a lot. `references/forevercoreskill.md` summarizes them **in our own words** with the
file of each; read the original there. The headlines:
- **Engine aura containers** (`CreateFrame("AuraContainer")`): the engine draws auras from FILTERS,
  secret or not, in instances too: the way to show auras where Lua can't read them.
- **Conditional visuals with no reading**: nested containers make a tint appear only while every
  listed debuff is present (AND logic, engine-side).
- **Secret sinks and never-secret signals**: which setters take secrets, which values never turn secret.
- **Threat is readable on Forever**; UnitIsUnit under identity restriction; the 12.1 script watchdog.

