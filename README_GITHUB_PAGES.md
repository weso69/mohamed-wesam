# ARES FIRST COLONY — Website Edition

This is the complete prebuilt static website. Do NOT upload the ZIP file into the repository as one file.

## Publish at GitHub Pages
1. Go to your public GitHub repository.
2. Choose Add file > Upload files.
3. Unzip this package, and upload ALL contents to the repository ROOT. `index.html` must be at the repository root (next to `game.js`, `style.css`, `react.js`, and `assets/`).
4. Commit changes.
5. Settings > Pages > Build and deployment > Deploy from a branch > `main` > `/(root)` > Save.
6. Wait for GitHub to show the live site URL. Open it in an incognito browser to verify the game.

If your account/repository is `weso69/mohamed-wesam`, the URL would be https://weso69.github.io/mohamed-wesam/ after successful deployment. This URL has not been verified live.

## Offline
Extract the ZIP, then open `index.html` in a desktop browser. For the best compatibility with browser security rules, run a local static server (for example `python -m http.server 8000`) and navigate to http://localhost:8000. The site uses local scripts and media; external NASA reference links are optional and require internet.

## Notes
`index.html` alone is not the whole game — all linked JS, CSS, audio, pictures, and video files must stay together.
