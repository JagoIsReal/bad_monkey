# B4d_M0nk3y / Deadwire FM

A silent, autonomous netrunner terminal for a background screen. Black, muted green and signal yellow. All interface copy is in English. Rajdhani and Share Tech Mono are bundled locally. The layout takes its cues from Cyberpunk 2077's in-world terminals and Breach Protocol screen.

Open **[dist/index.html](dist/index.html)** directly, or run `npm start` and visit `http://127.0.0.1:4177`. There are no dependencies to install and no build step.

The 150-second simulation starts immediately and repeats indefinitely: encrypted connection, network mapping, ICE isolation, data extraction, and trace cleanup. The raw terminal stream, network topology, routed packets, hexadecimal matrix, buffer and daemons follow the cycle. The matrix traverses valid alternating rows and columns. Every network address and system event is fictional. The page performs no network scans or data transfers.

There are no controls, menus, links, input fields, keyboard shortcuts or audio. The cursor stays visible. No interaction is required. The complete display fits desktop screens from 1280 × 720 upward; smaller screens use a stacked layout.

The network renderer runs at 24 frames per second, caches static geometry and suspends rendering while the page is hidden. Returning to the tab resumes the display automatically.

The original Deadwire FM logo is recolored at display time using an SVG color matrix, preserving the supplied file. The supplied protocol and warning graphics are used at small interface sizes. All images and fonts are served locally.

## GitHub Pages

The Git repository root is `bad_monkey/`. The deployment workflow is at `.github/workflows/pages.yml` in that root and publishes `blackwall-terminal/dist/`. It runs on pushes to `master` or `main`.

1. Commit and push from the `bad_monkey/` repository, including the root `.github/` folder.
2. In **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
3. Push to `master` or `main`, or run **Deploy BLACKWALL to GitHub Pages** from the Actions tab.

All asset paths are relative, so both account sites and project sites under `/<repository>/` work. No `.openai/hosting.json`, backend, external font service, or Sites hosting is needed.

See [GitHub's custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) for Pages configuration.

## Fullscreen display

For an unattended display, open the published URL in your browser's fullscreen or kiosk mode. The page fills the available viewport automatically; the browser controls its own chrome. A regular browser tab cannot enter fullscreen without a user gesture.

Fonts are distributed under the SIL Open Font License; licenses are included in `dist/assets/`.
