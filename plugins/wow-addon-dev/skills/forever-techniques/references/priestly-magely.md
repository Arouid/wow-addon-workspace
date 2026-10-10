# What Priestly and Magely measured (buff managers on Forever)

**Source**: Spotnick2's group-buff managers for Forever: **Priestly** (`Spotnick2/priestly`, report
`docs/FOREVER-PROBE.md`, probe `Tools/PriestlyProbe`), **Magely** (`Spotnick2/Magely`, a Mage port,
notes `docs/FOREVER-NOTES.md`, probe `Tools/MagelyProbe`) and their shared engine **LibGroupBuffs**
(`Spotnick2/LibGroupBuffs`). All **MIT**: code reusable in our addons with the notice. Their
`AGENTS.md` / `CLAUDE.md` are project guides (no objection). Read on GitHub without downloading,
2026-10-10. Both probes record dated, build-stamped results and keep "measured" apart from
"declared": the same discipline as ours.
**Status**: **reported** — these are the author's in-game measurements (builds 69913-70205).

## Auras in combat: measured, and total (Priestly §9, re-measured on 70009, 2026-09-25)

- In combat **every aura read by index THROWS, for every unit**: `GetAuraDataByIndex(): Auras cannot
  be accessed when secret while tainted by '<addon>'`. Confirmed on `player`, `target` and `party1`,
  three separate runs. Party and raid helpful auras are as unreadable as your own: an addon is blind
  to every buff for the whole fight.
- **`GetAuraDataBySpellName` does not throw: it quietly returns nil** in combat, indistinguishable from
  "not buffed" (matches Mage Kit's 1230/1230). An addon using only by-name lookups would show the
  whole raid unbuffed the moment combat starts. Priestly pcalls an index read to tell **BLOCKED** from
  **NONE**.
- Out of combat, a by-name miss may be **knowledge-gated** (like `GetSpellInfo(name)`): never treat it
  as "not buffed" without an index walk.
- `C_Secrets.GetSpellAuraSecrecy(id)` returned **2** for all seven buffs probed.
- So the buff state in combat comes from a **GUID-keyed cache** learned out of combat (expiration
  times), counted down by the clock; a member never seen shows `?`, not "missing". Priestly still
  tries a live read every time (if a future build un-hides party auras, live data wins).
- **Not covered by Priestly**: `C_UnitAuras.GetUnitAuraInstanceIDs(unit, filter)` (which Mage Kit
  counts on) — to measure.

## Other measured facts

| Fact | Build / date | Where |
|---|---|---|
| **Power Word: Fortitude lasts 3600 s** (Vanilla 1800); **Arcane Intellect at least 59:56** (total unmeasured) | 69913; 2026-09-27 | Priestly §9; Magely notes |
| **Secure snippets are broken**: `loadstring_untainted` missing, so `SecureHandler*` / state drivers exist but can't work. Plain `SecureActionButtonTemplate` click-casting (`SetAttribute` out of combat, insecure `PreClick`/`PostClick`) works, one cast per click on both mouse edges, also with `ActionButtonUseKeyDown`. "Do not introduce a `SecureHandler*`." | 70009 | Priestly §1 |
| A frame that parents secure buttons can't be hidden / moved in combat; a **plain** frame anchored under a protected one CAN be resized, re-anchored, hidden and shown in combat | 70009 | Priestly §13; Magely notes |
| **CVars written by an addon don't survive a full client exit** (they survive `/reload`, which fooled the first test). "`/reload` can prove something is broken, never that it works": confirm persistence with a full exit. | 69977 (not re-measured on 70009) | Priestly §11 |
| SavedVariables weren't read back up to 69977; **fixed in 70009** | 70009 | Priestly §11 |
| Talents can't be read: `C_SpecializationInfo.GetTalentInfo` answers nothing in any query shape (or throws "query.tier must be specified"), for yourself or an inspected target; inspecting works | 70009 | Magely notes |
| A WHISPER to a full "First Surname" name works (`C_ChatInfo.SendChatMessage(msg, "WHISPER", nil, "First Surname")`) | 70009 | Magely notes |
| `GetInstanceInfo` returns the continent outdoors; 11 values on 70009 | 70009 | Priestly §5 |
| `UnitBuff` and the item globals are gone; `C_UnitAuras`, `C_Item`, `AuraUtil` present | 69913 | Priestly §6, §9 |

## Ideas for us

- **Mage Kit Buffs / Curses in combat**: assume aura reads are blind in combat (measured by Priestly)
  unless our probe shows `GetUnitAuraInstanceIDs` survives; keep a GUID-keyed cache of expirations
  learned out of combat, show `?` for unknowns, and move "show in combat" duties to engine aura
  containers (Decursive's way).
- **Mage Kit forced-restriction switches (test 21)** set CVars: they may not persist across a full
  exit (fine: they're session switches), and must be reset by the addon anyway.
- **Mage Kit's `durations`**: AI ≥ 59:56, Fortitude 3600 s: check our hard-coded buff durations.
