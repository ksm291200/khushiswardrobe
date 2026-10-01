import { app, USE_EMULATORS, EMULATOR_HOST } from "./firebase-config.js";
import { getAuth, connectAuthEmulator, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export const auth = getAuth(app);
if (USE_EMULATORS) connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, { disableWarnings: true });

/* Phase 1 stand-in: an anonymous account so the security rules have a uid.
   Phase 3 replaces this with Google and email-link sign-in. */
export function currentUser() {
  return new Promise((resolve, reject) => {
    const off = onAuthStateChanged(auth, user => {
      if (user) { off(); resolve(user); }
      else signInAnonymously(auth).catch(err => { off(); reject(err); });
    });
  });
}
