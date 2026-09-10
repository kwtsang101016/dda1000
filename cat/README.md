# DDA1000 Class Attending Table

Realtime seating board for lecture **L12** (academic advisor 曾家炜 / Ka Wai Tsang). Students find their name card on the side and drag it onto a seat. Everyone looking at the page sees the table update immediately.

Layout:

1. Front row: academic advisor and peer advisors
2. Second row: empty aisle
3. Remaining rows: students (`Row 1`, `Row 2`, …). Row count and seats per row can be changed live.

## Run locally

From this `cat/` folder:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). For a classroom LAN test:

```bash
npm run build
npm start
```

Then visit `http://YOUR-LAN-IP:3001`.

## Deploy on Render

GitHub Pages cannot host the live multi-user table. Use [Render](https://render.com):

1. Connect the repo [kwtsang101016/dda1000](https://github.com/kwtsang101016/dda1000) (the whole course repo, not a separate “/cat” repo).
2. Create a **Web Service**.
3. Set **Root Directory** to `cat` (the root `render.yaml` already sets `rootDir: cat`).
4. Build: `npm install && npm run build` · Start: `npm start`.
5. Share the Render URL (for example `https://dda1000-cat.onrender.com`) with the class.

Wake the service a few minutes before class if you are on Render’s free plan.

## Roster

Name cards come from `src/data/roster.json`:

- AA: 曾家炜 (Ka Wai Tsang)
- PAs: 张雅婧 (leading), 吴蔡延, 梁心睿
- 36 L12 students listed under 曾家炜 in the 2026 class list
