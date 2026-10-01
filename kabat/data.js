/* The only module that talks to the database.
   Every path is scoped to the active closet: users/{closetUid}/... */
import { app, USE_EMULATORS, EMULATOR_HOST } from "./firebase-config.js";
import {
  initializeFirestore, connectFirestoreEmulator, persistentLocalCache, persistentMultipleTabManager,
  collection, doc, onSnapshot, getDoc, setDoc, updateDoc, deleteDoc, deleteField, increment, FieldPath
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  ignoreUndefinedProperties: true
});
if (USE_EMULATORS) connectFirestoreEmulator(db, EMULATOR_HOST, 8080);

let closet = null;
const subs = [];
let errorHandler = err => console.error(err);

export function setCloset(uid) { stopAll(); closet = uid; }
export function closetId() { return closet; }
export function onError(fn) { errorHandler = fn; }
export function stopAll() { subs.splice(0).forEach(off => off()); }

const colRef = col => collection(db, "users", closet, col);
const docRef = (col, id) => doc(db, "users", closet, col, id);
const fail = err => { try { errorHandler(err); } catch (e) { console.error(e); } };

/* Writes resolve as soon as the change is visible locally: on server ack, on the
   next snapshot of the listened collection, or after a short fallback. Firestore's
   own promises never resolve while offline, which would freeze the UI. */
const waiters = {};
function settle(key) { const w = waiters[key]; if (w) { delete waiters[key]; w.forEach(fn => fn()); } }
function track(key, write) {
  return new Promise(resolve => {
    let done = false; const fin = () => { if (!done) { done = true; resolve(); } };
    (waiters[key] ||= []).push(fin);
    write.then(fin, err => { fail(err); fin(); });
    setTimeout(fin, 1500);
  });
}

/* Patch keys may be nested paths like "els/abc/z"; null deletes the field. */
function patchArgs(prefix, patch) {
  const args = [];
  for (const [k, v] of Object.entries(patch)) {
    args.push(new FieldPath(...prefix, ...k.split("/")), v === null ? deleteField() : v);
  }
  return args;
}

export function newId(col = "items") { return doc(colRef(col)).id; }

/* cb receives {docId: data} for the whole collection, like the old onValue. */
export function listen(col, cb) {
  const off = onSnapshot(colRef(col), snap => {
    const out = {}; snap.forEach(d => { out[d.id] = d.data(); });
    cb(out, { fromCache: snap.metadata.fromCache });
    settle(col);
  }, fail);
  subs.push(off); return off;
}

export async function getOne(col, id) {
  try { const s = await getDoc(docRef(col, id)); return s.exists() ? s.data() : null; }
  catch (err) { fail(err); return null; }
}

export function save(col, id, data) { return track(col, setDoc(docRef(col, id), data)); }

export function add(col, data) {
  const id = newId(col);
  return save(col, id, data).then(() => ({ key: id, id }));
}

/* path is a doc id, optionally followed by a field path inside it:
   update("boards", bid + "/els/" + elId, { z: 3 }) */
export function update(col, path, patch) {
  const [id, ...prefix] = path.split("/");
  const args = patchArgs(prefix, patch);
  if (!args.length) return Promise.resolve();
  return track(col, updateDoc(docRef(col, id), ...args));
}

export function remove(col, id) { return track(col, deleteDoc(docRef(col, id))); }

/* Single settings documents under users/{uid}/meta/{name} */
export function listenMeta(name, cb) {
  const key = "meta/" + name;
  const off = onSnapshot(docRef("meta", name), snap => {
    cb(snap.exists() ? snap.data() : null, { fromCache: snap.metadata.fromCache });
    settle(key);
  }, fail);
  subs.push(off); return off;
}
export function saveMeta(name, data) { return track("meta/" + name, setDoc(docRef("meta", name), data)); }
export function updateMeta(name, patch) { return track("meta/" + name, setDoc(docRef("meta", name), patch, { merge: true })); }
export function bumpMeta(name, field, by = 1) {
  return track("meta/" + name, setDoc(docRef("meta", name), { [field]: increment(by) }, { merge: true }));
}
