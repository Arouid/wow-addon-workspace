# The rules of hooking Blizzard's Cooldown Manager on Forever

Read 2026-10-10 in Blizzard's Forever source (`Interface/AddOns/Blizzard_CooldownViewer`, the generated
docs `CooldownViewer*Documentation.lua`), plus EllesmereUI's field notes (`EllesmereUICooldownManager`,
summarized in our words). Status: **declared** (source) / **reported** (EllesmereUI) until measured by us.
A full addon built on these hooks, read 2026-10-10: `cooldown-manager-centered.md` (more hook points:
`OnActiveStateChanged`, `ShowPandemicStateFrame`, `RefreshIconColor`, the ready flash, the proc-glow
manager, action key presses; and the engine aura container rules).

## What it is

- `Blizzard_CooldownViewer` loads on Forever (`## AllowLoadGameType: standard, camelot`).
  `C_CooldownViewer.IsCooldownViewerAvailable()` says whether it's on (it's switched on in the game's
  options / Edit Mode).
- Four named viewer frames: `EssentialCooldownViewer`, `UtilityCooldownViewer` (your cooldowns),
  `BuffIconCooldownViewer` (Tracked Buffs, icons), `BuffBarCooldownViewer` (Tracked Bars). Categories
  (`Enum.CooldownViewerCategory`): Essential, Utility, TrackedBuff, TrackedBar, GroupBuff, plus
  spec-agnostic and equip-slot sets.
- Each viewer draws its items from a frame pool (`viewer.itemFramePool`, `CreateFramePool`); items get
  their data from `C_CooldownViewer.GetCooldownViewerCooldownInfo(cooldownID)` and the usual spell /
  aura APIs, as UNTAINTED Blizzard code: they read secrets that our code can't.
- Which spells are in which category is the PLAYER's choice, in the Cooldown Manager settings
  (`C_CooldownViewer.GetCooldownViewerCategorySet(category, allowUnlearned)` lists them;
  `GetLayoutData` / `SetLayoutData` hold the saved layout as a string).

## Why hook it at all

Blizzard's code sees what ours can't. Its items know, even in combat and instances:
- whether a cooldown is active, when it ends (drawn by the engine), charges;
- whether a tracked aura is on, its duration, its pandemic window;
- range and usability of the spell (`C_Spell.EnableSpellRangeCheck`, an event-driven range test).
And it raises **edges**: every item calls, on itself, the alert triggers, all of which route through
`CooldownViewerItemMixin:TriggerAlertEvent(event)` (it then finds no alert and plays nothing).
Hooking that gives "it just happened" signals for anything the player tracks there: way **B** (the
event itself) of deriving a conditional. **Corrected 2026-10-10** (Context's criterion-8 review,
`CooldownViewer.lua` build 70245): NOT every edge fires without a player-set alert.
- Fire regardless of alerts: **on cooldown** (`RefreshSpellCooldownInfo`, on the GCD-to-real-cooldown
  transition only, `allowOnCooldownAlert`), **aura applied / removed** (the viewer's `UNIT_AURA`
  path through `auraInstanceIDToItemFramesMap`), **pandemic** (registers its own OnUpdate).
- Fire ONLY with a player-set alert: **available** and **charge gained** come from the item's
  `OnUpdate`, and `NeedsOnUpdateRegistration` is `pandemicAlertTriggerTime or next(alertsByEvent)`.
  To know a cooldown ended, read the never-secret `isActive` of `C_Spell.GetSpellCooldown` (false
  and `isEnabled` not false) and raise your own edge.

## The rules

1. **Post-hook only**: `hooksecurefunc(object, "Method", fn)`. Never replace a Blizzard function or
   method, never `SetScript` on a Blizzard frame (taints it, and Blizzard's own code then fails in
   combat with your addon named).
2. **Hook per frame, at acquire**: mixin methods are copied into each frame when it's created, so
   hooking the global mixin table misses frames that already exist. Hook the viewer's
   `OnAcquireItemFrame(itemFrame)` (and walk `itemFramePool:EnumerateActive()` once at start-up),
   then hook each new item's trigger methods, once per frame object.
3. **Never write onto Blizzard frames**: no `itemFrame.myField = ...`. Keep per-frame state in a
   weak-keyed table of your own (`setmetatable({}, { __mode = "k" })`).
