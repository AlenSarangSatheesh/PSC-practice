# SCERT Social Science — Study Notes Website

A self-contained website for the consolidated Class 5–10 SCERT Social Science study notes.
It works **fully offline** and can also be **hosted online** without changes.

## Open it (offline)

Double-click **`index.html`**. That's it — search, navigation, figures, dark mode all work
locally with no internet and no server.

> A few browsers restrict `file://` pages. If a note ever looks empty when opened by
> double-click, serve the folder instead (see below) — everything works either way.

## Rebuild after editing the notes

The site is generated from the Markdown notes in `Study Notes/0X-*/`. After you add or edit a
note (or `index.md` / `coverage_report.md`), regenerate the site:

```
python "Study Notes/_tools/build_site.py"
```

This re-renders all notes, copies only the figures the notes reference into `website/images/`,
and rewrites `website/assets/notes-data.js`. The shell files (`index.html`,
`assets/app.css`, `assets/app.js`) are hand-authored and are not overwritten.

## Host it online (e.g. GitHub Pages / Netlify)

The `website/` folder is self-contained. Upload its **contents** as the site root:

- **GitHub Pages:** commit the `website/` folder, then set Pages to serve from it (or copy its
  contents to the repo root / `docs/`).
- **Netlify / any static host:** drag-and-drop the `website/` folder; set the publish directory
  to `website`.

No build step is required on the host — it is plain HTML/CSS/JS plus the generated data and
images.

## What's inside

```
website/
  index.html            app shell
  assets/app.css        theme (light/dark), layout, print styles
  assets/app.js         routing, sidebar, search, image lightbox
  assets/notes-data.js  GENERATED — all notes pre-rendered to HTML + search text
  images/               GENERATED — only the figures the notes reference
  README.md             this file
```

Built from 110 notes across History, Geography, Economics, Indian Constitution, Kerala
Governance and Important Acts. Keyboard: press **`/`** to search, **Esc** to close.
