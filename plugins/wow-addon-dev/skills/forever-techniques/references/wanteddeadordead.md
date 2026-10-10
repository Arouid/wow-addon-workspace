# What "Wanted: Dead or... Dead" teaches: world PvP enemy awareness on Forever

**Source**: Wanted: Dead or... Dead (`wanteddeadordead/wanted-dead-or-dead`, branch `main`, pushed
2026-10-10), Forever-only (`## Interface: 16001`, `## X-License: MIT`): bounties, nearby enemies, who
is targeting you, stealth alarms, shared between players of a faction and (optionally) sent to a
website. **License**: MIT: code reusable in Mage Kit / Context with its notice. Read on GitHub
without downloading, 2026-10-10. It solves the same problems as Mage Kit's Enemies window, so the
two designs are compared below.
**Status**: **reported** unless marked **declared** (Forever docs, build 70245).

## Enemy detection (`Enemies.lua`, `NearbyWindow.lua`)

| Idea | Summary | Where |
|---|---|---|
| Sources | The combat log is closed, so enemies are seen through unit tokens: nameplates (`NAME_PLATE_UNIT_ADDED/REMOVED`), target, focus, mouseover, plus `UNIT_TARGET` (an enemy changed target: rescan at once) and `UNIT_SPELLCAST_SUCCEEDED/STOP`. A 1 s scan; "in sight" while a token showed them in the last scan, "nearby" within 60 s of the last sighting, shaded after 30 s. | `Enemies.lua:5, 29, 46-56, 180-215` |
| **Never in instances** | No unit is read in an instance: identity is secret there and nothing there is world PvP (a battleground's enemies, a mind-controlled party member). | `Enemies.lua:186-190` |
| **Stealth** | "The game doesn't report Stealth or Vanish at all (not even as a hidden cast)": the plate just goes, and the target too if they were your target. A plate also goes when the camera turns or a wall is in the way (the target STAYS), and both go when they walk out of view. So **only your target counts**: nameplate and target gone together while within ~28 yd (`CheckInteractDistance` index 4, fresh for 1.5 s) and alive; plates that go together within 0.2 s (3+: loading screen, your teleport) aren't stealth; a cast bar that just ended (Hearthstone, teleport) explains a vanish; only someone seen acting in the last 30 s (casting, targeting you) is guessed to have stealthed, anyone else more likely logged off or zoned. One alarm per 3 s. | `Enemies.lua:31-48, 66` |
| Targeting you | "Seen targeting us within 2.2 s" counts as targeting now; listeners get `targeted` (the list) and `newTargeter`. Deaths: the death recap (`C_DeathRecap.GetRecapEvents`, **declared**), else the one enemy who had you targeted within 6 s before you died. | `Enemies.lua:7, 60, 221-232` |
| **PvP flag event** | `PLAYER_PVP_FLAG_CHANGED` exists from build 70170 (**declared**, `PvpInfoDocumentation.lua`): the moment your flag turns on or off; register it only if `C_EventUtils.IsEventValid` says so. Plus `PLAYER_FLAGS_CHANGED`, `UNIT_FACTION` (player), `UnitIsPVP`, `UnitIsPVPFreeForAll`, `UnitIsPVPSanctuary`. | `NearbyWindow.lua:100-112` |
| Secure rows in combat | Rows are secure buttons (targeting needs one): in combat they keep their players and only text updates; new players fill empty rows as text, not clickable until combat ends; showing/hiding anything on them is blocked in combat, so the health bar is shown once and faded with alpha. | `NearbyWindow.lua:3, 524-552, 647` |
| Health of a stranger | Secret: a StatusBar draws it without the addon reading it. | `NearbyWindow.lua:541` |
| **Targeting macro for "First Last" names** | Lines tried in turn, each only while nothing is targeted yet: `/cleartarget`, `/targetexact First Last`, `/targetexact [noexists] First-Last`, `/targetexact [noexists] First`, `/target [noexists] First Last`; the name is cleaned before it enters the macro. | `NearbyWindow.lua:589-605` |
| **Lifetime honorable kills of anyone** | Achievement comparison statistic **588** "Total Honorable Kills" via `SetAchievementComparisonUnit` + `INSPECT_ACHIEVEMENT_READY` (**declared** event), probed on 70205 (2026-10-05): works on target or mouseover, either faction, one player every few seconds, never in combat / instances / while the achievement window is open; a comparison started by anyone else (the window, another addon) takes precedence. | `HonorScout.lua:1-62` |

## Sharing

Addon messages to your faction with a registered prefix; **cross-faction bounties travel through
Battle.net friends** (`C_BattleNet.SendGameData` to friends' game accounts in Forever, friends first,
messages split in parts under their own prefix). Realm names are compared without spaces, dashes,
apostrophes or case. Guild officer ranks from the guild roster, with secret values left out.
(`Bridge.lua:1-50, 144`, `GuildRank.lua`)

## Compared with Mage Kit's Enemies (`Enemies.lua`, `EnemyTargeting.lua`)

- Same core: unit tokens, no combat log, stealth = plate gone while close and alive. Wanted adds
  **target + plate gone together**, the 0.2 s mass-removal filter, the "recently acting" filter and the
  cast-bar grace; Mage Kit adds the **on-screen-edge** guard (plate inside 10 % of the edge = camera).
  Both are worth having.
- Wanted keys by GUID (readable in the open world); Mage Kit by full name. Both avoid instances.
- New for Mage Kit: `PLAYER_PVP_FLAG_CHANGED`, honorable kills via statistic 588, Battle.net sharing
  across factions, the alpha-only health bar inside secure rows.
