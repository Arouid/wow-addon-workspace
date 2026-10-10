# What Cooldown Manager Centered teaches (its Forever build)

**Source**: Cooldown Manager Centered by Wildu (CurseForge "WilduTools", project 1393605), **v5.7.8**
(2026-10-01), the CurseForge zip `CooldownManagerCentered-v5.7.8.zip`. Its `.toc` says
`## Interface: 120100, 16001`, so this is the build that loads on Forever. The GitHub copies
(markrosos/CooldownManagerCentered-Public 2.6.8, Sectimus/CooldownManagerCentered 2.1.5) are
Retail-only `.toc`s and were **not** used.
**License**: "All Right Reserved", private modifications allowed, no redistribution, no AI objection.
So: notes in our own words with file:line references, **no code copied**. Read 2026-10-10.
**Status**: everything is **reported** (the author's code and comments), unless marked **declared**
(we also found it in Blizzard's Forever source / generated docs) or measured by us later.

Paths below are inside the addon folder (`CooldownManagerCentered/...`).

## Forever specifics

| Idea | Summary | Where |
|---|---|---|
| Detecting Forever | The 4th value of `GetBuildInfo()` between 16000 and 19999 = Forever (the engine is 12.x, the toc number is 1.60+). Works alongside our `WOW_PROJECT_ID` 18 check. | `core/config.lua:8-11` |
| **Per-file load tags in an addon .toc** | One .toc for Retail + Forever: a file line ending in `[AllowLoadGameType camelot] [ExcludeLoadGameType standard]` loads only on Forever; `[AllowLoadGameType standard]` only on Retail. Blizzard's own tocs use the same tags (`Blizzard_ActionBar.toc`). | `CooldownManagerCentered.toc:53-92` |
| Forever data it ships | Spell-rank families per class, spell → aura links, potions, racials, defensive presets, all `_Camelot` files. The rank data says it was generated from **EnhanceQoL**'s Forever tables (a research lead: check EnhanceQoL's license). The spell → aura links were generated from the client's DB2 tables (Blizzard's cooldown "linked spell" rows plus spell-effect triggers): **no runtime API gives "which aura does this cast apply"**. | `modules/Tracker/SpellRanks_Camelot.lua:1-3`, `core/spellAuraLinkData_Camelot.lua:1-6`, `core/spellAuraLinks.lua:3-4` |
| Auto rank-up | When a higher rank is learned, the tracked lower rank's whole settings table moves to the new rank ID (position, alerts, colors kept); if the higher rank is already tracked, only missing settings are filled. Families are ordered by rank, not by ID. Forced on for warriors and rogues (no reason given). | `modules/Tracker/AutoRankUp_Camelot.lua:21-61` |
| No rotation helper on Forever | Blizzard's `AssistedCombatManager.lua` loads only on `mainline` (`Blizzard_ActionBar.toc:21`, **declared**); CMC calls `C_AssistedCombat.GetNextCastSpell` only behind an existence check. Expect nothing on Forever. | `modules/assistant.lua:86-91` |

## Way A: readable side channels

