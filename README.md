# Welcome to the Grow Nigeria Digital project

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

You can deploy this project using various platforms like Vercel, Netlify, or Firebase Hosting. Follow the documentation of your chosen platform for deployment instructions.

---

## Admin authentication (Firebase)

Admin and client users are now handled by Firebase Authentication & Firestore. Each account has a `role` field (`"user"` or "admin") and admins additionally have `adminRole` (e.g. "CEO", "Designer").

### General workflow

1. Make sure your Firebase project is configured via `firebaseconfig.ts` and you have the appropriate
   `VITE_` environment variables.
2. If you haven't already, deploy the Firestore security rules in `FIRESTORE_RULES.txt`:
   ```bash
   firebase deploy --only firestore:rules
   ```
   or run the emulator:
   ```bash
   firebase emulators:start --only firestore
   ```
3. Start the frontend with `npm run dev`. Navigate to `/admin/login` to either sign in or create
   a new admin account. During registration you'll select a department and (for CEOs) the backend
   enforces only one CEO may exist.

The `AuthContext`/`AdminAuthContext` pair encapsulates the flows. Routes under `/admin` are
protected by `RequireAdmin` which checks `user.role === 'admin'`.

### Seeding a known admin user

To quickly bootstrap or recover access, you can run the helper script below. It uses the
Firebase Admin SDK, so you'll need a service account JSON from your project.

```bash
# place the downloaded service account at the project root as `serviceAccountKey.json`
node scripts/createAdmin.js
```

The script will create (or update) a user with email `jobasan7@gmail.com` and password
`Olaniyi12`, and mark them as an admin/CEO in Firestore. Feel free to edit the script to use
other credentials.

### Notes

- Be sure to run `npm install` to include `react-icons` (used by OAuth buttons) if you pull
  the latest changes.
- The Firestore rules in `FIRESTORE_RULES.txt` allow users to create their own profile documents
  and prevent non-admins from modifying the `role` field. Admins may promote/demote other users.



