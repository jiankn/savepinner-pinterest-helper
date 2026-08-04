# SavePinner Pinterest Helper

A small, open-source userscript that adds a private helper panel to Pinterest Pin pages.

## Features

- Extracts and copies a clean, canonical Pin URL.
- Detects public image or video URLs exposed in the page metadata.
- Routes a detected image Pin to the [Pinterest image downloader](https://savepinner.com/),
  a video Pin to the [Pinterest video downloader](https://savepinner.com/pinterest-video-downloader/),
  and an unknown media type to the general downloader.
- Works with Pinterest's client-side navigation without requiring a page refresh.
- Uses no analytics, remote code, or external assets.

## Install

1. Install a userscript manager such as Tampermonkey or Violentmonkey.
2. [Install the script from Greasy Fork](https://greasyfork.org/scripts/589357-savepinner-pinterest-helper).
3. Open a Pinterest Pin page and click the red **SP** button in the lower-right corner.

The source file is [`savepinner-pinterest-helper.user.js`](./savepinner-pinterest-helper.user.js).

## Privacy and safety

The script runs locally in your browser. It does not collect or send browsing data. Opening SavePinner is always an explicit button action.

## Development

Run the lightweight validation checks with Node.js:

```bash
npm test
```

## Links

- [Greasy Fork script page](https://greasyfork.org/scripts/589357-savepinner-pinterest-helper)
- [Report an issue](https://github.com/jiankn/savepinner-pinterest-helper/issues)

## License

MIT
