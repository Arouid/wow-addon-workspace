# What EverAuras teaches: WeakAuras on Forever, and geometry gates

**Source**: EverAuras by Hackblarvest, GitHub `Hackblarvest/EverAuras`, branch `main` (pushed
2026-10-09): a fork of M33kAuras / WeakAuras 2 rebuilt for Forever (alpha, interface 16001), plus a
probing addon, **ForeverDevInfo** (`addons/ForeverDevInfo`, `.toc` 16001). Its own Forever code is in
`tools/forever_files/` (the build downloads WeakAuras and patches it). **License**: GPL-2.0
(`LICENSE`): read freely, **ideas, not code** — unless Context is released under a GPL-2.0-compatible
license, which would let it reuse this code (Finess's call). Read on GitHub without downloading,
2026-10-10. The author dates many findings ("proven in game 2026-09-18", "measured 2026-10-06").
**Status**: **reported** (the author's measurements) unless marked **declared**.

This is the closest existing thing to Context: a WeakAuras that keeps working in combat by never
reading aura state and handing every display to the engine. Its README's "What works in combat"
table is a ready feature list; its "How it works" section is a ready design.

## Geometry gates: conditions the engine computes as SIZES (way D, extended)

The engine may set a frame's size from a secret value. Nothing reads that size, but other frames
can be **anchored** to it, and a **clipping** frame anchored between a fixed point and a
secret-sized edge shows or hides what's inside. Every logical operation below is pure layout.

| Gate | How | Where |
|---|---|---|
| **NOT ("aura missing")** | An aura GROUP with one button: the engine sizes the container to a secret **1 px while the aura is absent, W+1 px while present** (flow layout uses max(size, 1)). A clip from the container's right edge to a fixed right edge is full width while absent, zero while present: the "cast this" icon inside shows exactly while the aura is missing. | `ForeverEngineAura.lua:9-16`; `Probe_Dyn.lua` |
| **Time left < X** ("late glow") | An invisible StatusBar inside the aura button, filled by the engine from the aura's duration (`SetDurationBar`), wide at K px per second with its left edge X·K px left of a fixed point; a clip from the fill's edge to that point opens when X seconds are left. Needs the aura's total duration (seen out of combat, or read from the spell description "over N sec."). | `Probe_Late.lua`; `ForeverEngineAura.lua:704, 1284` |
| **Time left ≥ / < X, per frame** | The engine's own duration text, formatted **wide below X and narrow from X up**, with one anchor so the frame is as wide as its text: its width becomes a gate. One threshold per display. | `Probe_TimeGate.lua`; `ForeverEngineAura.lua:444-445, 1222` |
| **Stacks ≥ N / ≤ N** | An aura slot of its own carries a stack bar: the engine sets its range 0..max and value = stacks (`SetApplicationBar`). With max = N, a gate from the bar's left end to the fill edge reaches past the display only at N stacks or more; with max = N+1 a gate from the fill edge to the right end closes above N. The threshold lives in the bar's range only. Measured 2026-10-06: works at 0 stacks, in combat; a negative minimum is refused. | `ForeverEngineAura.lua:286, 1881-1895`; `Probe_Stacks.lua` |
| **Packing (dynamic groups)** | One invisible container per child, each hung on the end of the previous one; each is 1 px plus the child + spacing while its aura is up, 1 px while not: the game closes the gaps. The chain's anchor point decides growth (TOPLEFT → right, TOP → centred). | `Probe_Dyn.lua`; README "How it works" |
| **Sorted by time left** | One aura group over all the children's spells with `sortMethod = ExpirationOnly` (also in combat); containers don't notice a new target: refresh them on target change. | `Probe_Sort.lua` |
| Range | `C_Spell.IsSpellInRange` answers a **plain** boolean on Forever, in combat too, honouring the spell's min/max range (probe 2026-09-19); nil for a spell you don't know; a rangeless spell is never "in range": no gate at all is better than one that can't answer. Sampled 5×/s. | `ForeverEngineAura.lua:44-46, 1342-1360` |
| Power | Mana / rage / energy values are secret **even out of combat**; `UnitPowerPercent(unit, ..., curve)` lets the engine compare and hand back a secret alpha or colour ("hide while full", "colour below X"). | README; `ForeverGate.lua` |

**Rules that make it work** (all reported, several measured by the author):
- Frames anchored to a container that owns an aura group must carry its **layout-script ban**
  (`DisableUntrustedLayoutScriptsTemplate`); frames created inside such a frame inherit it, so build
  everything of yours inside one banned host. WeakAuras' own frames can't join the chain.
  (`Probe_Dyn.lua`; `ForeverEngineAura.lua:1697-1705`)
- **Secret anchoring spreads**: while an aura is shown, every region anchored to its button or clip,
  however indirectly, refuses `SetPoint` / `ClearAllPoints` / `SetSize` from addon code ("Attempt to
  access forbidden object", 2026-09-28) and nothing can be re-parented into it (LibCustomGlow's pooled
  frames refused, 2026-09-27). So: create in place, lay out once, and move only with **animations**
  (Path, FlipBook). (`ForeverGlow.lua` header)
- The engine sets the container's size (secretly), anchor it by TOPLEFT and never read it; a
  container can't change parent after creation, so create it inside its gate frames. (Plater
  re-parents its pre-made containers to nameplates: a disagreement to keep in mind.)
  (`ForeverEngineAura.lua:1704-1713`)
- **Curves**: use LINEAR curves with a near-vertical edge (0.0001 wide): the docs don't say which side a
  Step curve takes between two points. (`ForeverGate.lua` header)
- `initializeFrame` runs synchronously inside `AddAuraSlot`, before the button is locked: build the
  button's contents there. (`ForeverEngineAura.lua:1725`)
- Scripts never run inside the engine's aura buttons, so script-driven animation (WeakAuras' stop
  motion) becomes the game's FlipBook animation on the same sheet. (README)

