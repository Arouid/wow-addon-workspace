# What BazUI teaches: secrets you can't catch, and the per-aura question

**Source**: BazUI by Baz (`BazAddons/BazUI`, branch `main`, pushed 2026-10-10, release 023), `.toc`
`## Interface: 16001, 120100`, `## X-License: GPL-2.0-or-later`. **License**: GPL-2.0-or-later: code
reusable in Context with its notice; ideas only for Mage Kit. Read on GitHub without downloading,
2026-10-10. `Core/Compat.lua` is a long, careful essay on Forever's secrets, worth reading whole.
**Status**: **reported** (the author's in-game experience, build 69893+) unless marked **declared**.

| Lesson | Summary | Where |
|---|---|---|
| **Three things a secret forbids** | Comparing, arithmetic, AND testing for truth all raise. A secret **boolean** (e.g. `UnitIsUnit`, `SecretWhenUnitComparisonRestricted`) can't even go in an `if`: `if UnitIsUnit(a, b) then` raises before the body. BazUI wraps every read in a function with a fallback that keeps the UI looking normal ("not the same unit", "has power"). | `Core/Compat.lua:103-160` |
| **Ask by trying, never by version** | Which values are secret varies by power type, unit and context: a version rule goes stale. | `Compat.lua:114-117` |
| **Secret colors render BLACK** | `GetClassColor` accepts a secret class from a tainted caller and returns a color whose parts are secret; every color setter ACCEPTS it, then draws black, with no error. "Accepting a value and rendering it are not the same thing." Anything reaching a widget as a color must be a number you were allowed to read; otherwise pick your own color. (Cf. `C_CurveUtil.EvaluateColorValueFromBoolean`, which is the sanctioned way to get a color from a secret.) | `Compat.lua:183-195` |
| **Refused is not secret, and pcall doesn't catch it** | Most guarded APIs hand back a secret you can carry. The aura reads (`GetAuraDataByIndex` and neighbours, `RequiresUnitAuraAccess`, failure mode "Error") REFUSE instead, reported as a **restriction violation with taint attached**, not a Lua error: wrapping in `pcall` changes nothing but the traceback. The only way to avoid it is not to make the call: ask `C_Secrets` first, per unit and per index. | `Compat.lua:196-215` |
| **Per-aura, not "are auras secret"** | `ShouldAurasBeSecret` describes the GENERAL situation (always yes in combat). The docs' `SecretWhenUnitAuraRestricted` adds: "individual spells may be flagged as never or always secret, which takes priority over restrictions" (**declared**). Most auras BazUI cared about are never-secret and stay readable through a fight; gating everything on the general answer froze every aura row for every fight and looked like a refresh bug. So the per-index answer (`C_Secrets.ShouldUnitAuraIndexBeSecret(unit, index, filter)`, safely pcall-able: a question, not a read) decides; the general one is only the fallback; `HasSecretRestrictions()` false = a client with none (Classic Era). | `Compat.lua:226-270` |
| Secure snippets are dead (69893) | `RestrictedExecution.lua` captures `loadstring_untainted` at load and gets nil, so every snippet dies "attempt to call a nil value" at CLICK time, inside Blizzard's code, with nothing to catch: never install one; test `_G.loadstring_untainted ~= nil` once. (Matches Priestly.) | `Compat.lua:280-295` |
| Hiding Blizzard frames | Never replace `Show` / `OnShow` on a Blizzard frame (Edit Mode managed frames are protected; writing to `ObjectiveTrackerFrame`'s method table broke Blizzard's own `self:Show()`): `HookScript` only, state in your own tables, skip hiding in combat. Edit Mode systems override Hide/Show and write snap state: hiding one breaks its snaps. | `Compat.lua:305-330` |
| **Interruptible is secret on every unit but you and your pet** | So BazUI never asks; a cast bar hands its OWN color pair to `SetVertexColorFromBoolean` and the engine picks. What it DOES decide (readable) is whether YOU can interrupt: ready / waiting (cooldown) / none, and "none" matters: green on every cast for a hunter who can't kick means nothing. | `Core/Interrupt.lua:1-25` |

## Ideas for us

- **Mage Kit KICK alert / Casters**: color the bar by `SetVertexColorFromBoolean(notInterruptible, ...)`
  with our own pair, and show Counterspell's state (ready / on cooldown) as the readable half.
- **Mage Kit Curses / Buffs**: ask `ShouldUnitAuraIndexBeSecret` per index rather than
  `ShouldAurasBeSecret` once; the Curse-related never-secret spells may stay readable in a fight
  (to measure, test 22).
- **Everywhere**: never pass a secret-derived color to a setter (it draws black silently); never
  rely on `pcall` around aura reads.
