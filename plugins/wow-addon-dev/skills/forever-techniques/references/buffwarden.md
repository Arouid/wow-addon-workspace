# What BuffWarden teaches: a missing-buff helper on Forever

**Source**: BuffWarden by vebjorn (`vBaustad/BuffWarden`, branch `main`, pushed 2026-10-04,
0.1.0-beta8), Forever-only (`## Interface: 16001`, `## X-License: MIT`). **License**: MIT: code
reusable in our addons with its notice. Read on GitHub without downloading, 2026-10-10. It does what
Mage Kit's buff window does: missing self / group buffs, click to cast on the nearest member, whisper
to ask, orange when running out.
**Status**: **reported** unless marked **declared**.

| Idea | Summary | Where (`Core.lua`) |
|---|---|---|
| **Don't even ask while secret** | On Forever, asking for a secret aura is a Lua **error** for addon code, not a secret value: check `C_Secrets.ShouldAurasBeSecret()` first, and per index `C_Secrets.ShouldUnitAuraIndexBeSecret(unit, i, "HELPFUL")`; while auras are secret, BuffWarden doesn't look at all, and a unit it couldn't read is "unknown", never "missing". (Matches Priestly's measurement.) | `:600-640, 746` |
| **What still works mid-fight** | Weapon enchants are ITEM state, not auras: `C_Item.GetWeaponEnchantInfo(slot)` (no secrecy flag: **declared**) reads in combat — "the one thing BuffWarden can still tell you mid-fight". Forever's mage imbue scrolls go on the main hand. | `:380-395, 554` |
| **Your own talents ARE readable** | Forever gives each class one talent tree holding the three old tabs as node groups, and the point counts aren't secret: `C_ClassTalents.GetActiveConfigID()` → `C_Traits.GetConfigInfo(configID)` (tree ID) → `C_Traits.GetGroupDisplayInfoByTreeID(treeID)` + `C_Traits.GetTreeNodes(treeID)` → `C_Traits.GetNodeInfo(configID, nodeID)` per node, counted by its `groupIDs` (about 52 calls; cache, clear only on talent events). None of these carries a secrecy flag (**declared**). This answers what Magely couldn't do with `GetTalentInfo`. | `:84-140` |
| **nil = "we don't know", never "no"** | `UnitInRange` is `SecretReturns` (**declared**) and usually comes back hidden; BuffWarden's old fallback measured a real distance, said "out of range" and greyed a button Blizzard's raid frames showed in range. Now the client decides range at click time (a failed range check costs nothing: no GCD, no mana); distance only orders the list in 10-yard bands and drops people far away (200 yd out, 150 back in, 10 s delay); an unreadable position counts as the nearest band. | `:194-222` |
| Power is information, never a gate | Mana is secret while power is restricted: never refuse a click on our own arithmetic. | `:293-298` |
| "Running out" | Orange under 5 minutes by default; short buffs at a tenth of their duration (never under a minute). | `:327` |
| Forever names | Every name is two words now: show the full "First Surname". | `:276` |

## Ideas for us

- **Mage Kit Buffs**: adopt "unknown, never missing" while auras are secret; ask
  `ShouldAurasBeSecret` / `ShouldUnitAuraIndexBeSecret` before any read; let the click decide range;
  read our own talents through `C_Traits` (e.g. Arctic Reach, Improved Blink) instead of guessing.
- **Mage Kit mid-fight**: weapon enchants (and items) are the readable part; mage imbue scrolls.
