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

## 0. The goal: deriving conditionals

Forever hides values so addons can't BRANCH on them (`if hidden then ...` throws). Every technique
here is one of five ways to still get a decision. Classify a new find by which one it is:

| Way | Lua gets a usable `if`? | Examples (sections below) |
|---|---|---|
| **A. A readable side channel**: a related value the game leaves plain | yes | aura instance-ID lists (`#ids`), your own cast events, threat values, cooldown `isActive`, `C_Secrets.Should...` predicates, frame identity, Loss of Control `priority` |
| **B. The event itself**: THAT something happened, even with a hidden payload | yes ("something changed") | enemy `UNIT_SPELLCAST_*` (KICK alert), `UNIT_AURA`, nameplate added/removed (stealth check) |
| **C. Geometry and time**: combine yes/no answers with what you know (your position, the clock) | yes | range ladder, locator (trilateration), flip timing |
| **D. The engine decides, Lua never knows**: the condition only drives a visual | no, the screen does | `SetAlphaFromBoolean`, color from booleans/curves, engine aura containers, nested-container AND tints |
| **E. Ask before reading**: is this going to be hidden here? | yes (switch strategy) | `C_Secrets.Should...BeSecret` |

Notes: D is the sanctioned path Blizzard built for hidden values and the most future-proof. A-C rely on
what the game currently leaves readable; Blizzard has tightened such gaps between builds, so keep
each with its date and re-check after patches (`/wow-addon-dev:patch-diff`, Mage Kit's probes).
Reading an engine widget back (its size, visibility) to recover a hidden value is blocked by design
(aura buttons deny tainted access while auras are secret; containers forbid layout scripts): don't
build on it.

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
- **Test ONE aura against any filter**: `C_UnitAuras.IsAuraFilteredOutByInstanceID(unit,
  auraInstanceID, filter)` returns a plain boolean, no secrecy flag in the docs → **declared**
  (`references/enhanceqol.md`): classify each instance ID from `GetUnitAuraInstanceIDs` (mine?
  dispellable? CC?) instead of only counting lists.
- **Engine containers have an identity rule**: their `includeSpellIDs` / `excludeSpellIDs` are
  ignored for debuffs on friendly units and buffs on enemies (unless the spell is never-secret), and
  a group with `includeSpellIDs` then shows NOTHING. Dispel-type filters (`includeDispelTypes`) still
  work there → **declared** (`Blizzard_AuraContainerUtil.lua:51-86`; `references/plater.md`).

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
- **An engine timer that raises an edge**: an invisible `Cooldown` frame (alpha 0, shown) fed
  `C_Spell.GetSpellCooldownDuration(spell, true)` (true = ignore GCD) fires `OnCooldownDone` when the
  hidden cooldown ends: "spell ready" as an event, nothing read → **reported** (EnhanceQoL's
  Cooldown Pulse).
- **Aura buttons are a full display kit**: icon, timer as swipe/text/bar, stacks as text/bar,
  dispel-type color/text, spell name, **caster name**, a region shown only in the pandemic window,
  and YOUR animation groups played on aura shown / pandemic enter-active-leave → **declared**
  (`Blizzard_CustomAuraButton.lua`; table in `references/enhanceqol.md`).

### Visibility and color from a secret boolean
- `region:SetAlphaFromBoolean(secretBool, alphaIfTrue, alphaIfFalse)`: **measured** (range icons
  greying out of range inside a battleground, 2026-10-07). Same trick: the TARGETING YOU mark
  (`UnitIsUnit(nameplateN.."target", "player")` is secret ~85% of the time in a battleground).
- **AND of two secret booleans**: `SetAlphaFromBoolean` accepts a SECRET alpha, so
  `shown = C_CurveUtil.EvaluateColorValueFromBoolean(condA, 0, 1)` then
  `frame:SetAlphaFromBoolean(condB, shown, 0)` shows only when both hold → **reported**
  (TargetedSpells, `references/targetedspells.md`). `secretwrap(v)` makes a plain value secret so
  one path serves both.
- Any color, gradients: `C_CurveUtil.EvaluateColorFromBoolean`, color curves (`CreateColorCurve`,
  `AddPoint`, `Evaluate` on a secret x) → **candidate**.
- Number curves on a duration object: a 2-point curve (0 → 1, 0.001 → 0) makes
  `duration:EvaluateRemainingDuration(curve)` "1 when ready, else 0" for `SetAlpha` / `SetDesaturation`
  → **reported** (Cooldown Manager Centered, `references/cooldown-manager-centered.md`).
- Sounds the engine plays on an aura event: `C_UnitAuras.AddAuraSound(Enum.UnitAuraSoundTrigger.Added
  / ApplicationsIncreased / Removed, { unitToken, spellID, soundFileID, throttleSeconds })`; register
  out of combat while auras aren't secret → **declared** + **reported**.

### Fields Blizzard declares never secret (way A, from the docs)
The generated docs mark `NeverSecret = true` on 965 fields (2026-10-10, build 70245); most are chat
metadata. The gameplay ones, **declared** (to measure):
| API | Never-secret fields |
|---|---|
| `C_Spell.GetSpellCooldown` (secret when cooldowns are restricted) | `isActive`, `isEnabled`, `isOnGCD` (trust `isOnGCD` only in `SPELL_UPDATE_COOLDOWN`) |
| `C_Spell.GetSpellCharges` | `isActive`, `maxCharges` |
| spell loss of control | `isActive`, `shouldReplaceNormalCooldown` |
| `C_LossOfControl` data | `displayType`, `priority` |
| `UnitCastingInfo` / `UnitChannelInfo` | `castBarID`, `delayTimeMs`, `isTradeskill`, `isEmpowered`, `numEmpowerStages` |
| **`C_PvP.GetScoreInfo`** (battleground scoreboard) | `name`, `className`, `classToken`, `faction`, `raceName` |
| `C_DamageMeter` sources | `classFilename`, `classification`, `isLocalPlayer`, `specIconID`, `deathRecapID` |
| duration / curve objects | `HasSecretValues()`: ask an object whether it holds secrets |
Re-list after a patch: `grep -c "NeverSecret = true"` over `Blizzard_APIDocumentationGenerated`.

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
- **Offscreen Nameplates** (`nameplateShowOffscreen`) is a player option on Forever
  (`Blizzard_SettingsDefinitions_Frame/Nameplates.lua:525`): if it keeps plates at the screen edge,
  plates stop vanishing when the camera turns → **declared**, to measure (`references/plater.md`).
- **Is this cast aimed at ME?** `PlayerIsSpellTarget(unit)` → secret boolean for
  `SetAlphaFromBoolean`; "has a target at all" = `UnitSpellTargetName(unit) ~= nil` (a secret is never
  nil); `C_Spell.IsSpellImportant(id)` flags must-kick casts; pair start/stop by the never-secret
  cast ID; `RegisterUnitEvent` takes at most 4 units → **declared** (`references/targetedspells.md`).
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
- **Before lockdown, officially**: `ADDON_RESTRICTION_STATE_CHANGED (type, state)` with state
  `Activating` (1) fires while a restriction is about to be enforced; enforcement waits for the end
  of that dispatch. Types: 0 Combat, 1 Encounter, 2 ChallengeMode, 3 PvPMatch, 4 Map, 5 Chat (addon
  messages). `C_RestrictedActions.IsAddOnRestrictionActive(type)` asks at any time;
  `CheckAllowProtectedFunctions(frame, true)` asks silently whether a protected frame can be touched
  now → **declared** (`RestrictedActions*Documentation.lua`).
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
| `C_DamageMeter` | per-fight damage: secret in combat (declared), tables walkable, per-spell data copyable after (EnhanceQoL) | a mana coach (damage per mana per rank) |
| `C_Secrets.Should...BeSecret` / `Get...Secrecy` | know BEFORE reading if it'll be hidden | the map of what's hidden where |
| `C_CurveUtil` color curves | engine colors from secret numbers | does Evaluate work tainted? |
| `C_AssistedCombat.GetNextCastSpell` | Blizzard's rotation hint | available on Forever? (Blizzard's `AssistedCombatManager.lua` loads only on `mainline`: expect nothing) |

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

