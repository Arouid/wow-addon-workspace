# What "What's Training?" teaches on Forever (trainers, prices, the spellbook)

**Source**: What's Training? by Fusionpit, GitHub `fusionpit/WhatsTraining`, branch **`forever`**
(the default branch `master` is Era / TBC only), pushed 2026-10-07. `.toc`:
`## Interface: 20506, 16001, 11509`. **License**: MIT (`LICENSE`): code may be reused with its
copyright notice. Read on GitHub without downloading, 2026-10-10.
**Status**: **reported** (the author's measurements, dated where they say so).

| Idea | Summary | Where |
|---|---|---|
| A Forever branch | Some authors keep Forever on its own branch: check a repo's branches before deciding it doesn't support Forever. | repo branches |
| Detecting Forever | interface ≥ 16000 → "forever". | `Game.lua:4` |
| **Trainer discounts on Forever** | Measured on 1.60.1.70205: with the trainer's capital-city faction, **Friendly pays full price, Honored gets 10 %**; Revered / Exalted unchecked. The PvP-rank vendor discount (rank 3, Sergeant = `UnitPVPRank` 7) is applied on Era only. | `Pricing.lua:32-58` |
| Tome vendors | Forever's tome vendors charge full price at every standing (Era discounts them; the author suspects a Forever bug). | `Classes/Camelot/TrainerFactions.lua:24-29` |
| Reputation on Forever | `C_Reputation.GetFactionDataByID(id)` → `.name`, `.reaction` (the old `GetFactionInfoByID` path is for Era). | `Pricing.lua:43-46` |
| Override spells | On Forever, `SPELLS_CHANGED` re-checks warrior / rogue / druid override spells. | `WhatsTraining.lua:190-191` |
| Starting ranks | Some first ranks never appear in trainer data: the class tables add them. | `WhatsTraining.lua:100` |
| **Joining Blizzard's spellbook without touching it** | Forever's spellbook is `PlayerSpellsFrame.SpellBookFrame` (load-on-demand `Blizzard_PlayerSpells`). The addon draws its own "ledger" page as an overlay parented to the frame, never writing into Blizzard's frames, and follows it through **`EventRegistry` callbacks** (`PlayerSpellsFrame.SpellBookFrame.Show / Hide / DisplayedSpellsChanged`, `SpellSearchBox.FocusedGained`) plus `HookScript` on size/show/hide, instead of `hooksecurefunc`. | `Forever/SpellBook.lua:7, 19-20, 370-400` |
| **`hooksecurefunc` and taintLog** | The author notes `hooksecurefunc` misbehaves while `taintLog` > 0 on the current client build: test hooks with the taint log off too. | `Forever/SpellBook.lua:379` |
| Native geometry | Camelot's spellbook views are 680 wide, 95 below the book's top, 85 from its left and 50 from its right (`Blizzard_SpellBookTemplates.xml`). | `Forever/SpellBook.lua:19-20` |

## Ideas for us

- **Mage Kit Training tab**: show the Honored 10 % discount (and its city), read via
  `C_Reputation.GetFactionDataByID`; note that tomes don't get it.
- **Any Blizzard-frame integration**: prefer `EventRegistry` callbacks Blizzard already fires over
  hooks; when debugging taint with `taintLog`, re-test hooks with it off.
