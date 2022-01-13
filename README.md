# Metro Wallet - Web version

Metro is a wallet ecosystem for Avalanche. This is the web-version of Metro
which can easily be used with Apps such as Pangolin or TraderJoe, as Metro currently allows for connecting as metamask, with more better options coming later!

Metro has three branches: `Master`, `Nightly` and `Dev`.

* `Master` - Release builds which are the most stable builds, as well as the builds that are shipped on the chrome extension store.

* `Nightly` - (NOT YET USED) - Bleeding Edge metro, completely new UI framework (Vue), Most code in WASM compiled from Rust, this is the most
            exciting branch!

* `Dev` - Rolling updates, might have broken features and tests... This is the development branch where all the crazy shit happens...


## A note
Metro is in alpha stage, this means a lot of cool features are still in the works,
and there may be plenty of UI changes as well.

Metro is fully Open-source, and made by [xavax](https://xavax.io).

There will be a roadmap coming in the near future, highliting future features & updates
coming to metro.
___

## Development & Building

### Install dependencies:
```
npm install
```

### Build Metro into `dist` folder
```
npm run build
```

Since Metro web is made up of various parts including content-scripts which need to be
built seperately, there are a set of commands you can run to build each part.

### Build Scripts:
```
npm run build-scripts
```

### Build Popup-notifications:
```
npm run build-metroNotification
```
### Build metroWeb:
```
npm run build-metroWeb
```

* `metroNotification` is the popup you get when you for instance connect to a dApp as metamask, such as
pangolinDex or traderjoe. The metroNotification component is fairly temporary and will be replaced with
a better solution later.

* `scripts` is a set of content-scripts, injected scripts, and service workers that run in the background. The scripts are found in the `metro_scripts` directory.

* `metroWeb` is the web-page version of metro that gets opened when the user opens the Dashboard,
or simply creates/imports a new wallet.

The command `npm run build` will build all of these projects into a ready-to-run Extension.

___

## Support
Metro & xavax is an open-source project, therefore any help in the form of talking about the projects, giving feed-back as well as donations are well appreciated!

More about helping out can be found in [The xavax help page](https://xavax.io).

Donations [X-CHAIN]: `X-avax1zd67u0vrazmxu8fhuf0wu6dk9swheun0w6mlce`

Donations [C-CHAIN/EVM]: `0x6379131c0b67cc897dcc1a8a99ba2fd82d2eee7b`

Thanks for the tip!

### Hope you Have a good time, all the time! ~