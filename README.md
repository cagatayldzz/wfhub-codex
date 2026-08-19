# WFHub CDN

[![](https://data.jsdelivr.com/v1/package/gh/cagatayldzz/wfhub-codex/badge)](https://www.jsdelivr.com/package/gh/cagatayldzz/wfhub-codex)

WFHub CDN provides a convenient API for Warframe item data. Item and ability
images are referenced directly from the WFCD image CDN:
`https://cdn.warframestat.us/img/{filename}`.

The repository does not store or download image files locally. Running the
build only regenerates the JSON API data from `@wfcd/items`.

## Third-party services and attribution

This project uses and/or redistributes data and assets provided by third-party
services. Their names, trademarks, and content remain the property of their
respective owners.

- **WFCD / warframe-items** — item data and source image assets:
  [github.com/WFCD/warframe-items](https://github.com/WFCD/warframe-items)
- **GitHub** — source repository, GitHub Actions automation, and GitHub Pages
  hosting: [github.com](https://github.com/)
- **Warframe Wiki** — reference links included in some item records:
  [wiki.warframe.com](https://wiki.warframe.com/)
- **Bun and npm** — JavaScript runtime, package management, and build tooling:
  [bun.sh](https://bun.sh/) · [npmjs.com](https://www.npmjs.com/)

Warframe and related names, characters, images, and other intellectual
property are owned by their respective rights holders, including Digital
Extremes Ltd. WFHub CDN is an independent community project and is not
affiliated with, endorsed by, or sponsored by Digital Extremes.

Please refer to each third-party project or service for its applicable terms,
license, and attribution requirements. If you are a rights holder and believe
that content has been used incorrectly, please open an issue with the relevant
details.
