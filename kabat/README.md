# Kabat

The multi-user rebuild of the closet app. No build step: plain HTML, CSS and
ES modules that load Firebase from the gstatic CDN.

| File | What it does |
| --- | --- |
| `index.html` | Markup |
| `styles.css` | All styles (unchanged from the original) |
| `app.js` | Screens, styling engine, moodboards, everything you see |
| `data.js` | The only file that talks to the database (Firestore) |
| `auth.js` | Sign-in (Phase 1: an anonymous test account) |
| `firebase-config.js` | Firebase project settings and the emulator switch |
| `firestore.rules` | Who can read and write what |

## Run it on your computer (Phase 1)

Phase 1 runs only against the Firebase emulators, a private test copy of
Firebase on your own computer. Nothing touches a real Firebase project.

You need [Node.js](https://nodejs.org) (version 18 or later) and Java 11 or later
(on a Mac: `brew install openjdk`).

```
cd kabat
npm install        # first time only
npm run dev
```

Then open http://localhost:5050 and enter the PIN (2173). The PIN screen stays
until Phase 3 adds proper sign-in.

To look at the stored data, open http://localhost:4000 and go to Firestore. You'll see
`users/{id}/items`, `outfits`, `boards` and so on. Test data is saved in
`kabat/emu-data/` when you stop the emulators with Ctrl+C, and loaded again the
next time.
