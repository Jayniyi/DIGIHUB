// This script uses the Firebase Admin SDK to ensure an admin user exists.
// You need to download a service account JSON from the Firebase console and
// place it in the same directory, named `serviceAccountKey.json` (or update
// the path below).
//
// Usage:
//    node scripts/createAdmin.js
//
// It will create (or update) a user with the hard‑coded credentials and write
// a corresponding Firestore document giving them admin/CEO role.

const admin = require("firebase-admin");
const path = require("path");

// adjust if your key file has a different name or location
const serviceAccount = require(path.resolve(__dirname, "serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = admin.firestore();

async function main() {
  const email = "jobasan7@gmail.com";
  const password = "Olaniyi12";

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log("User already exists:", userRecord.uid);
  } catch (err) {
    console.log("Creating user...");
    userRecord = await auth.createUser({ email, password });
    console.log("Created user", userRecord.uid);
  }

  const uid = userRecord.uid;
  await db.doc(`users/${uid}`).set(
    {
      email,
      role: "admin",
      adminRole: "CEO",
    },
    { merge: true }
  );
  console.log("Firestore document set/updated for admin");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