| Idea | Summary | Where |
|---|---|---|
| **Cooldown state that never turns secret** | `C_Spell.GetSpellCooldown` is secret when cooldowns are restricted, BUT its `isActive`, `isEnabled` and `isOnGCD` fields are declared `NeverSecret` (**declared**, `SpellSharedDocumentation.lua`; same for `SpellChargeInfo.isActive/maxCharges`). "On a real cooldown" = `isActive and isOnGCD == false`. Blizzard: trust `isOnGCD` only while handling `SPELL_UPDATE_COOLDOWN`; CMC treats an unknown (nil) GCD flag as "cooldown started", never as "ended", and samples on a fixed 0.1 s ticker that events only wake. | `modules/readyAlerts.lua:196-220, 573, 631, 678` |
| Frame identity → static info | A viewer item's live spell (`frame:GetSpellID()`) is secret in combat, but its cooldownID isn't: `securecallmethod(frame, "GetCooldownID")`, then `C_CooldownViewer.GetCooldownViewerCooldownInfo(cooldownID)` gives the configured `spellID` and `linkedSpellIDs` (still test each with `issecretvalue`). | `modules/Buffs/BuffSounds.lua:375-425`, `modules/assistant.lua:112-113` |
| Who started a shared cooldown | `C_Spell.GetLastCategoryCooldownSource(category)` returns the spell (and item) that last started a category cooldown, e.g. which potion. It can be secret in combat (seen by the author; the doc says `SecretWhenCooldownsRestricted`, **declared**). Keep the last readable answer and split it into two accessors: "never secret, for decisions" and "may be secret, display only". | `modules/Tracker/TrackerItemsData.lua:1050-1085`, `TrackerItemVisuals.lua:419-440` |
| One gate before keys and comparisons | `canaccessvalue(x)` before using an ID as a table key or comparing it; a secret ID still goes straight to the duration APIs. | `modules/Tracker/TrackerItemVisuals.lua:427-440` |
| Usable vs no mana | `C_Spell.IsSpellUsable` returns (usable, notEnoughPower): two tints, "no resource" vs "not usable". Re-check on `SPELL_UPDATE_USABLE` and the player's `UNIT_POWER_UPDATE`, coalesced 0.05 s. Event-driven range: `C_Spell.EnableSpellRangeCheck(id, true)` + `SPELL_RANGE_CHECK_UPDATE (spellID, inRange, checksRange)`; register each spell once, diff the set. | `modules/Tracker/TrackerUsability.lua` |
| **Which restriction is on** | `C_RestrictedActions.IsAddOnRestrictionActive(type)`. Types (**declared**, `RestrictedActionsConstantsDocumentation.lua`): 0 Combat, 1 Encounter, 2 ChallengeMode, 3 PvPMatch, 4 Map, **5 Chat** (addon chat restricted). CMC checks 0-4. | `core/api.lua:411-420` |
| Ask before touching a protected frame | `C_RestrictedActions.CheckAllowProtectedFunctions(frame, true)` (silent): if false, queue the change for `PLAYER_REGEN_ENABLED`. | `modules/cooldownManager.lua:15-33` |
| Sizes can be secret | `GetSize()` of a reparented frame can come back secret: check, skip the math, keep the last good size. | `core/api.lua:349-353` |

Our own find, prompted by this: **`ADDON_RESTRICTION_STATE_CHANGED (type, state)`** with state
`Activating` (1) is sent while a restriction is ABOUT to be enforced; enforcement waits until the
event's dispatch ends (**declared**, `RestrictedActionsDocumentation.lua:99`,
`RestrictedActionsConstantsDocumentation.lua`). An official last window before lockdown, cleaner than
watching `UnitAffectingCombat`. During that dispatch, `IsAddOnRestrictionActive` answers false.

## Way B: the event itself (hooks that give edges)

