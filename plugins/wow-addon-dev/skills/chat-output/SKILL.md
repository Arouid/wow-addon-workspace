---
name: chat-output
description: "What a WoW addon may print to the chat frame, and when: only an answer to something the player just did (a slash command, a click on the addon's own frames, a keybinding); nothing at login except one line after an install or an update; never a line from a repeated game event or another player's message. Covers on/off commands (typed alone they show the state, only on/off change it), one action = one line, no 'nothing happened' lines, where the rest goes instead (a toast in the game's own AlertFrame stack, an icon for a state), and a headless test that counts the lines. Use whenever you add or change a print, a DEFAULT_CHAT_FRAME:AddMessage or a Print helper, a login message, a notification, or a slash command that turns something on or off, and when a player says an addon spams the chat."
---

# Chat output

The chat frame belongs to the player. Their guild, their group and their whispers scroll there, and
every line an addon adds pushes one of those out of sight. A player who finds an addon noisy doesn't
go looking for a setting. They uninstall it, or they leave a comment like the one that started this
rule, on Ley Lines in October 2026: "Too much chat spam, and the /ley signal off just turns itself
back on."

## The rule

An addon writes to chat only to answer something the player just did: a slash command, a click on
the addon's own frames, a keybinding. Nothing else goes to chat, with two exceptions.

- The first login after an install or an update gets one line: the version, and what changes for
  the player if anything does. Keep the last version the player saw in the saved variables and
  compare it at `PLAYER_LOGIN`. Every other login is silent, so no "loaded, type /x for help".
- A failure that stops the addon from working (a library that didn't load, a client it doesn't
  support) gets one line, once per session.

A repeated game event never writes to chat, even with a result the player would like to know: a
cast, a loot, a zone change, a tooltip, a combat event, a timer, an `OnUpdate`, a message from
another player's addon. Show it somewhere else: a toast for a moment, an icon or a counter for a
state that lasts ("3 spots waiting to be shared" stays on its icon until it's done).

For the toast, use the game's own stack, the one achievements and loot show in: register once with
`AlertFrame:AddQueuedAlertFrameSubSystem(template, setUp, shown, queued)`, then call
`system:AddAlert(...)`. It queues, so your toasts, other addons' and Blizzard's stack instead of
overlapping, and players already know where to look. On Forever it was measured safe in combat
(`wow-forever-api`, `taint-and-protected-frames.md`, "Toasts"), which also says what the template
must carry. On another client, check that reference's target before you rely on it.

## Answering the player

One action gives one line. A hint about what to type next goes at the end of that line, not on a
second one. A help list (`/x help`) is the only place several lines are fine: the player asked for a
list.

Don't write that nothing happened ("no ley line here", "nothing recorded") unless the player asked
a question and "nothing" is the answer.

A command that turns something on or off only changes it on `on` or `off`. Typed alone, or with any
other word, it shows the current state and the word that changes it, on one line, and changes
nothing:

```
/myaddon signal       My Addon Reminder: off. (/myaddon signal on to change)
/myaddon signal on    My Addon Reminder: on.
```

A command that flips when typed alone is how "off" turns itself back on: the player types it to
check, and it's on again. A button can toggle. A typed command shouldn't.

After `off`, print nothing that reads as if the feature were still running, like a count of what it
would have shown. And make sure the switch the player finds turns off what they actually see: if the
noise comes from somewhere else, that switch will look broken.

## Before you add a line

Follow the call up to where it starts. A slash handler or an `OnClick` is fine. An event handler,
an `OnUpdate`, a `C_Timer` callback, a hook (`hooksecurefunc`, `HookScript`) or a `CHAT_MSG_ADDON`
handler isn't, even when the `print` sits several calls deeper. If the same line can come out ten
times in an evening, it doesn't belong in chat.

## Test it headless

Catch both ways a line reaches the chat frame, run the paths the player didn't start, and check
that nothing came out. Load the addon as the `workspace` skill's Tests section shows, with
`CreateFrame` stubbed to keep the `OnEvent` script the addon sets (the template's test does this):

```lua
local lines = {}
print = function(s) lines[#lines + 1] = tostring(s) end
DEFAULT_CHAT_FRAME = { AddMessage = function(_, s) lines[#lines + 1] = s end }
-- ...load the addon, keep its OnEvent script in onEvent...
onEvent(nil, "ADDON_LOADED", "MyAddon")
onEvent(nil, "PLAYER_LOGIN")
check(#lines == 1, "the first login after an install says the version, once")
onEvent(nil, "PLAYER_LOGIN")
onEvent(nil, "CHAT_MSG_ADDON", "MYADDON", "hello", "WHISPER", "Someone")
check(#lines == 1, "a later login and an addon message print nothing")
SlashCmdList.MYADDON("signal")
check(#lines == 2 and lines[2]:find("signal on", 1, true), "typed alone, it shows the state")
```

The addon that `/wow-addon-dev:new-addon` writes follows this rule, and its test checks the login
part. The `api-gotcha-reviewer` agent flags a new line that breaks it.
