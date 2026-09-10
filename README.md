# DDA1000 Class Attending Table

Realtime seating board for lecture **L12** (academic advisor 曾家炜 / Ka Wai Tsang). Students find their name card on the side and drag it onto a seat. Everyone looking at the page sees the table update immediately.

Layout:

1. Front row: academic advisor and peer advisors
2. Second row: empty aisle
3. Remaining rows: students (`Row 1`, `Row 2`, …). Row count and seats per row can be changed live.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Open the same URL on another laptop or phone on your network after replacing `localhost` with your machine’s LAN IP if you want a classroom test. For that, start the production server instead:

```bash
npm run build
npm start
```

Then visit `http://YOUR-LAN-IP:3001`.

## Deploy (needed for the GitHub course site)

GitHub Pages can only host static files, so live multi-user seating needs a small Node server. The included `render.yaml` deploys this app on [Render](https://render.com):

1. Push this `website` folder to [kwtsang101016/dda1000](https://github.com/kwtsang101016/dda1000) as the repository root.
2. In Render, create a Web Service from that repo.
3. Render will build with `npm install && npm run build` and start with `npm start`.
4. Share the Render URL with the class. You can also set it as the GitHub repository website.

Wake the service a few minutes before class if you are on Render’s free plan.

## Roster

Name cards come from `src/data/roster.json`:

- AA: 曾家炜 (Ka Wai Tsang)
- PAs: 张雅婧 (leading), 吴蔡延, 梁心睿
- 36 L12 students listed under 曾家炜 in the 2026 class list
