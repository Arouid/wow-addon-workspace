# What KethoDoc teaches: dumping the client, and forcing restrictions for tests

**Source**: KethoDoc by Ketho, GitHub `ketho-wow/KethoDoc`, branch `master` (pushed 2026-10-06), v1.8.1,
`.toc` `## Interface: 120105, 120100, 50504, 20506, 11509, 16001`. **License**: MIT (`LICENSE`): code
may be reused in any of our addons with its copyright notice. Read on GitHub without downloading,
2026-10-10. It feeds Ketho's BlizzardInterfaceResources (API lists per client).
**Status**: **reported** unless marked **declared** (Forever docs, build 70245).

## A dumper for the live client (Mage Kit's probing goal)

`KethoDoc:DumpGlobalAPI()`, `DumpLuaAPI()`, `DumpWidgetAPI()`, `DumpScriptObjects()`, `DumpEvents()`,
`DumpCVars()` (via `ConsoleGetAllCommands()`), `DumpLuaEnums()`, `DumpConstants()`, `DumpFrames()`,
`DumpFrameXML()`, plus load-on-demand addon lists per client ("Camelot" = Forever, with its beta list).
Output goes to an edit box (`KethoDoc.lua:46-489`; `loadondemand.lua:186-325`). Blizzard_Deprecated
must be disabled first or deprecated names are mixed in. Widgets are created inside `pcall`
(`widget.lua:6`); frames that are secret tables or forbidden are skipped
(`issecrettable`, `IsForbidden`: `KethoDoc.lua:450`). The live client is the only proof an API exists
(`wow-forever-api`): this is the tool for that.

## Settings that FORCE addon restrictions (a test switch)

The CVar dump (from a client whose telemetry package is `Wow_Camelot_PTR`, i.e. Forever) lists, each
documented "If set, APIs guarded by ... will be restricted, or may return secrets":
`addonCombatRestrictionsForced`, `addonEncounterRestrictionsForced`, `addonChallengeModeRestrictionsForced`,
`addonPvPMatchRestrictionsForced`, `addonMapRestrictionsForced`, `addonChatRestrictionsForced`
(default "0"), and `taintLogObjectSecrets` ("include additional taint log entries when script objects
gain secret aspects or values"). (`cvar.lua:43-52, 1593`) Not in Blizzard's Lua source (engine CVars):
**reported**; whether a player may set them on the live client is the first thing to probe. If they
work, battleground / dungeon secrecy can be tested in the open world, out of combat.

## Asking a widget about its secrets (way E for frames)

`HasSecretAspect`, `HasAnySecretAspect`, `IsPreventingSecretValues` (and `AddSecretAspect`) are
script-object methods (**declared**, `SimpleFrameScriptObjectAPIDocumentation.lua`); duration-text
bindings, curves and duration objects have `HasSecretValues()`. (`widget.lua:56-69`)

## Ideas for us

- **Mage Kit Debug**: a switch per `addon...RestrictionsForced` CVar (out of combat), to run every
  probe under forced restrictions anywhere; a "dump" button (API names, events, CVars) to
  SavedVariables after each client update.
