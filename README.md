# SavePinner Pinterest Helper

A small, open-source userscript that adds a private helper panel to Pinterest Pin pages.

## Features

- Extracts and copies a clean, canonical Pin URL.
- Detects public image or video URLs exposed in the page metadata.
- Copies the current Pin URL and opens the SavePinner Pinterest downloader.
- Works with Pinterest's client-side navigation.
- Uses no analytics, remote code, or external assets.

## Install

1. Install a userscript manager such as Tampermonkey or Violentmonkey.
2. Install the script from its Greasy Fork page (link will be added after publication).
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

- [SavePinner Pinterest Downloader](https://savepinner.com/pinterest-downloader/)
- [Report an issue](https://github.com/jiankn/savepinner-pinterest-helper/issues)

## License

MIT
