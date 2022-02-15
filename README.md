# What is this

The Twitch Developer Rig is great, however the Twitch Developer Rig might not get updated in time for the upcoming Kraken/v5 shutdown. This app serves to replace the Rig in a Helix only world.

This Application solves that problem by putting the "Core" features in an Application in a similar way to that, that the rig did.

Generally it should serve as a "test tool" and not used to manage a live extension. If you do so it's at your own risk!

## Installation

This is an Electron App, so it maybe installed from the GitHub [releases tab](https://github.com/BarryCarlyon/twitch_extension_tools/releases).
It should also update from GitHub as new versions are released on GitHub. (Needs testing as I've never done Electron updates via GitHub)

It is Code Signed with the Publisher `Barry Carlyon`

You can download the latest version from here on GitHub under [releases](https://github.com/BarryCarlyon/twitch_extension_tools/releases)

## Supported Features

- [Get Extension Configuration Segment](https://dev.twitch.tv/docs/api/reference#get-extension-configuration-segment)
- [Set Extension Configuration Segment](https://dev.twitch.tv/docs/api/reference#set-extension-configuration-segment)
- [Set Extension Required Configuration](https://dev.twitch.tv/docs/api/reference#set-extension-required-configuration)
- [Send Extension PubSub Message](https://dev.twitch.tv/docs/api/reference#send-extension-pubsub-message)
- [Send Extension Chat Message](https://dev.twitch.tv/docs/api/reference#send-extension-chat-message)
- [Get Extensions](https://dev.twitch.tv/docs/api/reference#get-extensions)
- Simulation of the Extension Details page for the selected version of an Extension
- Test different Versions of an Extension against the API.

## Not Supported Featured

- Extension View simulation, this might get explored but it's not gonna be as effective as actually testing on the Twitch Website itself (when in localtest).

## Notes

- Uses Electron to provide as a Desktop App
- Uses Bootstrap for primary layout
- Uses GitHub for update delivery and code management
- JWT tokens are generated _inside_ the App via [auth0/node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), as apposed to "ClientSide" like [this example](https://barrycarlyon.github.io/twitch_misc/examples/extension_config/)
- A number of [sindresorhus](https://github.com/sindresorhus/) Electron Modules.

## Insomnia?

Basically this app is a "save my Extension configs" Insomnia-esque Rest Client. That wraps the main Extension functions in a handy Application. With some extra features!

[Insomnia](https://insomnia.rest/) is a Rest client. I have written a Plugin for Insomnia to aid with JWT generating inside Insomnia itself. You can find that [here on Github](https://github.com/BarryCarlyon/insomnia-plugin-twitch-extension-barrycarlyon)

## Warranty

If you break your extension from using this tool it's your own fault and the author(s) accept no responsbility for problems caused to your extension from using this tool. Granted the worse thing you might do is deprecate a bits product you actually needed.....

## Further Help with Twitch API

- [TwitchDev Documentation](http://dev.twitch.tv/docs)
- [TwitchDev Support Forums](https://discuss.dev.twitch.tv/)
- [TwitchDev Discord](https://link.twitch.tv/devchat)
- [TwitchDev Other Help](https://dev.twitch.tv/support)

[![TwitchDev Discord](https://discordapp.com/api/guilds/504015559252377601/embed.png?style=banner2)](https://link.twitch.tv/devchat)

## OMGLIEKWUT OHMYGOODNESS U SO MUCH HELP

Thank you for the help I want to give you beer/coffee money -> Check the Funding/Sponsor details
