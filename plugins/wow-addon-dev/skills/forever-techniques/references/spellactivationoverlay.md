# What SpellActivationOverlay teaches: proc alerts on Forever

**Source**: SpellActivationOverlay (SAO) by Ennvina, GitHub `ennvina/spellactivationoverlay`, branch
`main` (pushed 2026-10-10), v2.8.0-alpha, `.toc` includes `16001`. **License**: MIT (`LICENSE`): code
reusable in Context and Mage Kit with its copyright notice. Its `.github/copilot-instructions.md` is
an AI development guide, not an objection. Read on GitHub without downloading, 2026-10-10.
**Status**: **reported** unless marked **declared**.

| Idea | Summary | Where |
|---|---|---|
| Detecting Forever | `WOW_PROJECT_ID == (WOW_PROJECT_FOREVER or WOW_PROJECT_CAMELOT or 18)` (the constant's name wasn't stable during the beta; the toc-range test is kept commented as the alternative). Forever counts as having the Midnight UI. | `components/project.lua:4-25, 56-90` |
| **Ask before choosing a path (way E)** | For each overlay, `C_Secrets.GetSpellAuraSecrecy(spellID)`: `NeverSecret` → the normal Lua path (it can read the aura); otherwise → an engine-driven overlay. Engine mode needs `C_Secrets.GetSpellAuraSecrecy` to exist. | `components/auracontainer.lua:6, 280-300` |
| **Proc art on the engine's aura button** | One container for `"player"` (`SetUnit`, `SetEnabled(true)`), and per overlay position an `AddAuraSlot(key, "HELPFUL", { templateNames = { "SAOAuraButtonTemplate" }, initializeFrame = ..., candidateFilters = { includeSpellIDs = { [procSpellID] = true } } })`: the slot's button comes from the addon's OWN XML template (texture, icon, count, cooldown, pulse animation), so the engine shows the whole proc graphic exactly while the buff is up, in combat. In `initializeFrame`: `SetIcon`, `SetDurationCooldown`, `SetApplicationCount`, frame level, geometry, start the pulse. | `components/auracontainer.lua:70-170, 236-260` |
| The icon is the game's | A texture handed to `SetIcon` gets overridden by the client with the aura's icon: hide `GetIcon()` and draw your own texture (with flips / rotations by texture coordinates) next to it. | `components/auracontainer.lua:118-125` |
| Stacks | With secret auras an overlay can only mean "any stacks": stack-specific overlays don't work in engine mode (cf. EverAuras' stack gates). | `components/auracontainer.lua:300-305`, `variables/aurastacks.lua:12-26` |
| Mage procs on Forever | Its custom Clearcasting / Frozen / Hot Streak logic is disabled on Forever (it relied on the combat log); procs are shown from the buff itself. | `classes/mage.lua:13-17` |
| Modern aura tracking | Aura stacks from `UNIT_AURA` (Modern) instead of `COMBAT_LOG_EVENT_UNFILTERED` (Legacy). | `variables/aurastacks.lua:132-170` |

The `templateNames` option (additional templates inherited after `CustomAuraButtonTemplate`) exists
for aura groups, aura slots and weapon-enchant frames (**declared**:
`Blizzard_AuraContainer/Blizzard_AuraContainerShared.lua:132-134, 174-176, 239-241`).

## Ideas for us

- **Context phase 1 (mage procs)**: proc alerts exactly like this: an engine aura slot per proc with
  our own XML template; never-secret spells keep a Lua path (sounds, conditions); reuse allowed (MIT).