## 7. Learned from other installed addons

`references/addon-lessons.md`: every installed addon whose license allows reading (or reserves rights
without objecting), license-checked 2026-10-10, summarized in our own words. Never read the plusmouse
addons (their AGENTS.md refuses AI use). Headlines:
- A SECRET spell ID still gives its icon and name (`C_Spell.GetSpellTexture` / `GetSpellName` take
  secrets) and `UnitSpellTargetName` shows who a cast targets: display-only, works in battlegrounds.
- `UnitAffectingCombat("player")` can flip before `InCombatLockdown()`: a last window for secure changes.
- Secrets keep their Lua type; `..` takes them, `table.concat` throws; never store them in Blizzard tables.
- The combat log can't even be registered on Forever; nameplates scale with distance; Frost Nova
  freezes short of 10 yd.

## 8. Hooking Blizzard's Cooldown Manager

`references/cooldown-manager.md`: the four viewers, why hook them (Blizzard's untainted items see
secrets and raise engine edges: available, charge gained, aura applied/removed, pandemic, on
cooldown, even with no alert set), and the ten rules (post-hook per frame at acquire, never write
onto Blizzard frames, pooled frames move, read state from the item, tiny hook bodies, the player's
layout is theirs...).

`references/cooldown-manager-centered.md`: what Cooldown Manager Centered v5.7.8 (its Forever build,
"all rights reserved", own-words notes) teaches. Headlines:
- **Eleven rules for engine aura containers**: style the button ONLY inside `initializeFrame`; a
  child texture inherits the button's secret visibility (a free conditional visual); anchoring a
  protected aura protects your frame; no creation in combat; target containers need a nudge on
  target change.
