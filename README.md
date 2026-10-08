# DDA1000

Course site materials for DDA1000 Freshmen Induction and Academic Planning (Fall 2026–27).

Course homepage: <https://kwtsang101016.github.io/dda1000/>

| Path | Contents | Hosted at |
| --- | --- | --- |
| [`site/`](./site/) | Course homepage (links to everything below) | GitHub Pages `/dda1000/` |
| [`arrangement/`](./arrangement/) | Course arrangement (schedule, speakers, assessment, journal) — static HTML | GitHub Pages `/dda1000/arrangement/` |
| [`calendar/`](./calendar/) | Course calendar with separate / joint / small-group sessions and saved CAT attendance | GitHub Pages `/dda1000/calendar/` |
| [`what_and_why/`](./what_and_why/) | Slides: Studying at SDS — What and Why | GitHub Pages `/dda1000/what_and_why/` |
| [`academic_honesty/`](./academic_honesty/) | Slides: Academic Honesty | GitHub Pages `/dda1000/academic_honesty/` |
| [`study_schemes/`](./study_schemes/) | Slides: SDS Study Schemes | GitHub Pages `/dda1000/study_schemes/` |
| [`cat/`](./cat/) | Class Attending Table (live seating board for L12); its `/arrangement/` redirects to GitHub Pages | Render: <https://dda1000-cat.onrender.com/> |

## GitHub Pages

`.github/workflows/deploy.yml` builds the calendar and the three slide decks on every push to `main` (changes that only touch `cat/` are skipped) and publishes them together with `site/index.html`. In the repository settings, **Pages → Source** must be set to **GitHub Actions**.

Local preview of one app:

```bash
npm install --prefix calendar
npm run dev:cal
```

(`dev:why`, `dev:honesty`, and `dev:schemes` start the slide decks.)

## Adding a CAT attendance record to the calendar

1. In CAT, sign in as instructor and press **Save attendance**; put the CSV in `cat/data/` (CSV files there are git-ignored because they contain student numbers).
2. Convert it, merging the roster and the live CAT profiles (photos, college, country, hobbies):

   ```bash
   cd cat
   npm run export-attendance -- data/DDA1000-L12-attendance-YYYYMMDD-HHMM.csv --label "Session theme"
   ```

   This writes `calendar/public/attendance/<date>.json` with neutral ids (no student numbers).
3. Add `attendanceFile: "<date>.json"` to that date in `calendar/src/data/schedule.ts`, then commit and push.

## Class Attending Table

Source code lives in [`cat/`](./cat/). Deploy that folder as a Render Web Service with **Root Directory** set to `cat` (see root `render.yaml`).

Local run:

```bash
cd cat
npm install
npm run dev
```
