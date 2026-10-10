# What EllesmereUI's comments teach (summarized)

Source: EllesmereUI 9.4 by Ellesmere, as installed for WoW: Forever 1.60.1 (read 2026-10-10 in
`World of Warcraft/_classic_beta_/Interface/AddOns/EllesmereUI*`). Its license reserves all rights,
so nothing here is copied: each entry is OUR summary of an idea, with the file to read for the
author's own explanation. Status per the catalog: these are **reported** (the author's field notes)
until we see them ourselves. Credits the author gives are kept.

## Showing what Lua can't read

| Idea | Summary | Where |
|---|---|---|
| **Engine aura containers** | `CreateFrame("AuraContainer")`, then aura groups and slots defined by FILTER strings: the engine finds the matching auras and draws the buttons (icon, stacks, cooldown, duration text) itself, secret or not, inside instances too. EllesmereUI routes every aura display of the suite through one helper file. | `EllesmereUI/EllesmereUI_AuraKit.lua` (whole file), `EllesmereUINameplates/EUI_Nameplates_AuraContainers.lua` (header) |
| Filter strings must be canonical | The engine shares one aura scan between groups only when their filter strings are byte-identical, so the suite builds every filter in one fixed token order (polarity first, the rest sorted). | AuraKit, "Filter normalization" |
| Container creation in combat | Legal since build 68914 per the author's field test; the nameplate code still pre-creates a pool at login (plates appear in bursts) and attaches/detaches bundles as plates come and go. | AuraKit ~1553, ~1837; AuraContainers header |
| Rebuilding Blizzard's plate debuff list | Blizzard's own per-plate debuff/buff lists are locked to addons in 12.1, but their rule can be reproduced: fetch `HARMFUL\|INCLUDE_NAME_PLATE_ONLY` and keep auras flagged for the personal plate (a candidate filter). | AuraContainers header |
| Duration text on secret times | Pass the engine a number formatter (`C_StringUtil.CreateNumericRuleFormatter`, or `CreateSecondsFormatter` as a fallback); it formats the (possibly secret) remaining time engine-side. Round seconds UP so "0" never shows while time remains; a band at exactly 60 s avoids a "0m" flash. | AuraKit, "Duration text formatters" |
| A field-incident warning | Re-queuing work on an engine button every frame produced an error storm (~1300 errors) in build 68745: change-guard every write to engine buttons. | AuraKit ~1397 |
| **Tint only while debuffs are present** | Nest one container slot per spell inside the previous spell's engine button: the innermost tint renders only while EVERY engine button above it is shown, an AND computed entirely by the engine. Never read the aura payloads. Technique credited to Jeebz (PlateTweaks), used with permission. | `EllesmereUINameplates/EllesmereUINameplates_DebuffColors.lua` (header, ~412-430) |
| Secret visibility as alpha | An engine button's `IsShown()` can be a SECRET boolean (aura present or not): don't test it, feed it to `SetAlphaFromBoolean` on whatever should follow it. | `EllesmereUICooldownManager/EllesmereUICdmBuffBars.lua` ~4261 |
| Charges without numbers | Secret charge counts drawn as geometry: textures sized from duration objects, so the engine places the edges with no Lua arithmetic. | CdmBuffBars ~4699-4750 |

## Living with secret values

