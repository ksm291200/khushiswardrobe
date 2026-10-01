# Multi-user prototype

`app/index.html` is a copy of the closet app where anyone can create an account
and get their own private wardrobe. The original `index.html` is untouched and
keeps working as before.

## What changed in `app/index.html`
- The 4-digit PIN is replaced by **Firebase Authentication**: email + password
  (with "forgot password") or "Continue with Google".
- Every read and write now goes to `users/{uid}/…` instead of the database root,
  so each person only sees their own items, looks, boards, wears and wishlist.
- The app shows the signed-in person's name ("Priya's Closet", "Good morning, Priya").
- The photo cache on the device is kept per user, and there is a **Sign out**
  button under ⋯ (More).

## One-time Firebase setup (console.firebase.google.com → project `khushi-wardrobe`)
1. **Authentication → Get started → Sign-in method**: turn on **Email/Password**
   and **Google**.
2. **Authentication → Settings → Authorized domains**: add the domain the app is
   served from (e.g. `ksm291200.github.io`).
3. **Realtime Database → Rules**: paste in `database.rules.json` and publish.
   `users/$uid` can be read and written only by that signed-in user. The
   old root paths stay open so the original app keeps working.

## Moving your existing wardrobe into your account
Your current data sits at the database root. To bring it into the new app:
1. Sign up in `app/` once, then copy your user ID from Authentication → Users.
2. Realtime Database → ⋮ → **Export JSON** to download everything.
3. Open `users/<your-uid>` in the data viewer, then ⋮ → **Import JSON** and choose
   that file. This replaces the new, empty account with your items, photos, looks and boards.
4. When you are happy, delete the root-level entries and remove those root rules
   from `database.rules.json`. Until then they are readable and writable by anyone
   who has the database URL, because the old PIN only ran in the browser.

## Prototype limits
- No sharing between users yet (e.g. a friend viewing your closet).
- Photos are stored as base64 in the Realtime Database, as before. That is fine
  for a handful of testers. For more users, move photos to Firebase Storage.
