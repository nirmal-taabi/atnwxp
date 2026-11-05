# ATN Worldwide Xpress – website

Standalone website built with **HTML5 + Tailwind CSS v4 CDN + custom CSS3 + vanilla JavaScript (ES6+)**. No framework or local build tools required.

## Quick start

Tailwind utilities are generated in the browser from the classes in each HTML page. The pages load the Tailwind CSS v4 browser CDN and the shared custom stylesheet at `assets/css/style.css`. An internet connection is required for the Tailwind CDN and Google Fonts.

Open `index.html` in a browser, or use Python to serve the folder locally:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Folder structure

```
ATNWXP/
├── index.html                  Home page (single-page sections)
├── bookshipment.html           Booking page (4-step form)
├── README.md
└── assets/
    ├── css/
    │   ├── style.css           Design tokens + shared components + animations
    │   ├── responsiveness/
    │   │   └── index.css       Tablet / mobile / small-screen corrections
    ├── images/                 Logos, partner logos, hero + service photos, favicon
    ├── fonts/
    │   ├── Poppins/            Poppins 400–900 (self-hosted, primary font)
    │   └── Google_Sans/        Google Sans variable font (headings/display)
    ├── js/
    │   └── script.js           All interactions (no libraries)
    └── videos/                 Drop banner-video.mp4 here when available
```

## Design system

- **Root size:** `html { font-size: 62.5% }` → **1rem = 10px**. Tailwind spacing, typography and breakpoints are configured in each page's inline `@theme` block; utility colors reference the shared variables in `assets/css/style.css`.
- **Brand colors** (edit once in `:root` of `assets/css/style.css`):
  - `--c-ink: 17 17 17` (dark)
  - `--c-brand / --c-accent: 237 28 36` (brand red)
  - `--c-paper: 245 245 247` (page background)
  - `--c-line: 218 218 222` (hairlines)
- **Fonts:** Poppins (body) + Google Sans variable (display/headings), self-hosted in `assets/fonts/`.
- **Breakpoints:** xs 390 · sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1440.

## Interactions included (assets/js/script.js)

Sticky header · mobile drawer · scroll-spy nav · split-text headline reveals · staggered section reveals (IntersectionObserver) · animated counters · hero tilt card · cursor spotlight on feature cards · animated online-tracking timeline · animated pickup-route SVG · pricing bars · partner logo marquee (pause on hover) · footer brand letter reveal + hover sweep · service quick-nav pills with smooth scroll + flash highlight · booking form validation with progress meter, step indicator, mailto submission and success state · back-to-top ring · copy address · auto year.

All motion is disabled automatically for users with `prefers-reduced-motion`.

## Notes

- **Hero video:** the original `assets/video/banner-video.mp4` was not included in the upload, so the hero currently uses `assets/images/hero.jpg` with a slow zoom animation. To use a video again, drop the file in `assets/videos/banner-video.mp4` and follow the comment in `index.html`.
- **Booking form** has no backend: it validates, then opens a pre-filled email to `info@atnwxp.in`. Connect a form endpoint to submit directly.
- Service cards link to `bookshipment.html?mode=…&type=…`, which preselects the shipment mode/type.
