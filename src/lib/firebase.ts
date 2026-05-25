// This file still exists so that paths like `@/lib/firebase` work if
// they were referenced elsewhere in the codebase.  We simply re-export from
// the root `firebaseconfig.js` so there is only a single source of truth.

export * from "../../firebaseconfig";
