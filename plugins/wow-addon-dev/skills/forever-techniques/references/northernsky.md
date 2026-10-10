# What Northern Sky Raid Tools teaches: text, speech and sizes with secrets

**Source**: Northern Sky Raid Tools by Reloe, GitHub `Reloe/NorthernSkyRaidTools`, branch `main`
(pushed 2026-10-10). `.toc`: `## Interface: 120100, 16001`. **License**: "All Rights Reserved,
Copyright (c) 2026 Reloe" (`LICENSE`), no AI objection: own-words notes with file:line references,
**no code copied**. Read on GitHub without downloading, 2026-10-10.
**Status**: **reported** unless marked **declared** (Forever docs, build 70245).

| Idea | Summary | Where (`NorthernSkyRaidTools/...`) |
|---|---|---|
| **Formatting secret numbers into one text** | Build the FORMAT string from plain pieces ("%s: %d" lines joined by "\n": `table.concat` is fine on plain literals), then ONE `string.format` / `SetFormattedText` call with the secret values; the single secret result goes to `SetText` and is never concatenated again. (`GetCombatRating` is `SecretWhenUnitStatsRestricted`, **declared**.) | `PlayerStatsDisplay.lua:44-56` |
| **Sizes from secret text are secret** | `GetStringWidth/Height` of a text built from secrets return secrets, and `SetSize` rejects them: size frames from known numbers (line count × font size, a fixed width), or pre-size a big frame (2000×2000) for secret text. | `PlayerStatsDisplay.lua:105-113`, `RuntimeDisplays.lua:17-27, 44-55`, `Reminders.lua:705` |
| **Speaking a secret (way D, audio)** | `C_VoiceChat.SpeakText(voiceID, text, rate, volume, overlap)` takes a **secret text** (`ConditionalSecret`, allowed when tainted: **declared**, `VoiceChatDocumentation.lua`): a reminder whose text is secret is spoken instead of matched to a sound file. | `Functions.lua:279-300`, `Reminders.lua:1592` |
| One "restricted" test | The addon's single gate for "things are secret now" is `C_Secrets.ShouldAurasBeSecret()`. | `Functions.lua:56-58` |
| Keep comms working in instances | In raids / instances it keeps `UNIT_SPELLCAST_SUCCEEDED` (player) and `ADDON_RESTRICTION_STATE_CHANGED` registered: its addon comms and checks depend on them. | `QoL.lua:304-306` |
| Forever names | Forever detection: interface 16000-19999; nicknames allow 25 characters on Forever (12 elsewhere), since names are "First Surname". | `Functions.lua:65-68`, `NickNames.lua:28-55` |
| Your own events aren't secret | Events registered only for `player` carry plain spell IDs (no secret check needed). | `Reminders.lua:871`, `QoL.lua:234` |

## Ideas for us

- **Mage Kit KICK alert**: SPEAK the enemy's cast (`C_Spell.GetSpellName(secretID)` → `SpeakText`)
  in battlegrounds, where the ID is secret.
- **Every Mage Kit window that shows numbers in combat**: one format call per text, sizes from known
  numbers.
