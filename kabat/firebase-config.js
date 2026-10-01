import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

/* Phase 1 runs only against the local Firebase emulators. A "demo-" project id
   never touches a real Firebase project. Replace this with the new project's
   config when we go live. */
export const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "demo-kabat.firebaseapp.com",
  projectId: "demo-kabat",
  storageBucket: "demo-kabat.appspot.com",
  appId: "demo-app"
};

const host = location.hostname;
export const USE_EMULATORS = host === "localhost" || host === "127.0.0.1" || new URLSearchParams(location.search).has("emu");
export const EMULATOR_HOST = host || "127.0.0.1";

export const app = initializeApp(firebaseConfig);
