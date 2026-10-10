# What TellMeWhen teaches: aura reading in "restricted mode", and combat-ready icons

**Source**: TellMeWhen (Cybeloras / ascott18, originally NephMakes), GitHub `ascott18/TellMeWhen`,
branch `master` (pushed 2026-10-03), v12.1.5, `.toc` includes `16001`. **License**: GPL-3.0
(`LICENSE.txt`): read freely, **ideas only** for all our addons (GPL-3.0 code can't be mixed into
Context, which may hold GPL-2.0-only code). Read on GitHub without downloading, 2026-10-10.
Finess's favourite: TMW is the classic "conditions" addon, i.e. deriving conditionals.
**Status**: **reported** unless marked **declared**.

## The aura model while auras are secret (the clearest statement so far)

From `Components/Core/Common/Auras.lua:45-258`:
- While auras are secret (12.1 engine), **every aura read that takes an index, a slot or an
  auraInstanceID errors outright**, and **`UNIT_AURA`'s payload is entirely secret**.
- **Only reads by identifier survive**: `C_UnitAuras.GetUnitAuraBySpellID` and
  `GetAuraDataBySpellName`, which return real data for spells Blizzard flags never-secret and
  **nothing at all** for the rest (matches Mage Kit's 1230/1230 nil for Arcane Intellect by name in
  combat).
- So a unit's auras **can't be enumerated, only interrogated one identifier at a time**. TMW resolves
  identifiers on demand; the set that has been asked for is what `UNIT_AURA` re-reads, so nothing has
  to register anything.
- **Auras that were secret in combat become readable again when combat ends WITHOUT any
  `UNIT_AURA`**: caches holding unreadable data are stale until rebuilt. TMW watches the restriction
  flip on its update tick (it found no event) and drops every unit's cache when it changes mode.
- Unit tokens themselves can be secret (a player / pet NAME instead of a token), making
  `GetAuraDataByIndex` throw: wrap in `pcall`.
- TMW treats `IsAuraFilteredOutByInstanceID` as an instance-ID read (unusable in restricted mode),
  although the docs give it no secrecy flag. **Our catalog counts on it**: Mage Kit's test 14 will
  settle it. Mage Kit's curse/buff counts use `GetUnitAuraInstanceIDs` lists, which TMW doesn't
  cover: measure them in combat too.
- Small facts: the Enrage dispel type was an empty string until a 2026 fix ("Enrage");
  `isStealable` can be secret.

## Combat-ready icons (`IconModule_AuraContainer`, `IconType_buffcontainer`)

From `Components/IconModules/IconModule_AuraContainer/AuraContainer.lua:22-290`:
- Icons render auras through Blizzard's `AuraContainer` / `AuraButton` instead of TMW's own scan,
  fed a static "aura spec" (unit + filter strings, e.g. `HARMFUL|INCLUDE_NAME_PLATE_ONLY`).
- **The stamp**: each frame gets `DenyTaintedAccessWhenAurasAreSecret` as soon as `initializeFrame`
  returns (deferred to `PLAYER_ENTERING_WORLD` for frames made before login). While auras are secret
  it denies **every call** on the frame, not only secret reads: `button:SetSize()` is a hard error.
  So skin new buttons only in `initializeFrame`; re-skin existing ones only when
  `button:CanBeAccessedInContext()` says so, otherwise park the change and replay it when the
  restriction lifts (polled: no event).
- Groups and slots **can't be removed**, but their filter strings can change: reassign them by index;
  park unused groups with `maxFrameCount 0`, unused slots with a filter matching nothing. Groups for
  N auras across a group of icons, slots for one aura per icon.
- **Secret duration text in your own format**: `C_StringUtil.CreateNumericRuleFormatter` with
  breakpoints ("9.9" under 10 s, "42" under a minute, "M:SS", "H:MM:SS", "D:HH:MM:SS"), floor
  rounding, instead of Blizzard's "1m / 2h". (**declared**: `NumericRuleFormatter`, `StringUtilDocumentation.lua`)
- Feature detection of the caster-name widget off a **throwaway instance**: `Blizzard_AuraContainer`
  loads its Lua into the secure environment, so only its XML templates are visible to addons.
- What can't be honoured with secret remaining time: gradients by time left, a "fake max" on the
  bar, GCD handling on the bar.

## Combat secrecy, told to the user

The normal Buff/Debuff icon has a **secrecy panel** under its spell list: which of the entered spells
can be read in combat, which can't, and a link that converts the icon to the combat-ready type
(`IconType_buff/buff.lua:101-123`, `Auras.RegisterSecrecyPanel`). An option hides the icon while
auras are secret.

## Conditions and other facts

- TMW's conditions fall back to a safe value when an input is secret (0, false, "never"), each return
  checked on its own: totem name, start and duration can be secret independently.
  (`Conditions/Categories/Spells.lua:54-230, 972-1017`; `UnitAttributes.lua`; `Resources.lua`)
- **Forever has no `UNIT_HEALTH_FREQUENT`** (Camelot dropped it with the modern engine, though the
  content is Classic). (`Conditions/Categories/Resources.lua:80-81`)

## Ideas for us

- **Context**: interrogate auras by identifier (never enumerate) in combat; rebuild caches on the
  restriction flip; reskin only when `CanBeAccessedInContext`; a secrecy panel in the editor telling
  which spells work in combat; TMW-style duration text via a rule formatter.
- **Mage Kit**: measure `GetUnitAuraInstanceIDs` and `IsAuraFilteredOutByInstanceID` in combat
  (tests 14 and the curse window).