| Edge | Hook | Where |
|---|---|---|
| Tracked buff became active / inactive | `OnActiveStateChanged` on each buff item; keep the last state per frame in a weak table; if the frame's cooldownID changed, it's a reused pooled frame: re-prime, don't fire. | `modules/Buffs/BuffSounds.lua:375-440` |
| Pandemic window | `ShowPandemicStateFrame`, `TriggerPandemicAlert` on items (both in Forever's `CooldownViewer.lua:568, 586`, **declared**) | `modules/cooldownStyle.lua:1007-1012`, `modules/styled.lua:246-248` |
| Ready flash | `CooldownFlash.FlashAnim:Play` | `modules/cooldownStyle.lua:1038-1044` |
| Range / usable recolor | `RefreshIconColor` (item `needsRangeCheck` is set from `C_Spell.SpellHasRange`; `GetOutOfRangeTexture()`) | `modules/rangeCheck.lua` |
| Proc glow shown / hidden | `ActionButtonSpellAlertManager` `ShowAlert` / `HideAlert` (Forever: `Blizzard_ActionBar/Shared/ActionButtonSpellAlerts.lua`, **declared**); `C_SpellActivationOverlay.IsSpellOverlayed(id)` for the current state | `modules/cooldownStyle.lua:1804-1846`, `TrackerItemVisuals.lua:629-644` |
| A key pressed on an action slot | global `ActionButtonDown/Up(id)`, `MultiActionButtonDown/Up(bar, id)` (Forever: `Shared/ActionButton.lua:146`, `Shared/MultiActionBars.lua:35`, **declared**). CMC indexes every icon under all its spell IDs (self, override, base) ONCE, so a press is a few hash lookups and no allocation. | `modules/buttonPress.lua:23-34, 485-530` |

## Way D: the engine decides

| Idea | Summary | Where |
|---|---|---|
| **Curves on duration objects** | A two-point curve (0 → 1, 0.001 → 0) turns `duration:EvaluateRemainingDuration(curve)` into "1 when ready, 0 otherwise"; the reverse curve gives desaturation while on cooldown. Feed it to `SetAlpha` / `SetDesaturation`, never compare it. Works even with a SECRET spell ID passed straight to `C_Spell.GetSpellCooldownDuration`. | `modules/Tracker/TrackerItemVisuals.lua:57-66, 427-440, 486-497` |
| Counts that may be secret | `C_StringUtil.TruncateWhenZero(n)`: an integer as text, empty when zero; takes secrets (**declared**, `StringUtilDocumentation.lua`). For stacks / cast counts. | `TrackerItemVisuals.lua:50, 460` |
| **Engine-played aura sounds** | `C_UnitAuras.AddAuraSound(Enum.UnitAuraSoundTrigger.Added / ApplicationsIncreased / Removed, { unitToken, spellID, soundFileID or soundFileName, outputChannel, throttleSeconds 0-5 })` returns an ID; `RemoveAuraSound(id)`. The engine plays it when the aura event happens: Lua reads nothing (**declared**, `UnitAuraDocumentation.lua`, `UnitConstantsDocumentation.lua`; `HasRestrictions`; sounds stop after 5 s). CMC only (un)registers out of combat AND when `C_Secrets.ShouldAurasBeSecret()` is false, retries on regen / encounter end / entering world / zone change, and ref-counts one registration per (unit, spell, sound). | `modules/Buffs/BuffSounds.lua:108-314` |
| Spoken alerts | `C_VoiceChat.SpeakText(C_TTSSettings.GetVoiceOptionID(0), text, C_TTSSettings.GetSpeechRate(), 100, true)` | `modules/readyAlerts.lua:78-86` |
| Visibility from macro conditions | `RegisterAttributeDriver` with macro conditionals (combat, mounted...) drives the viewers' alpha; setting it up is combat-restricted (defer), and "in an instance" has no macro condition (use events). **Caution**: Priestly measured secure snippets broken on Forever (`loadstring_untainted` missing; state drivers "present but unusable", `priestly-magely.md`): test before relying on it. | `modules/visibility.lua:30-45, 252-336` |

## Engine aura containers: CMC's rules (feeds Mage Kit's Aura Lab and Context)

1. **Load `Blizzard_AuraContainer` out of combat only**: loading it creates secure/private template
   state; never start that from tainted code during lockdown. (`modules/auraTracking.lua:425-426`)
2. **Check the methods exist** (`AddAuraSlot`, `SetAuraSlotCandidateFilters`,
   `SetAuraGroupFilterString`, `SetEnabled`, `SetUnit`, `UpdateAllAuras`) before using a container.
   (`modules/AuraContainerRuntime.lua:8-15, 70-89`)
3. **Turn one off with `SetEnabled(false)`**, never `UnregisterEvent`: its event registrations are a
   forbidden aspect. Hide it and keep it for reuse. (`AuraContainerRuntime.lua:91-103`)
4. **`initializeFrame` is the only moment you own the AuraButton**: right after it returns, Blizzard
   denies tainted access to it while auras are secret, and `securecallfunction` doesn't make later
   code trusted. Create and style everything in that callback. (`auraTracking.lua:445-448`,
   `Buffs/CustomAuraProvider.lua:161-162, 203-205`; Mage Kit's `AuraLab.lua` already does this.)
5. **A child inherits the button's secret visibility**: a texture created on the AuraButton shows
   only while the engine shows the button, with no Lua reading. CMC uses it as a "cover": a copy of
   its tracker icon that hides the tracker's own cooldown swipe while the aura is up, so the aura's
   timer shows instead. A conditional visual for free. (`auraTracking.lua:555-558`)
6. Timer and stacks: give the button your own `CooldownFrameTemplate` via `SetDurationCooldown`,
   with `SetUseAuraDisplayTime(true)`; give it a FontString via `SetApplicationCount`, and the
   engine writes the (possibly secret) stack count there. (`auraTracking.lua:449-461, 560-580`)
7. **Anchoring protects**: parenting or anchoring a protected aura to your icon makes your icon
   protected too, and even UIParent-relative offsets of the aura's anchor are blocked in combat. Keep
   containers under UIParent; move and size an addon-owned "host" around them, which stays legal in
   combat. Size with the host's scale (the container's element size only changes its flow
   footprint). (`auraTracking.lua:118-119`, `CustomAuraProvider.lua:627-691`)
8. **One container per (entry, unit), one group each**: the FlowLayout auto-sizes it and collapses
   it to 0 when nothing matches; chain the containers with anchors. (`CustomAuraProvider.lua:338-341`)
9. **No creation in combat**: building a container or slot in combat, or changing its filters,
   leaves a partial init that taints later template loads. In combat only alpha, `SetEnabled` and
   `UpdateAllAuras`. (`auraTracking.lua:691-694`) Enhance QoL says the opposite for the current build
   (creation in combat allowed, only the addon load deferred): see `enhanceqol.md`; keep this
   stricter rule until we measure it.
10. **Target containers don't follow target changes**: on `PLAYER_TARGET_CHANGED`, and the target's
    `UNIT_FACTION` / `UNIT_TARGETABLE_CHANGED`, call `SetEnabled` + `UpdateAllAuras`.
    (`auraTracking.lua:824-838`)
11. Filters it uses: player `HELPFUL`, target `HARMFUL|PLAYER`, with
    `candidateFilters.includeSpellIDs`. (`auraTracking.lua:12-15, 549-550`)

## Cooldown Manager details (complements `cooldown-manager.md`)

- Enumerate a viewer's direct children and filter them yourself: Blizzard's layout-child accessor
  sorts a protected table. (`core/api.lua:309-311`)
- Per-frame state in a weak-keyed side table, no fields on Blizzard frames (the 5.7.8 code moved to
  this; older Retail versions wrote fields). (`core/api.lua:260-261`)
- Blizzard's item colors are public constants: `CooldownViewerConstants.ITEM_USABLE_COLOR`,
  `ITEM_NOT_ENOUGH_MANA_COLOR`, `ITEM_NOT_USABLE_COLOR`, `ITEM_AURA_COLOR`, `ITEM_COOLDOWN_COLOR`.
  (`core/config.lua:16-26`, `modules/rangeCheck.lua:36-43`)
- The viewers themselves aren't protected: `Show()` works in combat, but runs Blizzard's
  OnShow/RefreshLayout as addon code, so only when needed. (`modules/runtime.lua:81-82`)
- Right-click options on an item: `Menu.ModifyMenu("MENU_COOLDOWN_SETTINGS_ITEM", fn)` (the tag is
  set in Forever's `CooldownViewerSettings.lua:346`, **declared**). (`modules/cooldownStyle.lua:2226`)
- CMC DOES re-anchor Blizzard's item frames (to center them), guarded by
  `CheckAllowProtectedFunctions` and deferred in combat. Our rule stays: prefer our own frames.

## Ideas for us

- **Context**: aura sounds through `AddAuraSound` (mage procs: Clearcasting, Presence of Mind...),
  correct even when auras are secret; "spell ready" conditions from `isActive` / `isOnGCD`; ready
  glows from the ready curve; the "cover" trick for "show X only while aura Y is up".
- **Mage Kit**: Curses window's before-lockdown step on `ADDON_RESTRICTION_STATE_CHANGED`
  (Activating); `EnemyShare` checks `IsAddOnRestrictionActive(5)` (Chat) before sending; Aura Lab
  gets the cover child, `SetUseAuraDisplayTime`, and target-follow.