| Idea | Summary | Where |
|---|---|---|
| Secret sinks | `SetValue`, `SetText`, `SetFormattedText` arguments, color setters and `SetAlphaFromBoolean` accept secrets: pass them through, never compare, concatenate or do math. A secret count goes to `SetValue`/`SetText` untouched. | CdmBuffBars ~4111, ~4124, ~4965; NameplatesFriendly ~754, ~840 |
| Test secrecy first | Comparing a secret (even `== nil`) throws, and so do relational tests; check `issecretvalue` before anything else. (One nameplate note calls a bare truthiness test safe while `==` throws; the cooldown notes treat any test as unsafe: test secrecy first either way.) | ThreatData ~16; CdmBarGlows ~458; NameplatesFriendly ~105 |
| Frame identity never turns secret | A pairing "this config ↔ this frame" made out of combat survives into combat even when the frame's spell ID reads secret; trust the sticky binding then, re-derive only on clean reads. | CdmBuffBars ~3285-3290 |
| Cooldowns in combat | `isActive` stays readable while start time and duration turn secret. | CdmBuffBars ~5028 |
| Never-secret signals | Your own `UNIT_SPELLCAST_SUCCEEDED` spell ID; spell-activation glow event spell IDs; Loss of Control `priority` and `displayType` (NeverSecret in the docs). | CdmBuffBars ~4526, ~4625 |
| Presence by known spell ID | Asking for an aura by a KNOWN spell ID still finds it when its fields are secret, so "it just appeared" is detectable mid-fight without reading the ID back. (Contrast: by NAME returns nil.) | CdmBuffBars ~4313 |
| Stack counts | Aura application counts read secret even in the open world. | CdmBarGlows ~156 |
| Secret geometry | Inside the restricted nameplate tree `GetWidth`/`GetPoint` can return secrets: keep the widths you SET, don't measure. | NameplatesFriendly ~286; Nameplates_Faction ~37 |
| Unit comparison under identity restriction | Measured by the author in a 12.1 dungeon: the client answers "is this unit me?" (a secret boolean) and refuses every other pairing by returning nothing, not by erroring. `C_Secrets.CanCompareUnitTokens` says which. | `EllesmereUI/EllesmereUI_Colors.lua` ~483 |

## Forever specifics

| Idea | Summary | Where |
|---|---|---|
| **Threat is readable** | Forever hands the threat API over readable (`C_Secrets.ShouldUnitThreatValuesBeSecret` is false there); a value that does come back secret skips that unit. Threat events fire for every unit in every nearby fight: register them only while needed. Derived tokens (`targettarget`) get no threat events: re-read them on a short interval in combat. | `EllesmereUIForeverEssentials/..._ThreatData.lua` header; `_ThreatFeed.lua` ~150-200 |
| The 12.1 script watchdog | Long passes that scale with data are split into steps run under a CPU budget (~8 ms per slice), continuing with `C_Timer.After(0)`; even the first slice is deferred. | `EllesmereUI/EllesmereUI.lua` ~999 |
| Client gate | Forever is Blizzard game type "camelot" (12.1 engine, vanilla content); the suite gates Forever-only code on it at load. | `EllesmereUI/EllesmereUI_ClientGate.lua` |
| Flight timer with no API | No flight duration is exposed: route lengths come from datamined data, time = length / speed, the speed learned from each normal landing (moved a quarter of the way, outliers ignored). `UnitOnTaxi` is still false at takeoff (use the flight-map click); `PLAYER_CONTROL_GAINED` marks the landing. | `..._FlightTimer.lua` header, ~493-512 |
| Animation drift | One long translation animation ran too fast in the client: short slides restarted every tick from the exact spot don't drift. A plain `SetValue` doesn't reliably take a status bar back after `SetTimerDuration`. | `..._FlightTimer.lua` ~177-180, ~314 |
| Language-proof chat parsing | Match chat lines against the client's own localized global format strings (turned into patterns, argument order handled), so it works in every language. | `..._LootFeed.lua` header, ~54-73 |
| Uprank on learning | When a new rank is learned, swap lower ranks on the action bars (needs no combat and an empty cursor). A mage keeping a rank-1 on purpose wants an exception list. | `..._Uprank.lua` |
| Never write onto Blizzard frames | Keep per-frame state in weak-keyed tables of your own, never as custom keys on Blizzard widgets (taint). Nameplate CVars and the plate hit-test API are protected in combat: defer to `PLAYER_REGEN_ENABLED`. | Nameplates ~34, NameplatesFriendly ~791, ~1805, ~1917 |

## For Mage Kit

- `PlateAuras.lua` reads aura instance IDs in Lua: rebuilding it on **engine aura containers** would
  keep the sheep, DEF and CC badges working where Lua reads fail (instances, battlegrounds).
- The **nested-tint** idea could color a plate while your Polymorph is on it, with no reading at all.
- A **threat meter** is possible on Forever (readable threat): "you're about to pull aggro" for a mage.
