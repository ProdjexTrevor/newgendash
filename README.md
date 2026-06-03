# New Generation — Quarterly Reporting Dashboard

React reporting app for **leaders and field workers**: quarterly movement totals, regional drill-down, highlights, hard places, and report gaps. Coordinators also get **data quality** tools to fix rows before reports go out.

Stack:
- **Client:** React 18 + Vite + Tailwind + [Flowbite React](https://flowbite-react.com/) + [TanStack Table](https://tanstack.com/table) + [Tremor](https://www.tremor.so/) charts
- **Server:** Express + MySQL (`mysql2`) → your existing DigitalOcean / MariaDB database

Repo: [github.com/ProdjexTrevor/newgendash](https://github.com/ProdjexTrevor/newgendash)

---

## Quick start

### 1. Configure database

Copy credentials from your main project:

```powershell
cd newgeneration
copy ..\.env .env
# Or copy .env.example and fill in MYSQL_* values
```

Required variables:

```
MYSQL_HOST=
MYSQL_PORT=25060
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=newgendata
MYSQL_SSL=true
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

### 2. Install & run

```powershell
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
npm run dev
```

- Dashboard: **http://localhost:5174**
- API: **http://localhost:3010/api/health**

Or run the bootstrap script (installs deps + starts both):

```powershell
.\bootstrap.ps1
```

---

## What “healthy” means

Each row in `all_data` for a quarter-end is scored against these checks:

| Code | Severity | Meaning |
|------|----------|---------|
| `MISSING_ENGAGEMENT_ID` | Critical | No engagement ID |
| `DUPLICATE_ENGAGEMENT_DATE` | Critical | Same engagement + quarter + people group twice (not multiple PGs under one engagement) |
| `NEGATIVE_COUNTS` | Critical | Negative DBS/churches/disciples/baptisms |
| `CHURCHES_NO_GEN` | Warning | Churches reported but GEN = 0 |
| `MISSING_MBB_DECIMAL` | Warning | Activity but no MBB % |
| `STALE_MBB_DISCIPLES_CALC` | Warning | MBB % set but calc disciples = 0 |
| `STALE_MBB_CHURCHES_CALC` | Warning | MBB % set but calc churches = 0 |
| `BAPTISMS_EXCEED_DISCIPLES` | Warning | Baptisms > new disciples |
| `CHURCHES_WITHOUT_DBS` | Warning | Churches but zero DBS |
| `GEN_VERY_HIGH` | Warning | GEN > 12 |

**Health score** = % of rows with **no** critical or warning flags.

---

## Pages

1. **Management** — drill-down Global → Region → Country → Engagement; movement KPIs, evaluation ratios, missing-data heatmap, top performers, crisis flags  
2. **Data health (Overview)** — score, healthy/warning/critical counts, issue chart  
3. **Scorecard** — regional weighted grades (A–F)  
4. **Issues** — filterable table of failing rows  
5. **Regions** — health % and MBB totals by region  
6. **Trends** — last 15 quarters  

### Management metrics (definitions)

| Metric | Formula / source |
|--------|------------------|
| **POP** | `PeopleGroups.population_size` (joined on `engagement_id`) |
| **Comm / CAT / Churches** | `com_church`, `cat_church`, `total_church` |
| **MBB / MBC** | `mbb_disciples_calc`, `mbb_churches_calc` |
| **MBB vs POP** | MBB disciples ÷ population |
| **Market share** | New disciples ÷ population (%) |
| **R number** | New disciples this quarter ÷ prior quarter (reproduction proxy) |
| **Δ %** | Quarter-over-quarter % change vs prior quarter-end |
| **Crisis** | Keyword scan on `notes` + `PeopleGroups.cultural_challenges` (war, famine, crisis, …) |

API: `/api/analytics/rollup`, `/missing`, `/top-performers`, `/crisis`

---

## Production build

```powershell
npm run build
npm start
```

Serves the built React app from the API on `PORT` (default 3010).

Local dev uses **http://localhost:5174** (UI) and **http://localhost:3010** (API).
Run `.\bootstrap.ps1` on Windows to install and start both.

---

## Deploy to Vercel (UI)

The React client deploys to [Vercel](https://vercel.com). The Express + MySQL API must run elsewhere (Railway, Render, DigitalOcean App Platform, etc.) because Vercel does not host long-lived database connections.

1. Push this repo to GitHub (see below).
2. In Vercel: **Import** → select **newgendash** → set **Root Directory** to `client`.
3. Add environment variable **`VITE_API_URL`** = your hosted API URL (e.g. `https://newgendash-api.onrender.com`), no trailing slash.
4. Deploy. Vercel runs `npm run build` and serves `dist/`.

Host the API with `npm run build && npm start` from the repo root (or deploy the `server` folder). Set on the API:

- `MYSQL_*` — database credentials
- `CLIENT_ORIGIN` — your Vercel URL (e.g. `https://newgendash.vercel.app`)
- `PORT` — platform-assigned port

---

## Push to GitHub

```powershell
git add .
git commit -m "feat: quarterly reporting dashboard"
git remote add origin https://github.com/ProdjexTrevor/newgendash.git
git branch -M main
git push -u origin main
```