- Edges from hooks: buff active/inactive, pandemic, ready flash, proc glow, action key presses.
- Frame identity → `cooldownID` → static info stays readable while the live spell ID is secret.
- Per-file `[AllowLoadGameType camelot]` tags let one .toc serve Retail and Forever.

## 9. Learned from Plater (and Blizzard's aura container code)

`references/plater.md`: Plater Nameplates (master 2026-10-10, `## Interface-Camelot: 16001`, "all
rights reserved", own-words notes), plus Blizzard's own container code it led to. Headlines:
- **Pre-create containers out of combat and lend them** to plates (`SetParent`), disabled when idle.
- **OR logic engine-side**: two groups, the main one excluding what the include group shows.
- The full candidate-filter list, sort methods, the processing policy, and `AddDispelTypeTexture`
  (a border the engine colors by dispel type).
- Detect features, not versions: `C_XMLUtil.GetTemplateInfo("CustomAuraContainerTemplate")`.
- `C_CurveUtil.EvaluateColorValueFromBoolean` per color channel; secret "is target/focus" → false.

## 10. Learned from Enhance QoL

`references/enhanceqol.md`: Enhance QoL 13.9.0's Forever-only build ("all rights reserved", own-words
notes). Headlines:
- **Engine-run aura animations**: hand your animation groups to an aura button; Blizzard plays them
  when the aura shows or enters its pandemic window. Plus the button's full display kit.
- **Per-aura filter test** with a plain boolean; restriction state with its Activating step;
  `UNIT_AURA_BLOCKED`; `ShouldSpellAuraBeSecret`.
- **"Cooldown finished" as an event** from an invisible engine cooldown.
- Damage meter on Forever: secret in combat, walkable tables, per-spell data after.
- It and Cooldown Manager Centered DISAGREE on creating containers in combat: follow the stricter
  rule until measured.

## 11. Learned from TargetedSpells

`references/targetedspells.md` (GPL-3.0: ideas, not code): enemy casts on nameplates and whom they
target, entirely on secret values: `PlayerIsSpellTarget`, nil-test of `UnitSpellTargetName`,
`IsSpellImportant`, nested `SetAlphaFromBoolean` as AND, cast-ID pairing, 4-unit event shards, and
`nameplateShowOffscreen` (off-camera casts have no duration without it).

