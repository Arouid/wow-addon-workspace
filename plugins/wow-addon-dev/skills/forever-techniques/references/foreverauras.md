# What ForeverAuras teaches (a second WeakAuras for Forever)

**Source**: ForeverAuras by Neroxrw, GitHub `neroxrw/foreverauras`, branch `main` (pushed
2026-10-10, version 0.70.38-BETA.1): a modified WeakAuras2 (with M33kAuras code), every `.toc`
`## Interface: 16001`, `## X-License: GPL-2.0`. **License**: GPL-2.0 (plain v2 text: treat as
GPL-2.0-only). **Context is GPL-2.0-or-later**, so this code may be reused in Context with its
notice and credit; ideas only for non-GPL addons. Read on GitHub without downloading, 2026-10-10.
Its rank data is a separate license: **CC BY 4.0** from talentsforever.com (see below).
**Status**: **reported**. It reached the same geometry-gate design as EverAuras independently
(`everauras.md`): two authors agreeing is a good sign, but still not our measurement.

Its "Aura (Modern)" trigger lives in `ForeverAuras/SecretAura*.lua`.

| Idea | Summary | Where (`ForeverAuras/...`) |
|---|---|---|
| Missing | An invisible native group gives its container a width only while the aura is present; a clip on that width hides the Missing icon. | `SecretAuraSingle.lua` header |
| **Remaining Time via text** | The icon is drawn as an inline texture (`|T...|t`) inside the engine's own duration TEXT, and a **Step colour curve** over the remaining duration sets that text's colour/alpha: the icon shows only on the chosen side of X. ForeverAuras states a Step point "rules from its own value upwards" (`<=` / `>` move the edge just past the number) — EverAuras prefers a linear 0.0001 edge because the docs don't say; measure. | `SecretAuraSingle.lua` header |
| **Total Duration gate** | A hidden text formatted from the aura's TOTAL duration sizes a clip that holds the whole aura button: picks auras by their full length (e.g. one rank among several), where the identity rule blocks spell IDs. | `SecretAuraSingle.lua`; `BlizzardAuraDisplay.lua:886-887, 1072-1091` |
| Approximate Match | Spell IDs swapped for properties learned out of combat (like EverAuras' fingerprints). | `BlizzardAuraDisplay.lua:904` |
| **Groups that grow with secret content** | Each child draws from a "start" frame anchored to the END of the previous child's content; Blizzard's own sizes decide where that end is (Found: the container, one icon per aura, 1 px when empty; Missing: a second invisible container anchored backwards; Always / fixed: a fixed icon). Applied at safe time, kept in step by the engine in combat. Per unit frame / nameplate, each display's area for a unit links to the previous display's area for the same unit. | `SecretAuraFlow.lua` header; `BlizzardAuraDisplay.lua:1055-1076` |
| **Centred rows** | A secret size can't be halved, so every part gets an invisible **"shadow" copy at half size** (same filters, same unit), chained backwards from the centre: their far end is where the visible row starts. | `SecretAuraFlow.lua` header |
| Empty containers are 1 px | Reserve that pixel after occupied content too, then subtract it in the anchor chain, never reading a size. | `BlizzardAuraDisplay.lua:1075-1076` |
| Glows | Nothing inside a shown aura button can be moved by addon code: glows are built at safe time from textures and AnimationGroups (FlipBook, Translation, Alpha) registered with `AddAuraShownAnimation`; Blizzard plays them. | `SecretAuraGlow.lua` header |
| **Stand-ins** | Only frames created with `DisableUntrustedLayoutScriptsTemplate` may follow an aura container, so a non-engine display in a group is drawn by a COPY made inside the chain frame; every change to the original is forwarded and the original moves off screen. | `SecretAuraStand.lua` header |
| Pixel snapping | A clip that starts between screen pixels redraws its content blurred; the engine rounds it to whole pixels, even where the position can't be read. | `BlizzardAuraDisplay.lua:61-62` |
| Unit existence is public | Whether a unit exists is readable, whether it has the aura isn't: the only case the trigger turns inactive. Mouseover has no "cleared" event. | `SecretAuraTrigger.lua` header |
| Conditions as declarations | Trigger conditions style native widgets as declarations Blizzard consumes, never as Lua predicates on secret state. | `SecretAuraConditions.lua` header |
| Combat lock | Containers locked in combat are hidden, or given their units, when combat ends. | `BlizzardAuraDisplay.lua:9` |

## A Forever data source: spell ranks

`SecretAuraRanks.lua` bundles Forever beta rank data from **talentsforever.com/data.json**
(generated 2026-09-24), grouped by class, spell and rank, adapted under **CC BY 4.0** (attribution in
`SpellRankData-LICENSE.txt`). A public, attributable source of Forever spell ranks for Mage Kit and
Context (check its current terms before use).

## Ideas for us

- **Context**: Total Duration gates for ranked spells; centred rows via half-size shadows; stand-ins
  for non-engine displays in mixed groups; reuse is allowed (GPL-2.0) with credit.
- **Probe** (Mage Kit): which side a Step colour curve takes at its point (ForeverAuras vs EverAuras).
