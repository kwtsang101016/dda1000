# SDS Study Planner

Interactive 2026–27 study planner for CUHK(SZ) SDS majors **CSE**, **DSBDT**, **STA**, and **FE**.

Live: <https://kwtsang101016.github.io/dda1000/study_planner/>

## Features

- Seed the official recommended course pattern for your major (FE: Quantitative Finance or FinTech).
- Every catalogue slot is editable; filter the picker by role and specialization tags.
- University Core (36 units) and Free Electives are blank manual slots toward **120** units total.
- Autosave in `localStorage`; Export / Import JSON backup.

## Develop

```bash
npm install
npm run dev
```

Production base path is `/dda1000/study_planner/` (set in `vite.config.ts` on build).

## Disclaimer

Planning aid for DDA1000. Always verify with your academic advisor and the Registry.
