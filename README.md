# Work in Progress

# What is this

The Twitch Developer Rig is great, however the Twitch Developer Rig might not get updated in time for the upcoming Kraken/v5 shutdown. This app serves to replace the Rig in a Helix only world.

This Application solves that problem by putting the "Core" features in an Application in a similar way.

## Installation

This is an Electron App, so it maybe installed from GitHub.
It should also update from GitHub as new versions are released on GitHub. (Needs testing as I've never done Electron updates via GitHub)

It is Code Signed with the Publisher `Barry Carlyon`

https://github.com/BarryCarlyon/twitch_extension_tools/releases

## Notes

- Uses Electron to provide as a Desktop App
- Uses Bootstrap for primary layout
- Uses GitHub for update delivery
- JWT tokens are generated _inside_ the App via [auth0/node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), as apposed to "ClientSide" like [this example](https://barrycarlyon.github.io/twitch_misc/examples/extension_config/)

## orly?

Yeah, basically it's just a "save my Extension configs" Insomnia-esque Rest Client. That wraps the main Extension functions in a handy Application.

## Insomnia?

[Insomnia](https://insomnia.rest/) is a Rest client. I have written a Plugin for Insomnia to aid with JWT generating inside Insomnia itself. You can find that [here on Github](https://github.com/BarryCarlyon/insomnia-plugin-twitch-extension-barrycarlyon)

## Further Help with Twitch API

Some options

- [TwitchDev Documentation](http://dev.twitch.tv/docs)
- [TwitchDev Support Forums](https://discuss.dev.twitch.tv/)
- [TwitchDev Discord](https://link.twitch.tv/devchat)
- [TwitchDev Other Help](https://dev.twitch.tv/support)

[![TwitchDev Discord](https://discordapp.com/api/guilds/504015559252377601/embed.png?style=banner2)](https://link.twitch.tv/devchat)

## OMGLIEKWUT OHMYGOODNESS U SO MUCH HELP

Thank you for the help I want to give you beer/coffee money -> Check the Funding/Sponsor details