## Data the engine needs that Forever hides

| Problem | Answer | Where |
|---|---|---|
| A buff's ID differs from the castable spell's (Bloodrage 2687 → buff 29131, Last Stand, Vanish, procs) | Remember, per account, which aura IDs each spell NAME produced, learned while auras are plain (out of combat); all known ranks included and re-resolved when the spellbook changes. | `ForeverEngineAura.lua:185-215` |
| A DoT's total duration never seen out of combat | Read it from the spell description ("over N sec."). | `ForeverEngineAura.lua:704`; `Probe_Late.lua` (`/fddesc`) |
| Sounds by dispel type | `AddAuraSound` plays by spell ID only, and needs a sound FILE (no Sound Kit ID): spell IDs per dispel type are generated from the client's tables (SpellCategories DispelType + SpellEffect, client 70291). | `ForeverDispelData.lua` header; `ForeverEngineAura.lua:1383-1388` |
| Debuffs on yourself by spell | Impossible by spell while auras are secret (identity rule); optionally learn a debuff's "fingerprint" (duration, dispel type, flags) out of combat. | README |
| `%p` on a secret time | `string.format("%.1f")` on a secret shows "114.5": let the duration object format itself ("1m 54s"), rounding down like Blizzard's buff frame. | `ForeverEngineAura.lua:120-129` |
| Five Second Rule | Your own mana-costing casts are plain (spell ID and cost): start a 5 s timer on them. | `ForeverManaRegen.lua` |
| Old API names in imported code | Forever ships no deprecated fallbacks (`GetSpellInfo`, `GetItemInfo`, `GetSpellCooldown`...): map them to `C_Spell` / `C_Item` inside imported code only. `!ForeverCompat` shims FrameXML globals old AceGUI expects. | README; `addons/!ForeverCompat` |
| SavedVariables on early betas | Builds 69893 / 69913 wrote SavedVariables but never read them back (fixed by 70009); `!ForeverSVCanary` detects it. | `docs/blizzard-bug-report.md`; `addons/!ForeverSVCanary` |

## ForeverDevInfo: probes worth copying as ideas (Mage Kit's Debug tab)

`/fddispel` (containers by dispel type / stealable; which RAID-style tokens pass), `/fddyn`
(container as a dynamic group), `/fdlate` + `/fdchain` (the late clip, with OnUpdate counters),
`/fdsort` (sorted by time left in combat), `/fdsoundload` (~1628 aura sounds registered at once),
`/fdstack` (stack-driven geometry, cases A-F), `/fdtext` (what an engine-driven text draws),
`/fdtgate` (time gates inside vs outside the button), `/fdcount`, `/fddesc`, `/fdants`.

## Ideas for us

- **Context**: this is the design. Mage procs and buffs as engine displays; "missing" via the 1 px
  container; "refresh soon" via the late clip; stacks via the stack bar; glows created in place and
  animated by the client; sounds via `AddAuraSound` with files; IDs learned out of combat.
- **Context license**: if Context were GPL-2.0-or-later, EverAuras' Forever files could be reused
  with credit instead of re-implemented. A decision for Finess.
- **Mage Kit Debug**: add geometry-gate probes (NOT, time-left, stacks) like ForeverDevInfo's.
