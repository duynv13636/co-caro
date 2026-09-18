# Caro OX — Premium Tic-Tac-Toe

A premium 2-player Caro (Tic-Tac-Toe) game built with Next.js, TypeScript and Tailwind CSS.
Play **locally** on one device, or **online** with a friend on separate devices via a shareable room link.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Local 2-player mode works out of the box — no setup needed.

## Enabling Online Play

Online play uses [Firebase Realtime Database](https://firebase.google.com/docs/database) so two browsers
can sync moves live. There is no custom server — each client talks to Firebase directly.

1. Go to the [Firebase Console](https://console.firebase.google.com) and create a project (the free
   Spark plan is enough).
2. In the project, click **Add app → Web**, and copy the `firebaseConfig` values it shows you.
3. In the left sidebar, open **Build → Realtime Database → Create Database**. Pick any region and start
   in **test mode** (you'll lock it down with the rules below).
4. Copy `.env.local.example` to `.env.local` and fill in the values from step 2:

   ```bash
   cp .env.local.example .env.local
   ```

5. In the Realtime Database's **Rules** tab, replace the rules with:

   ```json
   {
     "rules": {
       "rooms": {
         "$code": {
           ".read": true,
           ".write": true,
           ".validate": "newData.hasChildren(['boardSize', 'board', 'currentPlayer', 'players', 'scores'])"
         }
       }
     }
   }
   ```

   This scopes read/write access to the `/rooms` path only (nothing else in your database is exposed).
   There's no login system, so anyone with a room code can join it — that's by design for a quick
   "share a link and play" game, not a substitute for real authentication.

6. Restart `npm run dev`. The **Play Online** button in the header will now let you create/join rooms.

If `.env.local` is missing, the app still runs fine — the Online lobby just shows a short message
explaining it isn't configured yet, instead of crashing.

## How Online Play Works

- **Create Room** generates a short room code (e.g. `A7K2QX`), creates a `/rooms/<code>` entry in
  Firebase, and assigns you `Player X`.
- Share the room link (shown on the waiting screen) with a friend. When they open it, they're assigned
  `Player O` automatically.
- Every move is written through a Firebase **transaction** that re-validates it's your turn and the cell
  is empty before applying it — this prevents both players from taking the same turn if they click at the
  same instant.
- Board size, New Game and Reset Score all sync instantly to both players.
- A browser tab remembers its player identity (via a random id in `localStorage`), so reloading the page
  reconnects you to the same seat instead of taking the open slot.
- A third visitor opening an already-full room lands on a "Room is full" screen.

## Deploying

This is a standard Next.js app — deploy it anywhere that runs Next.js (e.g.
[Vercel](https://vercel.com/new)). Just make sure to add the same `NEXT_PUBLIC_FIREBASE_*` environment
variables from `.env.local` to your hosting provider's project settings if you want Online Play to work
in production too.

## Tech Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- `lucide-react` for icons, `canvas-confetti` for the win celebration
- `firebase` (Realtime Database) for online multiplayer sync
- No backend/API routes — the game engine (`lib/game.ts`) and all state live on the client