4. **Pooled frames move**: the same frame object serves another spell after a release. Re-resolve
   which spell a frame shows on every acquire; a binding made out of combat can be trusted while
   values are secret (frame identity never turns secret), refreshed on the next clean read.
5. **Read state from the item, not around it**: `itemFrame:IsActive()` for active/inactive; a value
   read from the item may be secret: test `issecretvalue` first, then display only.
6. **Decorate, don't own**: adding our own child regions (a glow, a border, a text) to an item is
   possible but the item may become forbidden to tainted code while auras are secret; prefer our OWN
   frames positioned over the viewer, or our own displays fed by the hooked edges.
7. **Hooks cost CPU billed to us**: keep hook bodies tiny (set a flag, enqueue), do the work on a
   throttled tick; zero allocation in paths that run every frame.
8. **Combat**: no creation of secure things in combat; anything protected is created out of combat
   and only re-painted in combat.
9. **The player's layout is the player's**: read `GetLayoutData` if needed, never `SetLayoutData`
   without an explicit action of theirs.
10. **What's not in a category fires nothing**: to get engine edges for a spell, it has to be in the
    Cooldown Manager (the player adds it, or we guide them to). For spells outside it, fall back to
    our own sources (engine aura containers, cast events, cooldown duration objects).

Learned from Context's criterion-8 review (2026-10-10, `CooldownViewer.lua` and
`CooldownViewerItemData.lua`, build 70245; status: declared in source, checked by headless tests
against stubs that follow Blizzard's call order, not yet seen in game):

11. **Acquire comes BEFORE the cooldown ID.** `RefreshLayout` does `ReleaseAll` (the pool's reset
    callback runs `ResetCooldownData`, so `cooldownID` is nil) and acquires the frames, calling
    `OnAcquireItemFrame` on each; `RefreshData` then calls `SetCooldownID` → `OnCooldownIDSet`.
    So the frame's spell is unknown inside the acquire hook: bind in a post-hook of the item's
    `OnCooldownIDSet`, drop the binding in a post-hook of `ResetCooldownData`, and never trust what
    an item said before a release (rule 4). Both methods are mixin methods copied onto each frame.
12. **A cooldown item is "active" as soon as it is bound.** `CooldownViewerItemMixin:ShouldBeActive`
    is `self.cooldownID ~= nil`; only `CooldownViewerBuffItemMixin:ShouldBeActive` (Tracked Buffs
    and Tracked Bars items) follows the aura. Read `OnActiveStateChanged` / `IsActive()` as "aura
    on" only on the two buff viewers' items.
13. **Glow events are broadcast.** The viewer calls `OnSpellActivationOverlayGlowShowEvent(spellID)`
    and `...HideEvent(spellID)` on EVERY active item for every `SPELL_ACTIVATION_OVERLAY_GLOW_*`
    event; the item returns early unless `spellID == self:GetSpellID()`
    (`NeedSpellActivationUpdate`). A post-hook runs after that early return, so it must compare the
    spell ID itself (test `issecretvalue` first).
14. **A hook body that throws aborts Blizzard's loop.** The alert triggers run inside the viewer's
    loops over its items (`CheckAuraRemovedAlertTriggers` and friends): an error in a post-hook
    stops Blizzard's remaining items for that event, blamed on the addon. `pcall` a named function
    inside each hook and keep the error for a probe command.

## Useful building blocks seen in its code

| Need | Use |
|---|---|
| Import/export strings | `C_EncodingUtil.SerializeCBOR` → `CompressString` → `EncodeBase64` (and back) |
| Sounds with options | `C_Sound.PlaySoundWithOptions` (the alerts' sound path); its sound list `Enum.CooldownViewerSound` includes text-to-speech |
| Proc glow state | `C_SpellActivationOverlay.IsSpellOverlayed(spellID)` |
| Event-driven range | `C_Spell.EnableSpellRangeCheck(spellID, true)` then `SPELL_RANGE_CHECK_UPDATE` |
| Pandemic window | `C_UnitAuras.GetRefreshCarryOverDuration` (how much a recast would carry over) |
| Charges | `C_Spell.GetSpellCharges`, `GetSpellCastCount` |

## What's NOT here

`Blizzard_CooldownBroadcaster` is an esports tool (sends cooldowns to tournament commentators): ignore it.
