# DDA1000 Class Attending Table

Realtime seating board for lecture **L12** (academic advisor 曾家炜 / Ka Wai Tsang). Students find their name card on the side, tap it, then tap a seat. Everyone looking at the page sees the table update immediately.

## How students use it

1. Tap a name card, then tap a seat to sit
2. Enter **your student ID** when asked (IDs are never shown on the page)
3. Tap a seated card, then another empty seat to move
4. Double-tap a seated card to stand up
5. Press and hold a seat to see photo / college / country / hobbies
6. Use **Edit** to update your card (also requires your student ID)
7. Search by name, college, country, hobbies, etc. — waiting matches are purple; seated matches are teal
8. Auditors can **Add temporary card** (green-tinted); those cards sync live for the class but are **not** saved to Redis

Student IDs are checked only on the server as salted one-way hashes (HMAC-SHA256 with the secret `STUDENT_ID_SALT`). Card ids such as `stu-07` are neutral; the public website and GitHub repo contain neither raw IDs nor hashes that can be reversed without the salt.

## Instructor controls

Set environment variable `INSTRUCTOR_PIN` (on Render: Environment → `INSTRUCTOR_PIN`).

With that PIN you can:

- Manage any card (including the AA card)
- Change row / seat counts
- Reset all seats
- **Save attendance** — downloads a CSV snapshot of who is present/absent and which row/seat (useful from your phone; files usually land in Downloads / Files)

Local default PIN if unset: `change-me-dda1000` — change it before class.

## Layout

1. Front row: academic advisor and peer advisors
2. Second row: empty aisle
3. Remaining rows: students (`Row 1`, `Row 2`, …)

## Run locally

From this `cat/` folder:

```bash
npm install
npm run dev
```

Or production mode:

```bash
npm run build
npm start
```

Open [http://localhost:3001](http://localhost:3001) after `npm start`.

Optional:

```bash
set INSTRUCTOR_PIN=your-secret
set STUDENT_ID_SALT=<contents of private/STUDENT_ID_SALT.txt>
npm start
```

## Deploy on Render

1. Repo: [kwtsang101016/dda1000](https://github.com/kwtsang101016/dda1000)
2. Root Directory: `cat`
3. Build: `npm install && npm run build` · Start: `npm start`
4. Set `INSTRUCTOR_PIN` and `STUDENT_ID_SALT` in the Render dashboard (do not commit either; without the salt, students cannot log in)
5. **Required for keeping name-card edits after redeploy:** create a free [Upstash Redis](https://upstash.com/) database, then set on Render:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
6. Confirm `/health` returns `"durableStore": true`
7. Share the Render URL with the class

Redis is written when someone **edits a name card** (photo / college / country / hobbies), and once more on graceful shutdown (Render redeploy). Sit / move / stand do **not** call Redis — those stay in memory for the live class. Without Upstash, profile edits are still lost on redeploy. Wake the free-tier service a few minutes before class.

## Roster files

- `src/data/roster.json` — public names with neutral card ids (no student IDs)
- `server/data/credentials.json` — salted hashes used only on the server
- `private/` (git-ignored, on your computer only) — `STUDENT_ID_SALT.txt` and `id-map.csv` (card id → student ID, for reading attendance CSVs)

To add a student: append a card to `roster.json` with the next id (e.g. `stu-41`), then run `npm run hash-id -- <studentId>` and paste the output into `credentials.json` under that id.
